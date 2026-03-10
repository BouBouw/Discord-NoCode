import db from '../config/database.js';
import { MAX_NODES_PER_WORKFLOW } from '../config/constants.js';

export async function createWorkflow(userId, name, description, nodes, connections) {
  if (nodes.length > MAX_NODES_PER_WORKFLOW) {
    throw new Error(`Maximum ${MAX_NODES_PER_WORKFLOW} nodes allowed per workflow`);
  }

  const [result] = await db.execute(
    'INSERT INTO workflows (user_id, name, description, nodes, connections, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, description, JSON.stringify(nodes), JSON.stringify(connections), false]
  );

  return result.insertId;
}

export async function getWorkflowsByUser(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM workflows WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(row => ({
    ...row,
    nodes: JSON.parse(row.nodes || '[]'),
    connections: JSON.parse(row.connections || '[]')
  }));
}

export async function getWorkflowById(id, userId) {
  const [rows] = await db.execute(
    'SELECT * FROM workflows WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    nodes: JSON.parse(row.nodes || '[]'),
    connections: JSON.parse(row.connections || '[]')
  };
}

export async function updateWorkflow(id, userId, name, description, nodes, connections) {
  await db.execute(
    'UPDATE workflows SET name = ?, description = ?, nodes = ?, connections = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [name, description, JSON.stringify(nodes), JSON.stringify(connections), id, userId]
  );
}

export async function deleteWorkflow(id, userId) {
  await db.execute(
    'DELETE FROM workflows WHERE id = ? AND user_id = ?',
    [id, userId]
  );
}

export async function deployWorkflow(id, userId) {
  await db.execute(
    'UPDATE workflows SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [id, userId]
  );
}
