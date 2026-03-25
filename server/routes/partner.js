import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth.js';
import {
  getOrCreateWallet,
  getReferralStats,
  requestWithdrawal,
  setStripeConnectAccount,
  getWalletByUserId,
} from '../services/referralService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });
const router = express.Router();

// ─── Get partner stats (wallet, referrals, earnings, withdrawals) ─────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await getReferralStats(req.user.userId);
    res.json(stats);
  } catch (err) {
    console.error('[Partner] stats error:', err);
    res.status(500).json({ error: 'Failed to get partner stats' });
  }
});

// ─── Get referral code (auto-creates wallet if missing) ───────────────────────
router.get('/code', authenticate, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.userId);
    res.json({ referralCode: wallet.referral_code });
  } catch (err) {
    console.error('[Partner] code error:', err);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

// ─── Stripe Connect onboarding ────────────────────────────────────────────────
router.post('/connect/onboard', authenticate, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.userId);

    let accountId = wallet.stripe_connect_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        metadata: { disflow_user_id: String(req.user.userId) },
      });
      accountId = account.id;
      await setStripeConnectAccount(req.user.userId, accountId, false);
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${FRONTEND_URL}/dashboard/partner?connect=refresh`,
      return_url: `${FRONTEND_URL}/dashboard/partner?connect=success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error('[Partner] connect onboard error:', err);
    res.status(500).json({ error: 'Failed to create Stripe Connect onboarding link' });
  }
});

// ─── Check Stripe Connect status ──────────────────────────────────────────────
router.get('/connect/status', authenticate, async (req, res) => {
  try {
    const wallet = await getWalletByUserId(req.user.userId);
    if (!wallet || !wallet.stripe_connect_account_id) {
      return res.json({ connected: false, onboarded: false });
    }

    const account = await stripe.accounts.retrieve(wallet.stripe_connect_account_id);
    const onboarded = account.details_submitted && account.charges_enabled;

    // Update DB if newly onboarded
    if (onboarded && !wallet.stripe_connect_onboarded) {
      await setStripeConnectAccount(req.user.userId, wallet.stripe_connect_account_id, true);
    }

    res.json({
      connected: true,
      onboarded: !!onboarded,
      payoutsEnabled: !!account.payouts_enabled,
      accountId: account.id,
      email: account.email || null,
      country: account.country || null,
      businessType: account.business_type || null,
      displayName: account.business_profile?.name || account.individual?.first_name
        ? `${account.individual?.first_name || ''} ${account.individual?.last_name || ''}`.trim()
        : null,
    });
  } catch (err) {
    console.error('[Partner] connect status error:', err);
    res.status(500).json({ error: 'Failed to check connect status' });
  }
});

// ─── Request withdrawal (Stripe Transfer) ─────────────────────────────────────
router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const result = await requestWithdrawal(req.user.userId);

    // Execute Stripe transfer
    const wallet = await getWalletByUserId(req.user.userId);
    const transfer = await stripe.transfers.create({
      amount: result.amount,
      currency: 'eur',
      destination: wallet.stripe_connect_account_id,
      metadata: {
        disflow_user_id: String(req.user.userId),
        withdrawal_id: String(result.withdrawalId),
      },
    });

    // Mark withdrawal as completed
    const db = (await import('../config/database.js')).default;
    await db.execute(
      'UPDATE wallet_withdrawals SET status = ?, stripe_transfer_id = ?, completed_at = NOW() WHERE id = ?',
      ['completed', transfer.id, result.withdrawalId]
    );

    res.json({ success: true, amount: result.amount, transferId: transfer.id });
  } catch (err) {
    console.error('[Partner] withdraw error:', err);
    res.status(400).json({ error: err.message || 'Withdrawal failed' });
  }
});

// ─── Stripe Connect webhook (account.updated) ────────────────────────────────
// This is handled in the main subscription webhook route or can be added separately

export default router;
