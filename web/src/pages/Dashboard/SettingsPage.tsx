import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Settings, User, Users, Bell, CreditCard, Check, Globe, Palette,
  Zap, Shield, ChevronRight, ExternalLink, Star, ChevronDown,
  Bot, Terminal, Database, Sparkles, Crown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserSettings, type Language, type BotTheme } from '../../hooks/useUserSettings';
import { useTranslation } from '../../hooks/useTranslation';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { subscriptionAPI } from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = 'general' | 'subscription' | 'notifications';

const LANGUAGES: { value: Language; flag: string; label: string; nativeName: string }[] = [
  { value: 'fr', flag: '🇫🇷', label: 'Français',            nativeName: 'Français' },
  { value: 'en', flag: '🇬🇧', label: 'English',             nativeName: 'English' },
  { value: 'es', flag: '🇪🇸', label: 'Español',             nativeName: 'Español' },
  { value: 'de', flag: '🇩🇪', label: 'Deutsch',             nativeName: 'Deutsch' },
  { value: 'pt', flag: '🇧🇷', label: 'Português',           nativeName: 'Português' },
  { value: 'zh', flag: '🇨🇳', label: 'Chinese',             nativeName: '中文' },
  { value: 'hi', flag: '🇮🇳', label: 'Hindi',               nativeName: 'हिन्दी' },
  { value: 'ar', flag: '🇸🇦', label: 'Arabic',              nativeName: 'العربية' },
  { value: 'bn', flag: '🇧🇩', label: 'Bengali',             nativeName: 'বাংলা' },
  { value: 'ru', flag: '🇷🇺', label: 'Russian',             nativeName: 'Русский' },
  { value: 'id', flag: '🇮🇩', label: 'Indonesian',          nativeName: 'Bahasa Indonesia' },
  { value: 'ur', flag: '🇵🇰', label: 'Urdu',                nativeName: 'اردو' },
  { value: 'ja', flag: '🇯🇵', label: 'Japanese',            nativeName: '日本語' },
  { value: 'tr', flag: '🇹🇷', label: 'Turkish',             nativeName: 'Türkçe' },
  { value: 'vi', flag: '🇻🇳', label: 'Vietnamese',          nativeName: 'Tiếng Việt' },
  { value: 'ko', flag: '🇰🇷', label: 'Korean',              nativeName: '한국어' },
  { value: 'it', flag: '🇮🇹', label: 'Italiano',            nativeName: 'Italiano' },
  { value: 'th', flag: '🇹🇭', label: 'Thai',                nativeName: 'ภาษาไทย' },
  { value: 'mr', flag: '🇮🇳', label: 'Marathi',             nativeName: 'मराठी' },
  { value: 'ta', flag: '🇮🇳', label: 'Tamil',               nativeName: 'தமிழ்' },
  { value: 'te', flag: '🇮🇳', label: 'Telugu',              nativeName: 'తెలుగు' },
  { value: 'sw', flag: '🇰🇪', label: 'Swahili',             nativeName: 'Kiswahili' },
  { value: 'pl', flag: '🇵🇱', label: 'Polish',              nativeName: 'Polski' },
  { value: 'uk', flag: '🇺🇦', label: 'Ukrainian',           nativeName: 'Українська' },
  { value: 'nl', flag: '🇳🇱', label: 'Dutch',               nativeName: 'Nederlands' },
  { value: 'ms', flag: '🇲🇾', label: 'Malay',               nativeName: 'Bahasa Melayu' },
  { value: 'ro', flag: '🇷🇴', label: 'Romanian',            nativeName: 'Română' },
  { value: 'fa', flag: '🇮🇷', label: 'Persian',             nativeName: 'فارسی' },
  { value: 'gu', flag: '🇮🇳', label: 'Gujarati',            nativeName: 'ગુજરાતી' },
  { value: 'my', flag: '🇲🇲', label: 'Burmese',             nativeName: 'မြန်မာ' },
  { value: 'ha', flag: '🇳🇬', label: 'Hausa',               nativeName: 'Hausa' },
  { value: 'am', flag: '🇪🇹', label: 'Amharic',             nativeName: 'አማርኛ' },
];

