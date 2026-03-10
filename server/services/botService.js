import db from '../config/database.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { MAX_BOTS_PER_USER, BOT_STATUS } from '../config/constants.js';

export async function createBot(userId, name, discordToken, workflowId) {
  // Validate required fields
  if (!name || name.trim().length === 0) {
    throw new Error('Bot name is required');
  }

  if (!discordToken || discordToken.trim().length === 0) {
    throw new Error('Discord token is required');
  }

  // Check bot limit
  const [countRows] = await db.execute(
    'SELECT COUNT(*) as count FROM bots WHERE user_id = ?',
    [userId]
  );

  const botCount = countRows[0].count;
  if (botCount >= MAX_BOTS_PER_USER) {
    throw new Error(`Maximum ${MAX_BOTS_PER_USER} bots allowed per user`);
  }

  // Encrypt the Discord token
  const encryptedToken = encrypt(discordToken);

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO bots (user_id, name, discord_token, status, workflow_id) VALUES (?, ?, ?, ?, ?)',
      [userId, name, encryptedToken, BOT_STATUS.STOPPED, workflowId || null]
    );

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    console.error('Error creating bot:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function getBotsByUser(userId) {
  const [rows] = await db.execute(
    'SELECT id, user_id, name, status, workflow_id, created_at FROM bots WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  return rows;
}

export async function getBotById(id, userId) {
  const [rows] = await db.execute(
    'SELECT id, user_id, name, status, workflow_id, created_at FROM bots WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

export async function getBotWithToken(id, userId) {
  const [rows] = await db.execute(
    'SELECT * FROM bots WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (rows.length === 0) {
    return null;
  }

  const bot = rows[0];

  try {
    // Decrypt the Discord token
    const decryptedToken = decrypt(bot.discord_token);

    return {
      ...bot,
      discord_token: decryptedToken
    };
  } catch (error) {
    console.error('Error decrypting bot token:', error);
    throw new Error('Failed to decrypt bot token');
  }
}

export async function updateBot(id, userId, name, workflowId) {
  if (!name || name.trim().length === 0) {
    throw new Error('Bot name is required');
  }

  const [result] = await db.execute(
    'UPDATE bots SET name = ?, workflow_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [name, workflowId || null, id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Bot not found');
  }
}

export async function updateBotStatus(id, userId, status) {
  // Validate status
  const validStatuses = [BOT_STATUS.ACTIVE, BOT_STATUS.STOPPED, BOT_STATUS.ERRORED];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid bot status');
  }

  const [result] = await db.execute(
    'UPDATE bots SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [status, id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Bot not found');
  }
}

export async function deleteBot(id, userId) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // First, delete any executions associated with this bot
    await connection.execute(
      'DELETE FROM executions WHERE bot_id = ?',
      [id]
    );

    // Then delete the bot
    const [result] = await connection.execute(
      'DELETE FROM bots WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      throw new Error('Bot not found');
    }
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting bot:', error);
    throw error;
  } finally {
    connection.release();
  }
}
