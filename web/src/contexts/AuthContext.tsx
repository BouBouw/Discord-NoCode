import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PlanLimits, AiCredits } from '../services/api';

interface User {
  id: number;
  email: string;
  discord_id?: string;
  created_at: string;
  plan?: 'free' | 'pro' | 'business';
  planStatus?: string;
  billingInterval?: 'month' | 'year' | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  limits?: PlanLimits;
  aiCredits?: AiCredits;
  onboardingCompleted?: boolean;
  botsCount?: number;
  workflowsCount?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, userToken: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, userToken: string) => {
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

  const refreshProfile = useCallback(async () => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3008/api';
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  }, [token]);

  const value: AuthContextType = { user, token, login, logout, refreshProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
