import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Power, PowerOff, RotateCw, Bot as BotIcon,
  Terminal, Activity, ChevronRight, FolderOpen,
  RefreshCw, Trash2, Clock, AlertTriangle, CheckCircle2,
  Info, Server, Plug, Search, Database, Cpu, HardDrive, Zap,
  Download, Maximize2, Minimize2, Eye, EyeOff, Edit3, CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  botAPI, statsAPI,
  type Bot, type BotContainerStatus, type ContainerResources, type ActivityItem, type DbTable,
} from '../../services/api.js';
import { useUserSettings, getBotThemeConfig } from '../../hooks/useUserSettings';
import { useTranslation } from '../../hooks/useTranslation';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LogLine {
  raw: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'plain';
  ts?: string;
  message: string;
}

type LogFilter = 'all' | 'error' | 'warn' | 'info' | 'debug';

interface ResourceSnapshot {
  time: string;
  cpu: number;
  mem: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  idle:    { dot: '#6b7280', bg: '#6b728015', border: '#6b728030', text: '#9ca3af' },
  running: { dot: '#22c55e', bg: '#22c55e15', border: '#22c55e30', text: '#4ade80' },
  stopped: { dot: '#ef4444', bg: '#ef444415', border: '#ef444430', text: '#f87171' },
  error:   { dot: '#ef4444', bg: '#ef444415', border: '#ef444430', text: '#f87171' },
} as const;

function getStatusCfg(s: string) {
  return STATUS_CFG[s as keyof typeof STATUS_CFG] ?? STATUS_CFG.idle;
}

function parseLogLine(raw: string): LogLine {
  const stripped = raw.replace(/\x1B\[[0-9;]*[mGKHF]/g, '').trim();
  if (!stripped) return { raw, level: 'plain', message: '' };
  const parts = stripped.match(
    /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^Z]*Z?\s*)?(\[?(ERROR|WARN|INFO|DEBUG)\]?)?\s*(.*)$/i,
  );
  const ts = parts?.[1]?.trim();
  const lvl = parts?.[3]?.toUpperCase() ?? '';
  const message = parts?.[4]?.trim() ?? stripped;
  let level: LogLine['level'] = 'plain';
  if (lvl === 'ERROR' || /error/i.test(stripped)) level = 'error';
  else if (lvl === 'WARN'  || /warn/i.test(stripped))  level = 'warn';
  else if (lvl === 'DEBUG' || /debug/i.test(stripped)) level = 'debug';
  else if (lvl === 'INFO'  || stripped.length > 0)     level = 'info';
  return { raw, level, ts, message };
}

function logColor(level: LogLine['level']): string {
  if (level === 'error') return '#f87171';
  if (level === 'warn')  return '#fbbf24';
  if (level === 'debug') return '#818cf8';
  if (level === 'info')  return '#86efac';
  return '#888';
}

function parsePercent(val: string | undefined): number {
  if (!val) return 0;
  return parseFloat(val) || 0;
}

function formatUptime(startedAt: string | null | undefined): string | null {
  if (!startedAt) return null;
  const diff = Date.now() - new Date(startedAt).getTime();
  if (diff < 0) return null;
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  if (mins < 1) return `${secs}s`;
  const hours = Math.floor(mins / 60);
  if (hours < 1) return `${mins}m ${secs % 60}s`;
  const days = Math.floor(hours / 24);
  if (days < 1) return `${hours}h ${mins % 60}m`;
  return `${days}d ${hours % 24}h`;
}

function Spinner({ color = '#e8643a', size = 14 }: { color?: string; size?: number }) {
  return (
    <div
      className="rounded-full border-2 border-t-transparent animate-spin"
      style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }}
    />
  );
}

// ── MiniSparkline (from real data) ────────────────────────────────────────────

