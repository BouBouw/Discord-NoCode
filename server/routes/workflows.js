import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { attachPlan, checkWorkflowLimits } from '../middleware/planLimits.js';
import * as workflowController from '../controllers/workflowController.js';

const router = express.Router();

router.get('/', authenticate, workflowController.list);
router.post('/', authenticate, attachPlan, checkWorkflowLimits, workflowController.create);
router.get('/:id', authenticate, workflowController.get);
router.put('/:id', authenticate, attachPlan, checkWorkflowLimits, workflowController.update);
router.delete('/:id', authenticate, workflowController.deleteOne);
router.post('/:id/deploy', authenticate, workflowController.deploy);

export default router;
