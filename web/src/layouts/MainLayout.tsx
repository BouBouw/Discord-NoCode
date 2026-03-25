import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings, getBotThemeConfig } from '../hooks/useUserSettings';

export default function MainLayout() {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const th = getBotThemeConfig(settings.defaultBotTheme ?? 'dark');
  const thV = {
    '--t-bg': th.bg, '--t-s': th.surface, '--t-s2': th.surface2, '--t-s3': th.surface3,
    '--t-bd': th.border, '--t-a': th.accent, '--t-ah': th.accentHover,
    '--t-aa': th.accentAlpha, '--t-tx': th.text, '--t-sub': th.subtext, '--t-m': th.muted,
    '--t-btn-text': th.btnText,
  } as React.CSSProperties;

  return (
    <div className="h-screen flex overflow-hidden" style={{ ...thV, backgroundColor: 'var(--t-bg)' }}>
      {user && <Sidebar />}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
