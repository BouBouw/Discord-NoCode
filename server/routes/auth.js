import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { registerUser, getUserByEmail, loginUser, loginOrRegisterWithDiscord, linkDiscordFromCode, unlinkDiscordAccount } from '../services/authService.js';
import { applyReferral } from '../services/referralService.js';
import { verifyToken } from '../utils/jwt.js';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().max(32).optional(),
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, referralCode } = registerSchema.parse(req.body);

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await registerUser(email, password);

    // Apply referral if provided
    if (referralCode) {
      await applyReferral(user.id, referralCode).catch(() => {});
    }

    res.status(201).json({ user });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await loginUser(email, password);

    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/discord', (req, res) => {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_REDIRECT_URI) {
    return res.status(503).json({ error: 'Discord OAuth not configured' });
  }
  const state = req.query.ref ? String(req.query.ref) : '';
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
    ...(state ? { state } : {}),
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// Initiate Discord OAuth for linking an existing account (requires JWT in query)
router.get('/discord/link', (req, res) => {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_REDIRECT_URI) {
    return res.status(503).json({ error: 'Discord OAuth not configured' });
  }
  const token = req.query.token;
  if (!token) {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${FRONTEND_URL}/dashboard/settings?discord_link=error&reason=no_token`);
  }
  try {
    const decoded = verifyToken(String(token));
    // Encode link info in state: "link:<userId>:<jwt>"
    const state = `link:${decoded.userId}:${String(token)}`;
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify email',
      state,
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
  } catch {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${FRONTEND_URL}/dashboard/settings?discord_link=error&reason=invalid_token`);
  }
});

router.get('/discord/callback', async (req, res) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const { code, state } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=discord_cancelled`);
  }

  // Check if this is a "link" flow (state starts with "link:")
  if (state && String(state).startsWith('link:')) {
    const parts = String(state).split(':');
    if (parts.length < 3) {
      return res.redirect(`${FRONTEND_URL}/dashboard/settings?discord_link=error&reason=invalid_state`);
    }
    const userId = parseInt(parts[1], 10);
    const jwt = parts.slice(2).join(':');
    try {
      const decoded = verifyToken(jwt);
      if (decoded.userId !== userId) {
        return res.redirect(`${FRONTEND_URL}/dashboard/settings?discord_link=error&reason=invalid_token`);
      }
    } catch {
      return res.redirect(`${FRONTEND_URL}/dashboard/settings?discord_link=error&reason=expired_token`);
    }
    try {
      await linkDiscordFromCode(String(code), userId, process.env.DISCORD_REDIRECT_URI);
      return res.redirect(`${FRONTEND_URL}/dashboard/settings?discord_link=success`);
    } catch (error) {
      const reason = error.message === 'EMAIL_MISMATCH' ? 'email_mismatch'
        : error.message === 'DISCORD_ALREADY_LINKED' ? 'already_linked'
        : 'failed';
      return res.redirect(`${FRONTEND_URL}/dashboard/settings?discord_link=error&reason=${reason}`);
    }
  }

  // Normal login/register flow
  try {
    const result = await loginOrRegisterWithDiscord(String(code));

    // Apply referral if state contains a referral code (new user)
    if (state && result.isNewUser) {
      await applyReferral(result.user.id, String(state)).catch(() => {});
    }

    const params = new URLSearchParams({
      token: result.token,
      id: String(result.user.id),
      email: result.user.email,
      discord_id: result.user.discord_id || '',
    });
    res.redirect(`${FRONTEND_URL}/auth/discord/callback?${params}`);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=discord_failed`);
  }
});

// Unlink Discord account (requires auth)
router.post('/discord/unlink', authenticate, async (req, res) => {
  try {
    await unlinkDiscordAccount(req.user.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Discord unlink error:', error);
    res.status(500).json({ error: 'Failed to unlink Discord account' });
  }
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
