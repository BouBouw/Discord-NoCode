import Stripe from 'stripe';
import db from '../config/database.js';
import { PLANS, getPlanLimits } from '../config/plans.js';
import { getReferralByReferred, creditCommission } from '../services/referralService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

// ─── Price cache (plan+interval → Stripe Price ID) ───────────────────────────
const priceCache = new Map();
let referralCouponId = null;

/**
 * Auto-create a Stripe Product for the given plan if it doesn't exist,
 * then auto-create a Price for the requested interval (month/year).
 * Caches the resulting Price ID in memory.
 */
async function getOrCreatePrice(planKey, interval) {
  const cacheKey = `${planKey}_${interval}`;
  if (priceCache.has(cacheKey)) return priceCache.get(cacheKey);

  const plan = PLANS[planKey];
  if (!plan || plan.monthlyPrice === 0) throw new Error('Cannot create price for free plan');

  // ── Find or create Product ──────────────────────────────────────────────
  const products = await stripe.products.search({
    query: `metadata["disflow_plan"]:"${planKey}"`,
  });

  let product;
  if (products.data.length > 0) {
    product = products.data[0];
  } else {
    product = await stripe.products.create({
      name: `DisFlow ${plan.name}`,
      metadata: { disflow_plan: planKey },
    });
  }

  // ── Find or create Price ────────────────────────────────────────────────
  const unitAmount = interval === 'year' ? plan.annualPrice : plan.monthlyPrice;

  const prices = await stripe.prices.search({
    query: `product:"${product.id}" metadata["disflow_plan"]:"${planKey}" metadata["disflow_interval"]:"${interval}"`,
  });

  let price;
  if (prices.data.length > 0 && prices.data[0].unit_amount === unitAmount) {
    price = prices.data[0];
  } else {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: plan.currency,
      recurring: { interval },
      metadata: { disflow_plan: planKey, disflow_interval: interval },
    });
  }

  priceCache.set(cacheKey, price.id);
  return price.id;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getOrCreateCustomer(userId, email) {
  const [rows] = await db.execute(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
    [userId]
  );

  if (rows.length && rows[0].stripe_customer_id) {
    return rows[0].stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId: String(userId) },
  });

  // Ensure subscription row exists
  await db.execute(
    `INSERT INTO subscriptions (user_id, plan, stripe_customer_id, status)
     VALUES (?, 'free', ?, 'active')
     ON DUPLICATE KEY UPDATE stripe_customer_id = VALUES(stripe_customer_id)`,
    [userId, customer.id]
  );

  return customer.id;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

async function getOrCreateReferralCoupon() {
  if (referralCouponId) return referralCouponId;

  // Search for existing coupon
  const coupons = await stripe.coupons.list({ limit: 100 });
  const existing = coupons.data.find(c => c.metadata?.disflow_referral === 'true' && c.percent_off === 10);
  if (existing) {
    referralCouponId = existing.id;
    return referralCouponId;
  }

  const coupon = await stripe.coupons.create({
    percent_off: 10,
    duration: 'forever',
    name: 'Referral -10%',
    metadata: { disflow_referral: 'true' },
  });
  referralCouponId = coupon.id;
  return referralCouponId;
}

export async function createCheckoutSession(userId, email, planKey, interval, successUrl, cancelUrl) {
  const plan = PLANS[planKey];
  if (!plan || plan.monthlyPrice === 0) throw new Error('Invalid plan');

  if (!['month', 'year'].includes(interval)) throw new Error('Invalid interval');

  const customerId = await getOrCreateCustomer(userId, email);
  const priceId = await getOrCreatePrice(planKey, interval);

  // Check if user was referred → apply 10% discount
  const referral = await getReferralByReferred(userId);
  const discounts = [];
  if (referral) {
    const couponId = await getOrCreateReferralCoupon();
    discounts.push({ coupon: couponId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId: String(userId), plan: planKey, interval },
    subscription_data: {
      metadata: { userId: String(userId), plan: planKey, interval },
    },
    ...(discounts.length ? { discounts } : {}),
  });

  return session;
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

export async function createPortalSession(userId, returnUrl) {
  const [rows] = await db.execute(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
    [userId]
  );

  if (!rows.length || !rows[0].stripe_customer_id) {
    throw new Error('No Stripe customer found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: rows[0].stripe_customer_id,
    return_url: returnUrl,
  });

  return session;
}

// ─── Webhook Handlers ─────────────────────────────────────────────────────────

export function constructWebhookEvent(rawBody, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

export async function handleSubscriptionEvent(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.warn('[Stripe] handleSubscriptionEvent: no userId in metadata, sub:', subscription.id);
    return;
  }

  const planKey = subscription.metadata?.plan || 'free';
  const interval = subscription.metadata?.interval || 'month';
  const status = subscription.status; // active, past_due, canceled, trialing, incomplete
  const periodStart = new Date(subscription.current_period_start * 1000);
  const periodEnd = new Date(subscription.current_period_end * 1000);
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id || null;

  await db.execute(
    `INSERT INTO subscriptions (user_id, plan, billing_interval, stripe_subscription_id, stripe_price_id, status,
       current_period_start, current_period_end, cancel_at_period_end, stripe_customer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       plan = VALUES(plan),
       billing_interval = VALUES(billing_interval),
       stripe_subscription_id = VALUES(stripe_subscription_id),
       stripe_price_id = VALUES(stripe_price_id),
       status = VALUES(status),
       current_period_start = VALUES(current_period_start),
       current_period_end = VALUES(current_period_end),
       cancel_at_period_end = VALUES(cancel_at_period_end),
       stripe_customer_id = COALESCE(VALUES(stripe_customer_id), stripe_customer_id)`,
    [
      userId,
      planKey,
      interval,
      subscription.id,
      subscription.items?.data?.[0]?.price?.id || null,
      status === 'active' || status === 'trialing' ? 'active' : status,
      periodStart,
      periodEnd,
      subscription.cancel_at_period_end ? 1 : 0,
      customerId,
    ]
  );

  // Reset AI credits on new billing period
  const limits = getPlanLimits(planKey);
  await db.execute(
    `INSERT INTO ai_credits (user_id, credits_used, credits_limit, reset_at)
     VALUES (?, 0, ?, ?)
     ON DUPLICATE KEY UPDATE credits_limit = VALUES(credits_limit), credits_used = 0, reset_at = VALUES(reset_at)`,
    [userId, limits.aiCreditsPerMonth, periodEnd]
  );
}

/**
 * Handle checkout.session.completed — retrieve the full subscription and process it.
 * This is the most reliable event for updating the DB after a new checkout.
 */
export async function handleCheckoutCompleted(session) {
  if (session.mode !== 'subscription') return;

  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.warn('[Stripe] checkout.session.completed: no subscription id in session');
    return;
  }

  // Retrieve the full subscription (with metadata) from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionEvent(subscription);

  // Credit referral commission (fallback for when invoice.paid webhook doesn't arrive)
  const userId = session.metadata?.userId;
  if (userId && session.amount_total > 0) {
    try {
      // Use the latest invoice from the subscription
      const latestInvoice = subscription.latest_invoice;
      const invoiceId = typeof latestInvoice === 'string' ? latestInvoice : latestInvoice?.id;
      if (invoiceId) {
        const invoice = typeof latestInvoice === 'string'
          ? await stripe.invoices.retrieve(latestInvoice)
          : latestInvoice;
        if (invoice?.amount_paid > 0) {
          await creditCommission(parseInt(userId), invoice.amount_paid, invoice.id);
        }
      }
    } catch (err) {
      console.error('[Stripe] checkout.session.completed: commission credit error:', err.message);
    }
  }
}

