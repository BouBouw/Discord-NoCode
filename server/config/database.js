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
