import { useState, useEffect } from 'react';

export type Language =
  | 'fr' | 'en' | 'es' | 'de' | 'pt'
  | 'zh' | 'hi' | 'ar' | 'bn' | 'ru'
  | 'id' | 'ur' | 'ja' | 'tr' | 'vi'
  | 'ko' | 'it' | 'th' | 'mr' | 'ta'
  | 'te' | 'sw' | 'pl' | 'uk' | 'nl'
  | 'ms' | 'ro' | 'fa' | 'gu' | 'my'
  | 'ha' | 'am';
export type BotTheme = 'dark' | 'light';

export interface ThemeConfig {
  accent: string;
  accentHover: string;
  accentAlpha: string;   // rgba with ~12% opacity
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  text: string;
  subtext: string;
  muted: string;
  btnText: string;
  isLight: boolean;
}

export function getBotThemeConfig(theme: BotTheme): ThemeConfig {
  switch (theme) {
    case 'light':
      return {
        accent: '#7289DA', accentHover: '#3D61DF', accentAlpha: 'rgba(0,82,255,0.14)',
        bg: '#FFFFFF', surface: '#F5F7FA', surface2: '#EBEEF2', surface3: '#CBD5E1',
        border: '#E4E7EB', text: '#1A1D23', subtext: '#4B5563', muted: '#6B7280',
        btnText: '#FFFFFF', isLight: true,
      };
    default: // 'dark'
      return {
        accent: '#8686AC', accentHover: '#9D9DC8', accentAlpha: 'rgba(134,134,172,0.14)',
        bg: '#0F0E47', surface: '#272757', surface2: '#2D2C65', surface3: '#505081',
        border: 'rgba(134,134,172,0.18)', text: '#FFFFFF', subtext: 'rgba(255,255,255,0.72)', muted: 'rgba(255,255,255,0.38)',
        btnText: '#FFFFFF', isLight: false,
      };
  }
}

export interface UserSettings {
  defaultLanguage: Language;
  defaultBotTheme: BotTheme;
  notifications: {
    botStartStop: boolean;
    errors: boolean;
    weeklyReport: boolean;
    marketing: boolean;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultLanguage: 'fr',
  defaultBotTheme: 'dark',
  notifications: {
    botStartStop: true,
    errors: true,
    weeklyReport: false,
    marketing: false,
  },
};

const STORAGE_KEY = 'dnc_user_settings';

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old theme values (orange/blurple/green → dark)
      const theme: BotTheme = parsed.defaultBotTheme === 'light' ? 'light' : 'dark';
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        defaultBotTheme: theme,
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications ?? {}) },
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

const SETTINGS_EVENT = 'dnc:settings-changed';

export function saveUserSettings(s: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(loadUserSettings);

  useEffect(() => {
    const handler = () => setSettings(loadUserSettings());
    window.addEventListener(SETTINGS_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_EVENT, handler);
  }, []);
  function updateSettings(patch: Partial<UserSettings>) {
    setSettings(prev => {
      const next = {
        ...prev,
        ...patch,
        notifications: {
          ...prev.notifications,
          ...(patch.notifications ?? {}),
        },
      };
      saveUserSettings(next);
      return next;
    });
  }

  return { settings, updateSettings };
}

// Per-bot metadata (language + theme applied at creation)
const BOT_META_KEY = 'dnc_bot_meta';

export interface BotMeta {
  language: Language;
  theme: BotTheme;
}

export function saveBotMeta(botId: number, meta: BotMeta): void {
  try {
    const raw = localStorage.getItem(BOT_META_KEY);
    const all: Record<number, BotMeta> = raw ? JSON.parse(raw) : {};
    all[botId] = meta;
    localStorage.setItem(BOT_META_KEY, JSON.stringify(all));
  } catch {}
}

export function loadBotMeta(botId: number): BotMeta | null {
  try {
    const raw = localStorage.getItem(BOT_META_KEY);
    if (!raw) return null;
    const all: Record<number, BotMeta> = JSON.parse(raw);
    return all[botId] ?? null;
  } catch {
    return null;
  }
}
