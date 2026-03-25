import { exec } from 'child_process';
import { promisify } from 'util';
import { createServer } from 'net';
import { fileURLToPath } from 'url';
import { dirname, resolve as resolvePath } from 'path';
import db from '../config/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Absolute path to the docker/bot build context (the folder with the Dockerfile) */
const BOT_BUILD_CONTEXT = resolvePath(__dirname, '..', '..', 'docker', 'bot');

const execAsync = promisify(exec);

const DOCKER_NETWORK    = 'discord-nocode-network';
const MYSQL_PORT_BASE   = 13306;
const IMAGE_NAME        = 'discord-nocode-bot:latest';

// ── Auto-build image if missing ──────────────────────────────────────────────

/** Shared in-flight build promise — prevents parallel image builds */
let _buildPromise = null;

/**
 * Ensure the bot Docker image exists, building it automatically if not.
 * Safe to call concurrently — only one build runs at a time.
 */
async function ensureImageExists() {
  if (_buildPromise) return _buildPromise;

  const exists = await execAsync(`docker image inspect ${IMAGE_NAME} --format "{{.Id}}"`)
    .then(({ stdout }) => !!stdout.trim())
    .catch(() => false);

  if (exists) return;

  console.log(`[Docker] Image "${IMAGE_NAME}" not found — building from ${BOT_BUILD_CONTEXT} ...`);
  console.log('[Docker] This may take a minute on first run.');

  _buildPromise = execAsync(
    `docker build -t ${IMAGE_NAME} "${BOT_BUILD_CONTEXT}"`,
    { timeout: 600_000, maxBuffer: 50 * 1024 * 1024 },
  ).then(({ stdout, stderr }) => {
    console.log('[Docker] Image built successfully:', IMAGE_NAME);
    if (stderr) console.log('[Docker] Build output:', stderr.slice(-500));
    _buildPromise = null;
  }).catch(err => {
    _buildPromise = null;
    throw new Error(`Failed to build bot image: ${err.message}`);
  });

  return _buildPromise;
}

/**
 * Find a free port on the host, starting from basePort
 * @param {number} basePort
 * @returns {Promise<number>}
 */
function findFreePort(basePort = 9000) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', () => {
      resolve(findFreePort(basePort + 1));
    });
    server.listen(basePort, () => {
      server.close(() => resolve(basePort));
    });
  });
}

/**
 * Deploy a bot container: rebuild the image + stop/remove the old container + start a fresh one.
 * Preserves the MySQL data volume so the bot database survives redeployment.
 * Reuses existing host ports if already assigned.
 */
export async function deployBotContainer(bot) {
  const containerName = `discord-bot-${bot.id}`;
  const volName       = `discord-bot-data-${bot.id}`;

  // 1. Rebuild image (uses Docker layer cache — fast if code unchanged)
  console.log(`[Docker] Rebuilding image ${IMAGE_NAME}...`);
  await execAsync(
    `docker build -t ${IMAGE_NAME} "${BOT_BUILD_CONTEXT}"`,
    { timeout: 600_000, maxBuffer: 50 * 1024 * 1024 },
  );
  console.log('[Docker] Image rebuilt successfully.');

  await createDockerNetwork();

  // 2. Stop & remove old container (volume is kept)
  await removeContainer(containerName);

  // 3. Reuse stored ports or allocate new ones
  let port   = bot.port   || await findFreePort(9000);
  let dbPort = bot.db_port || await findFreePort(MYSQL_PORT_BASE);

  const dbName     = `bot_${bot.id}`;
  const dbUser     = 'botuser';
  const dbPassword = `bp_${bot.id}_${bot.id * 7 + 13}`;

  // 4. Persist ports + mark bot as active
  await db.execute(
    'UPDATE bots SET port = ?, db_port = ?, status = ? WHERE id = ?',
    [port, dbPort, 'active', bot.id],
  );

  // 5. Start fresh container with latest env vars
  const command = [
    'docker run -d',
    `--name ${containerName}`,
    `--network ${DOCKER_NETWORK}`,
    `-p ${port}:3000`,
    `-p ${dbPort}:3306`,
    `-v ${volName}:/var/lib/mysql`,
    `-e BOT_ID=${bot.id}`,
    `-e BOT_NAME="${bot.name}"`,
    `-e DISCORD_TOKEN=${bot.discord_token}`,
    `-e WORKFLOW_ID=${bot.workflow_id || ''}`,
    `-e PORT=3000`,
    `-e API_URL=${process.env.API_URL || `http://host.docker.internal:${process.env.PORT || 3099}`}`,
    `-e INTERNAL_SECRET=${process.env.INTERNAL_SECRET || ''}`,
    `-e DB_HOST=127.0.0.1`,
    `-e DB_PORT=3306`,
    `-e DB_USER=${dbUser}`,
    `-e DB_PASSWORD=${dbPassword}`,
    `-e DB_NAME=${dbName}`,
    IMAGE_NAME,
  ].join(' ');

  const { stdout } = await execAsync(command);
  const containerId = stdout.trim();
  console.log(`[Docker] Container deployed: ${containerName} (port ${port}, db ${dbPort}) → ${containerId}`);
  return containerId;
}

