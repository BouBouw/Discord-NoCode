import { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, Bot as BotIcon, Power, PowerOff, FolderOpen, Cpu,
  Search, Clock, Circle,
} from 'lucide-react';
import { createWorkflow } from '../services/workflowService.js';
import { botAPI, type Bot, type BotCreateData, type BotUpdateData } from '../services/api';
import BotModal from '../components/BotModal';
import { useTranslation } from '../hooks/useTranslation';
import { ExecutionChart, ActivityFeed, ErrorRateWidget, ResourceWidget, QuickDeployWidget } from '../components/DashboardWidgets';

// ── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: 'accent' | 'green' | 'purple' | 'red';
  total?: number;
}

interface BotItemProps {
  bot: Bot;
  loading?: LoadingState;
  onOpen: () => void;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}

type LoadingState = 'delete' | 'start' | 'stop' | 'open' | null;
type StatusFilter = 'all' | 'running' | 'stopped' | 'error';

// ── Uptime helper ────────────────────────────────────────────────────────────

function formatUptime(startedAt: string | null | undefined): string | null {
  if (!startedAt) return null;
  const diff = Date.now() - new Date(startedAt).getTime();
  if (diff < 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<number, LoadingState>>({});
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const botsData = await botAPI.list();
      setBots(botsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBots = useMemo(() => {
    let result = bots;
    if (filter !== 'all') {
      result = result.filter(b => {
        if (filter === 'running') return b.status === 'running';
        if (filter === 'stopped') return b.status === 'stopped' || b.status === 'idle';
        if (filter === 'error') return b.status === 'error';
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q));
    }
    return result;
  }, [bots, filter, search]);

  // ── Actions ──────────────────────────────────────────────────────────────

  async function handleOpenInstance(bot: Bot) {
    if (bot.workflow_id) { navigate(`/workflow/${bot.workflow_id}`); return; }
    setLoadingStates(prev => ({ ...prev, [bot.id]: 'open' }));
    try {
      const workflow = await createWorkflow({
        name: `${bot.name} Workflow`,
        description: `Workflow for ${bot.name}`,
        nodes: [],
        connections: [],
      });
      await botAPI.update(bot.id, { workflowId: workflow.id });
      navigate(`/workflow/${workflow.id}`);
    } catch (error) {
      console.error('Failed to open instance:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [bot.id]: null }));
    }
  }

  async function handleDeleteBot(id: number) {
    if (!confirm(t.dashboard.deleteConfirm)) return;
    setLoadingStates(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await botAPI.delete(id);
      await loadData();
    } catch { /* ignored */ }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  }

  async function handleStartBot(id: number) {
    setLoadingStates(prev => ({ ...prev, [id]: 'start' }));
    try { await botAPI.start(id); await loadData(); }
    catch { /* ignored */ }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  }

  async function handleStopBot(id: number) {
    setLoadingStates(prev => ({ ...prev, [id]: 'stop' }));
    try { await botAPI.stop(id); await loadData(); }
    catch { /* ignored */ }
    finally { setLoadingStates(prev => ({ ...prev, [id]: null })); }
  }

  function openBotModal(bot: Bot | null = null) {
    setEditingBot(bot);
    setShowBotModal(true);
  }

  async function handleSaveBot(data: BotCreateData | BotUpdateData, id?: number) {
    try {
      if (id) {
        const updateData: BotUpdateData = {
          name: 'name' in data ? data.name : undefined,
          workflowId: 'workflowId' in data ? data.workflowId : undefined,
        };
        await botAPI.update(id, updateData);
      } else {
        if ('discordToken' in data && data.discordToken) {
          await botAPI.create(data as BotCreateData);
        } else {
          throw new Error('Discord token is required');
        }
      }
      await loadData();
    } catch (error) {
      console.error('Failed to save instance:', error);
      throw error;
    }
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  const running = bots.filter(b => b.status === 'running').length;
  const errored = bots.filter(b => b.status === 'error').length;
  const stopped = bots.length - running - errored;

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--t-a)' }}
        />
      </div>
    );
  }

  // ── Filter config ────────────────────────────────────────────────────────

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: t.dashboard.filterAll, count: bots.length },
    { key: 'running', label: t.dashboard.filterRunning, count: running },
    { key: 'stopped', label: t.dashboard.filterStopped, count: stopped },
    { key: 'error', label: t.dashboard.filterError, count: errored },
  ];

  return (
    <div className="page-enter" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--t-tx)' }}>
            {t.dashboard.title}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t-sub)' }}>
            {t.dashboard.instances}
          </p>
        </div>
        <button
          onClick={() => openBotModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
          style={{ background: 'var(--t-a)', color: 'var(--t-btn-text)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--t-ah)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--t-a)'; }}
        >
          <Plus className="w-4 h-4" />
          {t.dashboard.newInstance}
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Cpu className="w-5 h-5" />} title={t.dashboard.total} value={bots.length} total={3} color="accent" />
        <StatCard icon={<BotIcon className="w-5 h-5" />} title={t.dashboard.active} value={running} color="green" />
        <StatCard icon={<Power className="w-5 h-5" />} title={t.dashboard.stopped} value={stopped} color="purple" />
        <StatCard icon={<PowerOff className="w-5 h-5" />} title={t.dashboard.errors} value={errored} color="red" />
      </div>

      {/* ── Widgets Grid ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <ExecutionChart t={t.dashboard} />
        <ActivityFeed t={t.dashboard} />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <ErrorRateWidget t={t.dashboard} />
        <ResourceWidget bots={bots} t={t.dashboard} />
        <QuickDeployWidget t={t.dashboard} />
      </div>

      {/* ── Instance List ────────────────────────────────────────────── */}
      <div className="dnc-card" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
        {/* Toolbar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--t-bd)' }}
        >
          <h2 className="text-base font-bold" style={{ color: 'var(--t-tx)' }}>
            {t.dashboard.yourInstances}
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter pills */}
            <div
              className="flex rounded-lg overflow-hidden text-xs font-medium shrink-0"
              style={{ border: '1px solid var(--t-bd)' }}
            >
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="px-2.5 py-1.5 transition-all flex items-center gap-1"
                  style={{
                    background: filter === f.key ? 'var(--t-a)' : 'transparent',
                    color: filter === f.key ? 'var(--t-btn-text)' : 'var(--t-sub)',
                  }}
                >
                  {f.label}
                  <span className="opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: 'var(--t-m)' }}
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.dashboard.searchPlaceholder}
                className="w-full sm:w-44 text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all"
                style={{
                  background: 'var(--t-s2)',
                  border: '1px solid var(--t-bd)',
                  color: 'var(--t-tx)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--t-a)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--t-bd)'; }}
              />
            </div>
          </div>
        </div>

        {/* Bot list */}
        {filteredBots.length === 0 ? (
          <div className="text-center py-14 px-4">
            <BotIcon
              className="w-14 h-14 mx-auto mb-3"
              style={{ color: 'var(--t-m)', opacity: 0.4 }}
            />
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--t-tx)' }}>
              {t.dashboard.noInstances}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--t-m)' }}>
              {t.dashboard.noInstancesDesc}
            </p>
            <button
              onClick={() => openBotModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
              style={{ background: 'var(--t-a)', color: 'var(--t-btn-text)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--t-ah)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--t-a)'; }}
            >
              <Plus className="w-4 h-4" />
              {t.dashboard.createInstance}
            </button>
          </div>
        ) : (
          <div>
            {filteredBots.map(bot => (
              <BotItem
                key={bot.id}
                bot={bot}
                loading={loadingStates[bot.id] ?? null}
                onOpen={() => handleOpenInstance(bot)}
                onStart={() => handleStartBot(bot.id)}
                onStop={() => handleStopBot(bot.id)}
                onEdit={() => openBotModal(bot)}
                onDelete={() => handleDeleteBot(bot.id)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── BotModal ────────────────────────────────────────────────── */}
      {showBotModal && (
        <BotModal
          bot={editingBot}
          workflows={[]}
          onClose={() => setShowBotModal(false)}
          onSave={handleSaveBot}
        />
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  accent: { bg: 'var(--t-aa)', icon: 'var(--t-a)' },
  green: { bg: 'rgba(34,197,94,0.12)', icon: '#22c55e' },
  purple: { bg: 'rgba(168,85,247,0.12)', icon: '#a855f7' },
  red: { bg: 'rgba(239,68,68,0.12)', icon: '#ef4444' },
};

const StatCard = memo(function StatCard({ icon, title, value, color, total }: StatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className="dnc-card p-5" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: c.bg, color: c.icon }}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-bold" style={{ color: 'var(--t-tx)' }}>
        {value}
        {total !== undefined && (
          <span className="text-base font-normal" style={{ color: 'var(--t-m)' }}> / {total}</span>
        )}
      </h3>
      <p className="text-xs mt-0.5" style={{ color: 'var(--t-sub)' }}>{title}</p>
    </div>
  );
});

// ── BotItem ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  idle: { color: 'var(--t-m)', dot: '#6b7280', label: 'Idle' },
  running: { color: '#22c55e', dot: '#22c55e', label: 'Running' },
  stopped: { color: '#ef4444', dot: '#ef4444', label: 'Stopped' },
  error: { color: '#ef4444', dot: '#ef4444', label: 'Error' },
};

const BotItem = memo(function BotItem({ bot, loading, onOpen, onStart, onStop, onEdit, onDelete, t }: BotItemProps) {
  const isDeleting = loading === 'delete';
  const isStarting = loading === 'start';
  const isStopping = loading === 'stop';
  const isOpening = loading === 'open';
  const busy = isDeleting || isStarting || isStopping || isOpening;

  const status = STATUS_CONFIG[bot.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.idle;
  const statusLabel = t.status?.[bot.status as keyof typeof t.status] ?? status.label;
  const uptime = bot.status === 'running' ? formatUptime((bot as any).started_at) : null;

  return (
    <div
      className="flex items-center justify-between px-5 py-4 transition-colors"
      style={{ borderBottom: '1px solid var(--t-bd)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--t-s2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Left: icon + info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--t-aa)' }}
        >
          <BotIcon className="w-4.5 h-4.5" style={{ color: 'var(--t-a)' }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--t-tx)' }}>
            {bot.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {/* Status badge */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
              <Circle className="w-1.5 h-1.5 fill-current" style={{ color: status.dot }} />
              <span style={{ color: status.color }}>{statusLabel}</span>
            </span>
            {/* Port */}
            {bot.port && (
              <span className="text-[11px] font-mono" style={{ color: 'var(--t-m)' }}>
                :{bot.port}
              </span>
            )}
            {/* Workflow */}
            {bot.workflow_id && (
              <span className="text-[11px]" style={{ color: 'var(--t-m)' }}>
                {t.dashboard.workflow} #{bot.workflow_id}
              </span>
            )}
            {/* Uptime */}
            {uptime && (
              <span
                className="inline-flex items-center gap-1 text-[11px]"
                style={{ color: '#22c55e' }}
              >
                <Clock className="w-3 h-3" />
                {uptime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0 ml-3">
        <ActionButton
          onClick={onOpen} disabled={busy}
          title={t.dashboard.viewInstance} color="var(--t-a)" bg="var(--t-aa)" loading={isOpening}
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </ActionButton>
        {bot.status === 'idle' || bot.status === 'stopped' ? (
          <ActionButton
            onClick={onStart} disabled={busy}
            title={t.dashboard.start} color="#22c55e" bg="rgba(34,197,94,0.12)" loading={isStarting}
          >
            <Power className="w-3.5 h-3.5" />
          </ActionButton>
        ) : (
          <ActionButton
            onClick={onStop} disabled={busy}
            title={t.dashboard.stop} color="#f97316" bg="rgba(249,115,22,0.12)" loading={isStopping}
          >
            <PowerOff className="w-3.5 h-3.5" />
          </ActionButton>
        )}
        <ActionButton
          onClick={onEdit} disabled={busy}
          title={t.dashboard.modify} color="var(--t-sub)" bg="var(--t-s2)"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </ActionButton>
        <ActionButton
          onClick={onDelete} disabled={busy}
          title={t.common.delete} color="#ef4444" bg="rgba(239,68,68,0.1)" loading={isDeleting}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </ActionButton>
      </div>
    </div>
  );
});

// ── ActionButton ──────────────────────────────────────────────────────────────

function ActionButton({ onClick, disabled, title, color, bg, loading, children }: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  color: string;
  bg: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
      style={{ color, background: 'transparent' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = bg; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {loading ? (
        <div
          className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: color, borderTopColor: 'transparent' }}
        />
      ) : (
        children
      )}
    </button>
  );
}
