import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