/**
 * Create a Docker container for a bot.
 * The container runs both Node.js (port 3000) and MySQL (port 3306) via start.sh.
 * The bot image is built automatically on first use.
 */
export async function createBotContainer(bot) {
  const containerName = `discord-bot-${bot.id}`;
  const volName       = `discord-bot-data-${bot.id}`;

  try {
    // Build the image automatically if it doesn't exist yet
    await ensureImageExists();

    await createDockerNetwork();
    await removeContainer(containerName);

    const port   = await findFreePort(9000);
    const dbPort = await findFreePort(MYSQL_PORT_BASE);

    const dbName     = `bot_${bot.id}`;
    const dbUser     = 'botuser';
    const dbPassword = `bp_${bot.id}_${bot.id * 7 + 13}`;

    await db.execute('UPDATE bots SET port = ?, db_port = ? WHERE id = ?', [port, dbPort, bot.id]);

    const command = [
      'docker run -d',
      `--name ${containerName}`,
      `--network ${DOCKER_NETWORK}`,
      `-p ${port}:3000`,
      `-p ${dbPort}:3306`,
      `-v ${volName}:/var/lib/mysql`,
      `-e BOT_ID=${bot.id}`,
      `-e BOT_NAME="${bot.name}"`,
      `-e DISCORD_TOKEN=${bot.discord_token}`,
      `-e WORKFLOW_ID=${bot.workflow_id || ''}`,
      `-e PORT=3000`,
      `-e API_URL=${process.env.API_URL || `http://host.docker.internal:${process.env.PORT || 3099}`}`,
      `-e INTERNAL_SECRET=${process.env.INTERNAL_SECRET || ''}`,
      `-e DB_HOST=127.0.0.1`,
      `-e DB_PORT=3306`,
      `-e DB_USER=${dbUser}`,
      `-e DB_PASSWORD=${dbPassword}`,
      `-e DB_NAME=${dbName}`,
      IMAGE_NAME,
    ].join(' ');

    const { stdout } = await execAsync(command);
    const containerId = stdout.trim();

    console.log(`[Docker] Container created: ${containerName} on port ${port}, MySQL on ${dbPort} (${containerId})`);
    return containerId;
  } catch (error) {
    console.error(`[Docker] Failed to create container for bot ${bot.id}:`, error);
    throw new Error(`Failed to create Docker container: ${error.message}`);
  }
}

/**
 * Start a bot container (MySQL resumes from its volume).
 */
export async function startBotContainer(botId) {
  const containerName = `discord-bot-${botId}`;
  try {
    await execAsync(`docker start ${containerName}`);
    console.log(`[Docker] Container started: ${containerName}`);
  } catch (error) {
    console.error(`[Docker] Failed to start container for bot ${botId}:`, error);
    throw new Error(`Failed to start container: ${error.message}`);
  }
}