/**
 * Verify a checkout session by ID and sync the subscription to DB.
 * Called from the frontend after redirect to ?success=true.
 */
export async function verifyAndSyncCheckoutSession(sessionId, userId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'subscription.latest_invoice'],
  });

  if (!session || session.mode !== 'subscription') {
    throw new Error('Invalid checkout session');
  }

  // Verify that this session belongs to this user
  if (session.metadata?.userId !== String(userId)) {
    throw new Error('Session does not belong to this user');
  }

  const subscription = session.subscription;
  if (!subscription || typeof subscription === 'string') {
    // If not expanded, retrieve it
    const sub = typeof subscription === 'string'
      ? await stripe.subscriptions.retrieve(subscription)
      : subscription;
    if (sub) await handleSubscriptionEvent(sub);
  } else {
    await handleSubscriptionEvent(subscription);
  }

  // Credit referral commission (fallback for when invoice.paid webhook doesn't arrive)
  if (session.amount_total > 0) {
    try {
      const sub = typeof subscription === 'string'
        ? await stripe.subscriptions.retrieve(subscription, { expand: ['latest_invoice'] })
        : subscription;
      const latestInvoice = sub?.latest_invoice;
      const invoiceId = typeof latestInvoice === 'string' ? latestInvoice : latestInvoice?.id;
      if (invoiceId) {
        const invoice = typeof latestInvoice === 'string'
          ? await stripe.invoices.retrieve(latestInvoice)
          : latestInvoice;
        if (invoice?.amount_paid > 0) {
          await creditCommission(userId, invoice.amount_paid, invoice.id);
        }
      }
    } catch (err) {
      console.error('[Stripe] verifyAndSync: commission credit error:', err.message);
    }
  }

  return { plan: session.metadata?.plan, status: 'synced' };
}

export async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Downgrade to free
  await db.execute(
    `UPDATE subscriptions SET plan = 'free', stripe_subscription_id = NULL,
       stripe_price_id = NULL, status = 'active', cancel_at_period_end = FALSE
     WHERE user_id = ?`,
    [userId]
  );

  // Reset AI credits to free limits
  const limits = getPlanLimits('free');
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  await db.execute(
    `UPDATE ai_credits SET credits_limit = ?, reset_at = ? WHERE user_id = ?`,
    [limits.aiCreditsPerMonth, nextMonth, userId]
  );
}

// ─── Get user subscription ───────────────────────────────────────────────────

export async function handleInvoicePaid(invoice) {
  // Credit 10% commission to referrer when a referred user pays
  const customerId = invoice.customer;
  if (!customerId || !invoice.amount_paid) return;

  // Find user by stripe customer id
  const [subs] = await db.execute(
    'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?',
    [customerId]
  );
  if (!subs.length) return;

  const userId = subs[0].user_id;
  await creditCommission(userId, invoice.amount_paid, invoice.id);
}

export async function getUserSubscription(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM subscriptions WHERE user_id = ?',
    [userId]
  );

  if (!rows.length) {
    // Auto-create free sub
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await db.execute(
      `INSERT INTO subscriptions (user_id, plan, status) VALUES (?, 'free', 'active')`,
      [userId]
    );
    await db.execute(
      `INSERT INTO ai_credits (user_id, credits_used, credits_limit, reset_at)
       VALUES (?, 0, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [userId, 1000, nextMonth]
    );

    return { plan: 'free', status: 'active', cancel_at_period_end: false };
  }

  return rows[0];
}
