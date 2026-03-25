import { EmbedBuilder } from 'discord.js';
import { resolve } from '../context.js';

/**
 * Phase 2 & 3 — Engagement nodes:
 *   xpGive, xpCheck, levelCheck, createPoll, giveawayCreate, giveawayEnd
 */
export async function executeAction(type, config, ctx) {
  switch (type) {
    case 'xpGive':          return xpGive(config, ctx);
    case 'xpCheck':         return xpCheck(config, ctx);
    case 'levelCheck':      return levelCheck(config, ctx);
    case 'createPoll':      return createPoll(config, ctx);
    case 'giveawayCreate':  return giveawayCreate(config, ctx);
    case 'giveawayEnd':     return giveawayEnd(config, ctx);
    default: return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function xpForLevel(level) {
  // XP needed to reach `level` → 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}

function levelFromXp(totalXp) {
  let lvl = 0;
  while (xpForLevel(lvl + 1) <= totalXp) lvl++;
  return lvl;
}

async function ensureXpTable(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dnc_xp (
      guild_id TEXT NOT NULL,
      user_id  TEXT NOT NULL,
      xp       INTEGER DEFAULT 0,
      level    INTEGER DEFAULT 0,
      PRIMARY KEY (guild_id, user_id)
    )
  `);
}

// ─── Give XP ─────────────────────────────────────────────────────────────────

async function xpGive(config, ctx) {
  if (!ctx.db) throw new Error('xpGive: no database');
  await ensureXpTable(ctx.db);

  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const userId  = resolve(config.userId || '{user.id}', ctx);
  const guildId = guild?.id ?? resolve(config.guildId || '', ctx);
  const amount  = Math.max(0, Number(resolve(config.amount || '10', ctx)) || 10);

  if (!guildId || !userId) throw new Error('xpGive: guildId and userId required');

  // Upsert xp
  await ctx.db.run(
    `INSERT INTO dnc_xp (guild_id, user_id, xp, level)
     VALUES (?, ?, ?, 0)
     ON CONFLICT(guild_id, user_id) DO UPDATE SET xp = xp + ?`,
    [guildId, userId, amount, amount]
  );

  // Fetch new totals
  const row = await ctx.db.get(
    'SELECT xp, level FROM dnc_xp WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );

  const newXp    = row?.xp ?? amount;
  const oldLevel = row?.level ?? 0;
  const newLevel = levelFromXp(newXp);

  ctx.variables['xp.total']    = String(newXp);
  ctx.variables['xp.level']    = String(newLevel);
  ctx.variables['xp.userId']   = userId;
  ctx.variables['xp.added']    = String(amount);
  ctx.variables['xp.nextLevelXp'] = String(xpForLevel(newLevel + 1));

  if (newLevel > oldLevel) {
    await ctx.db.run(
      'UPDATE dnc_xp SET level = ? WHERE guild_id = ? AND user_id = ?',
      [newLevel, guildId, userId]
    );
    ctx.variables['xp.leveledUp'] = 'true';
    ctx.variables['xp.oldLevel']  = String(oldLevel);
    return { nextHandle: 'levelUp' };
  }

  return { nextHandle: 'output' };
}

// ─── Check XP ────────────────────────────────────────────────────────────────

async function xpCheck(config, ctx) {
  if (!ctx.db) throw new Error('xpCheck: no database');
  await ensureXpTable(ctx.db);

  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const userId  = resolve(config.userId || '{user.id}', ctx);
  const guildId = guild?.id ?? resolve(config.guildId || '', ctx);

  const row = await ctx.db.get(
    'SELECT xp, level FROM dnc_xp WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );

  ctx.variables['xp.total']      = String(row?.xp    ?? 0);
  ctx.variables['xp.level']      = String(row?.level  ?? 0);
  ctx.variables['xp.userId']     = userId;
  ctx.variables['xp.nextLevelXp'] = String(xpForLevel((row?.level ?? 0) + 1));

  return { nextHandle: 'output' };
}

// ─── Level Check ─────────────────────────────────────────────────────────────

async function levelCheck(config, ctx) {
  if (!ctx.db) throw new Error('levelCheck: no database');
  await ensureXpTable(ctx.db);

  const guild        = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const userId       = resolve(config.userId || '{user.id}', ctx);
  const guildId      = guild?.id ?? resolve(config.guildId || '', ctx);
  const requiredLevel = Number(resolve(config.level || '1', ctx)) || 1;

  const row = await ctx.db.get(
    'SELECT level FROM dnc_xp WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );

  const currentLevel = row?.level ?? 0;
  ctx.variables['level.current']  = String(currentLevel);
  ctx.variables['level.required'] = String(requiredLevel);
  ctx.variables['level.userId']   = userId;

  return { nextHandle: currentLevel >= requiredLevel ? 'true' : 'false' };
}

// ─── Create Poll ─────────────────────────────────────────────────────────────

const POLL_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

async function createPoll(config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  if (!guild) throw new Error('createPoll: no guild');

  const channelId = resolve(config.channelId || '', ctx);
  const channel   = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : ctx.interaction?.channel;

  if (!channel?.send) throw new Error('createPoll: channel not found');

  const question = resolve(config.question || 'Poll', ctx);
  const options  = (config.options || [])
    .map((o, i) => ({ label: resolve(o.label || o, ctx), emoji: POLL_EMOJIS[i] }))
    .slice(0, 10);

  if (options.length < 2) throw new Error('createPoll: at least 2 options required');

  const description = options.map(o => `${o.emoji} ${o.label}`).join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${question}`)
    .setDescription(description)
    .setColor(parseInt((config.color || '#6366f1').replace('#', ''), 16))
    .setTimestamp()
    .setFooter({ text: 'React to vote!' });

  const msg = await channel.send({ embeds: [embed] });

  for (const o of options) {
    await msg.react(o.emoji).catch(() => {});
  }

  ctx.variables['poll.messageId'] = msg.id;
  ctx.variables['poll.channelId'] = channel.id;
  return { nextHandle: 'output' };
}

// ─── Create Giveaway ─────────────────────────────────────────────────────────

async function giveawayCreate(config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  if (!guild) throw new Error('giveawayCreate: no guild');

  const channelId = resolve(config.channelId || '', ctx);
  const channel   = channelId
    ? await guild.channels.fetch(channelId).catch(() => null)
    : ctx.interaction?.channel;

  if (!channel?.send) throw new Error('giveawayCreate: channel not found');

  const prize    = resolve(config.prize    || 'Prize', ctx);
  const winners  = Math.max(1, Number(resolve(config.winners || '1', ctx)) || 1);
  const duration = Math.max(1, Number(resolve(config.duration || '60', ctx)) || 60); // seconds

  const endsAt = new Date(Date.now() + duration * 1000);

  const embed = new EmbedBuilder()
    .setTitle('🎉 GIVEAWAY 🎉')
    .setDescription(`**${prize}**\n\nReact with 🎉 to enter!\n🏆 **${winners}** winner(s)\n⏰ Ends: <t:${Math.floor(endsAt.getTime() / 1000)}:R>`)
    .setColor(0xf472b6)
    .setTimestamp(endsAt)
    .setFooter({ text: `${winners} winner(s)` });

  const msg = await channel.send({ embeds: [embed] });
  await msg.react('🎉');

  ctx.variables['giveaway.messageId'] = msg.id;
  ctx.variables['giveaway.channelId'] = channel.id;
  ctx.variables['giveaway.prize']     = prize;
  ctx.variables['giveaway.winners']   = String(winners);
  ctx.variables['giveaway.endsAt']    = endsAt.toISOString();

  // Store in DB if available for later ending
  if (ctx.db) {
    await ctx.db.exec(`
      CREATE TABLE IF NOT EXISTS dnc_giveaways (
        message_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        guild_id   TEXT NOT NULL,
        prize      TEXT NOT NULL,
        winners    INTEGER DEFAULT 1,
        ends_at    TEXT NOT NULL,
        ended      INTEGER DEFAULT 0
      )
    `);
    await ctx.db.run(
      'INSERT OR REPLACE INTO dnc_giveaways (message_id, channel_id, guild_id, prize, winners, ends_at) VALUES (?, ?, ?, ?, ?, ?)',
      [msg.id, channel.id, guild.id, prize, winners, endsAt.toISOString()]
    );
  }

  return { nextHandle: 'output' };
}

// ─── End Giveaway ────────────────────────────────────────────────────────────

async function giveawayEnd(config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  if (!guild) throw new Error('giveawayEnd: no guild');

  const messageId = resolve(config.messageId || '{giveaway.messageId}', ctx);
  const channelId = resolve(config.channelId || '{giveaway.channelId}', ctx);

  if (!messageId || !channelId) throw new Error('giveawayEnd: messageId and channelId required');

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel) throw new Error('giveawayEnd: channel not found');

  const msg = await channel.messages.fetch(messageId).catch(() => null);
  if (!msg) throw new Error('giveawayEnd: message not found');

  // Get participants (users who reacted with 🎉)
  const reaction = msg.reactions.cache.get('🎉');
  if (!reaction) throw new Error('giveawayEnd: no 🎉 reaction found');

  const users = await reaction.users.fetch();
  const participants = users.filter(u => !u.bot).map(u => u.id);

  const winnersCount = Number(resolve(config.winners || '{giveaway.winners}', ctx)) || 1;
  const prize        = resolve(config.prize || '{giveaway.prize}', ctx);

  // Pick random winners
  const selected = [];
  const pool = [...participants];
  for (let i = 0; i < Math.min(winnersCount, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }

  const winnerMentions = selected.map(id => `<@${id}>`).join(', ') || 'No participants';

  const embed = new EmbedBuilder()
    .setTitle('🎉 GIVEAWAY ENDED 🎉')
    .setDescription(`**${prize}**\n\n🏆 **Winner(s):** ${winnerMentions}`)
    .setColor(0x6b7280)
    .setTimestamp();

  await msg.edit({ embeds: [embed], components: [] });
  await channel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);

  ctx.variables['giveaway.winnerIds']   = JSON.stringify(selected);
  ctx.variables['giveaway.winnerCount'] = String(selected.length);
  ctx.variables['giveaway.totalEntries'] = String(participants.length);

  // Mark as ended in DB
  if (ctx.db) {
    await ctx.db.run('UPDATE dnc_giveaways SET ended = 1 WHERE message_id = ?', [messageId]).catch(() => {});
  }

  return { nextHandle: 'output' };
}
