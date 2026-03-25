import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Bot as BotIcon, Power, PowerOff,
  Cpu, Activity, AlertCircle, ChevronRight, Settings2,
  ExternalLink, Circle, FolderOpen, Search, ArrowUpDown,
  LayoutGrid, LayoutList, CheckSquare, Square, CheckCircle,
} from 'lucide-react';
import { createWorkflow } from '../../services/workflowService.js';
import { botAPI, statsAPI, type Bot, type BotCreateData, type BotUpdateData, type StatsOverview } from '../../services/api.js';
import BotModal from '../../components/BotModal.js';
import { loadUserSettings, saveBotMeta } from '../../hooks/useUserSettings';
import { useTranslation } from '../../hooks/useTranslation';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ExecutionChart, ActivityFeed, ErrorRateWidget, ResourceWidget, QuickDeployWidget } from '../../components/DashboardWidgets';

// ── Types ─────────────────────────────────────────────────────────────────────

type LoadingState = 'delete' | 'start' | 'stop' | 'open' | null;

interface BotItemProps {
  bot: Bot;
  loading?: LoadingState;
  selected?: boolean;
  onToggleSelect?: () => void;
  onInstance: () => void;
  onOpen: () => void;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
  onDelete: () => void;
}



// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  idle:    { dot: '#6b7280', bg: '#6b728015', border: '#6b728030', text: '#9ca3af' },
  running: { dot: '#22c55e', bg: '#22c55e15', border: '#22c55e30', text: '#4ade80' },
  stopped: { dot: '#ef4444', bg: '#ef444415', border: '#ef444430', text: '#f87171' },
  error:   { dot: '#ef4444', bg: '#ef444415', border: '#ef444430', text: '#f87171' },
} as const;

