import { createWorkflow, getWorkflowsByUserId, getWorkflowById, updateWorkflow, deleteWorkflow, deployWorkflow } from '../services/workflowService.js';
import { getBotByWorkflowIdWithToken } from '../services/botService.js';
import { deployBotContainer } from '../services/dockerService.js';
import { z } from 'zod';

// Zod schemas for validation
const workflowNodeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.string(),
}).passthrough();

const workflowConnectionSchema = z.object({
  source: z.union([z.string(), z.number()]),
  target: z.union([z.string(), z.number()]),
}).passthrough();

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  nodes: z.array(workflowNodeSchema).min(0, 'Nodes must be an array'),
  connections: z.array(workflowConnectionSchema).min(0, 'Connections must be an array'),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  nodes: z.array(workflowNodeSchema).optional(),
  connections: z.array(workflowConnectionSchema).optional(),
});

export async function create(req, res) {
  try {
    // Validate request body
    const validationResult = createWorkflowSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { name, description, nodes, connections } = validationResult.data;

    const id = await createWorkflow(req.user.userId, name, description, nodes, connections);
    const workflow = await getWorkflowById(id, req.user.userId);

    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      error: 'Failed to create workflow',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function list(req, res) {
  try {
    const workflows = await getWorkflowsByUserId(req.user.userId);
    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      error: 'Failed to get workflows',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function get(req, res) {
  try {
    const workflow = await getWorkflowById(req.params.id, req.user.userId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      error: 'Failed to get workflow',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function update(req, res) {
  try {
    // Validate request body
    const validationResult = updateWorkflowSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { name, description, nodes, connections } = validationResult.data;

    const id = req.params.id;
    await updateWorkflow(id, req.user.userId, name, description, nodes, connections);
    const workflow = await getWorkflowById(id, req.user.userId);

    res.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({
      error: 'Failed to update workflow',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function deleteOne(req, res) {
  try {
    const id = req.params.id;
    await deleteWorkflow(id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      error: 'Failed to delete workflow',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function deploy(req, res) {
  try {
    const id = req.params.id;

    // 1. Mark workflow as active
    await deployWorkflow(id, req.user.userId);

    const workflow = await getWorkflowById(id, req.user.userId);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found after deploy' });

    // 2. Find the bot that uses this workflow and redeploy its container
    const bot = await getBotByWorkflowIdWithToken(id, req.user.userId);
    if (bot) {
      // Run async — don't block the HTTP response (rebuild can take ~30s)
      deployBotContainer(bot).catch(err =>
        console.error(`[Deploy] Container redeployment failed for bot ${bot.id}:`, err.message)
      );
      res.json({ ...workflow, deploying: true, botId: bot.id });
    } else {
      // No bot linked — workflow saved as active, user must link a bot
      res.json({ ...workflow, deploying: false, botId: null });
    }
  } catch (error) {
    console.error('Error deploying workflow:', error);
    res.status(500).json({
      error: 'Failed to deploy workflow',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
