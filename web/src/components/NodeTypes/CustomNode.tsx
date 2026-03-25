import { Handle, Position, type NodeProps } from 'reactflow';
import type { LucideIcon } from 'lucide-react';
import { type NodeData, NODE_TYPES } from '../../constants/nodeTypes';

// Node category → icon colour in dark theme
const ICON_COLORS: Record<string, string> = {
  blue:         '#4a9eff',
  purple:       '#a855f7',
  green:        '#22c55e',
  orange:       '#e8643a',
  teal:         '#2dd4bf',
  rose:         '#fb7185',
  'indigo-600': '#818cf8',
  'amber-600':  '#fbbf24',
  violet:       '#8b5cf6',
  pink:         '#ec4899',
  sky:          '#38bdf8',
};

const HANDLE_STYLE: React.CSSProperties = {
  width: 10,
  height: 10,
  background: 'var(--t-s2)',
  border: '2px solid var(--t-m)',
  borderRadius: '50%',
};

/** Minimal inline markdown renderer for canvas note cards. */
function renderInlineMd(text: string): React.ReactNode {
  const lines = text.split('\n').slice(0, 6); // max 6 lines on canvas
  return lines.map((line, li) => {
    const parts: React.ReactNode[] = [];
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+?)`)/g;
    let last = 0; let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
      else if (m[4]) parts.push(<code key={m.index} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 3, padding: '0 2px', fontFamily: 'monospace' }}>{m[4]}</code>);
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return <div key={li}>{parts.length ? parts : (line || <br />)}</div>;
  });
}

export default function CustomNode({ data, selected }: NodeProps<NodeData>) {
  const iconColor = ICON_COLORS[data.color ?? ''] ?? '#888';
  const nodeConfig = NODE_TYPES[data.type];
  const outputs = nodeConfig?.outputs ?? [{ id: 'output', label: '', type: 'source' as const }];
  const multiOut = outputs.length > 1;
  const cardH = multiOut ? Math.max(64, outputs.length * 30 + 16) : 64;
  const Icon = data.icon as LucideIcon | undefined;

  const settings = (data.config as any)?._settings;
  const noteVisible = settings?.displayNoteInFlow && settings?.notes;
  const rawNoteBg = settings?.noteBgColor || 'var(--t-s2)';
  // Convert to rgba with 70 % opacity for a translucent look
  const noteBgColor = (() => {
    const hex = rawNoteBg.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.70)`;
  })();

  const OVERHANG = 8;  // px the note bg peeks out beyond each side of the card
  const PAD_V    = 6;  // px the note bg extends above the card top / below note text

  return (
    <div className="flex flex-col items-center" style={{ userSelect: 'none', position: 'relative', width: 64 }}>
      {/* Note background — absolutely positioned, extends OVERHANG px beyond the card sides */}
      {noteVisible && (
        <div
          style={{
            position: 'absolute',
            top:    -PAD_V,
            bottom: -PAD_V,
            left:   -OVERHANG,
            right:  -OVERHANG,
            borderRadius: 14,
            background: noteBgColor,
            border: '1px solid rgba(255,255,255,0.10)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Card */}
      <div
        className="relative flex items-center justify-center"
        style={{
          position: 'relative',
          zIndex: 1,
          width: 64,
          height: cardH,
          borderRadius: 16,
          background: 'var(--t-s2)',
          border: selected ? '2px solid var(--t-a)' : '1px solid var(--t-bd)',
          boxShadow: selected
            ? '0 0 0 3px var(--t-aa), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 2px 10px rgba(0,0,0,0.45)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* Input handle — left centre */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{ ...HANDLE_STYLE, left: -5, top: '50%', transform: 'translateY(-50%)' }}
        />

        {/* Icon */}
        {Icon && (
          <Icon
            style={{ width: 26, height: 26, color: iconColor, flexShrink: 0 }}
            strokeWidth={1.5}
          />
        )}

        {/* Output handle(s) — right side */}
        {outputs.map((out, i) => {
          const topPct = multiOut
            ? `${((i + 1) / (outputs.length + 1)) * 100}%`
            : '50%';
          return (
            <Handle
              key={out.id}
              type="source"
              position={Position.Right}
              id={out.id}
              style={{ ...HANDLE_STYLE, right: -5, top: topPct, transform: 'translateY(-50%)' }}
            />
          );
        })}

        {/* Multi-output labels positioned outside card right */}
        {multiOut && outputs.map((out, i) => {
          const topPct = ((i + 1) / (outputs.length + 1)) * 100;
          return (
            <span
              key={out.id + '-label'}
              style={{
                position: 'absolute',
                right: -52,
                top: `${topPct}%`,
                transform: 'translateY(-50%)',
                fontSize: 10,
                color: 'var(--t-sub)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {out.label}
            </span>
          );
        })}
      </div>

      {/* Label below card */}
      <p
        style={{
        position: 'relative',
        zIndex: 1,
        marginTop: 6,
        fontSize: 11,
        color: 'var(--t-sub)',
        textAlign: 'center',
        maxWidth: 90,
        lineHeight: 1.3,
        wordBreak: 'break-word',
        pointerEvents: 'none',
      }}
    >
      {data.label}
    </p>

    {/* Note text — sits inside the note background layer */}
    {noteVisible && (
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          marginTop: 4,
          padding: '0 2px 2px',
            pointerEvents: 'none',
            wordBreak: 'break-word',
          }}
        >
          {renderInlineMd(settings.notes)}
        </div>
      )}
    </div>
  );
}
