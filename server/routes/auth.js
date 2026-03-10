import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
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
