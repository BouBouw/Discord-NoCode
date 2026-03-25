import db from '../config/database.js';
import { getPlanLimits } from '../config/plans.js';
import { getUserSubscription } from '../services/stripeService.js';
import { LimitExceededError } from '../utils/errors.js';

/**
 * Attaches req.subscription and req.planLimits to the request.
 * Use after authenticate middleware.
 */
export async function attachPlan(req, _res, next) {
  try {
    const sub = await getUserSubscription(req.user.userId);
    req.subscription = sub;
    req.planLimits = getPlanLimits(sub.plan);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Check if user can create another bot.
 */
export async function checkBotLimit(req, _res, next) {
  try {
    if (!req.planLimits) await _attachPlanInternal(req);

    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM bots WHERE user_id = ?',
      [req.user.userId]
    );
    const count = rows[0].count;

    if (count >= req.planLimits.maxBots) {
      throw new LimitExceededError(
        `Votre plan ${req.subscription.plan} est limité à ${req.planLimits.maxBots} bot(s). Passez à un plan supérieur.`
      );
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Check commands & events count in a workflow before save/deploy.
 * Expects nodes in req.body.nodes (array).
 */
export async function checkWorkflowLimits(req, _res, next) {
  try {
    if (!req.planLimits) await _attachPlanInternal(req);

    const nodes = req.body.nodes;
    if (!Array.isArray(nodes)) return next();

    const commandCount = nodes.filter(n => n.type === 'commandHandlerSuite').length;
    const eventCount = nodes.filter(n => n.type === 'eventHandlerSuite').length;

    if (req.planLimits.maxCommandsPerBot !== Infinity && commandCount > req.planLimits.maxCommandsPerBot) {
      throw new LimitExceededError(
        `Votre plan est limité à ${req.planLimits.maxCommandsPerBot} commandes par bot. Vous en avez ${commandCount}.`
      );
    }

    if (req.planLimits.maxEventsPerBot !== Infinity && eventCount > req.planLimits.maxEventsPerBot) {
      throw new LimitExceededError(
        `Votre plan est limité à ${req.planLimits.maxEventsPerBot} événements par bot. Vous en avez ${eventCount}.`
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Check AI credits before consuming.
 */
export async function checkAiCredits(req, _res, next) {
  try {
    if (!req.planLimits) await _attachPlanInternal(req);

    const [rows] = await db.execute(
      'SELECT credits_used, credits_limit, reset_at FROM ai_credits WHERE user_id = ?',
      [req.user.userId]
    );

    if (rows.length) {
      const { credits_used, credits_limit, reset_at } = rows[0];

      // Auto-reset if past period
      if (new Date(reset_at) <= new Date()) {
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);
        await db.execute(
          'UPDATE ai_credits SET credits_used = 0, reset_at = ? WHERE user_id = ?',
          [nextReset, req.user.userId]
        );
      } else if (credits_used >= credits_limit) {
        throw new LimitExceededError(
          `Crédits IA épuisés (${credits_used}/${credits_limit}). Rechargement le ${new Date(reset_at).toLocaleDateString('fr-FR')}.`
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

// Internal helper
async function _attachPlanInternal(req) {
  const sub = await getUserSubscription(req.user.userId);
  req.subscription = sub;
  req.planLimits = getPlanLimits(sub.plan);
}
