import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { listBots, getBot, createBotHandler, updateBotHandler, deleteBotHandler, startBot, stopBot, getBotContainerStatus, getBotLogs, listAllContainers } from '../controllers/botController.js';

const router = express.Router();

// GET /api/bots - List all bots for the authenticated user
router.get('/', authenticate, listBots);

// GET /api/bots/:id - Get a specific bot by ID
router.get('/:id', authenticate, getBot);

// POST /api/bots - Create a new bot
router.post('/', authenticate, createBotHandler);

// PUT /api/bots/:id - Update a bot
router.put('/:id', authenticate, updateBotHandler);

// DELETE /api/bots/:id - Delete a bot
router.delete('/:id', authenticate, deleteBotHandler);

// POST /api/bots/:id/start - Start a bot
router.post('/:id/start', authenticate, startBot);

// POST /api/bots/:id/stop - Stop a bot
router.post('/:id/stop', authenticate, stopBot);

// GET /api/bots/:id/status - Get bot container status
router.get('/:id/status', authenticate, getBotContainerStatus);

// GET /api/bots/:id/logs - Get bot container logs
router.get('/:id/logs', authenticate, getBotLogs);

// GET /api/bots/containers - List all bot containers (admin only)
router.get('/containers', authenticate, listAllContainers);

export default router;
