import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPrefs {
  locale:         'fr' | 'en' | 'es' | 'de' | 'pt';
  theme:          'dark' | 'light' | 'system';
  accentColor:    'orange' | 'blue' | 'purple' | 'green';
  notifySave:     boolean;
  notifyErrors:   boolean;
  notifyBrowser:  boolean;
  confirmDelete:  boolean;
  showTooltips:   boolean;
  compactNodes:   boolean;
}

export const DEFAULT_PREFS: UserPrefs = {
  locale:         'fr',
  theme:          'dark',
  accentColor:    'orange',
  notifySave:     true,
  notifyErrors:   true,
  notifyBrowser:  false,
  confirmDelete:  true,
  showTooltips:   true,
  compactNodes:   false,
};

export const ACCENT_VALUES: Record<UserPrefs['accentColor'], string> = {
  orange: '#e8643a',
  blue:   '#3b82f6',
  purple: '#a855f7',
  green:  '#10b981',
};

interface UserPrefsContextType {
  prefs: UserPrefs;
  setPrefs: (patch: Partial<UserPrefs>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CTX = createContext<UserPrefsContextType | undefined>(undefined);

function loadFromStorage(): UserPrefs {
  try {
    const raw = localStorage.getItem('userPrefs');
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return { ...DEFAULT_PREFS };
}

function applyTheme(theme: UserPrefs['theme']) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

function applyAccent(color: UserPrefs['accentColor']) {
  document.documentElement.style.setProperty('--accent', ACCENT_VALUES[color]);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function UserPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefsState] = useState<UserPrefs>(loadFromStorage);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply theme + accent on every change
  useEffect(() => {
    applyTheme(prefs.theme);
    applyAccent(prefs.accentColor);
  }, [prefs.theme, prefs.accentColor]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (prefs.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [prefs.theme]);

  // Load from server on mount if authenticated
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    apiRequest('/users/preferences')
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setPrefsState(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => { /* offline fallback is localStorage */ });
  }, []);

  const setPrefs = useCallback((patch: Partial<UserPrefs>) => {
    setPrefsState(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('userPrefs', JSON.stringify(next));
      // Debounced API save
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (localStorage.getItem('token')) {
        debounceRef.current = setTimeout(() => {
          apiRequest('/users/preferences', {
            method: 'PUT',
            body: JSON.stringify(next),
          }).catch(() => { /* silent */ });
        }, 800);
      }
      return next;
    });
  }, []);

  return <CTX.Provider value={{ prefs, setPrefs }}>{children}</CTX.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserPrefs(): UserPrefsContextType {
  const ctx = useContext(CTX);
  if (!ctx) throw new Error('useUserPrefs must be used inside <UserPrefsProvider>');
  return ctx;
}
