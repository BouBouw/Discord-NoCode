import { resolve } from '../context.js';

/**
 * Phase 2 — Cooldown node + Scheduled Trigger support
 *   cooldown (in-workflow rate limiter)
 *
 * Note: scheduledTrigger is handled at registration time in workflowHandler.js,
 * not as an executable node. This file only exports the cooldown logic.
 */

// In-memory cooldown tracker: Map<nodeId:scope:key, expiresAt>
const cooldowns = new Map();

export async function executeAction(type, config, ctx) {
  if (type !== 'cooldown') return null;
  return cooldown(config, ctx);
}

// ─── Cooldown ────────────────────────────────────────────────────────────────

async function cooldown(config, ctx) {
  const duration = Math.max(1, Number(resolve(config.duration || '10', ctx)) || 10); // seconds
  const scope    = config.scope || 'user'; // 'user' | 'channel' | 'guild' | 'global'

  const userId   = ctx.interaction?.user?.id ?? ctx.event?.[0]?.author?.id ?? 'unknown';
  const channelId = ctx.interaction?.channelId ?? ctx.event?.[0]?.channelId ?? 'unknown';
  const guildId  = ctx.interaction?.guildId ?? ctx.event?.[0]?.guildId ?? 'unknown';

  // Build scope key
  const nodeId = ctx._currentNodeId || 'cooldown';
  let scopeKey;
  switch (scope) {
    case 'channel': scopeKey = `${nodeId}:ch:${channelId}`; break;
    case 'guild':   scopeKey = `${nodeId}:g:${guildId}`; break;
    case 'global':  scopeKey = `${nodeId}:global`; break;
    default:        scopeKey = `${nodeId}:u:${userId}`; break;
  }

  const now       = Date.now();
  const expiresAt = cooldowns.get(scopeKey);

  if (expiresAt && now < expiresAt) {
    const remaining = Math.ceil((expiresAt - now) / 1000);
    ctx.variables['cooldown.remaining'] = String(remaining);
    ctx.variables['cooldown.active']    = 'true';
    ctx.variables['cooldown.userId']    = userId;
    return { nextHandle: 'cooldown' };
  }

  // Set cooldown
  cooldowns.set(scopeKey, now + duration * 1000);

  // Clean expired entries periodically
  if (cooldowns.size > 10000) {
    for (const [k, v] of cooldowns) {
      if (now > v) cooldowns.delete(k);
    }
  }

  ctx.variables['cooldown.remaining'] = '0';
  ctx.variables['cooldown.active']    = 'false';
  ctx.variables['cooldown.userId']    = userId;
  return { nextHandle: 'ready' };
}
