# Discord NoCode Bot Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete no-code platform for creating Discord bots with a visual workflow canvas, React frontend, and NodeJS backend with WebSocket and MySQL.

**Architecture:** React frontend with TailwindCSS/React Flow, Express REST API + WebSocket backend, MySQL database for persistence, Discord.js for bot execution. 1 bot instance = 1 isolated execution environment.

**Tech Stack:** React 19, React Router 7, TailwindCSS 4, Motion, Lucide Icons, React Flow, Express, ws, MySQL2, bcrypt, JWT, Discord.js v14, dotenv, Zod

---

## Phase 1: Backend Setup

### Task 1: Initialize Backend Project

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`
- Create: `server/.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "discord-nocode-server",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "init-db": "node scripts/init-db.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "mysql2": "^3.6.5",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "zod": "^3.22.4",
    "discord.js": "^14.14.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.5"
  }
}
```

**Step 2: Create .env.example**

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=discord_nocode

# Server
PORT=3000
WS_PORT=3000

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Limits
MAX_BOTS_PER_USER=3
MAX_NODES_PER_WORKFLOW=50
```

**Step 3: Create .gitignore**

```gitignore
node_modules/
.env
.DS_Store
*.log
```

**Step 4: Install dependencies**

Run: `cd server && npm install`
Expected: node_modules created, packages installed

**Step 5: Commit**

```bash
cd server
git add package.json .env.example .gitignore
git commit -m "feat: initialize backend project with dependencies"
```

### Task 2: Create Backend Structure

**Files:**
- Create: `server/index.js`
- Create: `server/config/database.js`
- Create: `server/config/constants.js`
- Create: `server/middleware/auth.js`
- Create: `server/middleware/error.js`
- Create: `server/utils/crypto.js`
- Create: `server/utils/jwt.js`

**Step 1: Create index.js**

```javascript
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
```

**Step 2: Create config/database.js**

```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'discord_nocode',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        discord_id VARCHAR(255) UNIQUE,
        discord_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bots (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        discord_token TEXT NOT NULL,
        status ENUM('active', 'stopped', 'errored') DEFAULT 'stopped',
        workflow_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (workflow_id) REFERENCES workflows(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        nodes JSON NOT NULL,
        connections JSON NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS executions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        workflow_id INT NOT NULL,
        bot_id INT,
        status ENUM('running', 'completed', 'failed') DEFAULT 'running',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        logs JSON,
        FOREIGN KEY (workflow_id) REFERENCES workflows(id),
        FOREIGN KEY (bot_id) REFERENCES bots(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS nodes_catalog (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        config_schema JSON NOT NULL,
        icon VARCHAR(255),
        description TEXT
      )
    `);

    console.log('Database tables initialized');
  } finally {
    connection.release();
  }
}

export default pool;
```

**Step 3: Create config/constants.js**

```javascript
export const CATEGORIES = {
  TRIGGER: 'trigger',
  LOGIC: 'logic',
  HTTP: 'http',
  DISCORD: 'discord',
  CORE: 'core'
};

export const BOT_STATUS = {
  ACTIVE: 'active',
  STOPPED: 'stopped',
  ERRORED: 'errored'
};

export const EXECUTION_STATUS = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const MAX_BOTS_PER_USER = parseInt(process.env.MAX_BOTS_PER_USER) || 3;
export const MAX_NODES_PER_WORKFLOW = parseInt(process.env.MAX_NODES_PER_WORKFLOW) || 50;
```

**Step 4: Create middleware/auth.js**

```javascript
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt.js';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      req.user = verifyToken(token);
    }
    next();
  } catch (error) {
    next();
  }
}
```

**Step 5: Create middleware/error.js**

```javascript
export default function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  res.status(500).json({ error: 'Internal server error' });
}
```

**Step 6: Create utils/crypto.js**

```javascript
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.ENCRYPTION_KEY?.padEnd(32, '0').substring(0, 32);
const IV_LENGTH = 16;

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

**Step 7: Create utils/jwt.js**

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}
```

**Step 8: Create placeholder websocket/index.js**

```javascript
import { WebSocketServer } from 'ws';

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return wss;
}
```

**Step 9: Create placeholder routes files**

```javascript
// routes/auth.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/discord', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;

// routes/users.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;

// routes/workflows.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.put('/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.delete('/:id', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:id/deploy', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;

// routes/bots.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:id/start', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:id/stop', authenticate, (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
```

**Step 10: Commit**

```bash
cd server
git add index.js config/ middleware/ utils/ routes/ websocket/index.js
git commit -m "feat: create backend structure with middleware and routes"
```

---

## Phase 2: Authentication Implementation

### Task 3: Implement User Registration

**Files:**
- Modify: `server/routes/auth.js`
- Create: `server/services/authService.js`

**Step 1: Create authService.js**

```javascript
import db from '../config/database.js';
import { hashPassword } from '../utils/crypto.js';

export async function registerUser(email, password) {
  const passwordHash = await hashPassword(password);

  const [result] = await db.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );

  return { id: result.insertId, email };
}

export async function getUserByEmail(email) {
  const [users] = await db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return users[0];
}

export async function getUserById(id) {
  const [users] = await db.execute(
    'SELECT id, email, discord_id, created_at FROM users WHERE id = ?',
    [id]
  );
  return users[0];
}

export async function linkDiscordAccount(userId, discordId, discordToken) {
  await db.execute(
    'UPDATE users SET discord_id = ?, discord_token = ? WHERE id = ?',
    [discordId, discordToken, userId]
  );
}
```

**Step 2: Update routes/auth.js register endpoint**

```javascript
import { registerUser, getUserByEmail } from '../services/authService.js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await registerUser(email, password);

    res.status(201).json({ user });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});
