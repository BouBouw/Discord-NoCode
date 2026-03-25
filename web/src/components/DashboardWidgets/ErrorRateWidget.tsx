import { memo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { statsAPI, type ErrorStats as ErrorStatsData } from '../../services/api';

interface Props {
  t: {
    errorRate: string;
    errorRateDesc: string;
    totalErrors: string;
    totalExecutions: string;
    noErrors: string;
    last7Days: string;
  };
}

export default memo(function ErrorRateWidget({ t }: Props) {
  const [data, setData] = useState<ErrorStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.errors(7).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const rate = data?.errorRate ?? 0;
  const rateColor = rate === 0 ? '#22c55e' : rate < 10 ? '#eab308' : '#ef4444';

  return (
    <div className="dnc-card p-5" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: rate > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.10)' }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: rateColor }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.errorRate}</h3>
          <p className="text-xs" style={{ color: 'var(--t-sub)' }}>{t.errorRateDesc}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--t-a)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          {/* Big rate number with visual treatment */}
          <div
            className="flex items-baseline gap-2 mb-4 px-4 py-3 rounded-xl"
            style={{
              background: rate === 0 ? 'rgba(34,197,94,0.06)' : rate < 10 ? 'rgba(234,179,8,0.06)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${rate === 0 ? 'rgba(34,197,94,0.14)' : rate < 10 ? 'rgba(234,179,8,0.14)' : 'rgba(239,68,68,0.14)'}`,
              boxShadow: rate === 0 ? '0 0 16px rgba(34,197,94,0.06)' : 'none',
            }}
          >
            <span
              className="text-4xl font-bold tracking-tight"
              style={{ color: rateColor }}
            >
              {rate}%
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--t-m)' }}>{t.last7Days}</span>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg px-3 py-2" style={{ background: 'var(--t-s2)' }}>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--t-m)' }}>{t.totalErrors}</p>
              <p className="text-base font-bold" style={{ color: data?.totalErrors ? '#ef4444' : 'var(--t-tx)' }}>{data?.totalErrors ?? 0}</p>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: 'var(--t-s2)' }}>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--t-m)' }}>{t.totalExecutions}</p>
              <p className="text-base font-bold" style={{ color: 'var(--t-tx)' }}>{data?.totalExecutions ?? 0}</p>
            </div>
          </div>

          {/* Mini bar chart */}
          {data && data.daily.length > 0 && (
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.daily} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" hide />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1940',
                      border: '1px solid rgba(134,134,172,0.22)',
                      borderRadius: 8,
                      fontSize: 11,
                      color: '#FFFFFF',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                    labelFormatter={(v: any) => String(v)}
                  />
                  <Bar dataKey="errors" radius={[3, 3, 0, 0]} maxBarSize={16}>
                    {data.daily.map((entry, idx) => (
                      <Cell key={idx} fill={entry.errors > 0 ? '#ef4444' : 'rgba(134,134,172,0.18)'} fillOpacity={entry.errors > 0 ? 0.8 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
});
