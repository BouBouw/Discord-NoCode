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
