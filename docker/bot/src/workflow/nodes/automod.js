import { resolve } from '../context.js';

/**
 * Phase 2 — Auto-moderation nodes:
 *   antiSpam, badWordFilter
 */

// In-memory spam tracker: Map<guildId:userId, { timestamps: number[], lastContent: string }>
const spamTracker = new Map();

export async function executeAction(type, config, ctx) {
  switch (type) {
    case 'antiSpam':      return antiSpam(config, ctx);
    case 'badWordFilter': return badWordFilter(config, ctx);
    default: return null;
  }
}

// ─── Anti-Spam ───────────────────────────────────────────────────────────────

async function antiSpam(config, ctx) {
  const message = ctx.event?.[0];
  if (!message?.author || message.author.bot) return { nextHandle: 'clean' };

  const guildId = message.guild?.id;
  const userId  = message.author.id;
  if (!guildId) return { nextHandle: 'clean' };

  const maxMessages = Number(resolve(config.maxMessages || '5', ctx)) || 5;
  const timeWindow  = Number(resolve(config.timeWindow  || '5', ctx)) || 5; // seconds
  const duplicateThreshold = Number(resolve(config.duplicateThreshold || '3', ctx)) || 3;

  const key     = `${guildId}:${userId}`;
  const now     = Date.now();
  const windowMs = timeWindow * 1000;

  if (!spamTracker.has(key)) {
    spamTracker.set(key, { timestamps: [], lastContent: '', dupeCount: 0 });
  }

  const tracker = spamTracker.get(key);

  // Clean old entries
  tracker.timestamps = tracker.timestamps.filter(t => now - t < windowMs);
  tracker.timestamps.push(now);

  // Check for duplicate messages
  if (message.content && message.content === tracker.lastContent) {
    tracker.dupeCount++;
  } else {
    tracker.dupeCount = 1;
    tracker.lastContent = message.content;
  }

  const isSpam = tracker.timestamps.length > maxMessages || tracker.dupeCount >= duplicateThreshold;

  ctx.variables['antiSpam.userId']       = userId;
  ctx.variables['antiSpam.messageCount'] = String(tracker.timestamps.length);
  ctx.variables['antiSpam.dupeCount']    = String(tracker.dupeCount);
  ctx.variables['antiSpam.isSpam']       = String(isSpam);

  if (isSpam) {
    // Auto-action
    const action = config.action || 'delete';

    if (action === 'delete' || action === 'delete_warn') {
      await message.delete().catch(() => {});
    }

    if (action === 'delete_warn' || action === 'warn') {
      const warnMsg = resolve(config.warnMessage || '⚠️ {user}, please stop spamming!', ctx)
        .replace(/\{user\}/g, `<@${userId}>`);
      await message.channel.send(warnMsg).then(m => {
        setTimeout(() => m.delete().catch(() => {}), 5000);
      }).catch(() => {});
    }

    if (action === 'timeout') {
      const duration = Number(resolve(config.timeoutDuration || '60', ctx)) || 60;
      const member = message.member || await message.guild.members.fetch(userId).catch(() => null);
      if (member?.moderatable) {
        await member.timeout(duration * 1000, 'Anti-spam auto-timeout').catch(() => {});
      }
      await message.delete().catch(() => {});
    }

    // Reset tracker after action
    tracker.timestamps = [];
    tracker.dupeCount = 0;

    return { nextHandle: 'spam' };
  }

  return { nextHandle: 'clean' };
}

// ─── Bad Word Filter ─────────────────────────────────────────────────────────

async function badWordFilter(config, ctx) {
  const message = ctx.event?.[0];
  if (!message?.content || message.author?.bot) return { nextHandle: 'clean' };

  const wordList = (resolve(config.wordList || '', ctx))
    .split(',')
    .map(w => w.trim().toLowerCase())
    .filter(Boolean);

  if (wordList.length === 0) return { nextHandle: 'clean' };

  const content = message.content.toLowerCase();
  const found = wordList.filter(word => content.includes(word));

  ctx.variables['filter.userId']     = message.author.id;
  ctx.variables['filter.matched']    = JSON.stringify(found);
  ctx.variables['filter.matchCount'] = String(found.length);

  if (found.length > 0) {
    const action = config.action || 'delete';

    if (action === 'delete' || action === 'delete_warn') {
      await message.delete().catch(() => {});
    }

    if (action === 'delete_warn' || action === 'warn') {
      const warnMsg = resolve(config.warnMessage || '⚠️ {user}, that language is not allowed here.', ctx)
        .replace(/\{user\}/g, `<@${message.author.id}>`);
      await message.channel.send(warnMsg).then(m => {
        setTimeout(() => m.delete().catch(() => {}), 5000);
      }).catch(() => {});
    }

    if (action === 'timeout') {
      const duration = Number(resolve(config.timeoutDuration || '60', ctx)) || 60;
      const member = message.member || await message.guild?.members.fetch(message.author.id).catch(() => null);
      if (member?.moderatable) {
        await member.timeout(duration * 1000, 'Bad word filter').catch(() => {});
      }
      await message.delete().catch(() => {});
    }

    return { nextHandle: 'blocked' };
  }

  return { nextHandle: 'clean' };
}
