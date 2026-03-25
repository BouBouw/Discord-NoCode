import './env.js';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { initDatabase } from './config/database.js';
import { initWebSocket } from './websocket/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import workflowRoutes from './routes/workflows.js';
import botRoutes from './routes/bots.js';
import internalRoutes from './routes/internal.js';
import aiRoutes from './routes/ai.js';
import membersRoutes from './routes/members.js';
import preferencesRoutes from './routes/preferences.js';
import statsRoutes from './routes/stats.js';
import subscriptionRoutes from './routes/subscription.js';
import partnerRoutes from './routes/partner.js';
import errorHandler from './middleware/error.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/workflows/:workflowId/members', membersRoutes);
app.use('/api/users/preferences', preferencesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/partner', partnerRoutes);

// Error handling
app.use(errorHandler);

// Initialize
async function start() {
  try {
    await initDatabase();

    let retries = 5;
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE' && retries > 0) {
        retries--;
        console.warn(`Port ${PORT} busy, retrying in 1s... (${retries} attempts left)`);
        setTimeout(() => server.listen(PORT), 1000);
      } else if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is still in use. Kill the process with: netstat -ano | findstr :${PORT}`);
        process.exit(1);
      } else {
        throw error;
      }
    });

    const wss = initWebSocket(server);
    wss.on('error', (error) => {
      if (error.code !== 'EADDRINUSE') {
        console.error('WebSocket error:', error);
      }
    });

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
