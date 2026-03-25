import express from 'express';
import { internalAuth } from '../middleware/internalAuth.js';
import db from '../config/database.js';
import { broadcastExecutionEvent } from '../websocket/index.js';

const router = express.Router();

/**
 * GET /api/internal/workflow/:id
 * Used by bot containers to fetch their assigned workflow at startup.
 * Authenticated via Authorization: Bearer <INTERNAL_SECRET>
 */
router.get('/workflow/:id', internalAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'INVALID_ID' });

  try {
    const [rows] = await db.execute('SELECT * FROM workflows WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' });

    const row = rows[0];
    res.json({
      ...row,
      nodes:       JSON.parse(row.nodes       || '[]'),
      connections: JSON.parse(row.connections || '[]'),
    });
  } catch (err) {
    console.error('[Internal] workflow fetch error:', err);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/internal/execution-event
 * Bot containers push node/edge execution events here; server fans them out via
 * WebSocket to any browser tabs currently watching that workflow.
 * Body: { workflowId, type, nodeId?, sourceId?, targetId? }
 */
router.post('/execution-event', internalAuth, (req, res) => {
  const { workflowId, ...event } = req.body;
  if (!workflowId) return res.status(400).json({ error: 'MISSING_WORKFLOW_ID' });
  broadcastExecutionEvent(workflowId, { workflowId, ...event });
  res.json({ ok: true });
});

export default router;
