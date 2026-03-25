import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/users/preferences
router.get('/', authenticate, async (req, res, next) => {
  try {
    const [[row]] = await pool.query(
      'SELECT prefs FROM user_preferences WHERE user_id = ?',
      [req.user.userId],
    );
    res.json(row ? row.prefs : {});
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/preferences
router.put('/', authenticate, async (req, res, next) => {
  try {
    const prefs = JSON.stringify(req.body ?? {});
    await pool.query(
      `INSERT INTO user_preferences (user_id, prefs)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE prefs = VALUES(prefs), updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, prefs],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
