import React, { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Background,
  BackgroundVariant,
} from 'reactflow';
import type { Node, Edge, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import { Terminal, GitBranch, Send } from 'lucide-react';

/* ── Icon map ── */
const ICON_MAP: Record<string, React.ReactNode> = {
  command: <Terminal style={{ width: 14, height: 14 }} strokeWidth={2} />,
  condition: <GitBranch style={{ width: 14, height: 14 }} strokeWidth={2} />,
  send: <Send style={{ width: 14, height: 14 }} strokeWidth={2} />,
};

const ICON_COLORS: Record<string, string> = {
  command: '#4a9eff',
  condition: '#a855f7',
  send: '#22c55e',
};

/* ── Mini Node component ── */
function MiniNode({ data }: NodeProps) {
  const color = ICON_COLORS[data.iconKey as string] || '#4a9eff';
  const dark = data.dark as boolean;

  return (
    <div style={{
      background: dark ? '#161616' : '#FFFFFF',
      border: `1px solid ${dark ? '#2a2a2a' : '#E4E7EB'}`,
      borderRadius: 14,
      padding: '10px 14px',
      minWidth: 140,
      boxShadow: dark
        ? '0 2px 12px rgba(0,0,0,0.5)'
        : '0 2px 12px rgba(0,0,0,0.08)',
      cursor: 'grab',
      transition: 'box-shadow 0.15s ease',
    }}>
      <Handle type="target" position={Position.Left} style={{
        width: 8, height: 8, background: dark ? '#161616' : '#fff',
        border: `2px solid ${dark ? '#484F58' : '#CBD0D7'}`, borderRadius: '50%',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${color}18`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {ICON_MAP[data.iconKey as string]}
        </div>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: dark ? '#F0F6FC' : '#1A1D23',
            lineHeight: 1.2,
          }}>
            {data.label as string}
          </div>
          <div style={{
            fontSize: 9, fontWeight: 500,
            color: dark ? '#484F58' : '#94A3B8',
            lineHeight: 1.3, marginTop: 1,
          }}>
            {data.sub as string}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{
        width: 8, height: 8, background: dark ? '#161616' : '#fff',
        border: `2px solid ${dark ? '#484F58' : '#CBD0D7'}`, borderRadius: '50%',
      }} />
    </div>
  );
}

const nodeTypes = { mini: MiniNode };

/* ── Sample data factory ── */
function makeNodes(dark: boolean): Node[] {
  return [
    { id: '1', type: 'mini', position: { x: 0, y: 50 }, data: { label: 'Command Handler', sub: '/welcome', iconKey: 'command', dark } },
    { id: '2', type: 'mini', position: { x: 230, y: 50 }, data: { label: 'Check Role', sub: 'Condition', iconKey: 'condition', dark } },
    { id: '3', type: 'mini', position: { x: 460, y: 50 }, data: { label: 'Send Message', sub: '#general', iconKey: 'send', dark } },
  ];
}

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#4a9eff', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
];

/* ── Main component ── */
export default function HeroWorkflowPreview({ dark }: { dark: boolean }) {
  const [nodes, , onNodesChange] = useNodesState(makeNodes(dark));
  const [edges] = useEdgesState(initialEdges);

  // Keep dark prop in sync
  const syncedNodes = nodes.map(n => ({
    ...n,
    data: { ...n.data, dark },
  }));

  const noop = useCallback(() => {}, []);

  return (
    <div style={{
      width: '100%', height: 340, borderRadius: 20, overflow: 'hidden',
      border: `1px solid ${dark ? '#1c1c1c' : '#E4E7EB'}`,
      boxShadow: dark
        ? '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,82,255,0.08)'
        : '0 24px 80px rgba(0,0,0,0.12)',
      background: dark ? '#0a0a0a' : '#F5F7FA',
    }}>
      <ReactFlow
        nodes={syncedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={noop}
        onConnect={noop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color={dark ? '#1c1c1c' : '#d0d5e0'}
        />
      </ReactFlow>
    </div>
  );
}
