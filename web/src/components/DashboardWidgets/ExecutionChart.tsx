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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--t-aa)' }}>
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.executionChart}</h3>
            <p className="text-xs" style={{ color: 'var(--t-sub)' }}>{t.executionChartDesc}</p>
          </div>
        </div>
        <div className="flex rounded-lg overflow-hidden text-xs font-medium" style={{ border: '1px solid var(--t-bd)' }}>
          <button
            onClick={() => setDays(7)}
            className="px-2.5 py-1 transition-all"
            style={{
              background: days === 7 ? 'var(--t-a)' : 'transparent',
              color: days === 7 ? 'var(--t-btn-text)' : 'var(--t-sub)',
            }}
          >
            {t.last7Days}
          </button>
          <button
            onClick={() => setDays(30)}
            className="px-2.5 py-1 transition-all"
            style={{
              background: days === 30 ? 'var(--t-a)' : 'transparent',
              color: days === 30 ? 'var(--t-btn-text)' : 'var(--t-sub)',
            }}
          >
            {t.last30Days}
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {totalCompleted} {t.completed}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {totalFailed} {t.failed}
        </span>
      </div>

      {/* Chart */}
      <div className="h-48">
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
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--t-bd)" strokeOpacity={0.5} />
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
                  background: 'var(--t-s2)',
                  border: '1px solid var(--t-bd)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--t-tx)',
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
