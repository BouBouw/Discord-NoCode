import crypto from 'crypto';
import db from '../config/database.js';

// ─── Generate a unique referral code ──────────────────────────────────────────

function generateCode() {
  return crypto.randomBytes(6).toString('hex'); // 12-char hex
}

// ─── Wallet helpers ───────────────────────────────────────────────────────────

export async function getOrCreateWallet(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM partner_wallets WHERE user_id = ?',
    [userId]
  );
  if (rows.length) return rows[0];

  const code = generateCode();
  const [result] = await db.execute(
    'INSERT INTO partner_wallets (user_id, referral_code) VALUES (?, ?)',
    [userId, code]
  );
  return {
    id: result.insertId,
    user_id: userId,
    referral_code: code,
    balance: 0,
    total_earned: 0,
    total_withdrawn: 0,
    stripe_connect_account_id: null,
    stripe_connect_onboarded: false,
  };
}

export async function getWalletByCode(code) {
  const [rows] = await db.execute(
    'SELECT * FROM partner_wallets WHERE referral_code = ?',
    [code]
  );
  return rows[0] || null;
}

export async function getWalletByUserId(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM partner_wallets WHERE user_id = ?',
    [userId]
  );
  return rows[0] || null;
}

// ─── Referral link handling on registration ───────────────────────────────────

export async function applyReferral(referredUserId, referralCode) {
  const wallet = await getWalletByCode(referralCode);
  if (!wallet) return null; // Invalid code

  // Referrer can't refer themselves
  if (wallet.user_id === referredUserId) return null;

  // Check if user is already referred
  const [existing] = await db.execute(
    'SELECT id FROM referrals WHERE referred_id = ?',
    [referredUserId]
  );
  if (existing.length) return null;

  const [result] = await db.execute(
    'INSERT INTO referrals (referrer_id, referred_id, referral_code) VALUES (?, ?, ?)',
    [wallet.user_id, referredUserId, referralCode]
  );

  return { id: result.insertId, referrer_id: wallet.user_id, referred_id: referredUserId };
}

// ─── Check if a user was referred (for discount) ─────────────────────────────

export async function getReferralByReferred(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM referrals WHERE referred_id = ?',
    [userId]
  );
  return rows[0] || null;
}

// ─── Credit commission to referrer after payment ──────────────────────────────

export async function creditCommission(referredUserId, paymentAmountCents, stripeInvoiceId) {
  const referral = await getReferralByReferred(referredUserId);
  if (!referral) return null;

  const wallet = await getWalletByUserId(referral.referrer_id);
  if (!wallet) return null;

  const commission = Math.round(paymentAmountCents * 0.10); // 10%
  if (commission <= 0) return null;

  // Check for duplicate
  const [dup] = await db.execute(
    'SELECT id FROM referral_earnings WHERE stripe_invoice_id = ?',
    [stripeInvoiceId]
  );
  if (dup.length) return null;

  await db.execute(
    'INSERT INTO referral_earnings (wallet_id, referral_id, amount, stripe_invoice_id, description) VALUES (?, ?, ?, ?, ?)',
    [wallet.id, referral.id, commission, stripeInvoiceId, `Commission 10% — invoice ${stripeInvoiceId}`]
  );

  await db.execute(
    'UPDATE partner_wallets SET balance = balance + ?, total_earned = total_earned + ? WHERE id = ?',
    [commission, commission, wallet.id]
  );

  return { commission, walletId: wallet.id };
}

// ─── Get referral stats ───────────────────────────────────────────────────────

export async function getReferralStats(userId) {
  const wallet = await getOrCreateWallet(userId);

  const [referrals] = await db.execute(
    `SELECT r.id, r.created_at, u.email AS referred_email
     FROM referrals r
     JOIN users u ON u.id = r.referred_id
     WHERE r.referrer_id = ?
     ORDER BY r.created_at DESC`,
    [userId]
  );

  const [earnings] = await db.execute(
    `SELECT re.amount, re.description, re.created_at
     FROM referral_earnings re
     WHERE re.wallet_id = ?
     ORDER BY re.created_at DESC
     LIMIT 50`,
    [wallet.id]
  );

  const [withdrawals] = await db.execute(
    `SELECT amount, status, created_at, completed_at
     FROM wallet_withdrawals
     WHERE wallet_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [wallet.id]
  );

  return {
    wallet: {
      referralCode: wallet.referral_code,
      balance: wallet.balance,
      totalEarned: wallet.total_earned,
      totalWithdrawn: wallet.total_withdrawn,
      stripeConnectOnboarded: !!wallet.stripe_connect_onboarded,
    },
    referrals: referrals.map(r => ({
      id: r.id,
      referredEmail: r.referred_email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      createdAt: r.created_at,
    })),
    earnings,
    withdrawals,
  };
}

// ─── Request a withdrawal ─────────────────────────────────────────────────────

export async function requestWithdrawal(userId) {
  const wallet = await getWalletByUserId(userId);
  if (!wallet) throw new Error('No wallet found');
  if (!wallet.stripe_connect_onboarded) throw new Error('Stripe Connect not onboarded');
  if (wallet.balance < 1000) throw new Error('Minimum withdrawal is 10€');

  const amount = wallet.balance;

  const [result] = await db.execute(
    'INSERT INTO wallet_withdrawals (wallet_id, amount) VALUES (?, ?)',
    [wallet.id, amount]
  );

  await db.execute(
    'UPDATE partner_wallets SET balance = balance - ?, total_withdrawn = total_withdrawn + ? WHERE id = ?',
    [amount, amount, wallet.id]
  );

  return { withdrawalId: result.insertId, amount, walletId: wallet.id };
}

// ─── Update Stripe Connect account ID ─────────────────────────────────────────

export async function setStripeConnectAccount(userId, accountId, onboarded) {
  await db.execute(
    'UPDATE partner_wallets SET stripe_connect_account_id = ?, stripe_connect_onboarded = ? WHERE user_id = ?',
    [accountId, onboarded ? 1 : 0, userId]
  );
}
