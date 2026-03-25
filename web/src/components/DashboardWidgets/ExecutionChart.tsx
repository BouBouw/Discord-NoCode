import { memo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { statsAPI, type ExecutionDayStats } from '../../services/api';
import { BarChart3 } from 'lucide-react';

interface Props {
  t: {
    executionChart: string;
    executionChartDesc: string;
    last7Days: string;
    last30Days: string;
    completed: string;
    failed: string;
    executions: string;
  };
}

export default memo(function ExecutionChart({ t }: Props) {
  const [data, setData] = useState<ExecutionDayStats[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    statsAPI.executions(days).then(setData).catch(() => setData([])).finally(() => setLoading(false));
  }, [days]);

  const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
  const totalFailed = data.reduce((s, d) => s + d.failed, 0);

  return (
    <div className="dnc-card p-5" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(134,134,172,0.12)' }}>
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.executionChart}</h3>
            <p className="text-xs" style={{ color: 'var(--t-sub)' }}>{t.executionChartDesc}</p>
          </div>
        </div>
        {/* Period toggle – pill style */}
        <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'var(--t-s2)' }}>
          <button
            onClick={() => setDays(7)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: days === 7 ? 'var(--t-a)' : 'transparent',
              color: days === 7 ? '#FFFFFF' : 'var(--t-sub)',
            }}
          >
            {t.last7Days}
          </button>
          <button
            onClick={() => setDays(30)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: days === 30 ? 'var(--t-a)' : 'transparent',
              color: days === 30 ? '#FFFFFF' : 'var(--t-sub)',
            }}
          >
            {t.last30Days}
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.10)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.18)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
          {totalCompleted} {t.completed}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
          {totalFailed} {t.failed}
        </span>
      </div>

      {/* Chart – slightly taller */}
      <div className="h-52">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--t-a)', borderTopColor: 'transparent' }} />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--t-m)' }}>
            {t.executions}: 0
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-bd)" strokeOpacity={0.4} />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => v.slice(5)}
                tick={{ fill: 'var(--t-m)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'var(--t-m)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1940',
                  border: '1px solid rgba(134,134,172,0.22)',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#FFFFFF',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                labelFormatter={(v: any) => String(v)}
              />
              <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#gradCompleted)" strokeWidth={2} />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="url(#gradFailed)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
