/**
 * botDbService.js
 * Manages MySQL connection pools to each bot's embedded MySQL instance.
 * The bot container exposes MySQL on a host port (db_port), which this
 * service connects to from the server process.
 */
import mysql from 'mysql2/promise';
import db from '../config/database.js';

/** Per-bot connection pool cache */
const pools = new Map();

/**
 * Get (or create) a mysql2 pool connected to a specific bot's MySQL.
 * @param {number} botId
 * @returns {Promise<import('mysql2/promise').Pool>}
 */
export async function getBotDbPool(botId) {
  if (pools.has(botId)) return pools.get(botId);

  const [rows] = await db.execute(
    'SELECT id, db_port FROM bots WHERE id = ?',
    [botId]
  );
  if (!rows.length) throw new Error('Bot not found');

  const bot = rows[0];
  if (!bot.db_port) {
    const err = new Error('db_port not configured — recreate the bot container to enable embedded MySQL');
    err.code = 'DB_UNAVAILABLE';
    throw err;
  }

  const pool = mysql.createPool({
    host: '127.0.0.1',
    port: bot.db_port,
    user: 'botuser',
    password: `bp_${bot.id}_${bot.id * 7 + 13}`,
    database: `bot_${bot.id}`,
    waitForConnections: true,
    connectionLimit: 3,
    connectTimeout: 5000,
    multipleStatements: true, // needed for the SQL runner
  });

  pools.set(botId, pool);
  return pool;
}

/**
 * Destroy the cached pool for a bot (call after purge or container restart).
 * @param {number} botId
 */
export function clearBotDbPool(botId) {
  const pool = pools.get(botId);
  if (pool) {
    pool.end().catch(() => {});
    pools.delete(botId);
  }
}

/**
 * Validate a SQL identifier (table/column name) to prevent injection.
 * Allows only alphanumeric chars and underscores.
 * @param {string} name
 * @returns {string} the validated name
 */
export function validateIdentifier(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid identifier: "${name}"`);
  }
  return name;
}

/**
 * Validate a column type (e.g. VARCHAR(255), INT, TEXT).
 * Allows alphanumeric, spaces, parentheses, commas, and single quotes.
 * @param {string} type
 * @returns {string} the validated type
 */
export function validateColumnType(type) {
  if (!/^[a-zA-Z0-9_\s(),'"]+$/.test(type)) {
    throw new Error(`Invalid column type: "${type}"`);
  }
  return type;
}
