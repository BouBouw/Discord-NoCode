import db from '../config/database.js';
import { hashPassword } from '../utils/crypto.js';
import { comparePassword } from '../utils/crypto.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

export async function registerUser(email, password) {
  try {
    const passwordHash = await hashPassword(password);

    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    return { id: result.insertId, email };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Email already registered');
    }
    throw error; // Re-throw other errors for the error handler middleware
  }
}

export async function getUserByEmail(email) {
  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0];
  } catch (error) {
    throw error; // Re-throw for error handler middleware
  }
}

export async function getUserById(id) {
  try {
    const [users] = await db.execute(
      'SELECT id, email, discord_id, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0];
  } catch (error) {
    throw error; // Re-throw for error handler middleware
  }
}

export async function linkDiscordAccount(userId, discordId, discordToken) {
  try {
    await db.execute(
      'UPDATE users SET discord_id = ?, discord_token = ? WHERE id = ?',
      [discordId, discordToken, userId]
    );
  } catch (error) {
    throw error; // Re-throw for error handler middleware
  }
}

export async function loginUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return {
    user: { id: user.id, email: user.email },
    token,
    refreshToken
  };
}
