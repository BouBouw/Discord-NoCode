import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import { initWebSocket } from './websocket/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import workflowRoutes from './routes/workflows.js';
import botRoutes from './routes/bots.js';
import errorHandler from './middleware/error.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/bots', botRoutes);

// Error handling
app.use(errorHandler);

// Initialize
async function start() {
  try {
    await initDatabase();
    initWebSocket(server);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
