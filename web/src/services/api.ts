const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3008/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
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

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error(data.error || 'Session expired');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authAPI = {
  register: (email: string, password: string, referralCode?: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(referralCode ? { referralCode } : {}) }),
    }),
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => apiRequest('/users/me'),
};

export interface Bot {
  id: number;
  name: string;
  discord_token: string;
  workflow_id: number | null;
  port: number | null;
  db_port: number | null;
  status: 'idle' | 'running' | 'stopped' | 'error';
  created_at: string;
  updated_at: string;
}

export interface BotCreateData {
  name: string;
  discordToken: string;
  workflowId?: number;
}

export interface BotUpdateData {
  name?: string;
  workflowId?: number;
  discordToken?: string;
}

// ── Dashboard stats types ───────────────────────────────────────────────
export interface StatsOverview {
  bots: { total: number; active: number; stopped: number; errored: number };
  workflows: number;
  executions: { total: number; running: number; completed: number; failed: number };
}

export interface ExecutionDayStats {
  date: string;
  completed: number;
  failed: number;
  running: number;
  total: number;
}

export interface ActivityItem {
  type: 'execution' | 'bot_status';
  status: string;
  botName: string;
  botId: number;
  workflowName?: string;
  workflowId?: number;
  timestamp: string;
  startedAt?: string;
}

export interface ErrorStats {
  totalErrors: number;
  totalExecutions: number;
  errorRate: number;
  daily: { date: string; errors: number; total: number }[];
}

export interface ContainerResources {
  cpu: string;
  memUsage: string;
  memPercent: string;
  netIO: string;
  pids: string;
  running: boolean;
}