function getStatusCfg(status: string) {
  return STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.idle;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<number, LoadingState>>({});
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);
  const toastId = useRef(0);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { completeAction, active: onboardingActive, step: onboardingStep } = useOnboarding();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoadingPage(true);
      const [botsData, statsData] = await Promise.all([botAPI.list(), statsAPI.overview().catch(() => null)]);
      setBots(botsData);
      if (statsData) setOverview(statsData);
    } catch (err) {
      console.error('Failed to load bots:', err);
    } finally {
      setLoadingPage(false);
    }
  }

  // Auto-skip "create bot" step if user already has a bot (e.g. went back)
  useEffect(() => {
    if (!onboardingActive || onboardingStep?.id !== 'dashboard-create-bot') return;
    if (bots.length === 0) return;
    // Already has a bot — skip to workflow with the latest one
    const bot = bots[bots.length - 1];
    completeAction('bot-created');
    (async () => {
      if (bot.workflow_id) {
        navigate(`/workflow/${bot.workflow_id}`);
      } else {
        try {
          const wf = await createWorkflow({ name: `${bot.name} Workflow`, description: `Workflow for ${bot.name}`, nodes: [], connections: [] });
          await botAPI.update(bot.id, { workflowId: wf.id });
          navigate(`/workflow/${wf.id}`);
        } catch { /* ignore */ }
      }
    })();
  }, [onboardingActive, onboardingStep, bots]);

  async function handleOpenWorkflow(bot: Bot) {
    if (bot.workflow_id) { navigate(`/workflow/${bot.workflow_id}`); return; }
    setLoadingStates(prev => ({ ...prev, [bot.id]: 'open' }));
    try {
      const wf = await createWorkflow({ name: `${bot.name} Workflow`, description: `Workflow for ${bot.name}`, nodes: [], connections: [] });
      await botAPI.update(bot.id, { workflowId: wf.id });
      navigate(`/workflow/${wf.id}`);
    } catch (err) {
      console.error('Failed to open workflow:', err);
    } finally {
      setLoadingStates(prev => ({ ...prev, [bot.id]: null }));
    }
  }

  async function handleDeleteBot(id: number) {
    if (!confirm(t.dashboard.deleteConfirm)) return;
    setLoadingStates(prev => ({ ...prev, [id]: 'delete' }));
    try { await botAPI.delete(id); await loadData(); showToast(t.dashboard.toastDeleted); }
    catch (err) { console.error('Delete failed:', err); showToast(t.dashboard.toastError, 'error'); }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  }

  async function handleStartBot(id: number) {
    setLoadingStates(prev => ({ ...prev, [id]: 'start' }));
    try { await botAPI.start(id); await loadData(); showToast(t.dashboard.toastStarted); }
    catch (err) { console.error('Start failed:', err); showToast(t.dashboard.toastError, 'error'); }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  }

  async function handleStopBot(id: number) {
    setLoadingStates(prev => ({ ...prev, [id]: 'stop' }));
    try { await botAPI.stop(id); await loadData(); showToast(t.dashboard.toastStopped); }
    catch (err) { console.error('Stop failed:', err); showToast(t.dashboard.toastError, 'error'); }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  }

  function openBotModal(bot: Bot | null = null) { setEditingBot(bot); setShowBotModal(true); }

  async function handleSaveBot(data: BotCreateData | BotUpdateData, id?: number) {
    try {
      if (id) {
        const updatePayload: BotUpdateData = {
          name: 'name' in data ? data.name : undefined,
          workflowId: 'workflowId' in data ? data.workflowId : undefined,
        };
        if ('discordToken' in data && data.discordToken) {
          updatePayload.discordToken = data.discordToken;
        }
        await botAPI.update(id, updatePayload);
      } else {
        if ('discordToken' in data && data.discordToken) {
          const newBot = await botAPI.create(data as BotCreateData);
          // Persist user's default language & theme for this new bot
          const { defaultLanguage, defaultBotTheme } = loadUserSettings();
          saveBotMeta(newBot.id, { language: defaultLanguage, theme: defaultBotTheme });
        } else {
          throw new Error('Discord token is required');
        }
      }
      await loadData();
      showToast(id ? t.common.saved : t.dashboard.toastCreated);
      if (!id) {
        completeAction('bot-created');
        // During onboarding, auto-navigate to the workflow editor
        if (onboardingActive && 'discordToken' in data && data.discordToken) {
          const updatedBots = await botAPI.list();
          const newBot = updatedBots[updatedBots.length - 1];
          if (newBot) {
            if (newBot.workflow_id) {
              navigate(`/workflow/${newBot.workflow_id}`);
            } else {
              const wf = await createWorkflow({ name: `${newBot.name} Workflow`, description: `Workflow for ${newBot.name}`, nodes: [], connections: [] });
              await botAPI.update(newBot.id, { workflowId: wf.id });
              navigate(`/workflow/${wf.id}`);
            }
          }
        }
      }
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  }

  const running = bots.filter(b => b.status === 'running').length;
  const errors  = bots.filter(b => b.status === 'error').length;
  const stopped = bots.length - running - errors;

  // ── Filtered & sorted bots ──────────────────────────────────────────────
  const filteredBots = useMemo(() => {
    let result = bots;
    if (statusFilter !== 'all') result = result.filter(b => b.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [bots, statusFilter, searchQuery, sortBy]);

  // ── Bulk helpers ────────────────────────────────────────────────────────
  function toggleSelect(id: number) {
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleSelectAll() {
    setSelectedIds(prev => prev.size === filteredBots.length ? new Set() : new Set(filteredBots.map(b => b.id)));
  }
  async function bulkAction(action: 'start' | 'stop' | 'delete') {
    const ids = [...selectedIds];
    for (const bid of ids) {
      try {
        if (action === 'start') await botAPI.start(bid);
        else if (action === 'stop') await botAPI.stop(bid);
        else if (action === 'delete') await botAPI.delete(bid);
      } catch { /* skip */ }
    }
    setSelectedIds(new Set());
    await loadData();
  }

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--t-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--t-a)', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: 'var(--t-m)' }}>{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--t-bg)' }}>

      {/* ── Page header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 h-14 flex items-center px-6" style={{ background: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}>
        <div className="w-full flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] mb-1" style={{ color: 'var(--t-m)' }}>
              <span>{t.dashboard.title}</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--t-sub)' }}>{t.dashboard.instances}</span>
            </div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.dashboard.instances}</h1>
          </div>
          <button
            data-onboarding="create-bot"
            onClick={() => openBotModal()}
            className="dnc-btn dnc-btn-primary dnc-btn-sm"
          >
            <Plus className="w-4 h-4" />
            {t.dashboard.newInstance}
          </button>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-6 py-8 space-y-6">

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <div data-onboarding="stats" className="grid grid-cols-4 gap-5">
          <StatCard
            icon={<Cpu className="w-4 h-4" />} title={t.dashboard.total}
            value={overview?.bots.total ?? bots.length} sub={t.dashboard.totalDesc}
            accent="#e8643a"
          />
          <StatCard
            icon={<Activity className="w-4 h-4" />} title={t.dashboard.active}
            value={overview?.bots.active ?? running} sub={t.dashboard.activeDesc}
            accent="#22c55e"
          />
          <StatCard
            icon={errors > 0 ? <AlertCircle className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
            title={errors > 0 ? t.dashboard.errors : t.dashboard.stopped}
            value={errors > 0 ? (overview?.bots.errored ?? errors) : (overview?.bots.stopped ?? stopped)}
            sub={errors > 0 ? t.dashboard.errorsDesc : t.dashboard.stoppedDesc}
            accent={errors > 0 ? '#ef4444' : '#6b7280'}
          />
          <StatCard
            icon={<FolderOpen className="w-4 h-4" />} title={t.dashboard.workflows}
            value={overview?.workflows ?? 0} sub={t.dashboard.totalWorkflows}
            accent="#a78bfa"
          />
        </div>

        {/* ── Error banner ─────────────────────────────────────────── */}
        {errors > 0 && (
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{ background: '#ef444412', border: '1px solid #ef444430' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
            <span className="text-xs font-medium flex-1" style={{ color: '#f87171' }}>
              {errors} {t.dashboard.errorBanner}
            </span>
            <button
              onClick={() => setStatusFilter('error')}
              className="dnc-btn dnc-btn-danger dnc-btn-xs"
            >
              {t.dashboard.errorBannerAction}
            </button>
          </div>
        )}

        {/* ── Widgets ──────────────────────────────────────────── */}
        <div data-onboarding="widgets" className="grid lg:grid-cols-3 gap-5">
          {/* Status donut */}
          <StatusDonut running={running} stopped={stopped} errored={errors} t={t.dashboard} />
          <ExecutionChart t={t.dashboard} />
          <ActivityFeed t={t.dashboard} />
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <ErrorRateWidget t={t.dashboard} />
          <ResourceWidget bots={bots} t={t.dashboard} />
          <QuickDeployWidget t={t.dashboard} />
        </div>

        {/* ── Instances list ──────────────────────────────────────── */}
        <div data-onboarding="botlist" className="rounded-2xl overflow-hidden" style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
          {/* Header row */}
          <div className="flex items-center gap-2.5 px-6 py-4 flex-wrap" style={{ borderBottom: '1px solid var(--t-bd)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.dashboard.yourInstances}</h2>
            <span className="px-1.5 py-0.5 text-[10px] rounded font-medium"
              style={{ background: 'var(--t-s2)', color: 'var(--t-sub)' }}>
              {bots.length}
            </span>
            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--t-m)' }} />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.dashboard.searchPlaceholder}
                className="text-xs rounded-lg pl-7 pr-3 py-1.5 outline-none w-44"
                style={{ background: 'var(--t-s2)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--t-a)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--t-bd)')}
              />
            </div>

            {/* Filter tabs */}
            <div className="flex rounded-lg overflow-hidden text-[11px] font-medium" style={{ border: '1px solid var(--t-bd)' }}>
              {([
                { key: 'all' as const, label: t.dashboard.filterAll },
                { key: 'running' as const, label: t.dashboard.filterRunning },
                { key: 'stopped' as const, label: t.dashboard.filterStopped },
                { key: 'error' as const, label: t.dashboard.filterError },
              ]).map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  className="px-2.5 py-1 transition"
                  style={{ background: statusFilter === f.key ? 'var(--t-aa)' : 'transparent', color: statusFilter === f.key ? 'var(--t-a)' : 'var(--t-m)' }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" style={{ color: 'var(--t-m)' }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'date' | 'status')}
                className="text-[11px] rounded-lg px-2 py-1 outline-none cursor-pointer"
                style={{ background: 'var(--t-s2)', border: '1px solid var(--t-bd)', color: 'var(--t-sub)' }}>
                <option value="name">{t.dashboard.sortName}</option>
                <option value="date">{t.dashboard.sortDate}</option>
                <option value="status">{t.dashboard.sortStatus}</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--t-bd)' }}>
              <button onClick={() => setViewMode('list')}
                className="p-1.5 transition"
                style={{ background: viewMode === 'list' ? 'var(--t-aa)' : 'transparent', color: viewMode === 'list' ? 'var(--t-a)' : 'var(--t-m)' }}>
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('grid')}
                className="p-1.5 transition"
                style={{ background: viewMode === 'grid' ? 'var(--t-aa)' : 'transparent', color: viewMode === 'grid' ? 'var(--t-a)' : 'var(--t-m)' }}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-6 py-2.5" style={{ background: 'var(--t-aa)', borderBottom: '1px solid var(--t-bd)' }}>
              <button onClick={toggleSelectAll} className="text-[11px] font-medium" style={{ color: 'var(--t-a)' }}>
                {selectedIds.size === filteredBots.length ? t.dashboard.deselectAll : t.dashboard.selectAll}
              </button>
              <span className="text-[11px]" style={{ color: 'var(--t-sub)' }}>
                {selectedIds.size} {t.dashboard.selected}
              </span>
              <div className="flex-1" />
              <button onClick={() => bulkAction('start')}
                className="dnc-btn dnc-btn-success dnc-btn-xs">
                <Power className="w-3 h-3" /> {t.dashboard.startSelected}
              </button>
              <button onClick={() => bulkAction('stop')}
                className="dnc-btn dnc-btn-soft dnc-btn-xs">
                <PowerOff className="w-3 h-3" /> {t.dashboard.stopSelected}
              </button>
              <button onClick={() => { if (confirm(t.dashboard.deleteConfirm)) bulkAction('delete'); }}
                className="dnc-btn dnc-btn-danger dnc-btn-xs">
                <Trash2 className="w-3 h-3" /> {t.dashboard.deleteSelected}
              </button>
            </div>
          )}

          {filteredBots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'var(--t-s2)', border: '1px solid var(--t-bd)' }}>
                <BotIcon className="w-7 h-7" style={{ color: 'var(--t-m)' }} />
              </div>
              <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--t-tx)' }}>{t.dashboard.noInstances}</h3>
              <p className="text-xs mb-5 max-w-xs leading-relaxed" style={{ color: 'var(--t-m)' }}>
                {t.dashboard.noInstancesDesc}
              </p>
              <button
                onClick={() => openBotModal()}
                className="dnc-btn dnc-btn-primary"
              >
                <Plus className="w-4 h-4" /> {t.dashboard.createInstance}
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div>
              {/* Select all row */}
              <button onClick={toggleSelectAll}
                className="flex items-center gap-2 px-6 py-2 text-[11px] w-full transition"
                style={{ borderBottom: '1px solid var(--t-bd)', color: 'var(--t-m)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--t-s2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {selectedIds.size === filteredBots.length
                  ? <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--t-a)' }} />
                  : <Square className="w-3.5 h-3.5" />}
                <span>{selectedIds.size === filteredBots.length ? t.dashboard.deselectAll : t.dashboard.selectAll}</span>
              </button>
              {filteredBots.map(bot => (
                <BotItem
                  key={bot.id}
                  bot={bot}
                  loading={loadingStates[bot.id] ?? null}
                  selected={selectedIds.has(bot.id)}
                  onToggleSelect={() => toggleSelect(bot.id)}
                  onInstance={() => navigate(`/dashboard/instances/${bot.id}`)}
                  onOpen={() => handleOpenWorkflow(bot)}
                  onStart={() => handleStartBot(bot.id)}
                  onStop={() => handleStopBot(bot.id)}
                  onEdit={() => openBotModal(bot)}
                  onDelete={() => handleDeleteBot(bot.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
              {filteredBots.map(bot => (
                <BotGridCard
                  key={bot.id}
                  bot={bot}
                  loading={loadingStates[bot.id] ?? null}
                  selected={selectedIds.has(bot.id)}
                  onToggleSelect={() => toggleSelect(bot.id)}
                  onInstance={() => navigate(`/dashboard/instances/${bot.id}`)}
                  onOpen={() => handleOpenWorkflow(bot)}
                  onStart={() => handleStartBot(bot.id)}
                  onStop={() => handleStopBot(bot.id)}
                  onEdit={() => openBotModal(bot)}
                  onDelete={() => handleDeleteBot(bot.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showBotModal && (
        <BotModal
          bot={editingBot}
          workflows={[]}
          onClose={() => setShowBotModal(false)}
          onSave={handleSaveBot}
        />
      )}

      {/* ── Toast container ─────────────────────────────────────── */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <div key={toast.id}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg animate-[slideIn_0.2s_ease-out]"
              style={{
                background: toast.type === 'error' ? '#ef444420' : '#22c55e20',
                color: toast.type === 'error' ? '#f87171' : '#4ade80',
                border: `1px solid ${toast.type === 'error' ? '#ef444430' : '#22c55e30'}`,
                backdropFilter: 'blur(8px)',
              }}>
              {toast.type === 'error'
                ? <AlertCircle className="w-3.5 h-3.5" />
                : <CheckCircle className="w-3.5 h-3.5" />}
              {toast.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── StatusDonut ───────────────────────────────────────────────────────────────

const StatusDonut = memo(function StatusDonut({
  running, stopped, errored, t,
}: {
  running: number; stopped: number; errored: number;
  t: { statusBreakdown: string; active: string; stopped: string; errors: string };
}) {
  const total = running + stopped + errored || 1;
  const segments = [
    { value: running, color: '#22c55e', label: t.active },
    { value: stopped, color: '#6b7280', label: t.stopped },
    { value: errored, color: '#ef4444', label: t.errors },
  ];
  const r = 42, stroke = 10, circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="rounded-2xl p-5 flex flex-col"
      style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', borderTop: '2px solid var(--t-a)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--t-m)' }}>
        {t.statusBreakdown}
      </h3>
      <div className="flex items-center gap-6 flex-1">
        <svg width={100} height={100} viewBox="0 0 100 100" className="shrink-0">
          {total > 0 && segments.map((seg, i) => {
            const dash = (seg.value / total) * circ;
            const el = (
              <circle key={i} cx="50" cy="50" r={r} fill="none"
                stroke={seg.value > 0 ? seg.color : 'transparent'}
                strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              />
            );
            offset += dash;
            return el;
          })}
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
            style={{ fill: 'var(--t-tx)', fontSize: 16, fontWeight: 700 }}>
            {running + stopped + errored}
          </text>
        </svg>
        <div className="space-y-2.5">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-xs" style={{ color: 'var(--t-sub)' }}>{seg.label}</span>
              <span className="text-xs font-bold ml-auto" style={{ color: seg.color }}>{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ── StatCard ──────────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  icon, title, value, sub, accent,
}: {
  icon: React.ReactNode; title: string; value: number;
  sub: string; accent: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between gap-4"
      style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', borderTop: `2px solid ${accent}` }}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}12`, color: accent }}>
          {icon}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--t-sub)' }}>{title}</span>
      </div>
      <div>
        <p className="text-3xl font-bold leading-none tracking-tight" style={{ color: 'var(--t-tx)' }}>{value}</p>
        <p className="text-xs mt-1.5" style={{ color: 'var(--t-m)' }}>{sub}</p>
      </div>
    </div>
  );
});

// ── BotItem ───────────────────────────────────────────────────────────────────

const BotItem = memo(function BotItem({ bot, loading, selected, onToggleSelect, onInstance, onOpen, onStart, onStop, onEdit, onDelete }: BotItemProps) {
  const isDeleting = loading === 'delete';
  const isStarting = loading === 'start';
  const isStopping = loading === 'stop';
  const isOpening  = loading === 'open';
  const busy = !!loading;
  const st = getStatusCfg(bot.status);
  const { t } = useTranslation();
  const statusLabel = t.status[bot.status as keyof typeof t.status] ?? t.status.idle;

  return (
    <div
      className="flex items-center justify-between px-6 py-5 transition-colors group"
      style={{ borderBottom: '1px solid var(--t-bd)', background: selected ? 'var(--t-aa)' : undefined }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--t-s2)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Left: checkbox + avatar + info */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSelect && (
          <button onClick={onToggleSelect} className="shrink-0" style={{ color: selected ? 'var(--t-a)' : 'var(--t-m)' }}>
            {selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
        )}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative"
          style={{ background: 'var(--t-s2)', border: `1px solid ${st.border}` }}>
          <BotIcon className="w-5 h-5" style={{ color: 'var(--t-a)' }} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: st.dot, borderColor: 'var(--t-s)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--t-tx)' }}>{bot.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full"
              style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
              <Circle className="w-1.5 h-1.5 fill-current" />
              {statusLabel}
            </span>
            {bot.port && <span className="text-[11px] font-mono" style={{ color: 'var(--t-m)' }}>:{bot.port}</span>}
            {bot.workflow_id && <span className="text-[11px]" style={{ color: 'var(--t-m)' }}>wf #{bot.workflow_id}</span>}
          </div>
        </div>
      </div>

      {/* Right: actions (always visible) */}
      <div className="flex items-center gap-1 shrink-0 ml-3">
        <IconBtn onClick={onInstance} title={t.dashboard.viewInstance} color="var(--t-a)" hoverBg="var(--t-aa)">
          <ExternalLink className="w-3.5 h-3.5" />
        </IconBtn>

        <TextBtn onClick={onOpen} disabled={busy} loading={isOpening} color="var(--t-a)" bg="var(--t-aa)" hoverBg="var(--t-aa)">
          {t.dashboard.workflow}
        </TextBtn>

        {(bot.status === 'idle' || bot.status === 'stopped') ? (
          <IconBtn onClick={onStart} disabled={busy} title={t.dashboard.start} color="#22c55e" hoverBg="#22c55e15">
            {isStarting ? <Spinner color="#22c55e" /> : <Power className="w-3.5 h-3.5" />}
          </IconBtn>
        ) : (
          <IconBtn onClick={onStop} disabled={busy} title={t.dashboard.stop} color="var(--t-a)" hoverBg="var(--t-aa)">
            {isStopping ? <Spinner color="var(--t-a)" /> : <PowerOff className="w-3.5 h-3.5" />}
          </IconBtn>
        )}

        <IconBtn onClick={onEdit} disabled={busy} title={t.dashboard.modify} color="var(--t-sub)" hoverBg="var(--t-s2)">
          <Settings2 className="w-3.5 h-3.5" />
        </IconBtn>

        <IconBtn onClick={onDelete} disabled={busy} title={t.common.delete} color="var(--t-m)" hoverBg="#ef444418" hoverColor="#ef4444">
          {isDeleting ? <Spinner color="#ef4444" /> : <Trash2 className="w-3.5 h-3.5" />}
        </IconBtn>
      </div>
    </div>
  );
});

// ── BotGridCard ───────────────────────────────────────────────────────────────

const BotGridCard = memo(function BotGridCard({ bot, loading, selected, onToggleSelect, onInstance, onOpen, onStart, onStop, onEdit, onDelete }: BotItemProps) {
  const busy = !!loading;
  const st = getStatusCfg(bot.status);
  const { t } = useTranslation();
  const statusLabel = t.status[bot.status as keyof typeof t.status] ?? t.status.idle;

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 transition-colors relative"
      style={{ background: selected ? 'var(--t-aa)' : 'var(--t-s2)', border: `1px solid ${selected ? 'var(--t-a)' : 'var(--t-bd)'}` }}>
      {onToggleSelect && (
        <button onClick={onToggleSelect} className="absolute top-3 right-3"
          style={{ color: selected ? 'var(--t-a)' : 'var(--t-m)' }}>
          {selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>
      )}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--t-s)', border: `1px solid ${st.border}` }}>
          <BotIcon className="w-4.5 h-4.5" style={{ color: 'var(--t-a)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--t-tx)' }}>{bot.name}</p>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full mt-0.5"
            style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
            <Circle className="w-1.5 h-1.5 fill-current" /> {statusLabel}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-auto">
        <IconBtn onClick={onInstance} title={t.dashboard.viewInstance} color="var(--t-a)" hoverBg="var(--t-aa)">
          <ExternalLink className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn onClick={onOpen} disabled={busy} title={t.dashboard.workflow} color="var(--t-a)" hoverBg="var(--t-aa)">
          {loading === 'open' ? <Spinner color="var(--t-a)" /> : <FolderOpen className="w-3.5 h-3.5" />}
        </IconBtn>
        {(bot.status === 'idle' || bot.status === 'stopped') ? (
          <IconBtn onClick={onStart} disabled={busy} title={t.dashboard.start} color="#22c55e" hoverBg="#22c55e15">
            {loading === 'start' ? <Spinner color="#22c55e" /> : <Power className="w-3.5 h-3.5" />}
          </IconBtn>
        ) : (
          <IconBtn onClick={onStop} disabled={busy} title={t.dashboard.stop} color="var(--t-a)" hoverBg="var(--t-aa)">
            {loading === 'stop' ? <Spinner color="var(--t-a)" /> : <PowerOff className="w-3.5 h-3.5" />}
          </IconBtn>
        )}
        <IconBtn onClick={onEdit} disabled={busy} title={t.dashboard.modify} color="var(--t-sub)" hoverBg="var(--t-s2)">
          <Settings2 className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn onClick={onDelete} disabled={busy} title={t.common.delete} color="var(--t-m)" hoverBg="#ef444418" hoverColor="#ef4444">
          {loading === 'delete' ? <Spinner color="#ef4444" /> : <Trash2 className="w-3.5 h-3.5" />}
        </IconBtn>
      </div>
    </div>
  );
});

// ── Primitives ────────────────────────────────────────────────────────────────

function Spinner({ color }: { color: string }) {
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
    style={{ borderColor: color, borderTopColor: 'transparent' }} />;
}

function IconBtn({ onClick, disabled, title, color, children }: {
  onClick: () => void; disabled?: boolean; title?: string;
  color: string; hoverBg?: string; hoverColor?: string;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="dnc-btn-icon w-8 h-8 shrink-0"
      style={{ color }}>
      {children}
    </button>
  );
}

function TextBtn({ onClick, disabled, loading, color, bg, children }: {
  onClick: () => void; disabled?: boolean; loading?: boolean;
  color: string; bg: string; hoverBg?: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="dnc-btn dnc-btn-xs"
      style={{ background: bg, color, border: `1px solid ${color}18` }}>
      {loading && <Spinner color={color} />}
      {children}
    </button>
  );
}
