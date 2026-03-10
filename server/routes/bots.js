import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:id/start', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:id/stop', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