function MiniSparkline({ data, dataKey, color, w = 76, h = 30 }: {
  data: ResourceSnapshot[]; dataKey: 'cpu' | 'mem'; color: string; w?: number; h?: number;
}) {
  if (data.length < 2) return <div style={{ width: w, height: h }} />;
  const vals = data.map(d => d[dataKey]);
  const max = Math.max(...vals, 1);
  const pad = 2;
  const xs = vals.map((_, i) => pad + (i / (vals.length - 1)) * (w - pad * 2));
  const ys = vals.map(v => pad + (1 - v / max) * (h - pad * 2));
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const fill = `${line} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={fill} fill={`${color}18`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── MiniBarChart ──────────────────────────────────────────────────────────────

function MiniBarChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const w = 100, h = 32;
  const barW = (w - (values.length - 1)) / values.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {values.map((v, i) => {
        const bh = Math.max(2, (v / max) * (h - 2));
        return <rect key={i} x={i * (barW + 1)} y={h - bh} width={barW} height={bh} rx="1" fill={`${color}50`} />;
      })}
    </svg>
  );
}

// ── InstancePage ──────────────────────────────────────────────────────────────

export default function InstancePage() {
  const { id } = useParams<{ id: string }>();
  const botId = Number(id);
  const navigate = useNavigate();
  const { settings } = useUserSettings();
  const { t } = useTranslation();
  const th = getBotThemeConfig(settings.defaultBotTheme ?? 'dark');
  const thV = {
    '--t-bg': th.bg, '--t-s': th.surface, '--t-s2': th.surface2,
    '--t-bd': th.border, '--t-a': th.accent, '--t-ah': th.accentHover,
    '--t-aa': th.accentAlpha, '--t-tx': th.text, '--t-sub': th.subtext, '--t-m': th.muted,
  } as React.CSSProperties;

  // ── State ───────────────────────────────────────────────────────────────────

  const [bot, setBot] = useState<Bot | null>(null);
  const [container, setContainer] = useState<BotContainerStatus['container'] | null>(null);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [resources, setResources] = useState<ContainerResources | null>(null);
  const [resourceHistory, setResourceHistory] = useState<ResourceSnapshot[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  const [loadingBot, setLoadingBot] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [action, setAction] = useState<'start' | 'stop' | 'restart' | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeTab, setActiveTab] = useState<'console' | 'activity' | 'executions'>('console');
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [logSearch, setLogSearch] = useState('');
  const [uptimeStr, setUptimeStr] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [dbTables, setDbTables] = useState<DbTable[]>([]);
  const [consoleFullscreen, setConsoleFullscreen] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState('');

  const consoleRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uptimeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load functions ──────────────────────────────────────────────────────────

  const loadBot = useCallback(async () => {
    if (!botId) return;
    try {
      const data = await botAPI.containerStatus(botId);
      setBot(data);
      setContainer(data.container);
    } catch {
      try { setBot(await botAPI.get(botId)); } catch { navigate('/dashboard'); }
    } finally {
      setLoadingBot(false);
    }
  }, [botId, navigate]);

  const loadLogs = useCallback(async () => {
    if (!botId) return;
    setLoadingLogs(true);
    try {
      const result = await botAPI.logs(botId, 300);
      setLogLines((result.logs || '').split('\n').filter((l: string) => l.trim()).map(parseLogLine));
    } catch { /* container not running */ }
    finally { setLoadingLogs(false); }
  }, [botId]);

  const loadResources = useCallback(async () => {
    if (!botId) return;
    try {
      const res = await botAPI.resources(botId);
      setResources(res);
      if (res.running) {
        setResourceHistory(prev => {
          const snap: ResourceSnapshot = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            cpu: parsePercent(res.cpu),
            mem: parsePercent(res.memPercent),
          };
          return [...prev.slice(-29), snap];
        });
      }
    } catch { /* not available */ }
  }, [botId]);

  const loadActivity = useCallback(async () => {
    try {
      const items = await statsAPI.activity(20);
      setActivityItems(items.filter((a: ActivityItem) => a.botId === botId));
    } catch { /* empty */ }
  }, [botId]);

  const loadDbInfo = useCallback(async () => {
    if (!botId) return;
    try {
      const status = await botAPI.dbStatus(botId);
      setDbStatus(status.status);
    } catch { setDbStatus(null); }
    try {
      const tables = await botAPI.dbListTables(botId);
      setDbTables(tables);
    } catch { setDbTables([]); }
  }, [botId]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoScroll && consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [logLines, autoScroll]);

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    loadBot();
    loadLogs();
    loadResources();
    loadActivity();
    loadDbInfo();
  }, [loadBot, loadLogs, loadResources, loadActivity, loadDbInfo]);

  // ── Polling (every 4s when running) ─────────────────────────────────────────

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (bot?.status === 'running') {
      pollRef.current = setInterval(() => {
        loadLogs();
        loadBot();
        loadResources();
      }, 4000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [bot?.status, loadLogs, loadBot, loadResources]);

  // ── Live uptime ticker ──────────────────────────────────────────────────────

  useEffect(() => {
    if (uptimeRef.current) clearInterval(uptimeRef.current);
    const update = () => setUptimeStr(formatUptime((bot as any)?.started_at));
    update();
    if (bot?.status === 'running') {
      uptimeRef.current = setInterval(update, 1000);
    }
    return () => { if (uptimeRef.current) clearInterval(uptimeRef.current); };
  }, [bot?.status, (bot as any)?.started_at]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function handleStart() {
    setAction('start');
    try { await botAPI.start(botId); await loadBot(); await loadLogs(); }
    finally { setAction(null); }
  }

  async function handleStop() {
    setAction('stop');
    try { await botAPI.stop(botId); await loadBot(); setResources(null); }
    finally { setAction(null); }
  }

  async function handleRestart() {
    setAction('restart');
    try {
      await botAPI.stop(botId);
      await new Promise(r => setTimeout(r, 800));
      await botAPI.start(botId);
      await loadBot();
      await loadLogs();
      setResourceHistory([]);
    } finally { setAction(null); }
  }

  function handlePurgeLogs() {
    setLogLines([]);
  }

  function handleExportLogs() {
    const text = logLines.map(l => `${l.ts ? l.ts + ' ' : ''}[${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bot?.name ?? 'bot'}-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRename() {
    if (!bot || !renameName.trim() || renameName === bot.name) { setRenaming(false); return; }
    try {
      await botAPI.update(botId, { name: renameName.trim() });
      await loadBot();
      setRenaming(false);
    } catch { /* failed */ }
  }

  // ── Filtered logs ───────────────────────────────────────────────────────────

  const filteredLogs = useMemo(() => {
    let result = logLines;
    if (logFilter !== 'all') result = result.filter(l => l.level === logFilter);
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      result = result.filter(l => l.message.toLowerCase().includes(q));
    }
    return result;
  }, [logLines, logFilter, logSearch]);

  const logCounts = useMemo(() => ({
    all: logLines.length,
    error: logLines.filter(l => l.level === 'error').length,
    warn: logLines.filter(l => l.level === 'warn').length,
    info: logLines.filter(l => l.level === 'info').length,
    debug: logLines.filter(l => l.level === 'debug').length,
  }), [logLines]);

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loadingBot || !bot) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ ...thV, background: 'var(--t-bg)' }}>
        <Spinner color={th.accent} size={20} />
      </div>
    );
  }

  const st = getStatusCfg(bot.status);
  const busy = action !== null;
  const isRunning = bot.status === 'running';
  const cpuPercent = parsePercent(resources?.cpu);
  const memPercent = parsePercent(resources?.memPercent);

  // ── Activity icon helper ────────────────────────────────────────────────────

  function activityIcon(type: string, status?: string) {
    if (type === 'execution' && status === 'failed') return <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f87171' }} />;
    if (type === 'execution' && status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />;
    if (type === 'execution') return <Activity className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />;
    if (type === 'bot_status' && (status === 'started' || status === 'running')) return <Power className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />;
    if (type === 'bot_status' && status === 'stopped') return <PowerOff className="w-3.5 h-3.5" style={{ color: '#f87171' }} />;
    return <Info className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ ...thV, background: 'var(--t-bg)' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 h-14 flex items-center px-6"
        style={{ background: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}
      >
        <div className="w-full flex items-center justify-between gap-4">
          {/* Left: back + breadcrumb + live badge */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="dnc-btn-icon w-7 h-7 shrink-0"
              style={{ color: 'var(--t-m)', border: '1px solid var(--t-bd)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--t-m)' }}>
              <span>{t.dashboard.title}</span>
              <ChevronRight className="w-3 h-3" />
              <span>{t.dashboard.instances}</span>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--t-sub)' }}>{bot.name}</span>
            </div>

            {/* LIVE badge */}
            {isRunning && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
                style={{ background: '#22c55e18', color: '#22c55e', border: '1px solid #22c55e30' }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22c55e' }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#22c55e' }} />
                </span>
                {t.instance.live}
              </span>
            )}

            {/* Uptime */}
            {isRunning && uptimeStr && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#4ade80' }}>
                <Clock className="w-3 h-3" />
                {uptimeStr}
              </span>
            )}

            {/* G1: Health pulse — polling active indicator */}
            {isRunning && (
              <span className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--t-m)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: 'var(--t-a)' }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--t-a)' }} />
                </span>
                {t.instance.pollingActive}
              </span>
            )}
          </div>

          {/* Right: control buttons */}
          <div className="flex items-center gap-2">
            {bot.workflow_id && (
              <CtrlBtn
                onClick={() => navigate(`/workflow/${bot.workflow_id}`)}
                label={t.dashboard.workflow}
                icon={<FolderOpen className="w-3.5 h-3.5" />}
                bg={th.accentAlpha} color={th.accent} hoverBg={`${th.accent}30`}
              />
            )}
            {isRunning ? (
              <>
                <CtrlBtn onClick={handleRestart} disabled={busy}
                  label={action === 'restart' ? t.instance.restarting : t.instance.restart}
                  icon={action === 'restart' ? <Spinner size={14} /> : <RotateCw className="w-3.5 h-3.5" />}
                  bg={th.accentAlpha} color={th.accent} hoverBg={`${th.accent}30`} />
                <CtrlBtn onClick={handleStop} disabled={busy}
                  label={action === 'stop' ? t.instance.stopping : t.dashboard.stop}
                  icon={action === 'stop' ? <Spinner size={14} color="#ef4444" /> : <PowerOff className="w-3.5 h-3.5" />}
                  bg="#ef444412" color="#ef4444" hoverBg="#ef444420" />
              </>
            ) : (
              <CtrlBtn onClick={handleStart} disabled={busy}
                label={action === 'start' ? t.instance.starting : t.dashboard.start}
                icon={action === 'start' ? <Spinner size={14} color="#22c55e" /> : <Power className="w-3.5 h-3.5" />}
                bg="#22c55e12" color="#22c55e" hoverBg="#22c55e20" />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-6 py-8 space-y-6">

        {/* ── Stat tiles ──────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-5">
          <StatTile
            icon={<Server className="w-4 h-4" />}
            label={t.instance.container}
            value={container?.status ?? (isRunning ? 'running' : bot.status)}
            accent={isRunning ? '#22c55e' : '#6b7280'}
            sparkData={resourceHistory} sparkKey="cpu"
          />
          <StatTile
            icon={<Clock className="w-4 h-4" />}
            label={t.instance.uptime}
            value={uptimeStr ?? '—'}
            accent={isRunning ? '#22c55e' : '#6b7280'}
            sparkData={resourceHistory} sparkKey="mem"
          />
          <StatTile
            icon={<Cpu className="w-4 h-4" />}
            label={t.instance.cpu}
            value={resources?.running ? `${cpuPercent.toFixed(1)}%` : '—'}
            accent={cpuPercent > 80 ? '#ef4444' : cpuPercent > 50 ? '#fbbf24' : '#22c55e'}
            sparkData={resourceHistory} sparkKey="cpu"
            alert={cpuPercent > 80 ? t.instance.highUsage : undefined}
          />
          <StatTile
            icon={<HardDrive className="w-4 h-4" />}
            label={t.instance.memory}
            value={resources?.running ? `${memPercent.toFixed(1)}%` : '—'}
            accent={memPercent > 80 ? '#ef4444' : memPercent > 50 ? '#fbbf24' : '#22c55e'}
            sparkData={resourceHistory} sparkKey="mem"
            alert={memPercent > 80 ? t.instance.highUsage : undefined}
          />
        </div>

        {/* ── Resource history chart ──────────────────────────────── */}
        {resourceHistory.length > 1 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>
                {t.instance.resourceHistory}
              </h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                  <span style={{ color: 'var(--t-sub)' }}>{t.instance.cpu}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#818cf8' }} />
                  <span style={{ color: 'var(--t-sub)' }}>{t.instance.memory}</span>
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={resourceHistory}>
                <defs>
                  <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--t-bd)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--t-m)' }} tickLine={false} axisLine={false} />
                <YAxis
                  domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--t-m)' }}
                  tickLine={false} axisLine={false} width={30}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--t-s)', border: '1px solid var(--t-bd)',
                    borderRadius: 8, fontSize: 11, color: 'var(--t-tx)',
                  }}
                  labelFormatter={(v: any) => String(v)}
                />
                <Area type="monotone" dataKey="cpu" stroke="#22c55e" fill="url(#gradCpu)" strokeWidth={1.5} dot={false} name="CPU" />
                <Area type="monotone" dataKey="mem" stroke="#818cf8" fill="url(#gradMem)" strokeWidth={1.5} dot={false} name="Memory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Bottom grid: Console + Right panel ──────────────────── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Console — 2/3 or full width */}
          <div
            className={`${consoleFullscreen ? 'col-span-3' : 'col-span-2'} rounded-2xl overflow-hidden flex flex-col`}
            style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', minHeight: 480, maxHeight: 640 }}
          >
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--t-bd)' }}>
              <TabBtn active={activeTab === 'console'} onClick={() => setActiveTab('console')}
                icon={<Terminal className="w-3 h-3" />} label={t.instance.console} />
              <TabBtn active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}
                icon={<Activity className="w-3 h-3" />}
                label={`${t.instance.activity}${activityItems.length > 0 ? ` (${activityItems.length})` : ''}`} />
              <TabBtn active={activeTab === 'executions'} onClick={() => setActiveTab('executions')}
                icon={<Zap className="w-3 h-3" />}
                label={t.instance.executions} />
              <div className="flex-1" />
              <button onClick={loadLogs} title={t.instance.refreshLogs}
                className="dnc-btn-icon text-[10px] px-2 py-1"
                style={{ color: 'var(--t-m)' }}>
                {loadingLogs ? <Spinner size={11} /> : <RefreshCw className="w-3 h-3" />}
              </button>
              <button onClick={handleExportLogs} title={t.instance.exportLogs}
                className="dnc-btn-icon text-[10px] px-2 py-1"
                style={{ color: 'var(--t-m)' }}>
                <Download className="w-3 h-3" />
              </button>
              <button onClick={() => setShowTimestamps(v => !v)} title={showTimestamps ? t.instance.hideTimestamps : t.instance.showTimestamps}
                className="dnc-btn-icon text-[10px] px-2 py-1"
                style={{ color: showTimestamps ? 'var(--t-a)' : 'var(--t-m)', background: showTimestamps ? 'var(--t-aa)' : '' }}>
                {showTimestamps ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
              <button onClick={() => setConsoleFullscreen(v => !v)} title={consoleFullscreen ? t.instance.exitFullscreen : t.instance.fullscreen}
                className="dnc-btn-icon text-[10px] px-2 py-1"
                style={{ color: 'var(--t-m)' }}>
                {consoleFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
              <button onClick={handlePurgeLogs} title={t.instance.clear}
                className="dnc-btn-icon text-[10px] px-2 py-1"
                style={{ color: 'var(--t-m)' }}>
                <Trash2 className="w-3 h-3" />
              </button>
              <button onClick={() => setAutoScroll(v => !v)} title="Auto-scroll"
                className="dnc-btn-icon text-[10px] px-2 py-1"
                style={{ color: autoScroll ? 'var(--t-a)' : 'var(--t-m)', background: autoScroll ? 'var(--t-aa)' : '' }}>
                <Clock className="w-3 h-3" /> auto
              </button>
            </div>

            {/* Console filter bar */}
            {activeTab === 'console' && (
              <div
                className="flex items-center gap-2 px-3 py-2 shrink-0"
                style={{ borderBottom: '1px solid var(--t-bd)', background: 'var(--t-bg)' }}
              >
                <div className="flex rounded-lg overflow-hidden text-[11px] font-medium" style={{ border: '1px solid var(--t-bd)' }}>
                  {([
                    { key: 'all' as LogFilter, label: t.instance.filterAll, count: logCounts.all, color: 'var(--t-sub)' },
                    { key: 'error' as LogFilter, label: t.instance.filterErrors, count: logCounts.error, color: '#f87171' },
                    { key: 'warn' as LogFilter, label: t.instance.filterWarns, count: logCounts.warn, color: '#fbbf24' },
                    { key: 'info' as LogFilter, label: t.instance.filterInfo, count: logCounts.info, color: '#86efac' },
                    { key: 'debug' as LogFilter, label: t.instance.filterDebug, count: logCounts.debug, color: '#818cf8' },
                  ]).map(f => (
                    <button
                      key={f.key}
                      onClick={() => setLogFilter(f.key)}
                      className="px-2 py-1 transition-all flex items-center gap-1"
                      style={{
                        background: logFilter === f.key ? 'var(--t-s)' : 'transparent',
                        color: logFilter === f.key ? f.color : 'var(--t-m)',
                      }}
                    >
                      {f.label}
                      {f.count > 0 && <span className="opacity-60">{f.count}</span>}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: 'var(--t-m)' }} />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    placeholder={t.instance.searchLogs}
                    className="w-full text-[11px] rounded-lg pl-7 pr-2 py-1.5 outline-none"
                    style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--t-a)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--t-bd)')}
                  />
                </div>
                {/* E3: filtered line counter */}
                {(logFilter !== 'all' || logSearch.trim()) && (
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--t-m)' }}>
                    {t.instance.showingLines.replace('{count}', String(filteredLogs.length)).replace('{total}', String(logLines.length))}
                  </span>
                )}
              </div>
            )}

            {/* Console content */}
            {activeTab === 'console' && (
              <div
                ref={consoleRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
                style={{ background: 'var(--t-bg)' }}
              >
                {filteredLogs.length === 0 ? (
                  <p style={{ color: 'var(--t-m)' }}>
                    {logLines.length === 0
                      ? (isRunning ? t.instance.waitingLogs : t.instance.botNotActive)
                      : `0 results`}
                  </p>
                ) : (
                  filteredLogs.map((l, i) => l.message && (
                    <div key={i} className="flex gap-2 py-0.5" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                      {showTimestamps && l.ts && (
                        <span className="shrink-0 select-none" style={{ color: 'var(--t-m)', minWidth: 80 }}>
                          {l.ts.slice(11, 19)}
                        </span>
                      )}
                      <span
                        className="shrink-0 w-2 mt-1 rounded-full h-2 self-start"
                        style={{ background: logColor(l.level), opacity: 0.8 }}
                      />
                      <span style={{ color: logColor(l.level), wordBreak: 'break-all' }}>{l.message}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Activity content (API-based) */}
            {activeTab === 'activity' && (
              <div className="flex-1 overflow-y-auto" style={{ background: 'var(--t-bg)' }}>
                {activityItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[11px]" style={{ color: 'var(--t-m)' }}>{t.instance.botNotActive}</p>
                  </div>
                ) : (
                  activityItems.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-3 py-2.5 transition-colors"
                      style={{ borderBottom: '1px solid var(--t-bd)' }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--t-s2)')}
                      onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                    >
                      <div className="shrink-0 mt-0.5">{activityIcon(e.type, e.status)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] break-words leading-relaxed" style={{ color: 'var(--t-tx)' }}>
                          {e.workflowName ? `${e.workflowName} — ` : ''}{e.status}
                        </p>
                        <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--t-m)' }}>
                          {new Date(e.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* F3: Executions tab */}
            {activeTab === 'executions' && (
              <div className="flex-1 overflow-y-auto" style={{ background: 'var(--t-bg)' }}>
                {(() => {
                  const execItems = activityItems.filter(a => a.type === 'execution');
                  if (execItems.length === 0) return (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-[11px]" style={{ color: 'var(--t-m)' }}>{t.instance.noExecutions}</p>
                    </div>
                  );
                  return execItems.map((e, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 transition-colors"
                      style={{ borderBottom: '1px solid var(--t-bd)' }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--t-s2)')}
                      onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                      <div className="shrink-0 mt-0.5">{activityIcon(e.type, e.status)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] break-words leading-relaxed" style={{ color: 'var(--t-tx)' }}>
                          {e.workflowName ?? 'Workflow'} — {e.status}
                        </p>
                        <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--t-m)' }}>
                          {new Date(e.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Right column */}
          {!consoleFullscreen && (
          <div className="flex flex-col gap-4">

            {/* Quick Actions */}
            <div className="rounded-2xl p-5 space-y-2.5" style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--t-m)' }}>
                {t.instance.quickActions}
              </h3>
              {bot.workflow_id && (
                <QuickActionBtn
                  icon={<FolderOpen className="w-3.5 h-3.5" />}
                  label={t.instance.openWorkflow}
                  onClick={() => navigate(`/workflow/${bot.workflow_id}`)}
                  color="var(--t-a)" bg="var(--t-aa)"
                />
              )}
              <QuickActionBtn
                icon={<Database className="w-3.5 h-3.5" />}
                label={t.instance.viewDatabase}
                onClick={() => navigate(`/dashboard/databases/${bot.id}`)}
                color="#a78bfa" bg="#a78bfa15"
              />
              {isRunning && (
                <QuickActionBtn
                  icon={<RotateCw className="w-3.5 h-3.5" />}
                  label={t.instance.restart}
                  disabled={busy}
                  onClick={handleRestart}
                  color={th.accent} bg={th.accentAlpha}
                />
              )}
              <QuickActionBtn
                icon={<Trash2 className="w-3.5 h-3.5" />}
                label={t.instance.purgeLogs}
                onClick={handlePurgeLogs}
                color="#f87171" bg="#f8717115"
              />
            </div>

            {/* Instance Info */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>
                {t.instance.info}
              </h3>
              <InfoRow icon={<BotIcon className="w-3.5 h-3.5" />} label={t.common.name} value={bot.name} accent={th.accent} />
              {/* F1: inline rename */}
              {renaming ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={renameName}
                    onChange={e => setRenameName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
                    className="flex-1 text-xs rounded-lg px-2 py-1 outline-none"
                    style={{ background: 'var(--t-s2)', border: '1px solid var(--t-bd)', color: 'var(--t-tx)' }}
                  />
                  <button onClick={handleRename}
                    className="w-6 h-6 flex items-center justify-center rounded-lg"
                    style={{ color: '#22c55e' }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setRenameName(bot.name); setRenaming(true); }}
                  className="dnc-btn-icon flex items-center gap-1.5 text-[11px]"
                  style={{ color: 'var(--t-m)' }}>
                  <Edit3 className="w-3 h-3" /> {t.instance.rename}
                </button>
              )}
              <InfoRow
                icon={<Server className="w-3.5 h-3.5" />}
                label={t.common.status}
                value={t.status[bot.status as keyof typeof t.status] ?? t.status.idle}
                accent={st.dot}
              />
              {bot.port && <InfoRow icon={<Plug className="w-3.5 h-3.5" />} label={t.instance.port} value={`:${bot.port}`} accent={th.muted} mono />}
              {bot.workflow_id && <InfoRow icon={<FolderOpen className="w-3.5 h-3.5" />} label={t.dashboard.workflow} value={`#${bot.workflow_id}`} accent={th.muted} />}
              {resources?.running && (
                <>
                  <InfoRow icon={<Cpu className="w-3.5 h-3.5" />} label={t.instance.cpu} value={resources.cpu} accent={cpuPercent > 80 ? '#ef4444' : '#22c55e'} mono />
                  <InfoRow icon={<HardDrive className="w-3.5 h-3.5" />} label={t.instance.memory} value={resources.memUsage} accent={memPercent > 80 ? '#ef4444' : '#818cf8'} mono />
                  <InfoRow icon={<Activity className="w-3.5 h-3.5" />} label={t.instance.network} value={resources.netIO} accent={th.muted} mono />
                  <InfoRow icon={<Zap className="w-3.5 h-3.5" />} label={t.instance.pids} value={resources.pids} accent={th.muted} mono />
                </>
              )}
              <InfoRow
                icon={<Clock className="w-3.5 h-3.5" />}
                label={t.instance.createdAt}
                value={new Date(bot.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                accent={th.muted}
              />
              {/* D1: DB status */}
              <InfoRow
                icon={<Database className="w-3.5 h-3.5" />}
                label={t.instance.dbStatus}
                value={dbStatus === 'running' ? t.instance.dbRunning : t.instance.dbStopped}
                accent={dbStatus === 'running' ? '#22c55e' : '#6b7280'}
              />
              {/* D2: DB tables count */}
              <InfoRow
                icon={<Database className="w-3.5 h-3.5" />}
                label={t.instance.dbTables}
                value={String(dbTables.length)}
                accent={th.muted}
                mono
              />
              {/* D3: Container ID */}
              {container?.id && (
                <InfoRow
                  icon={<Server className="w-3.5 h-3.5" />}
                  label={t.instance.containerId}
                  value={container.id.slice(0, 12)}
                  accent={th.muted}
                  mono
                />
              )}
            </div>

            {/* F2: Configuration */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>
                {t.instance.configuration}
              </h3>
              <InfoRow
                icon={<Plug className="w-3.5 h-3.5" />}
                label={t.instance.discordToken}
                value={bot.discord_token ? `${bot.discord_token.slice(0, 6)}••••••` : '—'}
                accent={th.muted}
                mono
              />
              {bot.port && (
                <InfoRow icon={<Server className="w-3.5 h-3.5" />} label={t.instance.port} value={`:${bot.port}`} accent={th.muted} mono />
              )}
              {bot.db_port && (
                <InfoRow icon={<Database className="w-3.5 h-3.5" />} label={t.instance.dbPort} value={`:${bot.db_port}`} accent={th.muted} mono />
              )}
            </div>

            {/* Log Summary */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-m)' }}>
                {t.instance.logSummary}
              </h3>
              <LogBadge label={t.instance.info} count={logCounts.info} color="#86efac" />
              <LogBadge label={t.instance.warn} count={logCounts.warn} color="#fbbf24" />
              <LogBadge label={t.common.error} count={logCounts.error} color="#f87171" />
              <LogBadge label={t.instance.debug} count={logCounts.debug} color="#818cf8" />
              <div className="pt-1">
                <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--t-m)' }}>
                  <span>{t.instance.errorsWarn}</span>
                  <span style={{ color: 'var(--t-sub)' }}>{logLines.length} {t.instance.lines}</span>
                </div>
                <MiniBarChart values={[logCounts.error, logCounts.warn, logCounts.info, logCounts.debug]} color={th.accent} />
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CtrlBtn({ onClick, disabled, label, icon, bg, color }: {
  onClick: () => void; disabled?: boolean; label: string;
  icon: React.ReactNode; bg: string; color: string; hoverBg?: string;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="dnc-btn dnc-btn-sm"
      style={{ background: bg, color, border: `1px solid ${color}18` }}
    >
      {icon}
      {label}
    </button>
  );
}

function StatTile({ icon, label, value, accent, sparkData, sparkKey, alert }: {
  icon: React.ReactNode; label: string; value: number | string;
  accent: string; sparkData: ResourceSnapshot[]; sparkKey: 'cpu' | 'mem'; alert?: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', borderTop: `2px solid ${accent}` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: accent }}>
          {icon}
          <span className="text-xs font-medium" style={{ color: 'var(--t-sub)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {alert && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full"
              style={{ background: '#ef444418', color: '#ef4444', border: '1px solid #ef444430' }}>
              <AlertCircle className="w-2.5 h-2.5" /> {alert}
            </span>
          )}
          <MiniSparkline data={sparkData} dataKey={sparkKey} color={accent} />
        </div>
      </div>
      <p className="text-xl font-bold font-mono leading-none truncate" style={{ color: 'var(--t-tx)' }}>
        {value}
      </p>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="dnc-btn dnc-btn-tab dnc-btn-xs"
      data-active={active}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoRow({ icon, label, value, accent, mono }: {
  icon: React.ReactNode; label: string; value: string; accent: string; mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2" style={{ color: 'var(--t-m)' }}>
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-xs" style={{ color: 'var(--t-sub)' }}>{label}</span>
      </div>
      <span className={`text-xs font-medium truncate ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--t-tx)' }}>
        {value}
      </span>
    </div>
  );
}

function LogBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-xs" style={{ color: 'var(--t-sub)' }}>{label}</span>
      </div>
      <span className="text-xs font-mono font-medium" style={{ color: count > 0 ? color : 'var(--t-m)' }}>{count}</span>
    </div>
  );
}

function QuickActionBtn({ icon, label, onClick, disabled, color, bg }: {
  icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; color: string; bg: string;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="dnc-btn dnc-btn-xs w-full justify-start"
      style={{ background: bg, color, border: `1px solid ${color}18` }}
    >
      {icon}
      {label}
    </button>
  );
}
