import { EmbedBuilder } from 'discord.js';
import { resolve } from '../context.js';

/**
 * Phase 3 — Economy nodes:
 *   economyGive, economyTake, economyBalance, economyLeaderboard
 */
export async function executeAction(type, config, ctx) {
  switch (type) {
    case 'economyGive':        return economyGive(config, ctx);
    case 'economyTake':        return economyTake(config, ctx);
    case 'economyBalance':     return economyBalance(config, ctx);
    case 'economyLeaderboard': return economyLeaderboard(config, ctx);
    default: return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ensureEconomyTable(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dnc_economy (
      guild_id TEXT NOT NULL,
      user_id  TEXT NOT NULL,
      balance  INTEGER DEFAULT 0,
      bank     INTEGER DEFAULT 0,
      PRIMARY KEY (guild_id, user_id)
    )
  `);
}

// ─── Give Currency ───────────────────────────────────────────────────────────

async function economyGive(config, ctx) {
  if (!ctx.db) throw new Error('economyGive: no database');
  await ensureEconomyTable(ctx.db);

  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const userId  = resolve(config.userId || '{user.id}', ctx);
  const guildId = guild?.id ?? resolve(config.guildId || '', ctx);
  const amount  = Math.max(0, Math.floor(Number(resolve(config.amount || '100', ctx)) || 100));

  if (!guildId || !userId) throw new Error('economyGive: guildId and userId required');

  await ctx.db.run(
    `INSERT INTO dnc_economy (guild_id, user_id, balance)
     VALUES (?, ?, ?)
     ON CONFLICT(guild_id, user_id) DO UPDATE SET balance = balance + ?`,
    [guildId, userId, amount, amount]
  );

  const row = await ctx.db.get(
    'SELECT balance, bank FROM dnc_economy WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );

  ctx.variables['economy.balance'] = String(row?.balance ?? amount);
  ctx.variables['economy.bank']    = String(row?.bank ?? 0);
  ctx.variables['economy.userId']  = userId;
  ctx.variables['economy.added']   = String(amount);

  return { nextHandle: 'output' };
}

// ─── Take Currency ───────────────────────────────────────────────────────────

async function economyTake(config, ctx) {
  if (!ctx.db) throw new Error('economyTake: no database');
  await ensureEconomyTable(ctx.db);

  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const userId  = resolve(config.userId || '{user.id}', ctx);
  const guildId = guild?.id ?? resolve(config.guildId || '', ctx);
  const amount  = Math.max(0, Math.floor(Number(resolve(config.amount || '100', ctx)) || 100));

  if (!guildId || !userId) throw new Error('economyTake: guildId and userId required');

  const row = await ctx.db.get(
    'SELECT balance FROM dnc_economy WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );

  const current = row?.balance ?? 0;

  if (current < amount) {
    ctx.variables['economy.balance']      = String(current);
    ctx.variables['economy.userId']       = userId;
    ctx.variables['economy.insufficient'] = String(amount - current);
    return { nextHandle: 'insufficient' };
  }

  await ctx.db.run(
    'UPDATE dnc_economy SET balance = balance - ? WHERE guild_id = ? AND user_id = ?',
    [amount, guildId, userId]
  );

  ctx.variables['economy.balance'] = String(current - amount);
  ctx.variables['economy.userId']  = userId;
  ctx.variables['economy.removed'] = String(amount);

  return { nextHandle: 'output' };
}

// ─── Check Balance ───────────────────────────────────────────────────────────

async function economyBalance(config, ctx) {
  if (!ctx.db) throw new Error('economyBalance: no database');
  await ensureEconomyTable(ctx.db);

  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const userId  = resolve(config.userId || '{user.id}', ctx);
  const guildId = guild?.id ?? resolve(config.guildId || '', ctx);

  const row = await ctx.db.get(
    'SELECT balance, bank FROM dnc_economy WHERE guild_id = ? AND user_id = ?',
    [guildId, userId]
  );

  ctx.variables['economy.balance'] = String(row?.balance ?? 0);
  ctx.variables['economy.bank']    = String(row?.bank ?? 0);
  ctx.variables['economy.total']   = String((row?.balance ?? 0) + (row?.bank ?? 0));
  ctx.variables['economy.userId']  = userId;

  return { nextHandle: 'output' };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

async function economyLeaderboard(config, ctx) {
  if (!ctx.db) throw new Error('economyLeaderboard: no database');
  await ensureEconomyTable(ctx.db);

  const guild   = ctx.interaction?.guild ?? ctx.event?.[0]?.guild;
  const guildId = guild?.id ?? resolve(config.guildId || '', ctx);
  const limit   = Math.min(25, Math.max(1, Number(resolve(config.limit || '10', ctx)) || 10));

  const rows = await ctx.db.all(
    'SELECT user_id, balance, bank FROM dnc_economy WHERE guild_id = ? ORDER BY (balance + bank) DESC LIMIT ?',
    [guildId, limit]
  );

  const lines = [];
  for (let i = 0; i < rows.length; i++) {
    const r     = rows[i];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
    const total = r.balance + r.bank;
    lines.push(`${medal} <@${r.user_id}> — 💰 ${total.toLocaleString()}`);
  }

  const currencyName = resolve(config.currencyName || 'coins', ctx);

  const embed = new EmbedBuilder()
    .setTitle(`🏆 ${resolve(config.title || 'Leaderboard', ctx)}`)
    .setDescription(lines.join('\n') || 'No data yet.')
    .setColor(parseInt((config.color || '#eab308').replace('#', ''), 16))
    .setFooter({ text: `Currency: ${currencyName}` })
    .setTimestamp();

  // Send the leaderboard
  if (ctx.interaction) {
    if (!ctx.interaction.replied && !ctx.interaction.deferred) {
      await ctx.interaction.reply({ embeds: [embed] });
    } else {
      const ch = ctx.interaction.channel;
      if (ch) await ch.send({ embeds: [embed] });
    }
  } else {
    const ch = ctx.event?.[0]?.channel;
    if (ch?.send) await ch.send({ embeds: [embed] });
  }

  ctx.variables['economy.leaderboard'] = JSON.stringify(rows);
  return { nextHandle: 'output' };
}
