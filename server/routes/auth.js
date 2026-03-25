import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { registerUser, getUserByEmail, loginUser, loginOrRegisterWithDiscord } from '../services/authService.js';
import { applyReferral } from '../services/referralService.js';
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

router.get('/discord/callback', async (req, res) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const { code, state } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=discord_cancelled`);
  }
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

router.post('/refresh', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
