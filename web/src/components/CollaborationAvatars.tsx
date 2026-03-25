import type { Collaborator } from '../hooks/useCollaboration';
import { useTranslation } from '../hooks/useTranslation';

interface CollaborationAvatarsProps {
  collaborators: Map<number, Collaborator>;
}

export default function CollaborationAvatars({ collaborators }: CollaborationAvatarsProps) {
  const { t } = useTranslation();
  const users = [...collaborators.values()];
  if (users.length === 0) return null;

  return (
    <div className="flex items-center ml-2">
      <div className="flex -space-x-1.5">
        {users.slice(0, 5).map(u => {
          const initial = u.email[0].toUpperCase();
          return (
            <div
              key={u.userId}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: u.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: '#fff',
                border: '2px solid var(--t-bg)',
                flexShrink: 0,
              }}
              title={u.email}
            >
              {initial}
            </div>
          );
        })}
        {users.length > 5 && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--t-s2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--t-m)',
              border: '2px solid var(--t-bg)',
              flexShrink: 0,
            }}
          >
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs ml-1.5" style={{ color: 'var(--t-m)' }}>
        {users.length} {t.workflow.collaboratorsOnline}
      </span>
    </div>
  );
}
