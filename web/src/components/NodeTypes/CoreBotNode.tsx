import { Handle, Position, type NodeProps } from 'reactflow';
import { Bot, Zap } from 'lucide-react';
import { type NodeData } from '../../constants/nodeTypes';

const HANDLE_STYLE: React.CSSProperties = {
  width: 10,
  height: 10,
  background: 'var(--t-s2)',
  border: '2px solid var(--t-m)',
  borderRadius: '50%',
};

export default function CoreBotNode({ selected }: NodeProps<NodeData>) {
  return (
    <div className="flex flex-col items-center" style={{ userSelect: 'none' }}>
      {/* Card */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'var(--t-s2)',
          border: selected ? '2px solid var(--t-a)' : '1px solid var(--t-bd)',
          boxShadow: selected
            ? '0 0 0 3px var(--t-aa), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 2px 10px rgba(0,0,0,0.45)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* Lightning badge — top-left, outside card */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: -8,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--t-a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 2px var(--t-s)',
            zIndex: 1,
          }}
        >
          <Zap style={{ width: 10, height: 10, color: '#fff' }} strokeWidth={2.5} />
        </div>

        {/* Bot icon */}
        <Bot style={{ width: 26, height: 26, color: 'var(--t-a)' }} strokeWidth={1.5} />

        {/* Source handle — right */}
        <Handle
          type="source"
          position={Position.Right}
          id="core-out"
          style={{ ...HANDLE_STYLE, right: -5, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Label */}
      <p
        style={{
          marginTop: 6,
          fontSize: 11,
          color: 'var(--t-sub)',
          textAlign: 'center',
          maxWidth: 90,
          lineHeight: 1.3,
          pointerEvents: 'none',
        }}
      >
        Core Bot
      </p>
    </div>
  );
}
