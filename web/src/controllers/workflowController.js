import { createWorkflow, getWorkflowsByUser, getWorkflowById, updateWorkflow, deleteWorkflow, deployWorkflow } from '../services/workflowService.js';
import { MAX_NODES_PER_WORKFLOW } from '../config/constants.js';

export async function listWorkflows(req, res) {
  try {
    const workflows = await getWorkflowsByUser(req.user.userId);
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get workflows' });
  }
}

export async function getWorkflow(req, res) {
  try {
    const workflow = await getWorkflowById(req.params.id, req.user.userId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get workflow' });
  }
}

export async function createWorkflowHandler(req, res) {
  try {
    const { name, description, nodes = [], connections = [] } = req.body;

    if (nodes.length > MAX_NODES_PER_WORKFLOW) {
      return res.status(400).json({ error: 'Maximum 50 nodes allowed' });
    }

    const id = await createWorkflow(req.user.userId, name, description, nodes, connections);
    const workflow = await getWorkflowById(id, req.user.userId);

    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workflow' });
  }
}

export async function updateWorkflowHandler(req, res) {
  try {
    const { name, description, nodes, connections } = req.body;

    if (nodes.length > MAX_NODES_PER_WORKFLOW) {
      return res.status(400).json({ error: 'Maximum 50 nodes allowed' });
    }

    const id = req.params.id;
    await updateWorkflow(id, req.user.userId, name, description, nodes, connections);
    const workflow = await getWorkflowById(id, req.user.userId);

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workflow' });
  }
}

export async function deleteWorkflowHandler(req, res) {
  try {
    const id = req.params.id;
    await deleteWorkflow(id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
}

export async function deployWorkflowHandler(req, res) {
  try {
    const id = req.params.id;
    await deployWorkflow(id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy workflow' });
  }
}
