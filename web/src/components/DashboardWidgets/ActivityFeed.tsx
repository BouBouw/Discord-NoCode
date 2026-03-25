import { memo, useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, PlayCircle, Power, PowerOff, AlertTriangle } from 'lucide-react';
import { statsAPI, type ActivityItem } from '../../services/api';

interface Props {
  t: {
    activityFeed: string;
    activityFeedDesc: string;
    noActivity: string;
    noActivityDesc: string;
    executionCompleted: string;
    executionFailed: string;
    executionRunning: string;
    botStarted: string;
    botStopped: string;
    botErrored: string;
    timeAgo: string;
  };
}

function timeAgo(ts: string, label: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return `<1 min ${label}`;
  if (mins < 60) return `${mins}m ${label}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${label}`;
  const days = Math.floor(hours / 24);
  return `${days}d ${label}`;
}

function getActivityMeta(item: ActivityItem, t: Props['t']) {
  if (item.type === 'execution') {
    switch (item.status) {
      case 'completed': return { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', text: t.executionCompleted };
      case 'failed': return { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', text: t.executionFailed };
      default: return { icon: PlayCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', text: t.executionRunning };
    }
  }
  // bot_status
  switch (item.status) {
    case 'active': return { icon: Power, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', text: t.botStarted };
    case 'stopped': return { icon: PowerOff, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', text: t.botStopped };
    case 'errored': return { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', text: t.botErrored };
    default: return { icon: Power, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', text: t.botStopped };
  }
}

export default memo(function ActivityFeed({ t }: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.activity(8).then(setActivities).catch(() => setActivities([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dnc-card p-5" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--t-aa)' }}>
          <Activity className="w-4 h-4" style={{ color: 'var(--t-a)' }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.activityFeed}</h3>
          <p className="text-xs" style={{ color: 'var(--t-sub)' }}>{t.activityFeedDesc}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--t-a)', borderTopColor: 'transparent' }} />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--t-m)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{t.noActivity}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--t-m)' }}>{t.noActivityDesc}</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
          {activities.map((item, i) => {
            const meta = getActivityMeta(item, t);
            const Icon = meta.icon;
            return (
              <div
                key={`${item.type}-${item.botId}-${item.timestamp}-${i}`}
                className="flex items-start gap-3 rounded-lg px-2.5 py-2 transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--t-s2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: meta.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--t-tx)' }}>{meta.text}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--t-m)' }}>
                    {item.botName}{item.workflowName ? ` · ${item.workflowName}` : ''}
                  </p>
                </div>
                <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--t-m)' }}>
                  {timeAgo(item.timestamp, t.timeAgo)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
