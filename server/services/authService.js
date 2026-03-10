import db from '../config/database.js';
import { hashPassword } from '../utils/crypto.js';

export async function registerUser(email, password) {
  const passwordHash = await hashPassword(password);

  const [result] = await db.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );

  return { id: result.insertId, email };
}

export async function getUserByEmail(email) {
  const [users] = await db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return users[0];
}

export async function getUserById(id) {
  const [users] = await db.execute(
    'SELECT id, email, discord_id, created_at FROM users WHERE id = ?',
    [id]
  );
  return users[0];
}

export async function linkDiscordAccount(userId, discordId, discordToken) {
  await db.execute(
    'UPDATE users SET discord_id = ?, discord_token = ? WHERE id = ?',
    [discordId, discordToken, userId]
  );
}
