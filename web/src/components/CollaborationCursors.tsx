import { useViewport } from 'reactflow';
import type { Collaborator } from '../hooks/useCollaboration';

interface CollaborationCursorsProps {
  collaborators: Map<number, Collaborator>;
}

export default function CollaborationCursors({ collaborators }: CollaborationCursorsProps) {
  const { x: vx, y: vy, zoom } = useViewport();
  const cursors = [...collaborators.values()].filter(c => c.cursorX != null && c.cursorY != null);

  if (cursors.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1000, overflow: 'hidden' }}>
      {cursors.map(c => {
        const sx = c.cursorX! * zoom + vx;
        const sy = c.cursorY! * zoom + vy;
        const name = c.email.includes('@') ? c.email.split('@')[0] : c.email;
        return (
          <div
            key={c.userId}
            style={{
              position: 'absolute',
              left: sx,
              top: sy,
              transition: 'left 80ms linear, top 80ms linear',
              pointerEvents: 'none',
            }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
              <path d="M0 0L16 12H6L0 20V0Z" fill={c.color} />
            </svg>
            <span
              style={{
                position: 'absolute',
                left: 14,
                top: 14,
                background: c.color,
                color: '#fff',
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                whiteSpace: 'nowrap',
                lineHeight: '14px',
              }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
