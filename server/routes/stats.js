import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getOverview, getExecutionStats, getActivityFeed, getErrorStats } from '../controllers/statsController.js';

const router = express.Router();

router.get('/overview', authenticate, getOverview);
router.get('/executions', authenticate, getExecutionStats);
router.get('/activity', authenticate, getActivityFeed);
router.get('/errors', authenticate, getErrorStats);

export default router;
