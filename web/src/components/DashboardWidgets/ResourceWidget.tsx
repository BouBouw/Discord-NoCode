import { memo, useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi } from 'lucide-react';
import { botAPI, type Bot, type ContainerResources } from '../../services/api';

interface Props {
  bots: Bot[];
  t: {
    resourceUsage: string;
    cpu: string;
    memory: string;
    network: string;
    notRunning: string;
  };
}

function parsePercent(s: string): number {
  return parseFloat(s.replace('%', '')) || 0;
}

export default memo(function ResourceWidget({ bots, t }: Props) {
  const [resources, setResources] = useState<Record<number, ContainerResources>>({});
  const [loading, setLoading] = useState(true);

  const runningBots = bots.filter(b => b.status === 'running');

  useEffect(() => {
    if (runningBots.length === 0) { setLoading(false); return; }
    Promise.allSettled(
      runningBots.map(b => botAPI.resources(b.id).then(r => ({ id: b.id, r })))
    ).then(results => {
      const map: Record<number, ContainerResources> = {};
      for (const res of results) {
        if (res.status === 'fulfilled') map[res.value.id] = res.value.r;
      }
      setResources(map);
    }).finally(() => setLoading(false));
  }, [bots]);

  return (
    <div className="dnc-card p-5" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.12)' }}>
          <Cpu className="w-4 h-4" style={{ color: '#a855f7' }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.resourceUsage}</h3>
          <p className="text-xs" style={{ color: 'var(--t-sub)' }}>
            {runningBots.length} instance{runningBots.length !== 1 ? 's' : ''} running
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--t-a)', borderTopColor: 'transparent' }} />
        </div>
      ) : runningBots.length === 0 ? (
        <div className="text-center py-6">
          <Cpu className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--t-m)' }} />
          <p className="text-sm" style={{ color: 'var(--t-m)' }}>{t.notRunning}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runningBots.map(bot => {
            const r = resources[bot.id];
            const cpuPct = r ? parsePercent(r.cpu) : 0;
            const memPct = r ? parsePercent(r.memPercent) : 0;

            return (
              <div key={bot.id} className="rounded-lg px-3 py-2.5" style={{ background: 'var(--t-s2)' }}>
                <p className="text-xs font-semibold mb-2 truncate" style={{ color: 'var(--t-tx)' }}>{bot.name}</p>
                <div className="space-y-1.5">
                  {/* CPU */}
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3 h-3 shrink-0" style={{ color: 'var(--t-m)' }} />
                    <span className="text-[10px] w-10 shrink-0" style={{ color: 'var(--t-m)' }}>{t.cpu}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--t-bd)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(cpuPct, 100)}%`, background: cpuPct > 80 ? '#ef4444' : cpuPct > 50 ? '#eab308' : '#22c55e' }}
                      />
                    </div>
                    <span className="text-[10px] w-10 text-right font-mono" style={{ color: 'var(--t-tx)' }}>{r?.cpu ?? '—'}</span>
                  </div>
                  {/* Memory */}
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3 shrink-0" style={{ color: 'var(--t-m)' }} />
                    <span className="text-[10px] w-10 shrink-0" style={{ color: 'var(--t-m)' }}>{t.memory}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--t-bd)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(memPct, 100)}%`, background: memPct > 80 ? '#ef4444' : memPct > 50 ? '#eab308' : '#3b82f6' }}
                      />
                    </div>
                    <span className="text-[10px] w-10 text-right font-mono" style={{ color: 'var(--t-tx)' }}>{r?.memPercent ?? '—'}</span>
                  </div>
                  {/* Network */}
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3 h-3 shrink-0" style={{ color: 'var(--t-m)' }} />
                    <span className="text-[10px] w-10 shrink-0" style={{ color: 'var(--t-m)' }}>{t.network}</span>
                    <span className="text-[10px] font-mono truncate" style={{ color: 'var(--t-tx)' }}>{r?.netIO ?? '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
