import db from '../config/database.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * GET /api/stats/overview
 * Aggregated dashboard overview for the logged-in user.
 */
export async function getOverview(req, res) {
  try {
    const userId = req.user.userId;

    const [botRows] = await db.execute(
      'SELECT status, COUNT(*) as count FROM bots WHERE user_id = ? GROUP BY status',
      [userId]
    );

    const [workflowRows] = await db.execute(
      'SELECT COUNT(*) as count FROM workflows WHERE user_id = ?',
      [userId]
    );

    const [execRows] = await db.execute(
      `SELECT e.status, COUNT(*) as count FROM executions e
       JOIN bots b ON e.bot_id = b.id
       WHERE b.user_id = ?
       GROUP BY e.status`,
      [userId]
    );

    const bots = { total: 0, active: 0, stopped: 0, errored: 0 };
    for (const r of botRows) {
      bots.total += r.count;
      if (r.status === 'active') bots.active = r.count;
      else if (r.status === 'stopped') bots.stopped = r.count;
      else if (r.status === 'errored') bots.errored = r.count;
    }

    const executions = { total: 0, running: 0, completed: 0, failed: 0 };
    for (const r of execRows) {
      executions.total += r.count;
      if (r.status === 'running') executions.running = r.count;
      else if (r.status === 'completed') executions.completed = r.count;
      else if (r.status === 'failed') executions.failed = r.count;
    }

    res.json({
      bots,
      workflows: workflowRows[0].count,
      executions,
    });
  } catch (error) {
    console.error('[Stats] getOverview error:', error);
    res.status(500).json({ error: 'Failed to get overview stats' });
  }
}

/**
 * GET /api/stats/executions?days=7
 * Execution counts grouped by day, for charts.
 */
export async function getExecutionStats(req, res) {
  try {
    const userId = req.user.userId;
    const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 90);

    const [rows] = await db.execute(
      `SELECT
         DATE(e.started_at) as date,
         SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN e.status = 'failed' THEN 1 ELSE 0 END) as failed,
         SUM(CASE WHEN e.status = 'running' THEN 1 ELSE 0 END) as running,
         COUNT(*) as total
       FROM executions e
       JOIN bots b ON e.bot_id = b.id
       WHERE b.user_id = ? AND e.started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(e.started_at)
       ORDER BY date ASC`,
      [userId, days]
    );

    // Fill in missing days with zeros
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const existing = rows.find(r => {
        const rd = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
        return rd === dateStr;
      });
      result.push({
        date: dateStr,
        completed: existing ? Number(existing.completed) : 0,
        failed: existing ? Number(existing.failed) : 0,
        running: existing ? Number(existing.running) : 0,
        total: existing ? Number(existing.total) : 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('[Stats] getExecutionStats error:', error);
    res.status(500).json({ error: 'Failed to get execution stats' });
  }
}

/**
 * GET /api/stats/activity?limit=10
 * Recent activity feed (executions + bot status changes).
 */
export async function getActivityFeed(req, res) {
  try {
    const userId = req.user.userId;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    // Recent executions
    const [execRows] = await db.execute(
      `SELECT
         e.id, e.status, e.started_at, e.completed_at,
         b.name as bot_name, b.id as bot_id,
         w.name as workflow_name, w.id as workflow_id
       FROM executions e
       JOIN bots b ON e.bot_id = b.id
       LEFT JOIN workflows w ON e.workflow_id = w.id
       WHERE b.user_id = ?
       ORDER BY e.started_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    // Recent bot events (start/stop = updated_at changes)
    const [botEvents] = await db.execute(
      `SELECT id, name, status, updated_at, started_at
       FROM bots
       WHERE user_id = ? AND updated_at IS NOT NULL
       ORDER BY updated_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    // Merge and sort
    const activities = [];

    for (const e of execRows) {
      activities.push({
        type: 'execution',
        status: e.status,
        botName: e.bot_name,
        botId: e.bot_id,
        workflowName: e.workflow_name,
        workflowId: e.workflow_id,
        timestamp: e.started_at,
      });
    }

    for (const b of botEvents) {
      activities.push({
        type: 'bot_status',
        status: b.status,
        botName: b.name,
        botId: b.id,
        timestamp: b.updated_at,
        startedAt: b.started_at,
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, limit));
  } catch (error) {
    console.error('[Stats] getActivityFeed error:', error);
    res.status(500).json({ error: 'Failed to get activity feed' });
  }
}

/**
 * GET /api/stats/errors?days=7
 * Error rate widget data.
 */
export async function getErrorStats(req, res) {
  try {
    const userId = req.user.userId;
    const days = Math.min(Math.max(parseInt(req.query.days) || 7, 1), 90);

    const [rows] = await db.execute(
      `SELECT
         DATE(e.started_at) as date,
         SUM(CASE WHEN e.status = 'failed' THEN 1 ELSE 0 END) as errors,
         COUNT(*) as total
       FROM executions e
       JOIN bots b ON e.bot_id = b.id
       WHERE b.user_id = ? AND e.started_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(e.started_at)
       ORDER BY date ASC`,
      [userId, days]
    );

    const totalErrors = rows.reduce((sum, r) => sum + Number(r.errors), 0);
    const totalExecs = rows.reduce((sum, r) => sum + Number(r.total), 0);
    const errorRate = totalExecs > 0 ? ((totalErrors / totalExecs) * 100).toFixed(1) : '0.0';

    // Fill days
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const existing = rows.find(r => {
        const rd = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
        return rd === dateStr;
      });
      result.push({
        date: dateStr,
        errors: existing ? Number(existing.errors) : 0,
        total: existing ? Number(existing.total) : 0,
      });
    }

    res.json({
      totalErrors,
      totalExecutions: totalExecs,
      errorRate: parseFloat(errorRate),
      daily: result,
    });
  } catch (error) {
    console.error('[Stats] getErrorStats error:', error);
    res.status(500).json({ error: 'Failed to get error stats' });
  }
}

/**
 * GET /api/bots/:id/resources
 * Docker container resource usage (CPU + memory).
 */
export async function getContainerResources(req, res) {
  try {
    const botId = parseInt(req.params.id);
    if (isNaN(botId)) return res.status(400).json({ error: 'Invalid bot ID' });

    // Verify ownership
    const [botRows] = await db.execute(
      'SELECT id FROM bots WHERE id = ? AND user_id = ?',
      [botId, req.user.userId]
    );
    if (botRows.length === 0) return res.status(404).json({ error: 'Bot not found' });

    const containerName = `discord-bot-${botId}`;

    try {
      const { stdout } = await execAsync(
        `docker stats ${containerName} --no-stream --format "{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}\\t{{.NetIO}}\\t{{.PIDs}}"`,
        { timeout: 10000 }
      );

      const parts = stdout.trim().split('\t');
      if (parts.length >= 4) {
        res.json({
          cpu: parts[0].trim(),
          memUsage: parts[1].trim(),
          memPercent: parts[2].trim(),
          netIO: parts[3].trim(),
          pids: parts[4]?.trim() || '0',
          running: true,
        });
      } else {
        res.json({ cpu: '0%', memUsage: '0B / 0B', memPercent: '0%', netIO: '0B / 0B', pids: '0', running: false });
      }
    } catch {
      res.json({ cpu: '0%', memUsage: '0B / 0B', memPercent: '0%', netIO: '0B / 0B', pids: '0', running: false });
    }
  } catch (error) {
    console.error('[Stats] getContainerResources error:', error);
    res.status(500).json({ error: 'Failed to get container resources' });
  }
}
