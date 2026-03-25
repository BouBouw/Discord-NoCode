import { getUserById } from '../services/authService.js';
import { getUserSubscription } from '../services/stripeService.js';
import { getAiCredits } from '../services/aiCreditsService.js';
import { getPlanLimits } from '../config/plans.js';
import db from '../config/database.js';

export async function getProfile(req, res) {
  try {
    const user = await getUserById(req.user.userId);

    // Get user's bots count
    const [bots] = await db.execute(
      'SELECT COUNT(*) as count FROM bots WHERE user_id = ?',
      [user.id]
    );

    // Get user's workflows count
    const [workflows] = await db.execute(
      'SELECT COUNT(*) as count FROM workflows WHERE user_id = ?',
      [user.id]
    );

    // Get subscription info
    const sub = await getUserSubscription(user.id);
    const credits = await getAiCredits(user.id);
    const limits = getPlanLimits(sub.plan);

    // Get onboarding status from preferences
    const [[prefRow]] = await db.query(
      'SELECT prefs FROM user_preferences WHERE user_id = ?',
      [user.id]
    );
    const prefs = prefRow?.prefs ?? {};
    const onboardingCompleted = !!prefs.onboarding?.completed;

    res.json({
      ...user,
      botsCount: bots[0].count,
      workflowsCount: workflows[0].count,
      plan: sub.plan,
      planStatus: sub.status,
      billingInterval: sub.billing_interval || null,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      currentPeriodEnd: sub.current_period_end,
      limits,
      onboardingCompleted,
      aiCredits: {
        used: credits.credits_used,
        limit: credits.credits_limit,
        resetAt: credits.reset_at,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
}
