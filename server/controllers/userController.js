import { getUserById } from '../services/authService.js';
import db from '../config/database.js';

export async function getProfile(req, res) {
  try {
    const user = await getUserById(req.user.userId);

    // Get user's bots count
    const [bots] = await db.execute(
      'SELECT COUNT(*) as count FROM bots WHERE user_id = ?',
      [user.id]
    );

    // Get user's workflows count
    const [workflows] = await db.execute(
      'SELECT COUNT(*) as count FROM workflows WHERE user_id = ?',
      [user.id]
    );

    res.json({
      ...user,
      botsCount: bots[0].count,
      workflowsCount: workflows[0].count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
}
