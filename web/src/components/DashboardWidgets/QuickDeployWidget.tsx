import { memo, useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import { workflowAPI, type Workflow } from '../../services/api';

interface Props {
  t: {
    quickDeploy: string;
    quickDeployDesc: string;
    lastModified: string;
    deploy: string;
    noWorkflows: string;
    noWorkflowsDesc: string;
  };
}

export default memo(function QuickDeployWidget({ t }: Props) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<number | null>(null);

  useEffect(() => {
    workflowAPI.list()
      .then(wfs => {
        // Sort by updated_at desc, take top 3
        const sorted = wfs.sort((a, b) => {
          const da = a.updated_at || a.created_at;
          const db = b.updated_at || b.created_at;
          return new Date(db).getTime() - new Date(da).getTime();
        });
        setWorkflows(sorted.slice(0, 3));
      })
      .catch(() => setWorkflows([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeploy(id: number) {
    setDeploying(id);
    try {
      await workflowAPI.deploy(id);
    } catch {
      // error handled silently
    } finally {
      setDeploying(null);
    }
  }

  function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="dnc-card p-5" style={{ background: 'var(--t-s)', borderColor: 'var(--t-bd)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
          <Rocket className="w-4 h-4" style={{ color: '#3b82f6' }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--t-tx)' }}>{t.quickDeploy}</h3>
          <p className="text-xs" style={{ color: 'var(--t-sub)' }}>{t.quickDeployDesc}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--t-a)', borderTopColor: 'transparent' }} />
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-6">
          <Rocket className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--t-m)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--t-tx)' }}>{t.noWorkflows}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--t-m)' }}>{t.noWorkflowsDesc}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workflows.map(wf => (
            <div
              key={wf.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
              style={{ background: 'var(--t-s2)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--t-tx)' }}>{wf.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--t-m)' }}>
                  {t.lastModified}: {formatDate(wf.updated_at || wf.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDeploy(wf.id)}
                disabled={deploying !== null}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: 'var(--t-a)',
                  color: 'var(--t-btn-text)',
                  opacity: deploying !== null ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!deploying) e.currentTarget.style.background = 'var(--t-ah)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--t-a)'; }}
              >
                {deploying === wf.id ? (
                  <div className="w-3 h-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Rocket className="w-3 h-3" />
                )}
                {t.deploy}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