```

**Step 3: Test with curl**

Run: `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'`
Expected: `{"user":{"id":1,"email":"test@example.com"}}`

**Step 4: Commit**

```bash
cd server
git add routes/auth.js services/authService.js
git commit -m "feat: implement user registration"
```

### Task 4: Implement Login

**Files:**
- Modify: `server/routes/auth.js`
- Modify: `server/services/authService.js`

**Step 1: Add login to authService.js**

```javascript
import { comparePassword } from '../utils/crypto.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

// Add after existing functions

export async function loginUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return {
    user: { id: user.id, email: user.email },
    token,
    refreshToken
  };
}
```

**Step 2: Add login endpoint to routes/auth.js**

```javascript
import { loginUser } from '../services/authService.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await loginUser(email, password);

    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});
```

**Step 3: Test login with curl**

Run: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'`
Expected: JSON with user, token, refreshToken

**Step 4: Commit**

```bash
cd server
git add routes/auth.js services/authService.js
git commit -m "feat: implement user login"
```

### Task 5: Implement Protected Routes

**Files:**
- Modify: `server/routes/users.js`
- Create: `server/controllers/userController.js`

**Step 1: Create userController.js**

```javascript
import { getUserById } from '../services/authService.js';
import db from '../config/database.js';

export async function getProfile(req, res) {
  try {
    const user = await getUserById(req.user.userId);

    // Get user's bots count
    const [bots] = await db.execute(
      'SELECT COUNT(*) as count FROM bots WHERE user_id = ?',
      [user.id]
    );

    // Get user's workflows count
    const [workflows] = await db.execute(
      'SELECT COUNT(*) as count FROM workflows WHERE user_id = ?',
      [user.id]
    );

    res.json({
      ...user,
      botsCount: bots[0].count,
      workflowsCount: workflows[0].count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
}
```

**Step 2: Update routes/users.js**

```javascript
import { authenticate } from '../middleware/auth.js';
import { getProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', authenticate, getProfile);

export default router;
```

**Step 3: Test protected route**

Run: `curl http://localhost:3000/api/users/me -H "Authorization: Bearer YOUR_TOKEN"`
Expected: User profile with botsCount and workflowsCount

**Step 4: Commit**

```bash
cd server
git add routes/users.js controllers/userController.js
git commit -m "feat: implement protected user profile route"
```

---

## Phase 3: Frontend Structure

### Task 6: Install Frontend Dependencies

**Files:**
- Modify: `web/package.json`

**Step 1: Install React Router and React Flow**

Run: `cd web && npm install react-router-dom reactflow`
Expected: Packages installed successfully

**Step 2: Commit**

```bash
cd web
git add package.json package-lock.json
git commit -m "feat: install react-router-dom and reactflow"
```

### Task 7: Create Frontend Structure

**Files:**
- Create: `web/src/router/index.jsx`
- Create: `web/src/contexts/AuthContext.jsx`
- Create: `web/src/layouts/MainLayout.jsx`
- Create: `web/src/components/Navbar.jsx`

**Step 1: Create router/index.jsx**

```jsx
import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

// Pages (to be created)
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import WorkflowEditorPage from '../pages/WorkflowEditorPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
      },
      {
        path: 'workflow/:id',
        element: <ProtectedRoute><WorkflowEditorPage /></ProtectedRoute>
      },
      {
        path: 'workflow/new',
        element: <ProtectedRoute><WorkflowEditorPage /></ProtectedRoute>
      }
    ]
  }
]);

export default router;
```

