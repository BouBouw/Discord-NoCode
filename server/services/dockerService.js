import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Docker Service for managing bot containers
 * Each bot runs in its own isolated Docker container
 */

const DOCKER_NETWORK = 'discord-nocode-network';

/**
 * Create a Docker container for a bot
 * @param {Object} bot - Bot configuration
 * @param {number} bot.id - Bot ID
 * @param {string} bot.name - Bot name
 * @param {string} bot.discord_token - Encrypted Discord token
 * @param {number|null} bot.workflow_id - Associated workflow ID
 * @returns {Promise<string>} Container ID
 */
export async function createBotContainer(bot) {
  const containerName = `discord-bot-${bot.id}`;
  const imageName = 'discord-nocode-bot:latest';

  try {
    // Create Docker network if it doesn't exist
    await createDockerNetwork();

    // Remove existing container if it exists
    await removeContainer(containerName);

    // Create Docker container with bot configuration
    const command = `docker run -d \
      --name ${containerName} \
      --network ${DOCKER_NETWORK} \
      -e BOT_ID=${bot.id} \
      -e BOT_NAME="${bot.name}" \
      -e DISCORD_TOKEN=${bot.discord_token} \
      -e WORKFLOW_ID=${bot.workflow_id || ''} \
      -e API_URL=${process.env.API_URL || 'http://host.docker.internal:3000'} \
      -e DB_HOST=${process.env.DB_HOST || 'host.docker.internal'} \
      -e DB_PORT=${process.env.DB_PORT || 3306} \
      -e DB_USER=${process.env.DB_USER} \
      -e DB_PASSWORD=${process.env.DB_PASSWORD} \
      -e DB_NAME=${process.env.DB_NAME} \
      ${imageName}`;

    const { stdout } = await execAsync(command);
    const containerId = stdout.trim();

    console.log(`[Docker] Container created: ${containerName} (${containerId})`);

    return containerId;
  } catch (error) {
    console.error(`[Docker] Failed to create container for bot ${bot.id}:`, error);
    throw new Error(`Failed to create Docker container: ${error.message}`);
  }
}

/**
 * Start a bot container
 * @param {number} botId - Bot ID
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
 * Stop a bot container
 * @param {number} botId - Bot ID
 */
export async function stopBotContainer(botId) {
  const containerName = `discord-bot-${botId}`;

  try {
    await execAsync(`docker stop ${containerName}`);
    console.log(`[Docker] Container stopped: ${containerName}`);
  } catch (error) {
    // Container might not be running, log but don't throw
    console.warn(`[Docker] Warning stopping container for bot ${botId}:`, error.message);
  }
}

/**
 * Remove a bot container
 * @param {number} botId - Bot ID
 */
export async function removeBotContainer(botId) {
  const containerName = `discord-bot-${botId}`;

  try {
    await execAsync(`docker rm -f ${containerName}`);
    console.log(`[Docker] Container removed: ${containerName}`);
  } catch (error) {
    // Container might not exist, log but don't throw
    console.warn(`[Docker] Warning removing container for bot ${botId}:`, error.message);
  }
}

/**
 * Get container status
 * @param {number} botId - Bot ID
 * @returns {Promise<Object>} Container status
 */
export async function getContainerStatus(botId) {
  const containerName = `discord-bot-${botId}`;

  try {
    const { stdout } = await execAsync(`docker inspect --format='{{.State.Status}}' ${containerName}`);
    const status = stdout.trim();

    return {
      status,
      running: status === 'running',
      exists: true,
    };
  } catch (error) {
    // Container doesn't exist
    return {
      status: 'not found',
      running: false,
      exists: false,
    };
  }
}

/**
 * Get container logs
 * @param {number} botId - Bot ID
 * @param {number} tail - Number of lines to tail (default: 100)
 * @returns {Promise<string>} Container logs
 */
export async function getContainerLogs(botId, tail = 100) {
  const containerName = `discord-bot-${botId}`;

  try {
    const { stdout } = await execAsync(`docker logs --tail ${tail} ${containerName}`);
    return stdout;
  } catch (error) {
    console.error(`[Docker] Failed to get logs for bot ${botId}:`, error);
    throw new Error(`Failed to get container logs: ${error.message}`);
  }
}

/**
 * Update container environment variables
 * @param {number} botId - Bot ID
 * @param {Object} envVars - Environment variables to update
 */
export async function updateContainerEnv(botId, envVars) {
  const containerName = `discord-bot-${botId}`;

  try {
    // Update environment variables
    for (const [key, value] of Object.entries(envVars)) {
      await execAsync(`docker stop ${containerName}`);
      await execAsync(`docker container update --env-add "${key}=${value}" ${containerName}`);
      await execAsync(`docker start ${containerName}`);
    }

    console.log(`[Docker] Container updated: ${containerName}`);
  } catch (error) {
    console.error(`[Docker] Failed to update container for bot ${botId}:`, error);
    throw new Error(`Failed to update container: ${error.message}`);
  }
}

/**
 * Restart a bot container
 * @param {number} botId - Bot ID
 */
export async function restartBotContainer(botId) {
  const containerName = `discord-bot-${botId}`;

  try {
    await execAsync(`docker restart ${containerName}`);
    console.log(`[Docker] Container restarted: ${containerName}`);
  } catch (error) {
    console.error(`[Docker] Failed to restart container for bot ${botId}:`, error);
    throw new Error(`Failed to restart container: ${error.message}`);
  }
}

/**
 * Create Docker network if it doesn't exist
 */
async function createDockerNetwork() {
  try {
    await execAsync(`docker network create ${DOCKER_NETWORK} 2>/dev/null`);
    console.log(`[Docker] Network ensured: ${DOCKER_NETWORK}`);
  } catch (error) {
    // Network might already exist, that's okay
    console.log(`[Docker] Network already exists or created: ${DOCKER_NETWORK}`);
  }
}

/**
 * Remove container (internal helper)
 * @param {string} containerName - Container name
 */
async function removeContainer(containerName) {
  try {
    await execAsync(`docker rm -f ${containerName} 2>/dev/null`);
  } catch (error) {
    // Container might not exist, ignore
  }
}

/**
 * List all bot containers
 * @returns {Promise<Array>} List of bot containers
 */
export async function listBotContainers() {
  try {
    const { stdout } = await execAsync('docker ps -a --filter "name=discord-bot-" --format "{{.Names}}\\t{{.Status}}\\t{{.ID}}"');
    const lines = stdout.trim().split('\n');

    return lines.map(line => {
      const [name, status, id] = line.split('\t');
      const botId = parseInt(name.replace('discord-bot-', ''));

      return {
        id,
        name,
        status,
        botId: isNaN(botId) ? null : botId,
        running: status.includes('Up'),
      };
    });
  } catch (error) {
    console.error('[Docker] Failed to list containers:', error);
    return [];
  }
}
