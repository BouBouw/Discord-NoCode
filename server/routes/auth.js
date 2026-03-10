import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { registerUser, getUserByEmail } from '../services/authService.js';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await registerUser(email, password);

    res.status(201).json({ user });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/discord', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
