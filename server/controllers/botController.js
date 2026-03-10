import { createBot, getBotsByUser, getBotById, getBotWithToken, updateBot, updateBotStatus, deleteBot } from '../services/botService.js';
import { BOT_STATUS } from '../config/constants.js';
import { z } from 'zod';

// Zod schemas for validation
const createBotSchema = z.object({
  name: z.string().min(1, 'Bot name is required'),
  discordToken: z.string().min(1, 'Discord token is required'),
  workflowId: z.number().optional(),
});

const updateBotSchema = z.object({
  name: z.string().min(1, 'Bot name is required').optional(),
  workflowId: z.number().optional(),
});

export async function listBots(req, res) {
  try {
    const bots = await getBotsByUser(req.user.userId);
    res.json(bots);
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(500).json({
      error: 'Failed to get bots',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function getBot(req, res) {
  try {
    const bot = await getBotById(req.params.id, req.user.userId);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    res.json(bot);
  } catch (error) {
    console.error('Error fetching bot:', error);
    res.status(500).json({
      error: 'Failed to get bot',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function createBotHandler(req, res) {
  try {
    // Validate request body
    const validationResult = createBotSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { name, discordToken, workflowId } = validationResult.data;

    const id = await createBot(req.user.userId, name, discordToken, workflowId);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found after creation' });
    }

    res.status(201).json(bot);
  } catch (error) {
    console.error('Error creating bot:', error);

    // Handle specific error messages
    if (error.message.includes('Maximum')) {
      return res.status(400).json({
        error: 'Bot limit reached',
        message: error.message,
      });
    }

    if (error.message.includes('required')) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to create bot',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function updateBotHandler(req, res) {
  try {
    // Validate request body
    const validationResult = updateBotSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const { name, workflowId } = validationResult.data;

    const id = req.params.id;
    await updateBot(id, req.user.userId, name, workflowId);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found after update' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Error updating bot:', error);

    if (error.message === 'Bot not found') {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (error.message.includes('required')) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to update bot',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function deleteBotHandler(req, res) {
  try {
    const id = req.params.id;
    await deleteBot(id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bot:', error);

    if (error.message === 'Bot not found') {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.status(500).json({
      error: 'Failed to delete bot',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function startBot(req, res) {
  try {
    const id = req.params.id;
    await updateBotStatus(id, req.user.userId, BOT_STATUS.ACTIVE);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found after starting' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Error starting bot:', error);

    if (error.message === 'Bot not found') {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (error.message === 'Invalid bot status') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to start bot',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function stopBot(req, res) {
  try {
    const id = req.params.id;
    await updateBotStatus(id, req.user.userId, BOT_STATUS.STOPPED);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found after stopping' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Error stopping bot:', error);

    if (error.message === 'Bot not found') {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (error.message === 'Invalid bot status') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to stop bot',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