export interface Workflow {
  id: number;
  name: string;
  description: string;
  nodes: unknown[];
  connections: unknown[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// ── DB Visualizer types ──────────────────────────────────────────────────
export interface DbTable {
  name: string;
  rows: number;
  engine: string;
  collation: string;
  dataLength: number;
  createTime: string;
}

export interface DbColumn {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

export interface DbColumnDef {
  name: string;
  type: string;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  notNull?: boolean;
  defaultValue?: string;
}

export interface DbRowsResult {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DbQueryResult {
  type: 'SELECT' | 'MODIFY';
  rows?: Record<string, unknown>[];
  fields?: string[];
  affectedRows?: number;
  insertId?: number;
  duration: number;
}

export interface BotContainerStatus extends Bot {
  container: {
    exists: boolean;
    running: boolean;
    status: string;
    id?: string;
  };
}

export interface BotLogsResult {
  bot: Bot;
  logs: string;
  tail: number;
}

export const botAPI = {
  list: (): Promise<Bot[]> => apiRequest('/bots'),
  get: (id: number): Promise<Bot> => apiRequest(`/bots/${id}`),
  create: (data: BotCreateData): Promise<Bot> =>
    apiRequest('/bots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: BotUpdateData): Promise<Bot> =>
    apiRequest(`/bots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number): Promise<void> =>
    apiRequest(`/bots/${id}`, {
      method: 'DELETE',
    }),
  start: (id: number): Promise<Bot> =>
    apiRequest(`/bots/${id}/start`, {
      method: 'POST',
    }),
  stop: (id: number): Promise<Bot> =>
    apiRequest(`/bots/${id}/stop`, {
      method: 'POST',
    }),
  containerStatus: (id: number): Promise<BotContainerStatus> =>
    apiRequest(`/bots/${id}/status`),
  logs: (id: number, tail = 200): Promise<BotLogsResult> =>
    apiRequest(`/bots/${id}/logs?tail=${tail}`),
  // DB container status
  dbStatus: (id: number): Promise<{ status: string; container: string }> =>
    apiRequest(`/bots/${id}/db/status`),

  // ── DB Visualizer ────────────────────────────────────────────────────────
  dbListTables: (id: number): Promise<DbTable[]> =>
    apiRequest(`/bots/${id}/db/tables`),
  dbCreateTable: (id: number, body: { name: string; columns: DbColumnDef[] }): Promise<void> =>
    apiRequest(`/bots/${id}/db/tables`, { method: 'POST', body: JSON.stringify(body) }),
  dbDropTable: (id: number, table: string): Promise<void> =>
    apiRequest(`/bots/${id}/db/tables/${table}`, { method: 'DELETE' }),

  dbTableStructure: (id: number, table: string): Promise<{ columns: DbColumn[]; indexes: any[] }> =>
    apiRequest(`/bots/${id}/db/tables/${table}/structure`),
  dbAddColumn: (id: number, table: string, col: DbColumnDef): Promise<void> =>
    apiRequest(`/bots/${id}/db/tables/${table}/columns`, { method: 'POST', body: JSON.stringify(col) }),
  dbDropColumn: (id: number, table: string, column: string): Promise<void> =>
    apiRequest(`/bots/${id}/db/tables/${table}/columns/${column}`, { method: 'DELETE' }),

  dbGetRows: (id: number, table: string, page = 1, limit = 25): Promise<DbRowsResult> =>
    apiRequest(`/bots/${id}/db/tables/${table}/rows?page=${page}&limit=${limit}`),
  dbInsertRow: (id: number, table: string, data: Record<string, unknown>): Promise<{ insertId: number }> =>
    apiRequest(`/bots/${id}/db/tables/${table}/rows`, { method: 'POST', body: JSON.stringify(data) }),
  dbUpdateRow: (id: number, table: string, where: Record<string, unknown>, data: Record<string, unknown>): Promise<void> =>
    apiRequest(`/bots/${id}/db/tables/${table}/rows`, { method: 'PUT', body: JSON.stringify({ where, data }) }),
  dbDeleteRow: (id: number, table: string, where: Record<string, unknown>): Promise<void> =>
    apiRequest(`/bots/${id}/db/tables/${table}/rows`, { method: 'DELETE', body: JSON.stringify({ where }) }),

  dbQuery: (id: number, sql: string): Promise<DbQueryResult> =>
    apiRequest(`/bots/${id}/db/query`, { method: 'POST', body: JSON.stringify({ sql }) }),
  dbPurge: (id: number): Promise<void> =>
    apiRequest(`/bots/${id}/db/purge`, { method: 'POST' }),

  // ── Resource usage ──────────────────────────────────────────────────────
  resources: (id: number): Promise<ContainerResources> =>
    apiRequest(`/bots/${id}/resources`),
};

// ── Stats API ─────────────────────────────────────────────────────────────
export const statsAPI = {
  overview: (): Promise<StatsOverview> => apiRequest('/stats/overview'),
  executions: (days = 7): Promise<ExecutionDayStats[]> => apiRequest(`/stats/executions?days=${days}`),
  activity: (limit = 10): Promise<ActivityItem[]> => apiRequest(`/stats/activity?limit=${limit}`),
  errors: (days = 7): Promise<ErrorStats> => apiRequest(`/stats/errors?days=${days}`),
};

// ── Workflows API ─────────────────────────────────────────────────────────
export const workflowAPI = {
  list: (): Promise<Workflow[]> => apiRequest('/workflows'),
  deploy: (id: number) => apiRequest(`/workflows/${id}/deploy`, { method: 'POST' }),
};

// ── Subscription / Billing API ────────────────────────────────────────────

export interface PlanLimits {
  maxBots: number;
  maxCommandsPerBot: number;   // -1 = unlimited
  maxEventsPerBot: number;     // -1 = unlimited
  maxMembersPerBot: number;
  maxDbSizeMb: number;
  maxDbPerBot: number;
  aiCreditsPerMonth: number;
  extraSeatPriceCents: number;
  unlimitedNodes: boolean;
}

export interface AiCredits {
  used: number;
  limit: number;
  resetAt: string;
}

export interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'business';
  status: string;
  billingInterval: 'month' | 'year' | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  limits: PlanLimits;
  aiCredits: AiCredits;
}

export interface PlanInfo {
  key: string;
  name: string;
  monthlyPrice: number; // cents
  annualPrice: number;  // cents
  currency: string;
  limits: PlanLimits;
}

export interface UserProfile {
  id: number;
  email: string;
  discord_id?: string;
  created_at: string;
  botsCount: number;
  workflowsCount: number;
  plan: 'free' | 'pro' | 'business';
  planStatus: string;
  billingInterval: 'month' | 'year' | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  limits: PlanLimits;
  aiCredits: AiCredits;
}

export const subscriptionAPI = {
  /** Get current user subscription + usage */
  me: (): Promise<SubscriptionInfo> => apiRequest('/subscription/me'),

  /** Get all available plans */
  plans: (): Promise<PlanInfo[]> => apiRequest('/subscription/plans'),

  /** Create Stripe checkout session for upgrade */
  checkout: (plan: 'pro' | 'business', interval: 'month' | 'year' = 'month'): Promise<{ url: string; sessionId: string }> =>
    apiRequest('/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan, interval }),
    }),

  /** Create Stripe customer portal session */
  portal: (): Promise<{ url: string }> =>
    apiRequest('/subscription/portal', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  /** Verify checkout session and sync subscription (fallback when webhook is delayed) */
  verifySession: (sessionId: string): Promise<{ plan: string; status: string }> =>
    apiRequest('/subscription/verify-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),
};

// ─── Partner / Referral ───────────────────────────────────────────────────────

export interface PartnerWallet {
  referralCode: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  stripeConnectOnboarded: boolean;
}

export interface PartnerReferral {
  id: number;
  referredEmail: string;
  createdAt: string;
}

export interface PartnerEarning {
  amount: number;
  description: string;
  created_at: string;
}

export interface PartnerWithdrawal {
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export interface PartnerStats {
  wallet: PartnerWallet;
  referrals: PartnerReferral[];
  earnings: PartnerEarning[];
  withdrawals: PartnerWithdrawal[];
}

export interface ConnectStatus {
  connected: boolean;
  onboarded: boolean;
  payoutsEnabled?: boolean;
  accountId?: string;
  email?: string | null;
  country?: string | null;
  businessType?: string | null;
  displayName?: string | null;
}

export const partnerAPI = {
  stats: (): Promise<PartnerStats> => apiRequest('/partner/stats'),
  code: (): Promise<{ referralCode: string }> => apiRequest('/partner/code'),
  connectOnboard: (): Promise<{ url: string }> =>
    apiRequest('/partner/connect/onboard', { method: 'POST', body: '{}' }),
  connectStatus: (): Promise<ConnectStatus> => apiRequest('/partner/connect/status'),
  withdraw: (): Promise<{ success: boolean; amount: number; transferId: string }> =>
    apiRequest('/partner/withdraw', { method: 'POST', body: '{}' }),
};
