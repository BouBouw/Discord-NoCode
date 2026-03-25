import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { loadUserSettings, getBotThemeConfig } from '../../hooks/useUserSettings';

export default function DiscordCallbackPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const discordId = searchParams.get('discord_id');

    if (!token || !id || !email) {
      navigate('/login?error=discord_failed', { replace: true });
      return;
    }

    login({ id: Number(id), email, discord_id: discordId ?? undefined, created_at: '' }, token);
    navigate('/dashboard', { replace: true });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={(() => {
        const th = getBotThemeConfig(loadUserSettings().defaultBotTheme ?? 'dark');
        const thV = { '--t-bg': th.bg, '--t-bd': th.border, '--t-a': th.accent } as React.CSSProperties;
        return { ...thV, backgroundColor: 'var(--t-bg)' };
      })()}
    >
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--t-bd)', borderTopColor: 'var(--t-a)' }}
      />
    </div>
  );
}