/**
 * Stop a bot container (MySQL data preserved in volume).
 */
export async function stopBotContainer(botId) {
  const containerName = `discord-bot-${botId}`;
  try {
    await execAsync(`docker stop ${containerName}`);
    console.log(`[Docker] Container stopped: ${containerName}`);
  } catch (error) {
    console.warn(`[Docker] Warning stopping container for bot ${botId}:`, error.message);
  }
}

/**
 * Remove a bot container and its MySQL data volume.
 */
export async function removeBotContainer(botId) {
  const containerName = `discord-bot-${botId}`;
  const volName       = `discord-bot-data-${botId}`;

  try {
    await execAsync(`docker rm -f ${containerName}`);
    console.log(`[Docker] Container removed: ${containerName}`);
  } catch (error) {
    console.warn(`[Docker] Warning removing container for bot ${botId}:`, error.message);
  }

  try {
    await execAsync(`docker volume rm ${volName}`);
    console.log(`[Docker] Volume removed: ${volName}`);
  } catch {
    // Volume might not exist or have already been removed
  }
}

/**
 * Get container status.
 */
export async function getContainerStatus(botId) {
  const containerName = `discord-bot-${botId}`;
  try {
    const { stdout } = await execAsync(`docker inspect --format='{{.State.Status}}' ${containerName}`);
    const status = stdout.trim().replace(/'/g, '');
    return { status, running: status === 'running', exists: true };
  } catch {
    return { status: 'not found', running: false, exists: false };
  }
}

/**
 * MySQL status = bot container status (MySQL runs inside the container).
 */
export async function getBotMysqlStatus(botId) {
  const cs = await getContainerStatus(botId);
  if (cs.running) return 'running';
  if (cs.exists)  return 'exited';
  return 'not_found';
}

/**
 * Get container logs.
 */
export async function getContainerLogs(botId, tail = 100) {
  const containerName = `discord-bot-${botId}`;
  try {
    const { stdout, stderr } = await execAsync(`docker logs --tail ${tail} ${containerName} 2>&1`);
    return stdout || stderr;
  } catch (error) {
    throw new Error(`Failed to get container logs: ${error.message}`);
  }
}

/**
 * Restart a bot container.
 */
export async function restartBotContainer(botId) {
  const containerName = `discord-bot-${botId}`;
  try {
    await execAsync(`docker restart ${containerName}`);
    console.log(`[Docker] Container restarted: ${containerName}`);
  } catch (error) {
    throw new Error(`Failed to restart container: ${error.message}`);
  }
}

/**
 * Create Docker network if it doesn't exist.
 */
async function createDockerNetwork() {
  try {
    await execAsync(`docker network create ${DOCKER_NETWORK}`);
    console.log(`[Docker] Network created: ${DOCKER_NETWORK}`);
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log(`[Docker] Network already exists: ${DOCKER_NETWORK}`);
    } else {
      throw error;
    }
  }
}

/**
 * Remove a container by name (internal helper, ignores errors).
 */
async function removeContainer(containerName) {
  try {
    await execAsync(`docker rm -f ${containerName}`);
    console.log(`[Docker] Container removed: ${containerName}`);
  } catch {
    // Container might not exist
  }
}

/**
 * List all bot containers.
 */
export async function listBotContainers() {
  try {
    const { stdout } = await execAsync(
      'docker ps -a --filter "name=discord-bot-" --format "{{.Names}}\\t{{.Status}}\\t{{.ID}}"'
    );
    const lines = stdout.trim().split('\n').filter(Boolean);
    return lines.map(line => {
      const [name, status, id] = line.split('\t');
      const botId = parseInt(name.replace('discord-bot-', ''));
      return { id, name, status, botId: isNaN(botId) ? null : botId, running: status.includes('Up') };
    });
  } catch {
    return [];
  }
}