function LangSelect({ value, onChange }: { value: Language; onChange: (v: Language) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = LANGUAGES.find(l => l.value === value) ?? LANGUAGES[0];
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="dnc-btn dnc-btn-ghost w-full justify-start rounded-xl"
        style={{ backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)' }}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="flex-1 text-left font-medium">{selected.nativeName}</span>
        <span className="text-xs" style={{ color: 'var(--t-m)' }}>{selected.label}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform"
          style={{ color: 'var(--t-m)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)', maxHeight: 260, overflowY: 'auto' }}
        >
          {LANGUAGES.map(lang => (
            <button
              key={lang.value}
              type="button"
              onClick={() => { onChange(lang.value); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition text-left"
              style={lang.value === value
                ? { backgroundColor: 'var(--t-aa)', color: 'var(--t-a)' }
                : { color: 'var(--t-tx)' }}

            >
              <span className="text-base leading-none w-6 shrink-0">{lang.flag}</span>
              <span className="flex-1">{lang.nativeName}</span>
              <span className="text-xs shrink-0" style={{ color: 'var(--t-m)' }}>{lang.label}</span>
              {lang.value === value && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BOT_THEMES_DATA: { value: BotTheme; color: string }[] = [
  { value: 'dark',  color: '#161616' },
  { value: 'light', color: '#f2f1ef' },
];

// ─── Reusable components ──────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
      <div className="mb-5">
        <h3 className="font-semibold text-base" style={{ color: 'var(--t-tx)' }}>{title}</h3>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--t-m)' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid var(--t-bd)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--t-m)' }}>{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5.5 rounded-full transition-colors shrink-0 ml-4"
        style={{
          backgroundColor: checked ? 'var(--t-a)' : 'var(--t-bd)',
          height: 22,
          width: 40,
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full transition-transform"
          style={{
            backgroundColor: '#fff',
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings, updateSettings } = useUserSettings();
  const { t } = useTranslation();
  const onboarding = useOnboarding();

  // If ?tab=subscription in URL, open that tab directly
  const initialTab = (searchParams.get('tab') === 'subscription' ? 'subscription' : 'general') as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [saved, setSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

  // Refresh profile on mount (gets latest plan info)
  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  // On redirect from Stripe checkout (?success=true), verify session and sync subscription
  useEffect(() => {
    if (searchParams.get('success') !== 'true') return;
    const sessionId = sessionStorage.getItem('stripe_checkout_session');
    if (!sessionId) {
      // No session ID stored — just refresh profile
      refreshProfile();
      return;
    }
    sessionStorage.removeItem('stripe_checkout_session');
    subscriptionAPI.verifySession(sessionId)
      .then(() => refreshProfile())
      .catch(() => refreshProfile());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Local draft for general tab (committed on save)
  const [draft, setDraft] = useState({
    defaultLanguage: settings.defaultLanguage,
    defaultBotTheme: settings.defaultBotTheme,
  });

  function handleSaveGeneral() {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isDirty =
    draft.defaultLanguage !== settings.defaultLanguage ||
    draft.defaultBotTheme !== settings.defaultBotTheme;

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    : null;

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'general',      label: t.settings.general,       Icon: Settings },
    { id: 'subscription', label: t.settings.subscription,    Icon: CreditCard },
    { id: 'notifications', label: t.settings.notifications, Icon: Bell },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }}>

      {/* Header */}
      <header
        className="h-14 flex items-center gap-3 px-6 sticky top-0 z-10"
        style={{ backgroundColor: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--t-aa)' }}
        >
          <Settings className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-none" style={{ color: 'var(--t-tx)' }}>{t.settings.title}</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t-m)' }}>{user?.email}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
          <div className="flex gap-6 items-start">

            {/* ── Sidebar nav ─────────────────────────────────────────────── */}
            <nav
              className="w-48 shrink-0 rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}
            >
              <div className="px-3 py-2">
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="dnc-btn dnc-btn-tab w-full justify-start rounded-xl mb-0.5"
                    data-active={activeTab === id}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </nav>

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <>
              {/* Profile card */}
              <SectionCard title={t.settings.profile} subtitle={t.settings.profileDesc}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 uppercase"
                    style={{ background: 'linear-gradient(135deg, var(--t-a), var(--t-ah))' }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--t-tx)' }}>{user?.email}</p>
                    {memberSince && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--t-m)' }}>{t.settings.memberSince} {memberSince}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {user?.discord_id ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'rgba(88,101,242,0.15)', color: '#7289ff' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7289ff]" />
                          {t.settings.discordLinked}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'var(--t-s2)', color: 'var(--t-m)' }}
                        >
                          {t.settings.discordNotLinked}
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--t-aa)', color: 'var(--t-a)' }}
                      >
                        <Zap className="w-3 h-3" />
                        {(user?.plan || 'free').charAt(0).toUpperCase() + (user?.plan || 'free').slice(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/settings')}
                    className="dnc-btn dnc-btn-ghost p-2 shrink-0"
                    title={t.settings.editProfile}
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </SectionCard>

              {/* Instance defaults card */}
              <SectionCard
                title={t.settings.instanceDefaults}
                subtitle={t.settings.instanceDefaultsDesc}
              >
                {/* Info banner */}
                <div
                  className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 mb-5 text-xs"
                  style={{ backgroundColor: 'var(--t-aa)', border: '1px solid var(--t-aa)' }}
                >
                  <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--t-a)' }} />
                  <span style={{ color: 'var(--t-sub)' }}>
                    {t.settings.instanceDefaultsBanner}
                  </span>
                </div>

                {/* Language selector */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4" style={{ color: 'var(--t-sub)' }} />
                    <label className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{t.settings.defaultLanguage}</label>
                  </div>
                  <LangSelect
                    value={draft.defaultLanguage}
                    onChange={v => setDraft(d => ({ ...d, defaultLanguage: v }))}
                  />
                </div>

                {/* Theme selector */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4" style={{ color: 'var(--t-sub)' }} />
                    <label className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{t.settings.defaultTheme}</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {BOT_THEMES_DATA.map(theme => {
                      const isSelected = draft.defaultBotTheme === theme.value;
                      const themeLabel = theme.value === 'dark' ? t.settings.themeDark : t.settings.themeLight;
                      const themeDesc = theme.value === 'dark' ? t.settings.themeDarkDesc : t.settings.themeLightDesc;
                      return (
                        <button
                          key={theme.value}
                          onClick={() => setDraft(d => ({ ...d, defaultBotTheme: theme.value }))}
                          className="rounded-xl p-4 flex items-center gap-3 transition-all relative"
                          style={{
                            border: isSelected ? '1.5px solid var(--t-a)' : '1px solid var(--t-bd)',
                            backgroundColor: isSelected ? 'var(--t-aa)' : 'var(--t-s2)',
                          }}

                        >
                          {/* Mini preview */}
                          <div
                            className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: theme.color, border: theme.value === 'light' ? '1px solid #ddd' : '1px solid #333' }}
                          >
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7289DA' }} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold" style={{ color: isSelected ? 'var(--t-a)' : 'var(--t-tx)' }}>
                              {themeLabel}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--t-m)' }}>{themeDesc}</p>
                          </div>
                          {isSelected && (
                            <span
                              className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'var(--t-a)' }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveGeneral}
                    disabled={!isDirty && !saved}
                    className={`dnc-btn ${saved ? 'dnc-btn-success' : 'dnc-btn-primary'}`}
                  >
                    {saved ? <><Check className="w-4 h-4" /> {t.common.saved}</> : t.common.save}
                  </button>
                </div>
              </SectionCard>

              {/* Onboarding tour */}
              <SectionCard title={t.onboarding.cat_welcome} subtitle={t.onboarding.welcomeDesc}>
                <button
                  onClick={() => onboarding.start()}
                  className="dnc-btn dnc-btn-ghost w-full justify-between rounded-xl"
                  style={{ backgroundColor: 'var(--t-s2)' }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--t-a)' }} />
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{t.onboarding.restartTour}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--t-m)' }}>{t.onboarding.welcomeDesc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </SectionCard>

              {/* Security card */}
              <SectionCard title={t.settings.security} subtitle={t.settings.securityDesc}>
                <button
                  className="dnc-btn dnc-btn-ghost w-full justify-between rounded-xl"
                  style={{ backgroundColor: 'var(--t-s2)' }}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{t.settings.changePassword}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--t-m)' }}>{t.settings.changePasswordDesc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </SectionCard>
            </>
          )}

          {/* ── SUBSCRIPTION TAB ───────────────────────────────────────────── */}
          {activeTab === 'subscription' && (() => {
            const plan = user?.plan || 'free';
            const limits = user?.limits;
            const credits = user?.aiCredits;
            const cancelPending = user?.cancelAtPeriodEnd;

            const planLabels: Record<string, string> = {
              free: 'Free', pro: t.settings.planPro, business: t.settings.planBusiness,
            };
            const planIcons: Record<string, React.ReactNode> = {
              free: <Zap className="w-5 h-5" style={{ color: 'var(--t-a)' }} />,
              pro: <Star className="w-5 h-5 text-white" />,
              business: <Crown className="w-5 h-5 text-white" />,
            };
            const planColors: Record<string, string> = {
              free: 'var(--t-aa)',
              pro: 'linear-gradient(135deg, #7289DA, #8fa3e8)',
              business: 'linear-gradient(135deg, #f59e0b, #f97316)',
            };
            const planPrices: Record<string, { month: string; year: string }> = {
              free: { month: '0€', year: '0€' },
              pro: { month: '4,99€', year: '49,90€' },
              business: { month: '14,99€', year: '149,90€' },
            };
            const currentInterval = user?.billingInterval || 'month';
            const currentPrice = planPrices[plan]?.[currentInterval] || planPrices[plan]?.month || '0€';
            const intervalLabel = currentInterval === 'year' ? t.settings.priceYear : t.settings.priceMonth;

            async function handleCheckout(targetPlan: 'pro' | 'business') {
              setCheckoutLoading(targetPlan);
              try {
                const { url, sessionId } = await subscriptionAPI.checkout(targetPlan, billingCycle);
                sessionStorage.setItem('stripe_checkout_session', sessionId);
                window.location.href = url;
              } catch {
                setCheckoutLoading(null);
              }
            }

            async function handlePortal() {
              setPortalLoading(true);
              try {
                const { url } = await subscriptionAPI.portal();
                window.location.href = url;
              } catch {
                setPortalLoading(false);
              }
            }

            function fmt(val: number) {
              return val === -1 ? t.settings.unlimited : String(val);
            }

            const usageRows = [
              { icon: Bot, label: t.settings.bots, used: user?.botsCount ?? 0, max: limits?.maxBots ?? 1 },
              { icon: Terminal, label: t.settings.commandsPerBot, used: null, max: limits?.maxCommandsPerBot ?? 6 },
              { icon: Zap, label: t.settings.eventsPerBot, used: null, max: limits?.maxEventsPerBot ?? 3 },
              { icon: Users, label: t.settings.membersPerBot, used: null, max: limits?.maxMembersPerBot ?? 3 },
              { icon: Database, label: t.settings.dbSize, used: null, max: limits?.maxDbSizeMb ?? 500 },
              { icon: Sparkles, label: t.settings.aiCredits, used: credits?.used ?? 0, max: credits?.limit ?? 1000 },
            ];

            return (
            <>
              {/* Current plan card */}
              <SectionCard title={t.settings.currentPlanLabel}>
                <div
                  className="rounded-xl p-5 flex items-center justify-between"
                  style={{ backgroundColor: 'var(--t-s2)', border: '1px solid var(--t-bd)' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: planColors[plan] }}
                    >
                      {planIcons[plan]}
                    </div>
                    <div>
                      <p className="font-bold text-lg" style={{ color: 'var(--t-tx)' }}>
                        {planLabels[plan]} — {currentPrice}{intervalLabel}
                      </p>
                      {cancelPending && (
                        <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>{t.settings.cancelPending}</p>
                      )}
                      {!cancelPending && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--t-m)' }}>
                          {plan === 'free' ? t.settings.freeAutoRenew : t.settings.active}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: cancelPending ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                      color: cancelPending ? '#f59e0b' : '#22c55e',
                    }}
                  >
                    {cancelPending ? t.settings.cancelPending : t.settings.active}
                  </span>
                </div>

                {/* Manage button for paid plans */}
                {plan !== 'free' && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="dnc-btn dnc-btn-ghost rounded-xl"
                      style={{ backgroundColor: 'var(--t-s2)' }}
                    >
                      <CreditCard className="w-4 h-4" />
                      {portalLoading ? '...' : t.settings.manageSubscription}
                      <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                    </button>
                  </div>
                )}

                {cancelPending && (
                  <p className="text-xs mt-3 px-1" style={{ color: 'var(--t-m)' }}>{t.settings.cancelInfo}</p>
                )}
              </SectionCard>

              {/* Usage card */}
              <SectionCard title={t.settings.usage}>
                <div className="space-y-3">
                  {usageRows.map(row => {
                    const Icon = row.icon;
                    const isUnlimited = row.max === -1;
                    const percentage = isUnlimited || row.used === null ? 0 : Math.min(100, Math.round((row.used / row.max) * 100));
                    const isDb = row.label === t.settings.dbSize;
                    const displayMax = isDb ? `${row.max >= 1024 ? `${(row.max / 1024).toFixed(0)} GB` : `${row.max} MB`}` : fmt(row.max);

                    return (
                      <div key={row.label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--t-s2)', border: '1px solid var(--t-bd)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: 'var(--t-sub)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{row.label}</span>
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--t-m)' }}>
                            {row.used !== null ? `${row.used} / ${isUnlimited ? '∞' : displayMax}` : displayMax}
                          </span>
                        </div>
                        {row.used !== null && !isUnlimited && (
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--t-bd)' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: percentage > 90 ? '#ef4444' : percentage > 70 ? '#f59e0b' : 'var(--t-a)',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {credits?.resetAt && (
                    <p className="text-xs px-1" style={{ color: 'var(--t-m)' }}>
                      {t.settings.creditResetsOn} {new Date(credits.resetAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </SectionCard>

              {/* Billing cycle toggle + upgrade cards */}
              {plan !== 'business' && (
              <>
                <div className="flex items-center justify-center gap-3 mb-4 mt-2">
                  <span className="text-sm font-medium" style={{ color: billingCycle === 'month' ? 'var(--t-tx)' : 'var(--t-m)' }}>
                    {t.settings.monthly}
                  </span>
                  <button
                    onClick={() => setBillingCycle(billingCycle === 'month' ? 'year' : 'month')}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: billingCycle === 'year' ? 'var(--t-a)' : 'var(--t-bd)' }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                      style={{
                        backgroundColor: 'white',
                        transform: billingCycle === 'year' ? 'translateX(26px)' : 'translateX(2px)',
                      }}
                    />
                  </button>
                  <span className="text-sm font-medium" style={{ color: billingCycle === 'year' ? 'var(--t-tx)' : 'var(--t-m)' }}>
                    {t.settings.annual}
                  </span>
                  {billingCycle === 'year' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                      {t.settings.savePercent}
                    </span>
                  )}
                </div>

                {/* Pro upgrade card */}
                {plan !== 'pro' && (
                  <div
                    className="rounded-2xl p-6 relative overflow-hidden mb-4"
                    style={{ background: 'linear-gradient(135deg, #12141f, #151828)', border: '1px solid rgba(114,137,218,0.3)' }}
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(114,137,218,0.15) 0%, transparent 70%)' }} />
                    <div className="flex items-start gap-4 relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7289DA, #8fa3e8)' }}>
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg" style={{ color: 'var(--t-tx)' }}>
                          {t.settings.proTitle} — {billingCycle === 'year' ? '49,90€' : '4,99€'}{billingCycle === 'year' ? t.settings.priceYear : t.settings.priceMonth}
                        </p>
                        {billingCycle === 'year' && (
                          <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>
                            {t.settings.annualSaving} 4,99€ × 12 = 59,88€
                          </p>
                        )}
                        <p className="text-sm mt-0.5 mb-4" style={{ color: 'var(--t-sub)' }}>{t.settings.proDesc}</p>
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 mb-5 text-xs" style={{ color: 'var(--t-sub)' }}>
                          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-a)' }} /> 3 bots</div>
                          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-a)' }} /> 30 cmds / 15 events</div>
                          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-a)' }} /> 6 {t.settings.membersPerBot}</div>
                          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-a)' }} /> 5 GB DB</div>
                          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--t-a)' }} /> 5 000 {t.settings.aiCredits}</div>
                        </div>
                        <button
                          onClick={() => handleCheckout('pro')}
                          disabled={checkoutLoading === 'pro'}
                          className="dnc-btn dnc-btn-primary rounded-xl"
                          style={{ background: 'linear-gradient(135deg, #7289DA, #8fa3e8)' }}
                        >
                          <Zap className="w-4 h-4" />
                          {checkoutLoading === 'pro' ? '...' : t.settings.upgradeNow}
                          <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business upgrade card */}
                <div
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1a1408, #1e1a0e)', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
                  <div className="flex items-start gap-4 relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg" style={{ color: 'var(--t-tx)' }}>
                        {t.settings.businessTitle} — {billingCycle === 'year' ? '149,90€' : '14,99€'}{billingCycle === 'year' ? t.settings.priceYear : t.settings.priceMonth}
                      </p>
                      {billingCycle === 'year' && (
                        <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>
                          {t.settings.annualSaving} 14,99€ × 12 = 179,88€
                        </p>
                      )}
                      <p className="text-sm mt-0.5 mb-4" style={{ color: 'var(--t-sub)' }}>{t.settings.businessDesc}</p>
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 mb-5 text-xs" style={{ color: 'var(--t-sub)' }}>
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} /> 15 bots</div>
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} /> {t.settings.unlimited} cmds/events</div>
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} /> 15 {t.settings.membersPerBot} (+2€/{t.settings.extraSeat})</div>
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} /> 15 GB DB</div>
                        <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} /> 20 000 {t.settings.aiCredits}</div>
                      </div>
                      <button
                        onClick={() => handleCheckout('business')}
                        disabled={checkoutLoading === 'business'}
                        className="dnc-btn dnc-btn-primary rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                      >
                        <Crown className="w-4 h-4" />
                        {checkoutLoading === 'business' ? '...' : t.settings.upgradeNow}
                        <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
              )}
            </>
            );
          })()}

          {/* ── NOTIFICATIONS TAB ──────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <>
              <SectionCard
                title={t.settings.emailNotifications}
                subtitle={t.settings.emailNotificationsDesc}
              >
                <ToggleRow
                  label={t.settings.notifStartStop}
                  description={t.settings.notifStartStopDesc}
                  checked={settings.notifications.botStartStop}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, botStartStop: v } })}
                />
                <ToggleRow
                  label={t.settings.notifErrors}
                  description={t.settings.notifErrorsDesc}
                  checked={settings.notifications.errors}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, errors: v } })}
                />
                <ToggleRow
                  label={t.settings.notifWeekly}
                  description={t.settings.notifWeeklyDesc}
                  checked={settings.notifications.weeklyReport}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, weeklyReport: v } })}
                />
                <ToggleRow
                  label={t.settings.notifMarketing}
                  description={t.settings.notifMarketingDesc}
                  checked={settings.notifications.marketing}
                  onChange={v => updateSettings({ notifications: { ...settings.notifications, marketing: v } })}
                />
                <p className="text-xs mt-4" style={{ color: 'var(--t-m)' }}>
                  {t.settings.autoSaved}
                </p>
              </SectionCard>
            </>
          )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
