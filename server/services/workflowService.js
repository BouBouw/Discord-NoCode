import db from '../config/database.js';
import { MAX_NODES_PER_WORKFLOW } from '../config/constants.js';

export async function createWorkflow(userId, name, description, nodes, connections) {
  if (nodes.length > MAX_NODES_PER_WORKFLOW) {
    throw new Error(`Maximum ${MAX_NODES_PER_WORKFLOW} nodes allowed per workflow`);
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO workflows (user_id, name, description, nodes, connections, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, description, JSON.stringify(nodes), JSON.stringify(connections), false]
    );

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getWorkflowsByUserId(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM workflows WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  return rows.map(row => {
    try {
      return {
        ...row,
        nodes: JSON.parse(row.nodes || '[]'),
        connections: JSON.parse(row.connections || '[]')
      };
    } catch (error) {
      console.error('Error parsing workflow JSON for id', row.id, ':', error);
      return {
        ...row,
        nodes: [],
        connections: []
      };
    }
  });
}

export async function getWorkflowById(id, userId) {
  const [rows] = await db.execute(
    'SELECT * FROM workflows WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (rows.length === 0) return null;

  const row = rows[0];

  try {
    return {
      ...row,
      nodes: JSON.parse(row.nodes || '[]'),
      connections: JSON.parse(row.connections || '[]')
    };
  } catch (error) {
    console.error('Error parsing workflow JSON for id', id, ':', error);
    throw new Error('Invalid workflow data format');
  }
}

export async function updateWorkflow(id, userId, name, description, nodes, connections) {
  const [result] = await db.execute(
    'UPDATE workflows SET name = ?, description = ?, nodes = ?, connections = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [name, description, JSON.stringify(nodes), JSON.stringify(connections), id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Workflow not found');
  }
}

export async function deleteWorkflow(id, userId) {
  const [result] = await db.execute(
    'DELETE FROM workflows WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Workflow not found');
  }
}

export async function deployWorkflow(id, userId) {
  const [result] = await db.execute(
    'UPDATE workflows SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Workflow not found');
  }
}
