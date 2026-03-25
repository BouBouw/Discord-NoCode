import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { attachPlan, checkBotLimit } from '../middleware/planLimits.js';
import {
  listBots, getBot, createBotHandler, updateBotHandler, deleteBotHandler,
  startBot, stopBot, getBotContainerStatus, getBotLogs, listAllContainers,
  getDbStatus,
} from '../controllers/botController.js';
import * as db from '../controllers/dbController.js';
import { getContainerResources } from '../controllers/statsController.js';

const router = express.Router();

// ─── Bot CRUD ──────────────────────────────────────────────────────────────
router.get('/',    authenticate, listBots);
router.get('/:id', authenticate, getBot);
router.post('/',   authenticate, attachPlan, checkBotLimit, createBotHandler);
router.put('/:id', authenticate, updateBotHandler);
router.delete('/:id', authenticate, deleteBotHandler);

// ─── Bot lifecycle ─────────────────────────────────────────────────────────
router.post('/:id/start',   authenticate, startBot);
router.post('/:id/stop',    authenticate, stopBot);
router.get('/:id/status',   authenticate, getBotContainerStatus);
router.get('/:id/logs',     authenticate, getBotLogs);
router.get('/containers',   authenticate, listAllContainers);
router.get('/:id/resources', authenticate, getContainerResources);

// ─── DB status (MySQL is inside the bot container) ────────────────────────
router.get('/:id/db/status', authenticate, getDbStatus);

// ─── DB Visualizer — Tables ───────────────────────────────────────────────
router.get('/:id/db/tables',              authenticate, db.listTables);
router.post('/:id/db/tables',             authenticate, db.createTable);
router.delete('/:id/db/tables/:table',    authenticate, db.dropTable);

// ─── DB Visualizer — Structure ────────────────────────────────────────────
router.get('/:id/db/tables/:table/structure',          authenticate, db.getTableStructure);
router.post('/:id/db/tables/:table/columns',           authenticate, db.addColumn);
router.delete('/:id/db/tables/:table/columns/:column', authenticate, db.dropColumn);

// ─── DB Visualizer — Rows ────────────────────────────────────────────────
router.get('/:id/db/tables/:table/rows',    authenticate, db.getTableRows);
router.post('/:id/db/tables/:table/rows',   authenticate, db.insertRow);
router.put('/:id/db/tables/:table/rows',    authenticate, db.updateRow);
router.delete('/:id/db/tables/:table/rows', authenticate, db.deleteRow);

// ─── DB Visualizer — SQL runner + Purge ──────────────────────────────────
router.post('/:id/db/query', authenticate, db.executeQuery);
router.post('/:id/db/purge', authenticate, db.purgeDb);

export default router;
