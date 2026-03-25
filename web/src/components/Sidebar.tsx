import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Cpu, Database, LogOut, ChevronLeft, ChevronRight, Settings, Bot as BotIcon, Circle, Gift } from 'lucide-react';
import { botAPI, type Bot } from '../services/api.js';
import { useTranslation } from '../hooks/useTranslation';

const STATUS_DOT: Record<string, string> = {
  running: '#22c55e',
  idle: '#6b7280',
  stopped: '#ef4444',
  error: '#ef4444',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const GROUPS = [
    {
      label: 'Automation',
      links: [
        { to: '/dashboard', icon: Cpu, label: t.sidebar.instances, end: true },
        { to: '/dashboard/databases', icon: Database, label: t.sidebar.databases, end: false },
      ],
    },
    {
      label: t.sidebar.partner,
      links: [
        { to: '/dashboard/partner', icon: Gift, label: t.sidebar.partner, end: false },
      ],
    },
  ];

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  // Instances link should be active on /dashboard and /dashboard/instances/*
  const isInstancesActive =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/dashboard/instances');

  // Databases link should be active on /dashboard/databases and /dashboard/databases/*
  const isDatabasesActive = location.pathname.startsWith('/dashboard/databases');

  const isSettingsActive = location.pathname.startsWith('/dashboard/settings');

  useEffect(() => {
    botAPI.list().then(setBots).catch(() => { });
  }, []);

  return (
    <aside
      className="shrink-0 flex flex-col h-screen sticky top-0 transition-all duration-150"
      style={{
        width: collapsed ? 56 : 220,
        background: 'var(--t-s)',
        borderRight: '1px solid var(--t-bd)',
        position: 'relative',
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center h-14 shrink-0 overflow-hidden"
        style={{ borderBottom: '1px solid var(--t-bd)', padding: collapsed ? '0 14px' : '0 16px' }}
      >
        <img src="/logo.ico" alt="DisFlow" className="w-7 h-7 rounded-lg shrink-0 object-contain" />
        {!collapsed && (
          <span className="ml-3 text-sm font-bold tracking-wide whitespace-nowrap overflow-hidden" style={{ color: 'var(--t-tx)' }}>
            DisFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3" style={{ padding: collapsed ? '12px 8px' : '12px 8px' }}>
        {GROUPS.map(({ label, links }) => (
          <div key={label} className="mb-2">
            {!collapsed && (
              <p
                className="mb-1 text-[10px] font-bold uppercase tracking-widest select-none"
                style={{ color: 'var(--t-m)', padding: '0 10px' }}
              >
                {label}
              </p>
            )}
            {links.map(({ to, icon: Icon, label: linkLabel, end }) => {
              const forceActive =
                (to === '/dashboard' && isInstancesActive) ||
                (to === '/dashboard/databases' && isDatabasesActive);
              return (
                <div key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    title={collapsed ? linkLabel : undefined}
                    className={({ isActive }) => {
                      const active = forceActive || isActive;
                      return `flex items-center rounded-lg text-sm font-medium transition-all mb-0.5 group relative ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
                        } ${active ? '' : ''}`;
                    }}
                    style={({ isActive }) => {
                      const active = forceActive || isActive;
                      return {
                        background: active ? 'var(--t-aa)' : 'transparent',
                        color: active ? 'var(--t-a)' : 'var(--t-tx)',
                      };
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      if (!(el as any).__isActive) {
                        el.style.background = 'var(--t-s2)';
                        el.style.color = 'var(--t-tx)';
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      if (!(el as any).__isActive) {
                        el.style.background = '';
                        el.style.color = '';
                      }
                    }}
                  >
                    {({ isActive }) => {
                      const active = forceActive || isActive;
                      return (
                        <>
                          {active && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                              style={{ background: 'var(--t-a)' }}
                            />
                          )}
                          <Icon
                            className="w-4 h-4 shrink-0"
                            strokeWidth={1.5}
                            style={{ color: active ? 'var(--t-a)' : 'var(--t-tx)' }}
                          />
                          {!collapsed && (
                            <span style={{ color: active ? 'var(--t-a)' : 'var(--t-tx)' }}>{linkLabel}</span>
                          )}
                        </>
                      );
                    }}
                  </NavLink>

                  {/* ── Instance sub-list under Instances link ── */}
                  {to === '/dashboard' && !collapsed && bots.length > 0 && (
                    <div className="ml-3 mt-0.5 mb-1 space-y-0.5" style={{ borderLeft: '1px solid var(--t-bd)', paddingLeft: 8 }}>
                      {bots.map(bot => {
                        const isBotActive = location.pathname === `/dashboard/instances/${bot.id}`;
                        return (
                          <button
                            key={bot.id}
                            onClick={() => navigate(`/dashboard/instances/${bot.id}`)}
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition"
                            style={{
                              background: isBotActive ? 'var(--t-aa)' : 'transparent',
                              color: isBotActive ? 'var(--t-a)' : 'var(--t-sub)',
                            }}
                            onMouseEnter={e => {
                              if (!isBotActive) {
                                (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isBotActive) {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = 'var(--t-sub)';
                              }
                            }}
                          >
                            <span className="relative shrink-0">
                              <BotIcon className="w-3.5 h-3.5" />
                              <Circle
                                className="w-1.5 h-1.5 fill-current absolute -bottom-0.5 -right-0.5"
                                style={{ color: STATUS_DOT[bot.status] ?? '#6b7280' }}
                              />
                            </span>
                            <span className="text-[11px] font-medium truncate flex-1">{bot.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Database sub-list under Bases de données link ── */}
                  {to === '/dashboard/databases' && !collapsed && bots.length > 0 && (
                    <div className="ml-3 mt-0.5 mb-1 space-y-0.5" style={{ borderLeft: '1px solid var(--t-bd)', paddingLeft: 8 }}>
                      {bots.map(bot => {
                        const isDbActive = location.pathname === `/dashboard/databases/${bot.id}`;
                        return (
                          <button
                            key={bot.id}
                            onClick={() => navigate(`/dashboard/databases/${bot.id}`)}
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition"
                            style={{
                              background: isDbActive ? 'var(--t-aa)' : 'transparent',
                              color: isDbActive ? 'var(--t-a)' : 'var(--t-sub)',
                            }}
                            onMouseEnter={e => {
                              if (!isDbActive) {
                                (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isDbActive) {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = 'var(--t-sub)';
                              }
                            }}
                          >
                            <Database className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px] font-medium truncate flex-1">{bot.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 py-2" style={{ borderTop: '1px solid var(--t-bd)', padding: collapsed ? '8px' : '8px 8px' }}>
        {/* User row */}
        {!collapsed && (
          <div
            className="flex items-center gap-2.5 rounded-lg mb-0.5"
            style={{ padding: '7px 10px' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 uppercase"
              style={{ background: 'var(--t-a)' }}
            >
              {initials}
            </div>
            <span
              className="text-xs truncate flex-1"
              style={{ color: 'var(--t-sub)' }}
            >
              {user?.email}
            </span>
          </div>
        )}

        <button
          title={collapsed ? t.sidebar.settings : undefined}
          onClick={() => navigate('/dashboard/settings')}
          className="w-full flex items-center rounded-lg transition mb-0.5"
          style={{
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px 0' : '7px 10px',
            color: isSettingsActive ? 'var(--t-a)' : 'var(--t-m)',
            background: isSettingsActive ? 'var(--t-aa)' : 'transparent',
          }}
          onMouseEnter={e => { if (!isSettingsActive) { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; } }}
          onMouseLeave={e => { if (!isSettingsActive) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; } }}
        >
          <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} style={{ color: isSettingsActive ? 'var(--t-a)' : undefined }} />
          {!collapsed && <span className="text-sm">{isSettingsActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full" style={{ background: 'var(--t-a)' }} />}{t.sidebar.settings}</span>}
        </button>

        {/* Logout */}
        <button
          title={collapsed ? t.sidebar.logout : undefined}
          onClick={logout}
          className="w-full flex items-center rounded-lg transition mb-1"
          style={{
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px 0' : '7px 10px',
            color: 'var(--t-m)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span className="text-sm">{t.sidebar.logout}</span>}
        </button>

      </div>

      {/* Collapse / expand — centred on right border */}
      <button
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? t.sidebar.expand : t.sidebar.collapse}
        className="absolute top-1/2 z-50 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
        style={{
          right: -11,
          transform: 'translateY(-50%)',
          backgroundColor: 'var(--t-s)',
          border: '1px solid var(--t-bd)',
          color: 'var(--t-m)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t-a)'; e.currentTarget.style.color = 'var(--t-a)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--t-bd)'; e.currentTarget.style.color = 'var(--t-m)'; }}
      >
        {collapsed
          ? <ChevronRight className="w-2.5 h-2.5" strokeWidth={2.5} />
          : <ChevronLeft className="w-2.5 h-2.5" strokeWidth={2.5} />}
      </button>
    </aside>
  );
}
