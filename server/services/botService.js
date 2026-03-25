import db from '../config/database.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { MAX_BOTS_PER_USER, BOT_STATUS } from '../config/constants.js';
import { ValidationError, NotFoundError, LimitExceededError, DatabaseError } from '../utils/errors.js';

export async function createBot(userId, name, discordToken, workflowId) {
  // Validate required fields
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Bot name is required');
  }

  if (!discordToken || discordToken.trim().length === 0) {
    throw new ValidationError('Discord token is required');
  }

  // Validate workflow ID if provided
  if (workflowId !== null && workflowId !== undefined) {
    const [workflowRows] = await db.execute(
      'SELECT id FROM workflows WHERE id = ? AND user_id = ?',
      [workflowId, userId]
    );

    if (workflowRows.length === 0) {
      throw new ValidationError('Workflow not found or does not belong to user');
    }
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check bot limit within transaction to prevent race condition
    const [countRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM bots WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    const botCount = countRows[0].count;
    if (botCount >= MAX_BOTS_PER_USER) {
      await connection.rollback();
      throw new LimitExceededError(`Maximum ${MAX_BOTS_PER_USER} bots allowed per user`);
    }

    // Encrypt the Discord token
    const encryptedToken = encrypt(discordToken);

    const [result] = await connection.execute(
      'INSERT INTO bots (user_id, name, discord_token, status, workflow_id) VALUES (?, ?, ?, ?, ?)',
      [userId, name, encryptedToken, BOT_STATUS.STOPPED, workflowId || null]
    );

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    console.error('Error creating bot:', error);

    // Re-throw custom errors as-is
    if (error.code) {
      throw error;
    }

    // Wrap database errors
    throw new DatabaseError('Failed to create bot');
  } finally {
    connection.release();
  }
}

export async function getBotsByUser(userId) {
  const [rows] = await db.execute(
    'SELECT id, user_id, name, status, workflow_id, port, db_port, created_at, started_at FROM bots WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  return rows;
}

export async function getBotById(id, userId) {
  const [rows] = await db.execute(
    'SELECT id, user_id, name, status, workflow_id, port, created_at FROM bots WHERE id = ? AND user_id = ?',
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
    throw new DatabaseError('Failed to decrypt bot token');
  }
}

/**
 * Get a bot by its assigned workflow ID, with decrypted Discord token.
 * Used by the deploy endpoint to restart the right container.
 */
export async function getBotByWorkflowIdWithToken(workflowId, userId) {
  const [rows] = await db.execute(
    'SELECT * FROM bots WHERE workflow_id = ? AND user_id = ?',
    [workflowId, userId]
  );
  if (rows.length === 0) return null;
  const bot = rows[0];
  try {
    return { ...bot, discord_token: decrypt(bot.discord_token) };
  } catch {
    throw new DatabaseError('Failed to decrypt bot token');
  }
}

export async function updateBot(id, userId, name, workflowId, discordToken) {
  if (workflowId !== null && workflowId !== undefined) {
    const [workflowRows] = await db.execute(
      'SELECT id FROM workflows WHERE id = ? AND user_id = ?',
      [workflowId, userId]
    );

    if (workflowRows.length === 0) {
      throw new ValidationError('Workflow not found or does not belong to user');
    }
  }

  // Build dynamic SET clause — only update fields that were provided
  const fields = [];
  const values = [];

  if (name !== undefined) {
    if (name.trim().length === 0) throw new ValidationError('Bot name is required');
    fields.push('name = ?');
    values.push(name);
  }

  if (workflowId !== undefined) {
    fields.push('workflow_id = ?');
    values.push(workflowId ?? null);
  }

  if (discordToken !== undefined) {
    if (discordToken.trim().length === 0) throw new ValidationError('Discord token cannot be empty');
    fields.push('discord_token = ?');
    values.push(encrypt(discordToken));
  }

  if (fields.length === 0) {
    throw new ValidationError('No fields to update');
  }

  values.push(id, userId);

  try {
    const [result] = await db.execute(
      `UPDATE bots SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('Bot not found');
    }
  } catch (error) {
    console.error('Error updating bot:', error);

    // Re-throw custom errors as-is
    if (error.code) {
      throw error;
    }

    // Wrap database errors
    throw new DatabaseError('Failed to update bot');
  }
}

export async function updateBotStatus(id, userId, status) {
  // Validate status
  const validStatuses = [BOT_STATUS.ACTIVE, BOT_STATUS.STOPPED, BOT_STATUS.ERRORED];
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid bot status');
  }

  try {
    const [result] = await db.execute(
      'UPDATE bots SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [status, id, userId]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('Bot not found');
    }
  } catch (error) {
    console.error('Error updating bot status:', error);

    // Re-throw custom errors as-is
    if (error.code) {
      throw error;
    }

    // Wrap database errors
    throw new DatabaseError('Failed to update bot status');
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
      throw new NotFoundError('Bot not found');
    }
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting bot:', error);

    // Re-throw custom errors as-is
    if (error.code) {
      throw error;
    }

    // Wrap database errors
    throw new DatabaseError('Failed to delete bot');
  } finally {
    connection.release();
  }
}
