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

// Route parameter validation schema
const botIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Bot ID must be a number').transform(val => parseInt(val, 10)),
});

export async function listBots(req, res) {
  try {
    const bots = await getBotsByUser(req.user.userId);
    res.json(bots);
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(error.statusCode || 500).json({
      error: error.code || 'DATABASE_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function getBot(req, res) {
  try {
    // Validate route parameter
    const validatedParams = botIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: validatedParams.error.errors,
      });
    }

    const { id } = validatedParams.data;
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Error fetching bot:', error);
    res.status(error.statusCode || 500).json({
      error: error.code || 'DATABASE_ERROR',
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
        error: 'VALIDATION_ERROR',
        details: validationResult.error.errors,
      });
    }

    const { name, discordToken, workflowId } = validationResult.data;

    const id = await createBot(req.user.userId, name, discordToken, workflowId);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    res.status(201).json(bot);
  } catch (error) {
    console.error('Error creating bot:', error);

    // Handle custom errors with error codes
    if (error.code) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'DATABASE_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function updateBotHandler(req, res) {
  try {
    // Validate route parameter
    const validatedParams = botIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: validatedParams.error.errors,
      });
    }

    // Validate request body
    const validationResult = updateBotSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: validationResult.error.errors,
      });
    }

    const { id } = validatedParams.data;
    const { name, workflowId } = validationResult.data;

    await updateBot(id, req.user.userId, name, workflowId);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Error updating bot:', error);

    // Handle custom errors with error codes
    if (error.code) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'DATABASE_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function deleteBotHandler(req, res) {
  try {
    // Validate route parameter
    const validatedParams = botIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: validatedParams.error.errors,
      });
    }

    const { id } = validatedParams.data;
    await deleteBot(id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bot:', error);

    // Handle custom errors with error codes
    if (error.code) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'DATABASE_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function startBot(req, res) {
  try {
    // Validate route parameter
    const validatedParams = botIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: validatedParams.error.errors,
      });
    }

    const { id } = validatedParams.data;
    await updateBotStatus(id, req.user.userId, BOT_STATUS.ACTIVE);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Error starting bot:', error);

    // Handle custom errors with error codes
    if (error.code) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'DATABASE_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export async function stopBot(req, res) {
  try {
    // Validate route parameter
    const validatedParams = botIdSchema.safeParse(req.params);
    if (!validatedParams.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: validatedParams.error.errors,
      });
    }

    const { id } = validatedParams.data;
    await updateBotStatus(id, req.user.userId, BOT_STATUS.STOPPED);
    const bot = await getBotById(id, req.user.userId);

    if (!bot) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Error stopping bot:', error);

    // Handle custom errors with error codes
    if (error.code) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'DATABASE_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
