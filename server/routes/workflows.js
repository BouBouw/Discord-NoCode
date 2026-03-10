import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.put('/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.delete('/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:id/deploy', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
