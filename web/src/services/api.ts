const API_BASE = 'http://localhost:3000/api';

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

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authAPI = {
  register: (email: string, password: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
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
  status: 'idle' | 'running' | 'stopped' | 'error';
  created_at: string;
  updated_at: string;
}

export interface BotCreateData {
  name: string;
  discord_token: string;
  workflow_id?: number;
}

export interface BotUpdateData {
  name?: string;
  workflow_id?: number;
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
  start: (id: number): Promise<void> =>
    apiRequest(`/bots/${id}/start`, {
      method: 'POST',
    }),
  stop: (id: number): Promise<void> =>
    apiRequest(`/bots/${id}/stop`, {
      method: 'POST',
    }),
};
