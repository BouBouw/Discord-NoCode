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
  // Create database if it doesn't exist
  const tempPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
  });

  const tempConnection = await tempPool.getConnection();
  try {
    await tempConnection.query('CREATE DATABASE IF NOT EXISTS discord_nocode');
  } finally {
    tempConnection.release();
    await tempPool.end();
  }

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
      CREATE TABLE IF NOT EXISTS workflows (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        nodes JSON NOT NULL,
        connections JSON NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
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
        port INT DEFAULT NULL,
        db_port INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (workflow_id) REFERENCES workflows(id)
      )
    `);

    // Add port / db_port columns to existing tables if missing
    await connection.query(`
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS port INT DEFAULT NULL
    `).catch(() => {});
    await connection.query(`
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS db_port INT DEFAULT NULL
    `).catch(() => {});

    // Add updated_at column to existing tables if missing
    await connection.query(`
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
    `).catch(() => {});

    await connection.query(`
      ALTER TABLE bots ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NULL
    `).catch(() => {});

    await connection.query(`
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
    `).catch(() => {});

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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS workflow_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        workflow_id INT NOT NULL,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        role ENUM('viewer','editor','admin') NOT NULL DEFAULT 'viewer',
        status ENUM('pending','accepted') NOT NULL DEFAULT 'pending',
        invited_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_wf_member (workflow_id, email),
        FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (invited_by) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INT PRIMARY KEY,
        prefs JSON NOT NULL DEFAULT ('{}'),
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ─── Subscriptions ─────────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        plan ENUM('free','pro','business') NOT NULL DEFAULT 'free',
        billing_interval ENUM('month','year') DEFAULT NULL,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        stripe_price_id VARCHAR(255),
        status ENUM('active','past_due','canceled','trialing','incomplete') NOT NULL DEFAULT 'active',
        current_period_start TIMESTAMP NULL,
        current_period_end TIMESTAMP NULL,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ─── AI Credits ────────────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_credits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        credits_used INT NOT NULL DEFAULT 0,
        credits_limit INT NOT NULL DEFAULT 1000,
        reset_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ─── Referrals ─────────────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        referrer_id INT NOT NULL,
        referred_id INT NOT NULL UNIQUE,
        referral_code VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ─── Partner Wallets (Stripe Connect) ──────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS partner_wallets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        referral_code VARCHAR(32) NOT NULL UNIQUE,
        balance INT NOT NULL DEFAULT 0,
        total_earned INT NOT NULL DEFAULT 0,
        total_withdrawn INT NOT NULL DEFAULT 0,
        stripe_connect_account_id VARCHAR(255) DEFAULT NULL,
        stripe_connect_onboarded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ─── Referral Earnings (commission log) ────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS referral_earnings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wallet_id INT NOT NULL,
        referral_id INT NOT NULL,
        amount INT NOT NULL,
        stripe_invoice_id VARCHAR(255),
        description VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES partner_wallets(id) ON DELETE CASCADE,
        FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE CASCADE
      )
    `);

    // ─── Wallet Withdrawals ────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wallet_withdrawals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wallet_id INT NOT NULL,
        amount INT NOT NULL,
        stripe_transfer_id VARCHAR(255),
        status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (wallet_id) REFERENCES partner_wallets(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized');
  } finally {
    connection.release();
  }
}

export default pool;
