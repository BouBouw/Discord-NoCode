import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';
import {
  Zap, Code, Shield, ArrowRight, GitBranch, LogIn, LogOut,
  Sparkles, Play, Star, Users, Globe, Bot, ChevronRight,
  ChevronDown, MessageCircle, Layers, Rocket, Clock, Check,
  Hash, Send, LayoutDashboard, Save, Terminal, CheckCircle, Search,
  MousePointerClick, Volume2, ShieldAlert, Database, Server,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useUserSettings, type Language } from '../hooks/useUserSettings';
import DotGrid from '../components/backgrounds/DotGrid';
import HeroWorkflowPreview from '../components/HeroWorkflowPreview';

/* ─── Language list ────────────────────────────────────────────────────────*/
const LANGUAGES: { value: Language; flag: string; label: string }[] = [
  { value: 'fr', flag: '\u{1F1EB}\u{1F1F7}', label: 'Fran\u00e7ais' },
  { value: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'English' },
  { value: 'es', flag: '\u{1F1EA}\u{1F1F8}', label: 'Espa\u00f1ol' },
  { value: 'de', flag: '\u{1F1E9}\u{1F1EA}', label: 'Deutsch' },
  { value: 'pt', flag: '\u{1F1E7}\u{1F1F7}', label: 'Portugu\u00eas' },
  { value: 'zh', flag: '\u{1F1E8}\u{1F1F3}', label: '\u4E2D\u6587' },
  { value: 'ja', flag: '\u{1F1EF}\u{1F1F5}', label: '\u65E5\u672C\u8A9E' },
  { value: 'ko', flag: '\u{1F1F0}\u{1F1F7}', label: '\uD55C\uAD6D\uC5B4' },
  { value: 'ru', flag: '\u{1F1F7}\u{1F1FA}', label: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439' },
  { value: 'ar', flag: '\u{1F1F8}\u{1F1E6}', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
  { value: 'hi', flag: '\u{1F1EE}\u{1F1F3}', label: '\u0939\u093F\u0928\u094D\u0926\u0940' },
  { value: 'it', flag: '\u{1F1EE}\u{1F1F9}', label: 'Italiano' },
  { value: 'tr', flag: '\u{1F1F9}\u{1F1F7}', label: 'T\u00FCrk\u00E7e' },
  { value: 'nl', flag: '\u{1F1F3}\u{1F1F1}', label: 'Nederlands' },
  { value: 'pl', flag: '\u{1F1F5}\u{1F1F1}', label: 'Polski' },
  { value: 'uk', flag: '\u{1F1FA}\u{1F1E6}', label: '\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430' },
  { value: 'vi', flag: '\u{1F1FB}\u{1F1F3}', label: 'Ti\u1EBFng Vi\u1EC7t' },
  { value: 'th', flag: '\u{1F1F9}\u{1F1ED}', label: '\u0E44\u0E17\u0E22' },
  { value: 'id', flag: '\u{1F1EE}\u{1F1E9}', label: 'Indonesia' },
  { value: 'ro', flag: '\u{1F1F7}\u{1F1F4}', label: 'Rom\u00E2n\u0103' },
  { value: 'bn', flag: '\u{1F1E7}\u{1F1E9}', label: '\u09AC\u09BE\u0982\u09B2\u09BE' },
  { value: 'ms', flag: '\u{1F1F2}\u{1F1FE}', label: 'Melayu' },
  { value: 'fa', flag: '\u{1F1EE}\u{1F1F7}', label: '\u0641\u0627\u0631\u0633\u06CC' },
  { value: 'sw', flag: '\u{1F1F0}\u{1F1EA}', label: 'Kiswahili' },
  { value: 'ur', flag: '\u{1F1F5}\u{1F1F0}', label: '\u0627\u0631\u062F\u0648' },
  { value: 'ta', flag: '\u{1F1EE}\u{1F1F3}', label: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD' },
  { value: 'te', flag: '\u{1F1EE}\u{1F1F3}', label: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41' },
  { value: 'mr', flag: '\u{1F1EE}\u{1F1F3}', label: '\u092E\u0930\u093E\u0920\u0940' },
  { value: 'gu', flag: '\u{1F1EE}\u{1F1F3}', label: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0' },
  { value: 'my', flag: '\u{1F1F2}\u{1F1F2}', label: '\u1019\u103C\u1014\u103A\u1019\u102C' },
  { value: 'ha', flag: '\u{1F1F3}\u{1F1EC}', label: 'Hausa' },
  { value: 'am', flag: '\u{1F1EA}\u{1F1F9}', label: '\u12A0\u121B\u122D\u129B' },
];

/* ─── Light Theme ──────────────────────────────────────────────────────────*/
const LIGHT = {
  bg: '#FFFFFF', bgAlt: '#F5F7FA', bgCard: '#FFFFFF',
  border: '#E4E7EB', borderHv: '#CBD5E1',
  text: '#1A1D23', textSub: '#4B5563', textMuted: '#6B7280',
  accent: '#0052FF', accentHv: '#0041CC', accentGlow: 'rgba(0,82,255,0.12)',
  shadow: '0 4px 24px rgba(0,0,0,0.07)', shadowHv: '0 12px 40px rgba(0,82,255,0.14)',
  glass: 'rgba(255,255,255,0.80)', glassBd: '#E4E7EB',
};

/* ─── Dark Theme ───────────────────────────────────────────────────────────*/
const DARK = {
  bg: '#323339', bgAlt: '#2C2D32', bgCard: '#2A2B2F',
  border: '#36373E', borderHv: '#4A4B52',
  text: '#C6C7C9', textSub: '#E6E6E6', textMuted: '#FFFFFF',
  accent: '#7289DA', accentHv: '#3D61DF', accentGlow: 'rgba(0,82,255,0.14)',
  shadow: '0 4px 24px rgba(0,0,0,0.35)', shadowHv: '0 12px 40px rgba(114,137,218,0.18)',
  glass: 'rgba(50,51,57,0.75)', glassBd: '#36373E',
};

/* ─── Scroll Hook ──────────────────────────────────────────────────────────*/
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return y;
}

/* ─── PremiumButton ────────────────────────────────────────────────────────*/
function PremiumButton({
  children, href, onClick, dark, ghost, size = 'md',
}: {
  children: React.ReactNode; href?: string; onClick?: () => void;
  dark?: boolean; ghost?: boolean; size?: 'sm' | 'md' | 'lg';
}) {
  const T = dark ? DARK : LIGHT;
  const px = size === 'lg' ? '1.75rem' : size === 'sm' ? '0.875rem' : '1.25rem';
  const py = size === 'lg' ? '0.875rem' : size === 'sm' ? '0.5rem' : '0.65rem';
  const fs = size === 'lg' ? '0.9375rem' : '0.875rem';

  const base: React.CSSProperties = ghost
    ? { background: 'transparent', border: `1px solid ${T.border}`, color: T.textSub, boxShadow: 'none' }
    : { background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentHv} 100%)`, border: 'none', color: '#fff', boxShadow: `0 6px 20px ${T.accentGlow}` };

  const style: React.CSSProperties = {
    ...base, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: `${py} ${px}`, borderRadius: '0.75rem', fontSize: fs, fontWeight: 600,
    letterSpacing: '0.01em', cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
    textDecoration: 'none', whiteSpace: 'nowrap',
  };

  const enter = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (ghost) { el.style.borderColor = T.borderHv; el.style.color = T.text; el.style.background = dark ? 'rgba(129,140,248,0.06)' : 'rgba(99,102,241,0.05)'; }
    else { el.style.boxShadow = `0 10px 28px ${T.accentGlow}`; el.style.transform = 'translateY(-2px)'; }
  };
  const leave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (ghost) { el.style.borderColor = T.border; el.style.color = T.textSub; el.style.background = 'transparent'; }
    else { el.style.boxShadow = `0 6px 20px ${T.accentGlow}`; el.style.transform = 'translateY(0)'; }
  };

  if (href) return <Link to={href} style={style} onMouseEnter={enter} onMouseLeave={leave}>{children}</Link>;
  return <button style={style} onClick={onClick} onMouseEnter={enter} onMouseLeave={leave}>{children}</button>;
}

/* ─── Navbar ───────────────────────────────────────────────────────────────*/
function LandingNavbar({ dark }: { dark: boolean }) {
  const { user, logout } = useAuth();
  const { t, lang } = useTranslation();
  const { updateSettings } = useUserSettings();
  const scrollY = useScrollY();
  const T = dark ? DARK : LIGHT;
  const scrolled = scrollY > 20;
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = LANGUAGES.find(l => l.value === lang) ?? LANGUAGES[0];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const navLink: React.CSSProperties = {
    padding: '6px 14px', fontSize: 14, fontWeight: 500, color: T.textSub,
    textDecoration: 'none', borderRadius: 8, transition: 'all 0.15s', cursor: 'pointer',
    background: 'transparent', border: 'none',
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      background: scrolled ? T.glass : 'transparent',
      borderBottom: scrolled ? `1px solid ${T.glassBd}` : '1px solid transparent',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.ico" alt="DisFlow" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'contain' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>DisFlow</span>
          </Link>

          <div style={{ display: 'none', alignItems: 'center', gap: 4 }} className="nav-links-desktop">
            {[
              { label: t.landing.featuresLabel, id: 'features' },
              { label: t.landing.navBenefits, id: 'benefits' },
              { label: t.landing.navTestimonials, id: 'testimonials' },
              { label: t.landing.navPricing, id: 'pricing' },
            ].map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)} style={navLink}
                onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.textSub; e.currentTarget.style.background = 'transparent'; }}
              >{label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Language selector */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLangOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                  borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s', fontSize: 13,
                  color: T.textSub,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHv; e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{currentLang.flag}</span>
                <ChevronDown style={{
                  width: 12, height: 12, color: T.textSub,
                  transition: 'transform 0.2s',
                  transform: langOpen ? 'rotate(180deg)' : 'rotate(0)',
                }} strokeWidth={2} />
              </button>

              {langOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setLangOpen(false)} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
                    minWidth: 180, maxHeight: 320, overflowY: 'auto', borderRadius: 14, padding: 4,
                    background: dark ? '#2A2B2F' : '#FFFFFF',
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  }}>
                    {LANGUAGES.map(l => (
                      <button
                        key={l.value}
                        onClick={() => { updateSettings({ defaultLanguage: l.value }); setLangOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '8px 12px', borderRadius: 10, border: 'none',
                          background: l.value === lang ? (dark ? 'rgba(114,137,218,0.12)' : 'rgba(0,82,255,0.08)') : 'transparent',
                          cursor: 'pointer', fontSize: 13, color: T.text, textAlign: 'left',
                          transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { if (l.value !== lang) { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; } }}
                        onMouseLeave={e => { if (l.value !== lang) { e.currentTarget.style.background = 'transparent'; } }}
                      >
                        <span style={{ fontSize: 16, lineHeight: 1 }}>{l.flag}</span>
                        <span style={{ flex: 1 }}>{l.label}</span>
                        {l.value === lang && <Check style={{ width: 14, height: 14, color: T.accent }} strokeWidth={2} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px',
                    borderRadius: 99, border: `1px solid ${T.border}`, background: 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHv; e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${T.accent}, #8b5cf6)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}>
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown style={{
                    width: 14, height: 14, color: T.textSub,
                    transition: 'transform 0.2s',
                    transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }} strokeWidth={2} />
                </button>

                {profileOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setProfileOpen(false)} />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
                      minWidth: 200, borderRadius: 14, padding: 6,
                      background: dark ? '#2A2B2F' : '#FFFFFF',
                      border: `1px solid ${T.border}`,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                    }}>
                      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>
                          {user.email.split('@')[0]}
                        </p>
                        <p style={{ fontSize: 12, color: T.textSub, margin: '2px 0 0' }}>
                          {user.email}
                        </p>
                      </div>
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        borderRadius: 10, fontSize: 13, fontWeight: 500, color: T.textSub,
                        textDecoration: 'none', transition: 'all 0.12s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = T.textSub; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LayoutDashboard style={{ width: 15, height: 15 }} strokeWidth={1.5} />
                        Dashboard
                      </Link>
                      <button onClick={() => { logout(); setProfileOpen(false); }} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#ef4444',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        width: '100%', textAlign: 'left', transition: 'all 0.12s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <LogOut style={{ width: 15, height: 15 }} strokeWidth={1.5} />
                        {t.landing.logoutBtn}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{ ...navLink, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.textSub; e.currentTarget.style.background = 'transparent'; }}
                ><LogIn style={{ width: 14, height: 14 }} strokeWidth={1.5} />{t.landing.login}</Link>
                <PremiumButton href="/register" dark={dark}>
                  {t.landing.getStarted} <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
                </PremiumButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Section helpers ──────────────────────────────────────────────────────*/
function SectionBadge({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  const T = dark ? DARK : LIGHT;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px',
      borderRadius: 99, background: dark ? 'rgba(114,137,218,0.1)' : 'rgba(0,82,255,0.08)',
      border: `1px solid ${dark ? 'rgba(114,137,218,0.22)' : 'rgba(0,82,255,0.22)'}`,
      color: T.accent, fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
      textTransform: 'uppercase', marginBottom: 18,
    }}>{children}</div>
  );
}

/* ─── Main LandingPage ─────────────────────────────────────────────────────*/
export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [yearly, setYearly] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── Preview draggable nodes ── */
  const INITIAL_NODES: Record<string, { x: number; y: number }> = {
    coreBot: { x: 60, y: 134 }, command: { x: 215, y: 84 }, condition: { x: 365, y: 78 },
    event: { x: 215, y: 234 }, sendMsg: { x: 515, y: 184 }, kick: { x: 515, y: 284 },
  };
  const [nodePos, setNodePos] = useState(INITIAL_NODES);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const onNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { id, ox: e.clientX - rect.left - nodePos[id].x, oy: e.clientY - rect.top - nodePos[id].y };
  }, [nodePos]);

  const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { id, ox, oy } = dragRef.current;
    const rawX = e.clientX - rect.left - ox;
    const rawY = e.clientY - rect.top - oy;
    const x = Math.max(0, Math.min(rawX, rect.width - 56));
    const y = Math.max(0, Math.min(rawY, rect.height - 70));
    setNodePos(prev => ({ ...prev, [id]: { x, y } }));
  }, []);

  const onCanvasMouseUp = useCallback(() => { dragRef.current = null; }, []);

  /* Edge helper: bezier path between two points */
  const bezier = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }, []);

  /* Compute edge paths from current positions */
  const previewEdges = (() => {
    const p = nodePos;
    // output right: x+55, y+26 (standard 52px node), input left: x, y+26
    // condition: 52x70, true output top: x+55, y+18, false output: x+55, y+52
    return [
      { from: [p.coreBot.x + 55, p.coreBot.y + 26], to: [p.command.x, p.command.y + 26], stroke: 'rgba(114,137,218,0.5)', dash: '' },
      { from: [p.coreBot.x + 55, p.coreBot.y + 26], to: [p.event.x, p.event.y + 26], stroke: 'rgba(114,137,218,0.5)', dash: '' },
      { from: [p.command.x + 55, p.command.y + 26], to: [p.condition.x, p.condition.y + 35], stroke: 'rgba(168,85,247,0.5)', dash: '' },
      { from: [p.condition.x + 55, p.condition.y + 18], to: [p.sendMsg.x, p.sendMsg.y + 26], stroke: 'rgba(34,197,94,0.4)', dash: '4 3' },
      { from: [p.condition.x + 55, p.condition.y + 52], to: [p.kick.x, p.kick.y + 26], stroke: 'rgba(251,113,133,0.4)', dash: '4 3' },
      { from: [p.event.x + 55, p.event.y + 26], to: [p.sendMsg.x, p.sendMsg.y + 26], stroke: 'rgba(232,100,58,0.5)', dash: '' },
    ];
  })();

  /* ── data ── */
  const features: { icon: React.ReactNode; title: string; desc: string; span?: number }[] = [
    { icon: <GitBranch style={{ width: 20, height: 20 }} strokeWidth={1.5} />, title: t.landing.feat1Title, desc: t.landing.feat1Desc, span: 2 },
    { icon: <Code style={{ width: 20, height: 20 }} strokeWidth={1.5} />, title: t.landing.feat2Title, desc: t.landing.feat2Desc },
    { icon: <Shield style={{ width: 20, height: 20 }} strokeWidth={1.5} />, title: t.landing.feat3Title, desc: t.landing.feat3Desc },
    { icon: <Rocket style={{ width: 20, height: 20 }} strokeWidth={1.5} />, title: t.landing.step3Title, desc: t.landing.step3Desc },
    { icon: <MessageCircle style={{ width: 20, height: 20 }} strokeWidth={1.5} />, title: t.landing.feat4Title, desc: t.landing.feat4Desc, span: 2 },
  ];

  const keyBenefits = [
    { icon: <Layers style={{ width: 22, height: 22 }} strokeWidth={1.5} />, title: t.landing.kb1Title, desc: t.landing.kb1Desc },
    { icon: <Rocket style={{ width: 22, height: 22 }} strokeWidth={1.5} />, title: t.landing.kb2Title, desc: t.landing.kb2Desc },
    { icon: <Clock style={{ width: 22, height: 22 }} strokeWidth={1.5} />, title: t.landing.kb3Title, desc: t.landing.kb3Desc },
    { icon: <Globe style={{ width: 22, height: 22 }} strokeWidth={1.5} />, title: t.landing.kb4Title, desc: t.landing.kb4Desc },
  ];

  const testimonials = [
    { quote: t.landing.test1Quote, name: t.landing.test1Name, role: t.landing.test1Role },
    { quote: t.landing.test2Quote, name: t.landing.test2Name, role: t.landing.test2Role },
    { quote: t.landing.test3Quote, name: t.landing.test3Name, role: t.landing.test3Role },
    { quote: t.landing.test4Quote, name: t.landing.test4Name, role: t.landing.test4Role },
  ];

  const plans = [
    { id: 'free' as const, name: t.landing.planFree, price: 0, period: '/mo', features: [t.landing.priceFeat1Bot, '6 cmds / 3 events', `3 ${t.settings.membersPerBot}`, '500 MB DB', '1 000 AI credits'], cta: t.landing.startFree, highlight: false },
    { id: 'pro' as const, name: t.landing.planPro, price: yearly ? 3.99 : 4.99, period: yearly ? `/mo ${t.landing.billedYearly}` : '/mo', features: ['3 bots', '30 cmds / 15 events', `6 ${t.settings.membersPerBot}`, '5 GB DB', '5 000 AI credits'], cta: t.landing.getStarted, highlight: true },
    { id: 'business' as const, name: t.landing.planBusiness, price: yearly ? 11.99 : 14.99, period: yearly ? `/mo ${t.landing.billedYearly}` : '/mo', features: ['15 bots', t.landing.priceFeatUnlimited + ' cmds/events', `15 ${t.settings.membersPerBot} (+2€/${t.settings.extraSeat})`, '15 GB DB', '20 000 AI credits'], cta: t.landing.getStarted, highlight: false },
  ];

  const faqs = [
    { q: t.landing.faq1Q, a: t.landing.faq1A },
    { q: t.landing.faq2Q, a: t.landing.faq2A },
    { q: t.landing.faq3Q, a: t.landing.faq3A },
    { q: t.landing.faq4Q, a: t.landing.faq4A },
    { q: t.landing.faq5Q, a: t.landing.faq5A },
    { q: t.landing.faq6Q, a: t.landing.faq6A },
  ];

  const PLAN_RANK = { free: 0, pro: 1, business: 2 } as const;
  const handlePlanCta = async (planId: 'free' | 'pro' | 'business') => {
    if (!user) { navigate('/register'); return; }
    const currentRank = PLAN_RANK[user.plan ?? 'free'];
    const targetRank = PLAN_RANK[planId];
    if (planId === 'free' || targetRank <= currentRank) { navigate('/dashboard/settings'); return; }
    try {
      const { url, sessionId } = await subscriptionAPI.checkout(planId, yearly ? 'year' : 'month');
      sessionStorage.setItem('stripe_checkout_session', sessionId);
      window.location.href = url;
    } catch { navigate('/dashboard/settings'); }
  };

  /* card hover helper */
  const cardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.borderColor = T.borderHv;
    e.currentTarget.style.boxShadow = T.shadowHv;
  };
  const cardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderColor = T.border;
    e.currentTarget.style.boxShadow = T.shadow;
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Space Grotesk', 'DM Sans', system-ui, sans-serif", transition: 'background 0.4s ease, color 0.4s ease' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .nav-links-desktop { display: none !important; }
        @media (min-width: 768px) {
          .nav-links-desktop { display: flex !important; }
        }
        @media (max-width: 767px) {
          .landing-grid-3 { grid-template-columns: 1fr !important; }
          .landing-grid-2 { grid-template-columns: 1fr !important; }
          .landing-grid-3 > * { grid-column: span 1 !important; }
          .landing-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-split { flex-direction: column !important; text-align: center !important; }
          .hero-split > * { align-items: center !important; }
          .hero-mockup { display: none !important; }
          .hero-ctas { justify-content: center !important; }
          .hero-trust { justify-content: center !important; }
        }
      `}</style>
      <LandingNavbar dark={dark} />

      {/* ── Mode Toggle ── */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 100 }}>
        <button onClick={() => setDark(d => !d)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          backdropFilter: 'blur(20px)', background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${T.border}`, color: T.text, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.18)'; }}
        >
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: dark ? '#FFFFFF' : '#1A1A1A', display: 'inline-block', transition: 'background 0.3s' }} />
          {dark ? t.landing.lightMode : t.landing.darkMode}
        </button>
      </div>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 80, paddingBottom: 0, paddingLeft: 24, paddingRight: 24, overflow: 'hidden' }}>
        <DotGrid dotSize={10} gap={22} baseColor={dark ? '#3a3b44' : '#d0d5e0'} activeColor={T.accent}
          proximity={180} shockRadius={200} shockStrength={4}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', zIndex: 0 }} />

        {/* Split layout */}
        <div className="hero-split" style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 56, width: '100%', flex: 1 }}>

          {/* Left — Text */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Avatar badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px 6px 6px', borderRadius: 99,
              background: dark ? 'rgba(114,137,218,0.1)' : 'rgba(0,82,255,0.08)',
              border: `1px solid ${dark ? 'rgba(114,137,218,0.28)' : 'rgba(0,82,255,0.22)'}`,
              marginBottom: 32,
            }}>
              <div style={{ display: 'flex' }}>
                {[T.accent, '#8b5cf6', '#3b82f6'].map((c, i) => (
                  <div key={i} style={{
                    width: 26, height: 26, borderRadius: '50%', background: c,
                    border: `2px solid ${T.bg}`, marginLeft: i > 0 ? -8 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                  }}>{['D', 'F', 'B'][i]}</div>
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>12,000+ {t.landing.statUsers}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 20, color: T.text }}>
              {t.landing.heroSubtitle}
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textSub, maxWidth: 480, marginBottom: 32, fontWeight: 400 }}>
              {t.landing.heroDesc}
            </p>

            <div className="hero-ctas" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
              <PremiumButton href="/register" dark={dark} size="lg">
                {t.landing.startFree} <ArrowRight style={{ width: 16, height: 16 }} strokeWidth={2} />
              </PremiumButton>
              <PremiumButton href="/login" dark={dark} ghost size="lg">
                <Play style={{ width: 14, height: 14 }} strokeWidth={2} /> {t.landing.viewDemo}
              </PremiumButton>
            </div>

            {/* Trust row */}
            <div className="hero-trust" style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              padding: '12px 16px', borderRadius: 12,
              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} style={{ width: 16, height: 16, fill: T.accent, color: T.accent }} />)}
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>4.8/5</span>
              <span style={{ fontSize: 13, color: T.textSub }}>{t.landing.basedOnReviews}</span>
            </div>
          </div>

          {/* Right — Workflow Preview */}
          <div className="hero-mockup" style={{ flex: '0 0 480px', maxWidth: 480 }}>
            <HeroWorkflowPreview dark={dark} />
          </div>
        </div>

        {/* Bottom trust bar */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: '24px 24px', marginTop: 'auto',
          marginLeft: -24, marginRight: -24,
          background: dark ? '#323339' : '#FFFFFF',
        }}>
          <p style={{ textAlign: 'center', fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            {t.landing.trustedBy}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap', opacity: 0.4 }}>
            {['Craftnet', 'Aventra', 'AirLab', 'Lumean', 'NovaTech'].map(name => (
              <span key={name} style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '0.02em' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES BENTO ══════════════════════ */}
      <section id="features" style={{ padding: '88px 24px', background: T.bgAlt }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge dark={dark}>{t.landing.featuresLabel}</SectionBadge>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 14 }}>
              {t.landing.featuresTitle}
            </h2>
            <p style={{ fontSize: 15, color: T.textSub, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>{t.landing.featuresSub}</p>
          </div>

          <div className="landing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                gridColumn: f.span ? `span ${f.span}` : undefined,
                padding: '28px 26px', borderRadius: 20, background: T.bgCard,
                border: `1px solid ${T.border}`, boxShadow: T.shadow,
                transition: 'all 0.25s ease', cursor: 'default',
              }}
                onMouseEnter={cardEnter} onMouseLeave={cardLeave}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14, marginBottom: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: dark ? 'rgba(114,137,218,0.08)' : 'rgba(0,82,255,0.08)',
                  border: `1px solid ${dark ? 'rgba(114,137,218,0.2)' : 'rgba(0,82,255,0.2)'}`, color: T.accent,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: T.textSub, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ BENEFITS CARDS ══════════════════════ */}
      <section id="benefits" style={{ padding: '88px 24px', background: T.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge dark={dark}>{t.landing.benefitsLabel}</SectionBadge>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 14 }}>
              {t.landing.benefitsTitle}
            </h2>
            <p style={{ fontSize: 15, color: T.textSub, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
              {t.landing.benefitsSub}
            </p>
          </div>

          <div className="landing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* Card 1 — Template Library */}
            <div style={{
              borderRadius: 24, overflow: 'hidden', border: `1px solid ${T.border}`,
              background: dark ? `linear-gradient(180deg, ${DARK.bgCard} 0%, ${DARK.bgAlt} 100%)` : `linear-gradient(180deg, rgba(0,82,255,0.06) 0%, #fff 100%)`,
              transition: 'all 0.25s ease',
            }} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
              <div style={{ padding: '28px 24px 20px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                  borderRadius: 99, background: dark ? 'rgba(114,137,218,0.1)' : 'rgba(0,82,255,0.08)',
                  border: `1px solid ${dark ? 'rgba(114,137,218,0.25)' : 'rgba(0,82,255,0.2)'}`,
                  color: T.accent, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
                }}>
                  <Layers style={{ width: 9, height: 9 }} strokeWidth={2} /> {t.landing.templatesLabel}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{t.landing.templatesTitle}</h3>
                <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.65, marginBottom: 16 }}>
                  {t.landing.templatesDesc}
                </p>
              </div>
              {/* Mini template grid */}
              <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[{ name: t.landing.tplModeration, key: 'mod' }, { name: t.landing.tplWelcome, key: 'wel' }, { name: t.landing.tplTickets, key: 'tic' }, { name: t.landing.tplAutoRole, key: 'aro' }].map(item => (
                  <div key={item.key} style={{
                    padding: '10px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: dark ? 'rgba(255,255,255,0.04)' : '#F5F7FA',
                    border: `1px solid ${T.border}`, color: T.textSub,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Hash style={{ width: 10, height: 10, color: T.accent }} strokeWidth={2} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Community */}
            <div style={{
              borderRadius: 24, overflow: 'hidden', border: `1px solid ${T.border}`,
              background: T.bgCard, transition: 'all 0.25s ease',
            }} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
              <div style={{ padding: '28px 24px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                  borderRadius: 99, background: dark ? 'rgba(114,137,218,0.1)' : 'rgba(0,82,255,0.08)',
                  border: `1px solid ${dark ? 'rgba(114,137,218,0.25)' : 'rgba(0,82,255,0.2)'}`,
                  color: T.accent, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
                }}>
                  <Users style={{ width: 9, height: 9 }} strokeWidth={2} /> {t.landing.communityLabel}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{t.landing.communityTitle}</h3>
                <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.65, marginBottom: 20 }}>
                  {t.landing.communityDesc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: -8 }}>
                  {[T.accent, '#22c55e', '#facc15', '#ef4444'].map((c, i) => (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: '50%', background: c, border: `2px solid ${T.bgCard}`,
                      marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>{['A', 'S', 'M', 'J'][i]}</div>
                  ))}
                  <span style={{ marginLeft: 12, fontSize: 12, color: T.textSub }}>{t.landing.communityMembers}</span>
                </div>
                <a
                  href="https://discord.gg/rXcsN2Ck"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18,
                    padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    color: '#fff', background: '#5865F2', textDecoration: 'none',
                    transition: 'all 0.15s', border: 'none', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#4752C4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#5865F2'; }}
                >
                  <svg width="16" height="12" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.2a58.9 58.9 0 0017.7 9 .2.2 0 00.3-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.4 36.4 0 01-5.5 2.7.2.2 0 00-.1.4 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.7 58.7 0 0070.5 45.7v-.2c1.4-15-2.3-28-9.8-39.6a.2.2 0 00-.1-.1zM23.7 37.3c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.1 6.3 7-2.8 7-6.3 7zm23.2 0c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.1 6.3 7-2.8 7-6.3 7z" fill="currentColor" /></svg>
                  {t.landing.joinDiscord}
                </a>
              </div>
            </div>

            {/* Card 3 — Bot Preview */}
            <div style={{
              borderRadius: 24, overflow: 'hidden', border: `1px solid ${T.border}`,
              background: T.bgCard, transition: 'all 0.25s ease',
            }} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
              <div style={{ padding: '28px 24px 16px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                  borderRadius: 99, background: dark ? 'rgba(139,92,246,0.1)' : '#EDE9FE',
                  border: `1px solid ${dark ? 'rgba(139,92,246,0.25)' : '#C4B5FD'}`,
                  color: '#8b5cf6', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
                }}>
                  <Bot style={{ width: 9, height: 9 }} strokeWidth={2} /> {t.landing.previewLabel}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 12 }}>{t.landing.previewTitle}</h3>
              </div>
              {/* Mini chat */}
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '14px 14px 14px 4px', fontSize: 12, lineHeight: 1.5,
                  background: dark ? 'rgba(114,137,218,0.12)' : '#EBF2FF', color: T.text, maxWidth: '85%',
                }}>
                  {t.landing.previewChat1}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '14px 14px 4px 14px', fontSize: 12, lineHeight: 1.5,
                  background: dark ? 'rgba(255,255,255,0.06)' : '#F5F7FA', color: T.textSub, alignSelf: 'flex-end', maxWidth: '75%',
                }}>
                  /setup welcome
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '14px 14px 14px 4px', fontSize: 12, lineHeight: 1.5,
                  background: dark ? 'rgba(114,137,218,0.12)' : '#EBF2FF', color: T.text, maxWidth: '85%',
                }}>
                  <span style={{ color: T.accent }}>&#10003;</span> {t.landing.previewChat2}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 10, border: `1px solid ${T.border}`, marginTop: 4,
                }}>
                  <span style={{ flex: 1, fontSize: 11, color: T.textMuted }}>{t.landing.previewPlaceholder}</span>
                  <Send style={{ width: 12, height: 12, color: T.accent }} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ KEY BENEFITS ══════════════════════ */}
      <section style={{ padding: '88px 24px', background: T.bgAlt }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge dark={dark}>{t.landing.advantagesLabel}</SectionBadge>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 14 }}>
              {t.landing.advantagesTitle}
            </h2>
          </div>

          <div className="landing-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {keyBenefits.map((b, i) => (
              <div key={i} style={{
                padding: '32px 28px', borderRadius: 20, background: T.bgCard,
                border: `1px solid ${T.border}`, boxShadow: T.shadow,
                transition: 'all 0.25s ease', cursor: 'default',
              }} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16, marginBottom: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: dark ? 'rgba(114,137,218,0.08)' : 'rgba(0,82,255,0.08)',
                  border: `1px solid ${dark ? 'rgba(114,137,218,0.2)' : 'rgba(0,82,255,0.2)'}`, color: T.accent,
                }}>{b.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 10 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.65 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section id="testimonials" style={{ padding: '88px 24px', background: T.bg }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge dark={dark}>{t.landing.testimonialsLabel}</SectionBadge>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 14 }}>
              {t.landing.testimonialsTitle}
            </h2>
          </div>

          <div className="landing-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {testimonials.map((item, i) => (
              <div key={i} style={{
                padding: '32px 28px', borderRadius: 20, background: T.bgCard,
                border: `1px solid ${T.border}`, boxShadow: T.shadow,
                transition: 'all 0.25s ease', cursor: 'default',
              }} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
                <div style={{ fontSize: 40, lineHeight: 1, color: T.accent, marginBottom: 16, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7, marginBottom: 24 }}>{item.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${T.accent}, #a5b4fc)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff',
                  }}>{item.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ PRICING ══════════════════════ */}
      <section id="pricing" style={{ padding: '88px 24px', background: T.bgAlt }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge dark={dark}>{t.landing.pricingLabel}</SectionBadge>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 14 }}>
              {t.landing.pricingTitle}
            </h2>
            <p style={{ fontSize: 15, color: T.textSub, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.65 }}>
              {t.landing.pricingSub}
            </p>

            {/* Toggle */}
            <div style={{
              display: 'inline-flex', borderRadius: 12, padding: 4,
              background: dark ? 'rgba(255,255,255,0.04)' : '#F5F7FA',
              border: `1px solid ${T.border}`,
            }}>
              {([t.landing.monthly, t.landing.yearly] as const).map((period, idx) => {
                const active = idx === 1 ? yearly : !yearly;
                return (
                  <button key={idx} onClick={() => setYearly(idx === 1)} style={{
                    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: active ? T.accent : 'transparent',
                    color: active ? '#fff' : T.textSub,
                  }}>{period}</button>
                );
              })}
            </div>
          </div>

          <div className="landing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{
                borderRadius: 24, overflow: 'hidden', padding: '32px 28px',
                background: plan.highlight
                  ? (dark ? `linear-gradient(180deg, ${DARK.bgCard} 0%, ${DARK.bgAlt} 100%)` : `linear-gradient(180deg, rgba(0,82,255,0.06) 0%, #fff 100%)`)
                  : T.bgCard,
                border: `1px solid ${plan.highlight ? (dark ? 'rgba(114,137,218,0.35)' : 'rgba(0,82,255,0.3)') : T.border}`,
                boxShadow: plan.highlight ? T.shadowHv : T.shadow,
                transition: 'all 0.25s ease',
              }} onMouseEnter={cardEnter} onMouseLeave={cardLeave}>
                {plan.highlight && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
                    borderRadius: 99, background: dark ? 'rgba(114,137,218,0.14)' : 'rgba(0,82,255,0.08)',
                    border: `1px solid ${dark ? 'rgba(114,137,218,0.28)' : 'rgba(0,82,255,0.22)'}`,
                    color: T.accent, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16,
                  }}>
                    <Sparkles style={{ width: 9, height: 9 }} strokeWidth={2} />{t.landing.popular}
                  </div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>{plan.name} {t.landing.planSuffix}</h3>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{plan.price}€</span>
                  <span style={{ fontSize: 14, color: T.textSub, marginLeft: 4 }}>{plan.period}</span>
                </div>

                <PremiumButton onClick={() => handlePlanCta(plan.id)} dark={dark} ghost={!plan.highlight} size="md">
                  {plan.cta} <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
                </PremiumButton>

                <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {plan.features.map((feat) => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: T.textSub }}>
                      <Check style={{ width: 16, height: 16, color: T.accent, flexShrink: 0 }} strokeWidth={2} />
                      {feat}
                    </div>
                  ))}
                </div>

                <p style={{ marginTop: 20, fontSize: 11, color: T.textMuted }}>{t.landing.cancelAnytime}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FAQ ══════════════════════ */}
      <section style={{ padding: '88px 24px', background: T.bg }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionBadge dark={dark}>{t.landing.faqLabel}</SectionBadge>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 14 }}>
              {t.landing.faqTitle}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{
                  borderRadius: 16, overflow: 'hidden',
                  border: `1px solid ${isOpen ? T.borderHv : T.border}`,
                  background: T.bgCard, transition: 'all 0.2s ease',
                }}>
                  <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{
                    width: '100%', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', cursor: 'pointer', gap: 16, textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{faq.q}</span>
                    <ChevronDown style={{
                      width: 18, height: 18, color: T.textMuted, flexShrink: 0,
                      transition: 'transform 0.2s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }} strokeWidth={2} />
                  </button>
                  <div style={{
                    maxHeight: isOpen ? 200 : 0, overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}>
                    <p style={{ padding: '0 24px 18px', fontSize: 14, color: T.textSub, lineHeight: 1.7, margin: 0 }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA + FOOTER (ChatFrame style) ══════════════════════ */}
      <section style={{
        background: dark
          ? `linear-gradient(180deg, ${DARK.bg} 0%, #2a2b35 50%, #252630 100%)`
          : `linear-gradient(180deg, ${LIGHT.bgAlt} 0%, ${LIGHT.bg} 50%, ${LIGHT.bgAlt} 100%)`,
        padding: '0',
      }}>
        {/* CTA area */}
        <div style={{ padding: '88px 24px 64px', textAlign: 'center' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
            {/* Workflow Editor Preview */}
            <div style={{
              maxWidth: 1100, margin: '0 auto', borderRadius: 16, overflow: 'hidden',
              background: dark ? 'rgba(255,255,255,0.03)' : T.bgCard,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : T.border}`,
              boxShadow: dark ? '0 24px 80px rgba(0,0,0,0.4)' : '0 24px 80px rgba(0,0,0,0.08)',
            }}>
              {/* Editor toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : T.border}`,
                background: dark ? 'rgba(255,255,255,0.02)' : T.bgAlt,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bot style={{ width: 16, height: 16, color: T.accent }} strokeWidth={2} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: dark ? '#F0F6FC' : T.text }}>{t.landing.previewBotName}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: dark ? 'rgba(255,255,255,0.06)' : T.bgAlt, color: dark ? 'rgba(255,255,255,0.5)' : T.textSub,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Save style={{ width: 11, height: 11 }} strokeWidth={2} /> {t.landing.previewSave}
                  </div>
                  <div style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: T.accent, color: '#fff',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Play style={{ width: 11, height: 11 }} strokeWidth={2} /> {t.landing.previewDeploy}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', height: 500 }}>
                {/* Canvas */}
                <div
                  ref={canvasRef}
                  onMouseMove={onCanvasMouseMove}
                  onMouseUp={onCanvasMouseUp}
                  onMouseLeave={onCanvasMouseUp}
                  style={{ flex: 1, position: 'relative', background: dark ? 'rgba(0,0,0,0.15)' : '#FAFBFC', cursor: dragRef.current ? 'grabbing' : 'default' }}>
                  {/* Dot grid background */}
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.3,
                    backgroundImage: dark
                      ? 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)'
                      : 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }} />

                  {/* Dynamic edges */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
                    {previewEdges.map((edge, i) => (
                      <path key={i} d={bezier(edge.from[0], edge.from[1], edge.to[0], edge.to[1])}
                        fill="none" stroke={edge.stroke} strokeWidth="2"
                        strokeDasharray={edge.dash || undefined} />
                    ))}
                  </svg>

                  {/* Core Bot node */}
                  <div
                    onMouseDown={e => onNodeMouseDown(e, 'coreBot')}
                    style={{ position: 'absolute', left: nodePos.coreBot.x, top: nodePos.coreBot.y, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab', userSelect: 'none' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: dark ? '#2A2B2F' : '#fff', border: '2px solid #4a9eff',
                      boxShadow: dark ? '0 0 0 3px rgba(74,158,255,0.15), 0 4px 12px rgba(0,0,0,0.5)' : '0 0 0 3px rgba(74,158,255,0.12), 0 4px 12px rgba(0,0,0,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Bot style={{ width: 22, height: 22, color: '#4a9eff' }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 9, color: dark ? 'rgba(255,255,255,0.5)' : T.textSub, marginTop: 4 }}>{t.landing.nodeCoreBot}</span>
                  </div>

                  {/* Command Handler node */}
                  <div
                    onMouseDown={e => onNodeMouseDown(e, 'command')}
                    style={{ position: 'absolute', left: nodePos.command.x, top: nodePos.command.y, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab', userSelect: 'none' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: dark ? '#2A2B2F' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : T.border}`,
                      boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 10px rgba(0,0,0,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Terminal style={{ width: 22, height: 22, color: '#e8643a' }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 9, color: dark ? 'rgba(255,255,255,0.5)' : T.textSub, marginTop: 4 }}>{t.landing.nodeCommand}</span>
                  </div>

                  {/* Condition node */}
                  <div
                    onMouseDown={e => onNodeMouseDown(e, 'condition')}
                    style={{ position: 'absolute', left: nodePos.condition.x, top: nodePos.condition.y, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab', userSelect: 'none' }}>
                    <div style={{
                      width: 52, height: 70, borderRadius: 14,
                      background: dark ? '#2A2B2F' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : T.border}`,
                      boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 10px rgba(0,0,0,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <CheckCircle style={{ width: 22, height: 22, color: '#22c55e' }} strokeWidth={1.5} />
                      <span style={{ position: 'absolute', right: -30, top: 14, fontSize: 8, color: 'rgba(34,197,94,0.7)' }}>{t.landing.nodeTrue}</span>
                      <span style={{ position: 'absolute', right: -32, bottom: 14, fontSize: 8, color: 'rgba(251,113,133,0.7)' }}>{t.landing.nodeFalse}</span>
                    </div>
                    <span style={{ fontSize: 9, color: dark ? 'rgba(255,255,255,0.5)' : T.textSub, marginTop: 4 }}>{t.landing.nodeCondition}</span>
                  </div>

                  {/* Event Handler node */}
                  <div
                    onMouseDown={e => onNodeMouseDown(e, 'event')}
                    style={{ position: 'absolute', left: nodePos.event.x, top: nodePos.event.y, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab', userSelect: 'none' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: dark ? '#2A2B2F' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : T.border}`,
                      boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 10px rgba(0,0,0,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Zap style={{ width: 22, height: 22, color: '#e8643a' }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 9, color: dark ? 'rgba(255,255,255,0.5)' : T.textSub, marginTop: 4 }}>{t.landing.nodeEvent}</span>
                  </div>

                  {/* Send Message node */}
                  <div
                    onMouseDown={e => onNodeMouseDown(e, 'sendMsg')}
                    style={{ position: 'absolute', left: nodePos.sendMsg.x, top: nodePos.sendMsg.y, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab', userSelect: 'none' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: dark ? '#2A2B2F' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : T.border}`,
                      boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 10px rgba(0,0,0,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Send style={{ width: 22, height: 22, color: '#a855f7' }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 9, color: dark ? 'rgba(255,255,255,0.5)' : T.textSub, marginTop: 4 }}>{t.landing.nodeSendMsg}</span>
                  </div>

                  {/* Kick node */}
                  <div
                    onMouseDown={e => onNodeMouseDown(e, 'kick')}
                    style={{ position: 'absolute', left: nodePos.kick.x, top: nodePos.kick.y, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab', userSelect: 'none' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: dark ? '#2A2B2F' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : T.border}`,
                      boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 10px rgba(0,0,0,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <LogOut style={{ width: 22, height: 22, color: '#fb7185' }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 9, color: dark ? 'rgba(255,255,255,0.5)' : T.textSub, marginTop: 4 }}>{t.landing.nodeKick}</span>
                  </div>

                  {/* MiniMap */}
                  <div style={{
                    position: 'absolute', bottom: 10, left: 10, width: 80, height: 50,
                    borderRadius: 6, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : T.border}`, zIndex: 3,
                    overflow: 'hidden',
                  }}>
                    {[
                      { id: 'coreBot', c: '#4a9eff' }, { id: 'command', c: '#e8643a' },
                      { id: 'condition', c: '#22c55e' }, { id: 'event', c: '#e8643a' },
                      { id: 'sendMsg', c: '#a855f7' }, { id: 'kick', c: '#fb7185' },
                    ].map(d => (
                      <div key={d.id} style={{
                        position: 'absolute', left: nodePos[d.id].x / 8 + 2, top: nodePos[d.id].y / 8 + 2,
                        width: 6, height: 6, borderRadius: 2,
                        background: d.c, opacity: 0.6,
                      }} />
                    ))}
                  </div>
                </div>

                {/* Right aside — Node Sidebar (mini) */}
                <div style={{
                  width: 180, borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : T.border}`,
                  display: 'flex', flexDirection: 'column',
                  background: dark ? 'rgba(255,255,255,0.02)' : T.bgAlt,
                  textAlign: 'left',
                }}>
                  {/* Header */}
                  <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : T.border}`, minWidth: 180 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: dark ? '#F0F6FC' : T.text }}>{t.landing.previewAddNode}</span>
                  </div>
                  {/* Search */}
                  <div style={{ padding: '8px 10px 6px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 8px', borderRadius: 6, fontSize: 10,
                      background: dark ? 'rgba(0,0,0,0.2)' : T.bg, border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : T.border}`,
                      color: dark ? 'rgba(255,255,255,0.3)' : T.textMuted,
                    }}>
                      <Search style={{ width: 10, height: 10, flexShrink: 0 }} strokeWidth={2} />
                      {t.landing.previewSearchNodes}
                    </div>
                  </div>
                  {/* Category list */}
                  <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 4 }}>
                    {[
                      { icon: Terminal, label: t.landing.catHandlers, desc: t.landing.catHandlersDesc, color: '#4f46e5', bg: 'rgba(99,102,241,0.2)' },
                      { icon: Bot, label: t.landing.catBot, desc: t.landing.catBotDesc, color: '#f472b6', bg: 'rgba(236,72,153,0.2)' },
                      { icon: Send, label: t.landing.catActions, desc: t.landing.catActionsDesc, color: '#60a5fa', bg: 'rgba(59,130,246,0.2)' },
                      { icon: Users, label: t.landing.catUsers, desc: t.landing.catUsersDesc, color: '#06b6d4', bg: 'rgba(6,182,212,0.2)' },
                      { icon: MousePointerClick, label: t.landing.catInteractions, desc: t.landing.catInteractionsDesc, color: '#0ea5e9', bg: 'rgba(14,165,233,0.2)' },
                      { icon: Server, label: t.landing.catGuild, desc: t.landing.catGuildDesc, color: '#8b5cf6', bg: 'rgba(139,92,246,0.2)' },
                      { icon: Volume2, label: t.landing.catVoice, desc: t.landing.catVoiceDesc, color: '#f97316', bg: 'rgba(249,115,22,0.2)' },
                      { icon: ShieldAlert, label: t.landing.catModeration, desc: t.landing.catModerationDesc, color: '#ef4444', bg: 'rgba(239,68,68,0.2)' },
                      { icon: Layers, label: t.landing.catCanvas, desc: t.landing.catCanvasDesc, color: '#a78bfa', bg: 'rgba(139,92,246,0.2)' },
                      { icon: Database, label: t.landing.catDatabase, desc: t.landing.catDatabaseDesc, color: '#14b8a6', bg: 'rgba(20,184,166,0.2)' },
                      { icon: GitBranch, label: t.landing.catLogic, desc: t.landing.catLogicDesc, color: '#22c55e', bg: 'rgba(34,197,94,0.2)' },
                    ].map(({ icon: CIcon, label, desc, color, bg }) => (
                      <div key={label} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px', cursor: 'default',
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', background: bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <CIcon style={{ width: 12, height: 12, color }} strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: dark ? '#F0F6FC' : T.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
                          <p style={{ fontSize: 8, color: dark ? 'rgba(255,255,255,0.4)' : T.textSub, margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</p>
                        </div>
                        <ArrowRight style={{ width: 10, height: 10, color: dark ? 'rgba(255,255,255,0.1)' : T.border, flexShrink: 0 }} strokeWidth={2} />
                      </div>
                    ))}
                    {/* Separator before Core */}
                    <div style={{ margin: '2px 10px', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : T.border}` }} />
                    {/* Core */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', cursor: 'default',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: 'rgba(100,116,139,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Bot style={{ width: 12, height: 12, color: '#94a3b8' }} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: dark ? '#F0F6FC' : T.text, margin: 0 }}>{t.landing.nodeCoreBot}</p>
                        <p style={{ fontSize: 8, color: dark ? 'rgba(255,255,255,0.4)' : T.textSub, margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.landing.catCoreBotDesc}</p>
                      </div>
                      <ArrowRight style={{ width: 10, height: 10, color: dark ? 'rgba(255,255,255,0.1)' : T.border, flexShrink: 0 }} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '64px 24px 32px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div className="landing-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <img src="/logo.ico" alt="DisFlow" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'contain' }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: dark ? '#F0F6FC' : T.text }}>DisFlow</span>
                </div>
                <p style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.45)' : T.textSub, lineHeight: 1.65, maxWidth: 280 }}>
                  {t.landing.footerDesc}
                </p>
              </div>
              {/* Navigation */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: dark ? '#F0F6FC' : T.text, marginBottom: 18 }}>{t.landing.footerNav}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: t.landing.featuresLabel, id: 'features' },
                    { label: t.landing.navBenefits, id: 'benefits' },
                    { label: t.landing.navTestimonials, id: 'testimonials' },
                    { label: t.landing.navPricing, id: 'pricing' },
                  ].map(({ label, id }) => (
                    <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                      style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.45)' : T.textSub, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = dark ? '#F0F6FC' : T.text; }}
                      onMouseLeave={e => { e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.45)' : T.textSub; }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              {/* Pages */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: dark ? '#F0F6FC' : T.text, marginBottom: 18 }}>{t.landing.footerPages}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: t.landing.footerHome, href: '/' },
                    { label: t.landing.login, href: '/login' },
                    { label: t.landing.getStarted, href: '/register' },
                    { label: t.landing.dashboard, href: '/dashboard' },
                  ].map(({ label, href }) => (
                    <Link key={href} to={href} style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.45)' : T.textSub, textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = dark ? '#F0F6FC' : T.text; }}
                      onMouseLeave={e => { e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.45)' : T.textSub; }}
                    >{label}</Link>
                  ))}
                </div>
              </div>
              {/* Socials */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: dark ? '#F0F6FC' : T.text, marginBottom: 18 }}>{t.landing.footerSocials}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Discord', 'GitHub', 'Twitter/X'].map(name => (
                    <span key={name} style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.45)' : T.textSub, cursor: 'default' }}>{name}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : T.border}`, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.3)' : T.textMuted }}>{t.landing.footer}</p>
              <button onClick={() => setDark(d => !d)}
                style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.4)' : T.textSub, background: 'transparent', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : T.border}`, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = dark ? '#F0F6FC' : T.text; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.25)' : T.borderHv; }}
                onMouseLeave={e => { e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.4)' : T.textSub; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.1)' : T.border; }}
              >
                {dark ? `\u2600 ${t.landing.lightMode}` : `\u25D1 ${t.landing.darkMode}`}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}