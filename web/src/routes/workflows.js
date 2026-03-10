import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listWorkflows,
  getWorkflow,
  createWorkflowHandler,
  updateWorkflowHandler,
  deleteWorkflowHandler,
  deployWorkflowHandler
} from '../controllers/workflowController.js';

const router = express.Router();

router.get('/', authenticate, listWorkflows);
router.get('/:id', authenticate, getWorkflow);
router.post('/', authenticate, createWorkflowHandler);
router.put('/:id', authenticate, updateWorkflowHandler);
router.delete('/:id', authenticate, deleteWorkflowHandler);
router.post('/:id/deploy', authenticate, deployWorkflowHandler);

export default router;
