import { resolve } from '../context.js';

const UNIT_TO_MS = { seconds: 1_000, minutes: 60_000, hours: 3_600_000, days: 86_400_000 };

export async function executeAction(type, config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild ?? ctx.event?.[1]?.guild;
  if (!guild) { console.warn(`[${type}] No guild in context`); return { nextHandle: 'output' }; }

  const reason = config.reason ? resolve(config.reason, ctx) : undefined;

  // ── kick ───────────────────────────────────────────────────────────────────
  if (type === 'kick') {
    const userId = resolve(config.userId || '', ctx);
    const member = await guild.members.fetch(userId).catch(() => null);
    if (member) await member.kick(reason);
    return { nextHandle: 'output' };
  }

  // ── ban ────────────────────────────────────────────────────────────────────
  if (type === 'ban') {
    const userId = resolve(config.userId || '', ctx);
    await guild.bans.create(userId, {
      deleteMessageSeconds: (config.deleteMessageDays || 0) * 86_400,
      reason,
    });
    return { nextHandle: 'output' };
  }

  // ── unban ──────────────────────────────────────────────────────────────────
  if (type === 'unban') {
    const userId = resolve(config.userId || '', ctx);
    await guild.bans.remove(userId, reason).catch(() => {});
    return { nextHandle: 'output' };
  }

  // ── timeout ────────────────────────────────────────────────────────────────
  if (type === 'timeout') {
    const userId = resolve(config.userId || '', ctx);
    const ms     = (config.duration || 1) * (UNIT_TO_MS[config.durationUnit || 'minutes'] || 60_000);
    const member = await guild.members.fetch(userId).catch(() => null);
    if (member) await member.timeout(ms, reason);
    return { nextHandle: 'output' };
  }

  // ── setNickname ────────────────────────────────────────────────────────────
  if (type === 'setNickname') {
    const userId   = resolve(config.userId || '', ctx);
    const nickname = config.nickname ? resolve(config.nickname, ctx) : null;
    const member   = await guild.members.fetch(userId).catch(() => null);
    if (member) await member.setNickname(nickname, reason);
    return { nextHandle: 'output' };
  }

  // ── unmute ────────────────────────────────────────────────────────────────
  if (type === 'unmute') {
    const userId = resolve(config.userId || '', ctx);
    const member = await guild.members.fetch(userId).catch(() => null);
    if (member) await member.timeout(null, reason);
    return { nextHandle: 'output' };
  }

  // ── bulkDeleteMessages ────────────────────────────────────────────────────
  if (type === 'bulkDeleteMessages') {
    const channelId = resolve(config.channelId || '', ctx);
    const channel = channelId
      ? await ctx.client.channels.fetch(channelId).catch(() => null)
      : ctx.interaction?.channel ?? ctx.event?.[0]?.channel ?? null;
    if (!channel) return { nextHandle: 'error' };
    const count = Math.min(Math.max(parseInt(resolve(config.count || '10', ctx)) || 10, 1), 100);
    try {
      const deleted = await channel.bulkDelete(count, true);
      ctx.variables[config.outputVar || '_deletedCount'] = deleted.size;
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables['_bulkDeleteError'] = err.message;
      return { nextHandle: 'error' };
    }
  }
  return null;
}
