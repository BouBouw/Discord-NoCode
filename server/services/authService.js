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

export async function getUserByDiscordId(discordId) {
  const [users] = await db.execute(
    'SELECT id, email, discord_id, created_at FROM users WHERE discord_id = ?',
    [discordId]
  );
  return users[0];
}

export async function loginOrRegisterWithDiscord(code) {
  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }),
  });
  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Discord token exchange failed: ${errText}`);
  }
  const tokenData = await tokenResponse.json();

  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userResponse.ok) {
    throw new Error('Failed to fetch Discord user info');
  }
  const discordUser = await userResponse.json();

  if (!discordUser.email) {
    throw new Error('Discord account has no verified email');
  }

  let user = await getUserByDiscordId(discordUser.id);
  let isNewUser = false;
  if (!user) {
    const existing = await getUserByEmail(discordUser.email);
    if (existing) {
      await linkDiscordAccount(existing.id, discordUser.id, tokenData.access_token);
      user = { ...existing, discord_id: discordUser.id };
    } else {
      const [result] = await db.execute(
        'INSERT INTO users (email, discord_id) VALUES (?, ?)',
        [discordUser.email, discordUser.id]
      );
      user = { id: result.insertId, email: discordUser.email, discord_id: discordUser.id };
      isNewUser = true;
    }
  }

  const token = generateToken({ userId: user.id, email: user.email });
  return {
    user: { id: user.id, email: user.email, discord_id: user.discord_id },
    token,
    isNewUser,
  };
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
