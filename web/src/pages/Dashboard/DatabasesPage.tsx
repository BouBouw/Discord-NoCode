import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Bot, CheckCircle2, XCircle, RefreshCw,
  Copy, ChevronDown, ChevronUp, TableProperties, AlertTriangle, Loader2,
} from 'lucide-react';
import { botAPI, type Bot as BotType } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';

const STATUS_CFG: Record<string, { dot: string; bg: string; text: string }> = {
  running: { dot: '#22c55e', bg: 'rgba(34,197,94,0.12)',  text: '#22c55e' },
  idle:    { dot: '#6b7280', bg: 'rgba(107,114,128,0.12)', text: '#9ca3af' },
  stopped: { dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
  error:   { dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
};

const DB_STATUS: Record<string, { color: string; dot: string }> = {
  running:   { color: '#22c55e', dot: '#22c55e' },
  exited:    { color: '#f97316', dot: '#f97316' },
  not_found: { color: 'var(--t-m)',    dot: 'var(--t-m)' },
  unknown:   { color: 'var(--t-m)',    dot: 'var(--t-m)' },
};

function botDbPassword(id: number) { return `bp_${id}_${id * 7 + 13}`; }

function CopyButton({ value, title }: { value: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 p-0.5 transition"
      style={{ color: copied ? '#22c55e' : 'var(--t-m)' }}
      title={title}
    >
      {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0" style={{ color: 'var(--t-m)' }}>{label}</span>
      <code className="rounded px-1.5 py-0.5 font-mono flex-1 truncate" style={{ backgroundColor: 'var(--t-s2)', color: 'var(--t-tx)', border: '1px solid var(--t-bd)' }}>{value}</code>
      <CopyButton value={value} title="" />
    </div>
  );
}

export default function DatabasesPage() {
  const { t } = useTranslation();
  const [bots, setBots]             = useState<BotType[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<Set<number>>(new Set());
  const [dbStatuses, setDbStatuses] = useState<Record<number, string>>({});
  const [purgeTarget, setPurgeTarget] = useState<number | null>(null);
  const [purging, setPurging]       = useState(false);
  const [msg, setMsg]               = useState<{ id: number; type: 'ok' | 'err'; text: string } | null>(null);
  const navigate = useNavigate();

  const loadBots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await botAPI.list();
      setBots(data);
      data.forEach(async bot => {
        try {
          const r = await botAPI.dbStatus(bot.id);
          setDbStatuses(prev => ({ ...prev, [bot.id]: r.status }));
        } catch {
          setDbStatuses(prev => ({ ...prev, [bot.id]: 'unknown' }));
        }
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBots(); }, [loadBots]);

  function toggleExpand(id: number) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    if (purgeTarget === id) setPurgeTarget(null);
  }

  async function confirmPurge(botId: number) {
    setPurging(true);
    try {
      await botAPI.dbPurge(botId);
      setMsg({ id: botId, type: 'ok', text: t.databases.purged });
      setPurgeTarget(null);
    } catch (e: any) {
      setMsg({ id: botId, type: 'err', text: e.message ?? t.common.error });
    } finally {
      setPurging(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]" style={{ backgroundColor: 'var(--t-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--t-bd)', borderTopColor: 'var(--t-a)' }} />
          <p className="text-xs" style={{ color: 'var(--t-m)' }}>{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }}>
      {/* Sticky page header */}
      <header className="sticky top-0 z-10 h-14 flex items-center px-6" style={{ backgroundColor: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}>
        <div className="w-full flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--t-m)' }}>
              <span>{t.dashboard.title}</span>
              <span className="mx-1" style={{ color: 'var(--t-m)' }}>/</span>
              <span className="font-medium" style={{ color: 'var(--t-sub)' }}>{t.databases.title}</span>
            </div>
            <h1 className="text-base font-semibold leading-none" style={{ color: 'var(--t-tx)' }}>{t.databases.title}</h1>
          </div>
          <button
            onClick={loadBots}
            className="dnc-btn dnc-btn-ghost dnc-btn-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} /> {t.common.refresh}
          </button>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-6 py-6">

        <p className="text-xs mb-4" style={{ color: 'var(--t-m)' }}>{t.databases.description}</p>

        {bots.length === 0 ? (
        <div className="text-center py-20 rounded-xl" style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
          <Bot className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--t-m)' }} strokeWidth={1.5} />
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--t-tx)' }}>{t.databases.noInstances}</p>
          <p className="text-xs mb-4" style={{ color: 'var(--t-m)' }}>{t.databases.noInstancesDesc}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="dnc-btn dnc-btn-primary"
          >
            {t.databases.goToInstances}
          </button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
          {/* Column header */}
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'var(--t-s2)', borderBottom: '1px solid var(--t-bd)', color: 'var(--t-m)' }}>
            <span>{t.databases.instanceCol}</span>
            <span>{t.databases.engine}</span>
            <span>{t.databases.containerPort}</span>
            <span>{t.databases.dbStatus}</span>
            <span></span>
          </div>

          {bots.map((bot, i) => {
            const statusCfg = STATUS_CFG[bot.status] ?? STATUS_CFG.idle;
            const dbStatus  = DB_STATUS[dbStatuses[bot.id] ?? 'unknown'] ?? DB_STATUS.unknown;
            const dbRunning = dbStatuses[bot.id] === 'running';
            const isExp     = expanded.has(bot.id);
            const isPurge   = purgeTarget === bot.id;
            const rowMsg    = msg?.id === bot.id ? msg : null;

            return (
              <div key={bot.id} style={i !== bots.length - 1 ? { borderBottom: '1px solid var(--t-bd)' } : {}}>
                {/* Main row */}
                <div
                  className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-5 py-4 transition"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--t-s2)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Instance */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--t-aa)' }}>
                      <Bot className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--t-tx)' }}>{bot.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                          {t.status[bot.status as keyof typeof t.status] ?? t.status.idle}
                        </span>
                        {bot.port && <span className="text-xs font-mono" style={{ color: 'var(--t-m)' }}>:{bot.port}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Engine */}
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--t-sub)' }}>
                    <Database className="w-4 h-4 shrink-0" style={{ color: 'var(--t-a)' }} />
                    MariaDB
                  </div>

                  {/* Container */}
                  <div>
                    <code className="text-xs font-mono px-2 py-1 rounded block truncate" style={{ backgroundColor: 'var(--t-s2)', color: 'var(--t-sub)', border: '1px solid var(--t-bd)' }}>
                      discord-bot-{bot.id}
                    </code>
                    {bot.db_port && <span className="text-xs font-mono mt-0.5 block" style={{ color: 'var(--t-m)' }}>MySQL :{bot.db_port}</span>}
                  </div>

                  {/* DB status */}
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: dbStatus.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dbStatus.dot }} />
                      {{ running: t.status.online, exited: t.status.stopped, not_found: t.status.nonexistent }[dbStatuses[bot.id] ?? ''] ?? '...'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {dbRunning && (
                      <button
                        onClick={() => navigate(`/dashboard/databases/${bot.id}`)}
                        title={t.databases.openViewer}
                        className="dnc-btn dnc-btn-primary dnc-btn-xs"
                      >
                        <TableProperties className="w-3.5 h-3.5" /> {t.databases.openViewer}
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(bot.id)}
                      className="dnc-btn-icon p-2"
                    >
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExp && (
                  <div className="px-5 py-4 space-y-4" style={{ borderTop: '1px solid var(--t-bd)', backgroundColor: 'var(--t-s2)' }}>
                    {/* Credentials */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t-m)' }}>
                        {t.databases.credentials}
                      </p>
                      <div className="space-y-1.5 max-w-sm">
                        <CredRow label={t.databases.host}     value="127.0.0.1" />
                        <CredRow label="Port"     value="3306 (interne)" />
                        <CredRow label={t.databases.base}     value={`bot_${bot.id}`} />
                        <CredRow label={t.databases.user}     value="botuser" />
                        <CredRow label={t.databases.password} value={botDbPassword(bot.id)} />
                      </div>
                    </div>

                    {/* Purge */}
                    {!isPurge ? (
                      <div>
                        <button
                          onClick={() => { setPurgeTarget(bot.id); setExpanded(prev => { const n = new Set(prev); n.add(bot.id); return n; }); }}
                          className="dnc-btn dnc-btn-danger dnc-btn-xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> {t.databases.purgeAll}
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#ef4444' }}>
                          <AlertTriangle className="w-4 h-4" /> {t.databases.purgeConfirm}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                          La base <code style={{ backgroundColor: 'rgba(239,68,68,0.15)', padding: '0 4px', borderRadius: 3 }}>bot_{bot.id}</code> sera vidée (tables + données). Cette action est irréversible.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setPurgeTarget(null)}
                            className="dnc-btn dnc-btn-ghost dnc-btn-xs"
                          >
                            {t.common.cancel}
                          </button>
                          <button
                            onClick={() => confirmPurge(bot.id)}
                            disabled={purging}
                            className="dnc-btn dnc-btn-danger-solid dnc-btn-xs"
                          >
                            {purging && <Loader2 className="w-3 h-3 animate-spin" />}
                            {t.databases.purge}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {rowMsg && (
                      <div
                        className="text-xs px-3 py-2 rounded-lg font-medium"
                        style={rowMsg.type === 'ok'
                          ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                          : { backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      >
                        {rowMsg.type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" /> : <XCircle className="w-3.5 h-3.5 inline mr-1.5" />}
                        {rowMsg.text}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}


