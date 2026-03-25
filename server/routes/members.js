import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../config/database.js';
import { z } from 'zod';
import { getUserSubscription } from '../services/stripeService.js';
import { getPlanLimits } from '../config/plans.js';

const router = express.Router({ mergeParams: true }); // gets :workflowId from parent

// ── helpers ───────────────────────────────────────────────────────────────────

async function assertOwnerOrAdmin(workflowId, userId) {
  // Owner: user_id on workflows table
  const [[wf]] = await pool.query('SELECT user_id FROM workflows WHERE id = ?', [workflowId]);
  if (!wf) throw Object.assign(new Error('Workflow not found'), { status: 404 });
  if (wf.user_id === userId) return 'owner';
  // Admin member
  const [[member]] = await pool.query(
    "SELECT role FROM workflow_members WHERE workflow_id = ? AND user_id = ? AND status = 'accepted'",
    [workflowId, userId],
  );
  if (member?.role === 'admin') return 'admin';
  throw Object.assign(new Error('Forbidden'), { status: 403 });
}

async function assertAccess(workflowId, userId) {
  const [[wf]] = await pool.query('SELECT user_id FROM workflows WHERE id = ?', [workflowId]);
  if (!wf) throw Object.assign(new Error('Workflow not found'), { status: 404 });
  if (wf.user_id === userId) return 'owner';
  const [[member]] = await pool.query(
    "SELECT role FROM workflow_members WHERE workflow_id = ? AND user_id = ? AND status = 'accepted'",
    [workflowId, userId],
  );
  if (!member) throw Object.assign(new Error('Forbidden'), { status: 403 });
  return member.role;
}

// ── GET /api/workflows/:workflowId/members ────────────────────────────────────

router.get('/', authenticate, async (req, res, next) => {
  try {
    const workflowId = parseInt(req.params.workflowId);
    await assertAccess(workflowId, req.user.userId);

    // Include owner row (synthetic)
    const [[wf]] = await pool.query(
      'SELECT w.user_id, u.email FROM workflows w JOIN users u ON u.id = w.user_id WHERE w.id = ?',
      [workflowId],
    );

    const [rows] = await pool.query(
      `SELECT m.id, m.email, m.role, m.status, m.created_at,
              u.id AS user_id
       FROM workflow_members m
       LEFT JOIN users u ON u.email = m.email
       WHERE m.workflow_id = ?
       ORDER BY m.created_at ASC`,
      [workflowId],
    );

    res.json({
      owner: { email: wf.email, userId: wf.user_id, role: 'owner' },
      members: rows,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/workflows/:workflowId/members  (invite) ─────────────────────────

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['viewer', 'editor', 'admin']).default('viewer'),
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const workflowId = parseInt(req.params.workflowId);
    await assertOwnerOrAdmin(workflowId, req.user.userId);

    const result = inviteSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: 'Validation failed', details: result.error.errors });

    const { email, role } = result.data;

    // Prevent inviting self (owner)
    const [[owner]] = await pool.query('SELECT user_id FROM workflows WHERE id = ?', [workflowId]);
    const [[inviterUser]] = await pool.query('SELECT email FROM users WHERE id = ?', [req.user.userId]);
    if (inviterUser?.email === email) return res.status(400).json({ error: 'Vous ne pouvez pas vous inviter vous-même.' });

    // Check member limit based on owner's plan
    const ownerId = owner.user_id;
    const sub = await getUserSubscription(ownerId);
    const limits = getPlanLimits(sub.plan);
    const [[memberCount]] = await pool.query(
      'SELECT COUNT(*) as count FROM workflow_members WHERE workflow_id = ?',
      [workflowId],
    );
    // +1 for the owner (included in the limit)
    const totalMembers = memberCount.count + 1;
    if (totalMembers >= limits.maxMembersPerBot) {
      return res.status(403).json({
        error: `Limite de ${limits.maxMembersPerBot} membres atteinte (propriétaire inclus). Passez à un plan supérieur.`,
        code: 'MEMBER_LIMIT_REACHED',
        limit: limits.maxMembersPerBot,
        extraSeatPrice: limits.extraSeatPriceCents || 0,
      });
    }

    // Resolve user_id if already registered
    const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    const userId = existing?.id ?? null;

    // Upsert: if already invited, update role
    await pool.query(
      `INSERT INTO workflow_members (workflow_id, user_id, email, role, status, invited_by)
       VALUES (?, ?, ?, ?, 'pending', ?)
       ON DUPLICATE KEY UPDATE role = VALUES(role), user_id = VALUES(user_id)`,
      [workflowId, userId, email, role, req.user.userId],
    );

    const [[member]] = await pool.query(
      'SELECT * FROM workflow_members WHERE workflow_id = ? AND email = ?',
      [workflowId, email],
    );

    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/workflows/:workflowId/members/:memberId  (update role) ───────────

router.put('/:memberId', authenticate, async (req, res, next) => {
  try {
    const workflowId = parseInt(req.params.workflowId);
    const memberId   = parseInt(req.params.memberId);
    await assertOwnerOrAdmin(workflowId, req.user.userId);

    const { role } = req.body;
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Valeurs: viewer, editor, admin' });
    }

    await pool.query(
      'UPDATE workflow_members SET role = ? WHERE id = ? AND workflow_id = ?',
      [role, memberId, workflowId],
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/workflows/:workflowId/members/:memberId ───────────────────────

router.delete('/:memberId', authenticate, async (req, res, next) => {
  try {
    const workflowId = parseInt(req.params.workflowId);
    const memberId   = parseInt(req.params.memberId);
    await assertOwnerOrAdmin(workflowId, req.user.userId);

    await pool.query(
      'DELETE FROM workflow_members WHERE id = ? AND workflow_id = ?',
      [memberId, workflowId],
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/workflows/:workflowId/members/accept  (accept invite) ──────────

router.post('/accept', authenticate, async (req, res, next) => {
  try {
    const workflowId = parseInt(req.params.workflowId);
    const [[user]] = await pool.query('SELECT email FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await pool.query(
      "UPDATE workflow_members SET status = 'accepted', user_id = ? WHERE workflow_id = ? AND email = ? AND status = 'pending'",
      [req.user.userId, workflowId, user.email],
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
