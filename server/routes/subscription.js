import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  handleSubscriptionEvent,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleCheckoutCompleted,
  verifyAndSyncCheckoutSession,
  getUserSubscription,
} from '../services/stripeService.js';
import { getAiCredits } from '../services/aiCreditsService.js';
import { PLANS, getPlanLimits } from '../config/plans.js';

const router = express.Router();

// ─── Get current subscription + usage ─────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const sub = await getUserSubscription(req.user.userId);
    const credits = await getAiCredits(req.user.userId);
    const limits = getPlanLimits(sub.plan);

    res.json({
      plan: sub.plan,
      status: sub.status,
      billingInterval: sub.billing_interval || null,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      currentPeriodEnd: sub.current_period_end,
      limits,
      aiCredits: {
        used: credits.credits_used,
        limit: credits.credits_limit,
        resetAt: credits.reset_at,
      },
    });
  } catch (err) {
    console.error('[Subscription] GET /me error:', err);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// ─── Get available plans ──────────────────────────────────────────────────────
router.get('/plans', (_req, res) => {
  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    key,
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    currency: plan.currency,
    limits: {
      ...plan.limits,
      maxCommandsPerBot: plan.limits.maxCommandsPerBot === Infinity ? -1 : plan.limits.maxCommandsPerBot,
      maxEventsPerBot: plan.limits.maxEventsPerBot === Infinity ? -1 : plan.limits.maxEventsPerBot,
    },
  }));
  res.json(plans);
});

// ─── Create Stripe checkout session ───────────────────────────────────────────
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { plan, interval, successUrl, cancelUrl } = req.body;

    if (!plan || !['pro', 'business'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    if (!interval || !['month', 'year'].includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval (month or year)' });
    }

    const session = await createCheckoutSession(
      req.user.userId,
      req.user.email,
      plan,
      interval,
      successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/settings?tab=subscription&success=true`,
      cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/settings?tab=subscription&canceled=true`,
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[Subscription] checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

// ─── Create Stripe customer portal ────────────────────────────────────────────
router.post('/portal', authenticate, async (req, res) => {
  try {
    const { returnUrl } = req.body;

    const session = await createPortalSession(
      req.user.userId,
      returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/settings?tab=subscription`,
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Subscription] portal error:', err);
    res.status(500).json({ error: err.message || 'Failed to create portal session' });
  }
});

// ─── Verify checkout session (fallback for when webhooks are delayed) ─────────
router.post('/verify-session', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    const result = await verifyAndSyncCheckoutSession(sessionId, req.user.userId);
    res.json(result);
  } catch (err) {
    console.error('[Subscription] verify-session error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify session' });
  }
});

// ─── Stripe webhook (raw body required) ───────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = constructWebhookEvent(req.body, req.headers['stripe-signature']);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
