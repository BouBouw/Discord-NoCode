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
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: rate > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}>
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
          {/* Big number */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold" style={{ color: rateColor }}>{rate}%</span>
            <span className="text-xs" style={{ color: 'var(--t-m)' }}>{t.last7Days}</span>
          </div>

          {/* Mini stats */}
          <div className="flex gap-4 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--t-m)' }}>{t.totalErrors}</p>
              <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{data?.totalErrors ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--t-m)' }}>{t.totalExecutions}</p>
              <p className="text-sm font-bold" style={{ color: 'var(--t-tx)' }}>{data?.totalExecutions ?? 0}</p>
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
                      background: 'var(--t-s2)',
                      border: '1px solid var(--t-bd)',
                      borderRadius: 8,
                      fontSize: 11,
                      color: 'var(--t-tx)',
                    }}
                    labelFormatter={(v: any) => String(v)}
                  />
                  <Bar dataKey="errors" radius={[3, 3, 0, 0]} maxBarSize={16}>
                    {data.daily.map((entry, idx) => (
                      <Cell key={idx} fill={entry.errors > 0 ? '#ef4444' : 'var(--t-bd)'} fillOpacity={entry.errors > 0 ? 0.8 : 0.3} />
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
