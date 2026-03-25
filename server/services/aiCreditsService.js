import db from '../config/database.js';
import { getPlanLimits } from '../config/plans.js';
import { getUserSubscription } from '../services/stripeService.js';

/**
 * Get current AI credits for a user.
 * Auto-creates the row if missing.
 */
export async function getAiCredits(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM ai_credits WHERE user_id = ?',
    [userId]
  );

  if (rows.length) {
    const row = rows[0];

    // Auto-reset if past period
    if (new Date(row.reset_at) <= new Date()) {
      const sub = await getUserSubscription(userId);
      const limits = getPlanLimits(sub.plan);
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);

      await db.execute(
        'UPDATE ai_credits SET credits_used = 0, credits_limit = ?, reset_at = ? WHERE user_id = ?',
        [limits.aiCreditsPerMonth, nextReset, userId]
      );

      return { credits_used: 0, credits_limit: limits.aiCreditsPerMonth, reset_at: nextReset };
    }

    return row;
  }

  // Create default row
  const sub = await getUserSubscription(userId);
  const limits = getPlanLimits(sub.plan);
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);

  await db.execute(
    'INSERT INTO ai_credits (user_id, credits_used, credits_limit, reset_at) VALUES (?, 0, ?, ?)',
    [userId, limits.aiCreditsPerMonth, nextReset]
  );

  return { credits_used: 0, credits_limit: limits.aiCreditsPerMonth, reset_at: nextReset };
}

/**
 * Consume AI credits. Returns the updated usage.
 * @param {number} userId
 * @param {number} amount - credits to consume (default 1)
 */
export async function consumeAiCredits(userId, amount = 1) {
  // Ensure row exists
  await getAiCredits(userId);

  await db.execute(
    'UPDATE ai_credits SET credits_used = credits_used + ? WHERE user_id = ?',
    [amount, userId]
  );

  return getAiCredits(userId);
}