**Step 2: Create contexts/AuthContext.jsx**

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = { user, token, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Step 3: Create layouts/MainLayout.jsx**

```jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Outlet />
    </div>
  );
}
```

**Step 4: Create components/Navbar.jsx**

```jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Bot, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Bot className="w-8 h-8" />
            <span className="text-xl font-bold">Discord NoCode</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-blue-800 transition"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-blue-800 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded hover:bg-blue-800 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Step 5: Create components/ProtectedRoute.jsx**

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

**Step 6: Update main.tsx to use router**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

**Step 7: Commit**

```bash
cd web/src
git add router/ contexts/ layouts/ components/ main.tsx
cd ..
git commit -m "feat: create frontend structure with routing and auth context"
```

### Task 8: Create Landing Page

**Files:**
- Create: `web/src/pages/LandingPage.jsx`

**Step 1: Create LandingPage.jsx**

```jsx
import { Link } from 'react-router-dom';
import { Bot, Zap, Code, Shield, ArrowRight, MessageSquare, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Build Discord Bots{' '}
            <span className="text-blue-600">Without Code</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Create powerful Discord bots with our intuitive visual workflow editor.
            No coding required - just drag, drop, and deploy.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-12 h-12" />}
            title="Visual Workflow Editor"
            description="Drag and drop nodes to create complex bot behaviors. Connect triggers to actions effortlessly."
          />
          <FeatureCard
            icon={<Code className="w-12 h-12" />}
            title="All DiscordJS Features"
            description="Access every DiscordJS v14/v15 capability - from basic messaging to advanced moderation."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12" />}
            title="Secure & Reliable"
            description="Your bots run in isolated environments with enterprise-grade security and uptime."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 bg-blue-900 text-white rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            step={1}
            icon={<MessageSquare className="w-8 h-8" />}
            title="Create Your Bot"
            description="Sign up and create your first bot with a Discord token."
          />
          <StepCard
            step={2}
            icon={<Settings className="w-8 h-8" />}
            title="Build Workflow"
            description="Use the visual editor to add triggers, logic, and actions."
          />
          <StepCard
            step={3}
            icon={<Zap className="w-8 h-8" />}
            title="Deploy & Run"
            description="One-click deploy and your bot is live on Discord."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Ready to Build Your Bot?
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Join thousands of creators building amazing Discord experiences.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg text-lg"
        >
          <span>Start Building Now</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({ step, icon, title, description }) {
  return (
    <div className="text-center">
      <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold">{step}</span>
      </div>
      <div className="text-blue-200 mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-blue-200">{description}</p>
    </div>
  );
}
```

**Step 2: Test dev server**

Run: `cd web && npm run dev`
Expected: Landing page loads at http://localhost:5173

**Step 3: Commit**

```bash
cd web
git add src/pages/LandingPage.jsx
git commit -m "feat: create landing page"
```

---

## Phase 4: Authentication Pages

### Task 9: Create Login Page

**Files:**
- Create: `web/src/pages/LoginPage.jsx`
- Create: `web/src/services/api.js`

**Step 1: Create services/api.js**

```jsx
const API_BASE = 'http://localhost:3000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authAPI = {
  register: (email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => apiRequest('/users/me'),
};
```

**Step 2: Create LoginPage.jsx**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Bot, Mail, Lock, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-600 mt-2">Login to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
cd web
git add src/pages/LoginPage.jsx src/services/api.js
git commit -m "feat: create login page with API service"
```

### Task 10: Create Register Page

**Files:**
- Create: `web/src/pages/RegisterPage.jsx`

**Step 1: Create RegisterPage.jsx**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Bot, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api.js';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      try {
        await authAPI.register(email, password);
        const loginData = await authAPI.login(email, password);
        login(loginData.user, loginData.token);
        navigate('/dashboard');
      } catch (registerErr) {
        setError(registerErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-600 mt-2">Start building your bots today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Test authentication flow**

Run: `cd web && npm run dev`
Expected: Can navigate to /register, create account, redirect to /dashboard

**Step 3: Commit**

```bash
cd web
git add src/pages/RegisterPage.jsx
git commit -m "feat: create register page"
```

---

## Phase 5: Dashboard and Workflow Management

### Task 11: Create Dashboard Page

**Files:**
- Create: `web/src/pages/DashboardPage.jsx`
- Modify: `server/routes/workflows.js`
- Create: `server/services/workflowService.js`
- Create: `server/controllers/workflowController.js`

**Step 1: Create workflowService.js**

```javascript
import db from '../config/database.js';
import { MAX_NODES_PER_WORKFLOW } from '../config/constants.js';

export async function createWorkflow(userId, name, description, nodes, connections) {
  const [result] = await db.execute(
    'INSERT INTO workflows (user_id, name, description, nodes, connections) VALUES (?, ?, ?, ?, ?)',
    [userId, name, description, JSON.stringify(nodes), JSON.stringify(connections)]
  );
  return result.insertId;
}

export async function getWorkflowsByUser(userId) {
  const [workflows] = await db.execute(
    'SELECT id, name, description, is_active, created_at FROM workflows WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return workflows;
}

export async function getWorkflowById(id, userId) {
  const [workflows] = await db.execute(
    'SELECT * FROM workflows WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return workflows[0];
}

export async function updateWorkflow(id, userId, name, description, nodes, connections) {
  await db.execute(
    'UPDATE workflows SET name = ?, description = ?, nodes = ?, connections = ? WHERE id = ? AND user_id = ?',
    [name, description, JSON.stringify(nodes), JSON.stringify(connections), id, userId]
  );
}

export async function deleteWorkflow(id, userId) {
  await db.execute(
    'DELETE FROM workflows WHERE id = ? AND user_id = ?',
    [id, userId]
  );
}

export async function deployWorkflow(id, userId) {
  await db.execute(
    'UPDATE workflows SET is_active = true WHERE id = ? AND user_id = ?',
    [id, userId]
  );
}
```

**Step 2: Create workflowController.js**

```javascript
import { createWorkflow, getWorkflowsByUser, getWorkflowById, updateWorkflow, deleteWorkflow, deployWorkflow } from '../services/workflowService.js';
import db from '../config/database.js';
import { MAX_BOTS_PER_USER } from '../config/constants.js';

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
      return res.status(400).json({ error: `Maximum ${MAX_NODES_PER_WORKFLOW} nodes allowed` });
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
      return res.status(400).json({ error: `Maximum ${MAX_NODES_PER_WORKFLOW} nodes allowed` });
    }

    await updateWorkflow(req.params.id, req.user.userId, name, description, nodes, connections);
    const workflow = await getWorkflowById(req.params.id, req.user.userId);
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workflow' });
  }
}

export async function deleteWorkflowHandler(req, res) {
  try {
    await deleteWorkflow(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
}

export async function deployWorkflowHandler(req, res) {
  try {
    await deployWorkflow(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy workflow' });
  }
}
```

**Step 3: Update routes/workflows.js**

```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { listWorkflows, getWorkflow, createWorkflowHandler, updateWorkflowHandler, deleteWorkflowHandler, deployWorkflowHandler } from '../controllers/workflowController.js';

const router = express.Router();

router.get('/', authenticate, listWorkflows);
router.post('/', authenticate, createWorkflowHandler);
router.get('/:id', authenticate, getWorkflow);
router.put('/:id', authenticate, updateWorkflowHandler);
router.delete('/:id', authenticate, deleteWorkflowHandler);
router.post('/:id/deploy', authenticate, deployWorkflowHandler);

export default router;
```

**Step 4: Create DashboardPage.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Plus, Play, Edit2, Trash2, Bot, FileText, Clock } from 'lucide-react';
import { apiRequest } from '../services/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      const data = await apiRequest('/workflows');
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await apiRequest(`/workflows/${id}`, { method: 'DELETE' });
      loadWorkflows();
    } catch (error) {
      alert('Failed to delete workflow');
    }
  }

  async function handleDeploy(id) {
    try {
      await apiRequest(`/workflows/${id}/deploy`, { method: 'POST' });
      alert('Workflow deployed successfully!');
      loadWorkflows();
    } catch (error) {
      alert('Failed to deploy workflow');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Manage your Discord bots and workflows</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Bot className="w-8 h-8" />}
          title="Active Bots"
          value={user?.botsCount || 0}
          color="blue"
        />
        <StatCard
          icon={<FileText className="w-8 h-8" />}
          title="Workflows"
          value={workflows.length}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-8 h-8" />}
          title="Max Bots"
          value="3"
          color="purple"
        />
      </div>

      {/* Workflows */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Your Workflows</h2>
          <Link
            to="/workflow/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>New Workflow</span>
          </Link>
        </div>

        {workflows.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No workflows yet</h3>
            <p className="text-slate-600 mb-4">Create your first workflow to get started</p>
            <Link
              to="/workflow/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Workflow</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {workflows.map((workflow) => (
              <WorkflowItem
                key={workflow.id}
                workflow={workflow}
                onEdit={() => window.location.href = `/workflow/${workflow.id}`}
                onDelete={() => handleDelete(workflow.id)}
                onDeploy={() => handleDeploy(workflow.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-slate-600 mt-1">{title}</p>
    </div>
  );
}

function WorkflowItem({ workflow, onEdit, onDelete, onDeploy }) {
  return (
    <div className="p-6 hover:bg-slate-50 transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-900">{workflow.name}</h3>
          <p className="text-slate-600 text-sm mt-1">
            {workflow.description || 'No description'}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Created {new Date(workflow.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {workflow.is_active && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              Active
            </span>
          )}
          <button
            onClick={onDeploy}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            title="Deploy"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Update api.js to add workflow endpoints**

```jsx
// Add to services/api.js after authAPI object

export const workflowAPI = {
  list: () => apiRequest('/workflows'),
  get: (id) => apiRequest(`/workflows/${id}`),
  create: (data) =>
    apiRequest('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/workflows/${id}`, {
      method: 'DELETE',
    }),
  deploy: (id) =>
    apiRequest(`/workflows/${id}/deploy`, {
      method: 'POST',
    }),
};
```

**Step 6: Test dashboard**

Run: Test dev server and navigate to /dashboard
Expected: See workflows list, can create new workflow

**Step 7: Commit**

```bash
cd server
git add routes/workflows.js services/workflowService.js controllers/workflowController.js
git commit -m "feat: implement workflow CRUD endpoints"
cd ..
cd web
git add src/pages/DashboardPage.jsx src/services/api.js
git commit -m "feat: create dashboard page with workflow management"
```

---

## Phase 6: Workflow Canvas Editor

### Task 12: Create Workflow Editor Page with React Flow

**Files:**
- Create: `web/src/pages/WorkflowEditorPage.jsx`
- Create: `web/src/components/WorkflowCanvas.jsx`
- Create: `web/src/components/NodeSidebar.jsx`
- Create: `web/src/components/NodeTypes/CustomNode.jsx`
- Create: `web/src/constants/nodeTypes.js`

**Step 1: Create constants/nodeTypes.js**

```javascript
export const NODE_CATEGORIES = {
  TRIGGER: 'Trigger',
  LOGIC: 'Logic',
  HTTP: 'HTTP/API',
  DISCORD: 'Discord Actions',
  CORE: 'Core',
};

export const NODE_TYPES = [
  // Core
  {
    type: 'core',
    category: NODE_CATEGORIES.CORE,
    label: 'Core Bot',
    description: 'Main bot configuration',
    icon: 'bot',
    color: '#1e3a8a',
    required: true,
  },

  // Triggers
  {
    type: 'trigger-message',
    category: NODE_CATEGORIES.TRIGGER,
    label: 'Message Received',
    description: 'Trigger when a message is received',
    icon: 'message-square',
    color: '#7c3aed',
  },
  {
    type: 'trigger-reaction',
    category: NODE_CATEGORIES.TRIGGER,
    label: 'Reaction Added',
    description: 'Trigger when a reaction is added',
    icon: 'heart',
    color: '#7c3aed',
  },
  {
    type: 'trigger-member-join',
    category: NODE_CATEGORIES.TRIGGER,
    label: 'Member Joined',
    description: 'Trigger when a member joins the server',
    icon: 'user-plus',
    color: '#7c3aed',
  },

  // Logic
  {
    type: 'logic-condition',
    category: NODE_CATEGORIES.LOGIC,
    label: 'Condition',
    description: 'If/Else logic',
    icon: 'git-branch',
    color: '#2563eb',
  },
  {
    type: 'logic-delay',
    category: NODE_CATEGORIES.LOGIC,
    label: 'Delay',
    description: 'Wait for a period of time',
    icon: 'clock',
    color: '#2563eb',
  },
  {
    type: 'logic-variable',
    category: NODE_CATEGORIES.LOGIC,
    label: 'Variable',
    description: 'Store or retrieve a variable',
    icon: 'database',
    color: '#2563eb',
  },

  // HTTP
  {
    type: 'http-request',
    category: NODE_CATEGORIES.HTTP,
    label: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: 'globe',
    color: '#059669',
  },
  {
    type: 'http-webhook',
    category: NODE_CATEGORIES.HTTP,
    label: 'Webhook',
    description: 'Send payload to webhook URL',
    icon: 'webhook',
    color: '#059669',
  },

  // Discord Actions
  {
    type: 'discord-send-message',
    category: NODE_CATEGORIES.DISCORD,
    label: 'Send Message',
    description: 'Send a message to a channel',
    icon: 'send',
    color: '#ea580c',
  },
  {
    type: 'discord-add-role',
    category: NODE_CATEGORIES.DISCORD,
    label: 'Add Role',
    description: 'Add a role to a member',
    icon: 'shield-plus',
    color: '#ea580c',
  },
  {
    type: 'discord-create-role',
    category: NODE_CATEGORIES.DISCORD,
    label: 'Create Role',
    description: 'Create a new role',
    icon: 'shield',
    color: '#ea580c',
  },
  {
    type: 'discord-kick',
    category: NODE_CATEGORIES.DISCORD,
    label: 'Kick Member',
    description: 'Kick a member from the server',
    icon: 'user-x',
    color: '#ea580c',
  },
  {
    type: 'discord-ban',
    category: NODE_CATEGORIES.DISCORD,
    label: 'Ban Member',
    description: 'Ban a member from the server',
    icon: 'ban',
    color: '#ea580c',
  },
];
```

**Step 2: Create components/NodeTypes/CustomNode.jsx**

```jsx
import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function CustomNode({ data, type }) {
  const { label, icon, color, isRequired } = data;

  return (
    <div
      className="px-4 py-3 bg-white rounded-lg border-2 shadow-lg min-w-[180px]"
      style={{ borderColor: color }}
    >
      {type !== 'core' && (
        <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      )}

      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: color }}>
          <span className="text-white text-sm font-bold">{label[0]}</span>
        </div>
        <div>
          <div className="font-semibold text-slate-900 text-sm">{label}</div>
          {isRequired && (
            <span className="text-xs text-blue-600">Required</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
}

export default memo(CustomNode);
```

**Step 3: Create components/NodeSidebar.jsx**

```jsx
import { useState } from 'react';
import {
  Bot as BotIcon,
  MessageSquare,
  Heart,
  UserPlus,
  GitBranch,
  Clock,
  Database,
  Globe,
  Webhook,
  Send,
  ShieldPlus,
  Shield,
  UserX,
  Ban,
} from 'lucide-react';
import { NODE_CATEGORIES, NODE_TYPES } from '../constants/nodeTypes.js';

const iconMap = {
  bot: BotIcon,
  'message-square': MessageSquare,
  heart: Heart,
  'user-plus': UserPlus,
  'git-branch': GitBranch,
  clock: Clock,
  database: Database,
  globe: Globe,
  webhook: Webhook,
  send: Send,
  'shield-plus': ShieldPlus,
  shield: Shield,
  'user-x': UserX,
  ban: Ban,
};

export default function NodeSidebar({ onAddNode }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredNodes = selectedCategory
    ? NODE_TYPES.filter((node) => node.category === selectedCategory)
    : NODE_TYPES;

  return (
    <div className="w-72 bg-white border-r border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Node Library</h2>
        <div className="flex flex-wrap gap-2">
          <CategoryButton
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </CategoryButton>
          {Object.values(NODE_CATEGORIES).map((category) => (
            <CategoryButton
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </CategoryButton>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNodes.map((node) => (
          <NodeCard key={node.type} node={node} onAdd={() => onAddNode(node)} />
        ))}
      </div>
    </div>
  );
}

function CategoryButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-full transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function NodeCard({ node, onAdd }) {
  const Icon = iconMap[node.icon];

  return (
    <button
      onClick={onAdd}
      className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left"
    >
      <div className="flex items-center space-x-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ backgroundColor: node.color }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 text-sm">{node.label}</div>
          <div className="text-xs text-slate-500 truncate">{node.description}</div>
        </div>
      </div>
    </button>
  );
}
```

**Step 4: Create components/WorkflowCanvas.jsx**

```jsx
import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './NodeTypes/CustomNode.jsx';
import { NODE_TYPES } from '../constants/nodeTypes.js';

const nodeTypes = {
  custom: CustomNode,
};

export default function WorkflowCanvas({ workflowId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(!!workflowId);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  async function loadWorkflow() {
    try {
      const response = await fetch(`http://localhost:3000/api/workflows/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setNodes(data.nodes || []);
      setEdges(data.connections || []);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    } finally {
      setLoading(false);
    }
  }

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    []
  );

  const addNode = (nodeType) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        ...nodeType,
        isRequired: nodeType.required,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeData) return;

      const position = {
        x: event.clientX - 200,
        y: event.clientY - 100,
      };

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: JSON.parse(nodeData),
      };

      setNodes((nds) => [...nds, newNode]);
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data.color}
          className="!bg-white !border !border-slate-200"
        />
      </ReactFlow>
    </div>
  );
}
```

**Step 5: Create pages/WorkflowEditorPage.jsx**

```jsx
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Play, ArrowLeft, Settings, Trash2 } from 'lucide-react';
import NodeSidebar from '../components/NodeSidebar.jsx';
import WorkflowCanvas from '../components/WorkflowCanvas.jsx';
import { useReactFlow } from 'reactflow';

export default function WorkflowEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNodes, getEdges } = useReactFlow();
  const [workflowName, setWorkflowName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id !== 'new') {
      loadWorkflow();
    }
  }, [id]);

  async function loadWorkflow() {
    try {
      const response = await fetch(`http://localhost:3000/api/workflows/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setWorkflowName(data.name);
      setDescription(data.description || '');
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  }

  const addNode = useCallback((nodeType) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: { x: 300 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        ...nodeType,
        isRequired: nodeType.required,
      },
    };
    // This will be handled by the canvas component
    window.dispatchEvent(new CustomEvent('addNode', { detail: newNode }));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const nodes = getNodes();
      const edges = getEdges();

      const body = {
        name: workflowName || 'Untitled Workflow',
        description,
        nodes,
        connections: edges,
      };

      const url = id === 'new'
        ? 'http://localhost:3000/api/workflows'
        : `http://localhost:3000/api/workflows/${id}`;

      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }

      const data = await response.json();
      if (id === 'new') {
        navigate(`/workflow/${data.id}`);
      }
      alert('Workflow saved successfully!');
    } catch (error) {
      alert('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeploy() {
    try {
      const response = await fetch(`http://localhost:3000/api/workflows/${id}/deploy`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deploy workflow');
      }

      alert('Workflow deployed successfully!');
    } catch (error) {
      alert('Failed to deploy workflow');
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-bold text-slate-900 border-none focus:ring-0 p-0 bg-transparent"
              placeholder="Untitled Workflow"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm text-slate-500 border-none focus:ring-0 p-0 bg-transparent w-96"
              placeholder="Add a description..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          {id !== 'new' && (
            <button
              onClick={handleDeploy}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Play className="w-4 h-4" />
              <span>Deploy</span>
            </button>
          )}
          <button className="p-2 hover:bg-slate-100 rounded-lg transition">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar onAddNode={addNode} />
        <WorkflowCanvas workflowId={id} />
      </div>
    </div>
  );
}
```

**Step 6: Update router/index.jsx to wrap WorkflowEditorPage with ReactFlowProvider**

```jsx
import { createBrowserRouter } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

// Pages
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import WorkflowEditorPage from '../pages/WorkflowEditorPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
      },
      {
        path: 'workflow/:id',
        element: (
          <ProtectedRoute>
            <ReactFlowProvider>
              <WorkflowEditorPage />
            </ReactFlowProvider>
          </ProtectedRoute>
        )
      },
      {
        path: 'workflow/new',
        element: (
          <ProtectedRoute>
            <ReactFlowProvider>
              <WorkflowEditorPage />
            </ReactFlowProvider>
          </ProtectedRoute>
        )
      }
    ]
  }
]);

export default router;
```

**Step 7: Test workflow editor**

Run: Test dev server, navigate to /workflow/new
Expected: Can see node sidebar, can add nodes to canvas, can save workflow

**Step 8: Commit**

```bash
cd web
git add src/constants/nodeTypes.js src/components/NodeTypes/CustomNode.jsx src/components/NodeSidebar.jsx src/components/WorkflowCanvas.jsx src/pages/WorkflowEditorPage.jsx src/router/index.jsx
git commit -m "feat: create workflow canvas editor with React Flow"
```

---

## Phase 7: Bot Management

### Task 13: Implement Bot CRUD

**Files:**
- Create: `server/services/botService.js`
- Create: `server/controllers/botController.js`
- Modify: `server/routes/bots.js`
- Modify: `server/services/authService.js` (to encrypt/decrypt tokens)

**Step 1: Update authService.js to add bot encryption**

```javascript
// Add these imports at the top
import { encrypt, decrypt } from '../utils/crypto.js';

// Add these functions after existing functions

export async function createBot(userId, name, discordToken) {
  const encryptedToken = encrypt(discordToken);

  const [result] = await db.execute(
    'INSERT INTO bots (user_id, name, discord_token) VALUES (?, ?, ?)',
    [userId, name, encryptedToken]
  );

  return { id: result.insertId, name, status: 'stopped' };
}

export async function getBotsByUser(userId) {
  const [bots] = await db.execute(
    'SELECT id, name, status, workflow_id, created_at FROM bots WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return bots;
}

export async function getBotById(id, userId) {
  const [bots] = await db.execute(
    'SELECT id, name, status, workflow_id, created_at FROM bots WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return bots[0];
}

export async function getBotWithToken(id, userId) {
  const [bots] = await db.execute(
    'SELECT * FROM bots WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (bots[0]) {
    bots[0].discord_token = decrypt(bots[0].discord_token);
  }
  return bots[0];
}

export async function updateBotStatus(id, userId, status) {
  await db.execute(
    'UPDATE bots SET status = ? WHERE id = ? AND user_id = ?',
    [status, id, userId]
  );
}

export async function linkBotToWorkflow(botId, userId, workflowId) {
  await db.execute(
    'UPDATE bots SET workflow_id = ? WHERE id = ? AND user_id = ?',
    [workflowId, botId, userId]
  );
}
```

**Step 2: Create botService.js**

```javascript
import db from '../config/database.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { MAX_BOTS_PER_USER, BOT_STATUS } from '../config/constants.js';
import { getBotsByUser as getUserBots } from '../services/authService.js';

export async function createBot(userId, name, discordToken, workflowId) {
  // Check bot limit
  const userBots = await getUserBots(userId);
  if (userBots.length >= MAX_BOTS_PER_USER) {
    throw new Error(`Maximum ${MAX_BOTS_PER_USER} bots allowed`);
  }

  const encryptedToken = encrypt(discordToken);

  const [result] = await db.execute(
    'INSERT INTO bots (user_id, name, discord_token, workflow_id) VALUES (?, ?, ?, ?)',
    [userId, name, encryptedToken, workflowId || null]
  );

  return { id: result.insertId, name, status: BOT_STATUS.STOPPED };
}

export async function getBotsByUser(userId) {
  const [bots] = await db.execute(
    'SELECT id, name, status, workflow_id, created_at FROM bots WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return bots;
}

export async function getBotById(id, userId) {
  const [bots] = await db.execute(
    'SELECT id, name, status, workflow_id, created_at FROM bots WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return bots[0];
}

export async function getBotWithToken(id, userId) {
  const [bots] = await db.execute(
    'SELECT * FROM bots WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (bots[0]) {
    bots[0].discord_token = decrypt(bots[0].discord_token);
  }
  return bots[0];
}

export async function updateBot(id, userId, name, workflowId) {
  await db.execute(
    'UPDATE bots SET name = ?, workflow_id = ? WHERE id = ? AND user_id = ?',
    [name, workflowId, id, userId]
  );
}

export async function updateBotStatus(id, userId, status) {
  await db.execute(
    'UPDATE bots SET status = ? WHERE id = ? AND user_id = ?',
    [status, id, userId]
  );
}

export async function deleteBot(id, userId) {
  await db.execute(
    'DELETE FROM bots WHERE id = ? AND user_id = ?',
    [id, userId]
  );
}
```

**Step 3: Create botController.js**

```javascript
import { createBot, getBotsByUser, getBotById, updateBot, updateBotStatus, deleteBot } from '../services/botService.js';

export async function listBots(req, res) {
  try {
    const bots = await getBotsByUser(req.user.userId);
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bots' });
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
    res.status(500).json({ error: 'Failed to get bot' });
  }
}

export async function createBotHandler(req, res) {
  try {
    const { name, discordToken, workflowId } = req.body;

    if (!name || !discordToken) {
      return res.status(400).json({ error: 'Name and discordToken are required' });
    }

    const bot = await createBot(req.user.userId, name, discordToken, workflowId);
    res.status(201).json(bot);
  } catch (error) {
    if (error.message.includes('Maximum')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create bot' });
  }
}

export async function updateBotHandler(req, res) {
  try {
    const { name, workflowId } = req.body;

    await updateBot(req.params.id, req.user.userId, name, workflowId);
    const bot = await getBotById(req.params.id, req.user.userId);
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bot' });
  }
}

export async function deleteBotHandler(req, res) {
  try {
    await deleteBot(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bot' });
  }
}

export async function startBot(req, res) {
  try {
    await updateBotStatus(req.params.id, req.user.userId, 'active');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start bot' });
  }
}

export async function stopBot(req, res) {
  try {
    await updateBotStatus(req.params.id, req.user.userId, 'stopped');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop bot' });
  }
}
```

**Step 4: Update routes/bots.js**

```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { listBots, getBot, createBotHandler, updateBotHandler, deleteBotHandler, startBot, stopBot } from '../controllers/botController.js';

const router = express.Router();

router.get('/', authenticate, listBots);
router.get('/:id', authenticate, getBot);
router.post('/', authenticate, createBotHandler);
router.put('/:id', authenticate, updateBotHandler);
router.delete('/:id', authenticate, deleteBotHandler);
router.post('/:id/start', authenticate, startBot);
router.post('/:id/stop', authenticate, stopBot);

export default router;
```

**Step 5: Test bot endpoints**

Run: Test create bot with curl
```bash
curl -X POST http://localhost:3000/api/bots -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"name":"Test Bot","discordToken":"your_token_here"}'
```

**Step 6: Commit**

```bash
cd server
git add routes/bots.js services/botService.js controllers/botController.js services/authService.js
git commit -m "feat: implement bot CRUD endpoints"
```

### Task 14: Add Bot Management to Dashboard

**Files:**
- Modify: `web/src/pages/DashboardPage.jsx`
- Create: `web/src/components/BotModal.jsx`
- Modify: `web/src/services/api.js` (add botAPI)

**Step 1: Update api.js to add botAPI**

```jsx
// Add to services/api.js after workflowAPI object

export const botAPI = {
  list: () => apiRequest('/bots'),
  get: (id) => apiRequest(`/bots/${id}`),
  create: (data) =>
    apiRequest('/bots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/bots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/bots/${id}`, {
      method: 'DELETE',
    }),
  start: (id) =>
    apiRequest(`/bots/${id}/start`, {
      method: 'POST',
    }),
  stop: (id) =>
    apiRequest(`/bots/${id}/stop`, {
      method: 'POST',
    }),
};
```

**Step 2: Create components/BotModal.jsx**

```jsx
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { botAPI, workflowAPI } from '../services/api.js';

export default function BotModal({ bot, workflows, onClose, onSave }) {
  const [name, setName] = useState('');
  const [discordToken, setDiscordToken] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bot) {
      setName(bot.name);
      setDiscordToken('');
      setWorkflowId(bot.workflow_id || '');
    }
  }, [bot]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (bot) {
        await botAPI.update(bot.id, { name, workflow_id: workflowId || null });
      } else {
        await botAPI.create({ name, discordToken, workflow_id: workflowId || null });
      }
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to save bot');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {bot ? 'Edit Bot' : 'Create Bot'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bot Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="My Awesome Bot"
            />
          </div>

          {!bot && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Discord Token
              </label>
              <input
                type="password"
                value={discordToken}
                onChange={(e) => setDiscordToken(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Your Discord bot token"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your token from{' '}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Discord Developer Portal
                </a>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Workflow (Optional)
            </label>
            <select
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">No workflow</option>
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : bot ? 'Update' : 'Create'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 3: Update DashboardPage.jsx to include bot management**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Plus, Play, Square, Edit2, Trash2, Bot, FileText, Clock } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import BotModal from '../components/BotModal.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBot, setEditingBot] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [workflowsData, botsData] = await Promise.all([
        apiRequest('/workflows'),
        apiRequest('/bots'),
      ]);
      setWorkflows(workflowsData);
      setBots(botsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteWorkflow(id) {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await apiRequest(`/workflows/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      alert('Failed to delete workflow');
    }
  }

  async function handleDeployWorkflow(id) {
    try {
      await apiRequest(`/workflows/${id}/deploy`, { method: 'POST' });
      alert('Workflow deployed successfully!');
      loadData();
    } catch (error) {
      alert('Failed to deploy workflow');
    }
  }

  async function handleDeleteBot(id) {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    try {
      await apiRequest(`/bots/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      alert('Failed to delete bot');
    }
  }

  async function handleStartBot(id) {
    try {
      await apiRequest(`/bots/${id}/start`, { method: 'POST' });
      loadData();
    } catch (error) {
      alert('Failed to start bot');
    }
  }

  async function handleStopBot(id) {
    try {
      await apiRequest(`/bots/${id}/stop`, { method: 'POST' });
      loadData();
    } catch (error) {
      alert('Failed to stop bot');
    }
  }

  function openBotModal(bot = null) {
    setEditingBot(bot);
    setShowBotModal(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Manage your Discord bots and workflows</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Bot className="w-8 h-8" />}
          title="Active Bots"
          value={bots.filter(b => b.status === 'active').length}
          total={bots.length}
          color="blue"
        />
        <StatCard
          icon={<FileText className="w-8 h-8" />}
          title="Workflows"
          value={workflows.length}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-8 h-8" />}
          title="Max Bots"
          value="3"
          color="purple"
        />
      </div>

      {/* Bots Section */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Your Bots</h2>
          <button
            onClick={() => openBotModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Bot</span>
          </button>
        </div>

        {bots.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No bots yet</h3>
            <p className="text-slate-600 mb-4">Add your first Discord bot to get started</p>
            <button
              onClick={() => openBotModal()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Bot</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {bots.map((bot) => (
              <BotItem
                key={bot.id}
                bot={bot}
                onEdit={() => openBotModal(bot)}
                onDelete={() => handleDeleteBot(bot.id)}
                onStart={() => handleStartBot(bot.id)}
                onStop={() => handleStopBot(bot.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Workflows Section */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Your Workflows</h2>
          <Link
            to="/workflow/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>New Workflow</span>
          </Link>
        </div>

        {workflows.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No workflows yet</h3>
            <p className="text-slate-600 mb-4">Create your first workflow to get started</p>
            <Link
              to="/workflow/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Workflow</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {workflows.map((workflow) => (
              <WorkflowItem
                key={workflow.id}
                workflow={workflow}
                onEdit={() => window.location.href = `/workflow/${workflow.id}`}
                onDelete={() => handleDeleteWorkflow(workflow.id)}
                onDeploy={() => handleDeployWorkflow(workflow.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showBotModal && (
        <BotModal
          bot={editingBot}
          workflows={workflows}
          onClose={() => setShowBotModal(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
}

function StatCard({ icon, title, value, total, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900">
        {total !== undefined ? `${value}/${total}` : value}
      </h3>
      <p className="text-slate-600 mt-1">{title}</p>
    </div>
  );
}

function BotItem({ bot, onEdit, onDelete, onStart, onStop }) {
  return (
    <div className="p-6 hover:bg-slate-50 transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-slate-900">{bot.name}</h3>
            <span className={`px-3 py-1 text-sm rounded-full ${
              bot.status === 'active' ? 'bg-green-100 text-green-700' :
              bot.status === 'stopped' ? 'bg-gray-100 text-gray-700' :
              'bg-red-100 text-red-700'
            }`}>
              {bot.status}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-2">
            Created {new Date(bot.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {bot.status === 'active' ? (
            <button
              onClick={onStop}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
              title="Stop"
            >
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onStart}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
              title="Start"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowItem({ workflow, onEdit, onDelete, onDeploy }) {
  return (
    <div className="p-6 hover:bg-slate-50 transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-900">{workflow.name}</h3>
          <p className="text-slate-600 text-sm mt-1">
            {workflow.description || 'No description'}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Created {new Date(workflow.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {workflow.is_active && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              Active
            </span>
          )}
          <button
            onClick={onDeploy}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            title="Deploy"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Test bot management**

Run: Test dev server, navigate to /dashboard
Expected: Can see bots list, can add/edit/delete/start/stop bots

**Step 5: Commit**

```bash
cd web
git add src/pages/DashboardPage.jsx src/components/BotModal.jsx src/services/api.js
git commit -m "feat: add bot management to dashboard"
```

---

## Phase 8: Final Polish

### Task 15: Update index.css for custom styling

**Files:**
- Modify: `web/src/index.css`

**Step 1: Update index.css**

```css
@import "tailwindcss";

/* Custom React Flow styling */
.react-flow__node {
  cursor: grab;
}

.react-flow__node:active {
  cursor: grabbing;
}

.react-flow__handle {
  width: 12px;
  height: 12px;
}

.react-flow__edge-path {
  stroke: #3b82f6;
  stroke-width: 2;
}

.react-flow__edge.selected .react-flow__edge-path {
  stroke: #1e40af;
  stroke-width: 3;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
```

**Step 2: Commit**

```bash
cd web
git add src/index.css
git commit -m "style: add custom styling for React Flow and scrollbars"
```

---

## Summary

This implementation plan provides:

1. ✅ Backend NodeJS setup with Express, WebSocket, MySQL2
2. ✅ Complete authentication system (Email + Password)
3. ✅ Frontend React structure with routing
4. ✅ Landing page, Login, Register, Dashboard
5. ✅ Workflow Canvas editor with React Flow
6. ✅ Node library with all DiscordJS node types
7. ✅ Bot management system (CRUD, start/stop)
8. ✅ Modern blue color palette

**Total Tasks:** 15
**Estimated Time:** 3-4 hours for implementation

**Next Steps (Beyond this plan):**
- Implement actual bot execution engine with Discord.js
- Add WebSocket real-time notifications
- Implement Discord OAuth login
- Add workflow execution history
- Add more node configuration panels
- Add undo/redo functionality
- Add keyboard shortcuts
- Add workflow templates
- Add team collaboration features
- Add billing/pro plans
