import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/api.ts';
import { loadUserSettings, getBotThemeConfig } from '../../hooks/useUserSettings';
import { useTranslation } from '../../hooks/useTranslation';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3008/api';

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.048.032.066a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const referralCode = searchParams.get('ref') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }
    if (password.length < 8) {
      setError(t.auth.passwordTooShort);
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.register(email, password, referralCode || undefined);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.unknownError);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    const refParam = referralCode ? `?ref=${encodeURIComponent(referralCode)}` : '';
    window.location.href = `${API_BASE}/auth/discord${refParam}`;
  };

  const s = loadUserSettings();
  const th = getBotThemeConfig(s.defaultBotTheme ?? 'dark');
  const thV = {
    '--t-bg': th.bg, '--t-s': th.surface, '--t-s2': th.surface2,
    '--t-bd': th.border, '--t-a': th.accent, '--t-ah': th.accentHover,
    '--t-aa': th.accentAlpha, '--t-tx': th.text, '--t-sub': th.subtext, '--t-m': th.muted,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex" style={{ ...thV, backgroundColor: 'var(--t-bg)' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex w-96 shrink-0 flex-col items-center justify-center p-12"
        style={{ backgroundColor: 'var(--t-s)', borderRight: '1px solid var(--t-bd)' }}
      >
        <img src="/logo.ico" alt="DisFlow" className="w-12 h-12 rounded-2xl object-contain mb-6" />
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--t-tx)' }}>
          DisFlow
        </h2>
        <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--t-sub)' }}>
          {t.auth.brandTagline}
        </p>
        <div className="mt-10 w-full space-y-3">
          {[t.auth.feature1, t.auth.feature2, t.auth.feature3].map(f => (
            <div key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--t-sub)' }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--t-a)' }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--t-tx)' }}>{t.auth.register}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--t-sub)' }}>{t.auth.registerSubtitle}</p>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5 text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              {error}
            </div>
          )}

          {/* Discord OAuth */}
          <button
            type="button"
            onClick={handleDiscordLogin}
            className="dnc-btn dnc-btn-discord dnc-btn-block py-2.5 rounded-xl text-sm font-semibold mb-4"
          >
            <DiscordIcon />
            {t.auth.registerDiscord}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--t-bd)' }} />
            <span className="text-xs" style={{ color: 'var(--t-m)' }}>ou</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--t-bd)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-[11px] font-semibold mb-1.5 uppercase tracking-widest"
                style={{ color: 'var(--t-m)' }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--t-m)' }}
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                  style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                  placeholder="you@example.com"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--t-a)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--t-bd)')}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold mb-1.5 uppercase tracking-widest"
                style={{ color: 'var(--t-m)' }}
              >
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--t-m)' }}
                  strokeWidth={1.5}
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none transition"
                  style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                  placeholder={t.auth.minChars}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--t-a)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--t-bd)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="dnc-btn-icon absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--t-m)' }}
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold mb-1.5 uppercase tracking-widest"
                style={{ color: 'var(--t-m)' }}
              >
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--t-m)' }}
                  strokeWidth={1.5}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                  style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                  placeholder="••••••••"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--t-a)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--t-bd)')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="dnc-btn dnc-btn-primary dnc-btn-block py-2.5 rounded-xl text-sm font-semibold mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>{t.auth.createAccount} <ArrowRight className="w-4 h-4" strokeWidth={2} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--t-m)' }}>
            {t.auth.hasAccount}{' '}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: 'var(--t-a)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--t-ah)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--t-a)')}
            >
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
