import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Bot, User, Loader2, Sparkles, Undo2, Check, AlertCircle,
  ChevronDown, ChevronRight, Eye, EyeOff, Trash2, Info,
} from 'lucide-react';
import type { Node, Edge } from 'reactflow';
import type { NodeData, NodeType } from '../constants/nodeTypes';
import { NODE_TYPES } from '../constants/nodeTypes';
import { apiRequest } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AIAction {
  type: 'add_node' | 'edit_node' | 'delete_node' | 'add_edge' | 'delete_edge';
  // add_node
  nodeType?: NodeType;
  tempId?: string;
  position?: { x: number; y: number };
  // edit_node / delete_node
  nodeId?: string;
  config?: Record<string, any>;
  // add_edge / delete_edge
  source?: string;
  target?: string;
  sourceHandle?: string;
  targetHandle?: string;
  edgeId?: string;
}

interface AIPreviewNode {
  id: string;
  type: NodeType;
  label: string;
  config?: Record<string, any>;
}

interface AIReply {
  text: string;
  actions?: AIAction[];
  preview?: AIPreviewNode[];
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  parsed?: AIReply;
  applied?: boolean;
  error?: string;
}

export interface AIChatPanelProps {
  workflowId?: string;
  workflowName?: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode?: Node<NodeData> | null;
  onApplyActions: (actions: AIAction[]) => void;
  onRestoreSnapshot: (nodes: Node<NodeData>[], edges: Edge[]) => void;
}

// ── Color map ─────────────────────────────────────────────────────────────────

const NODE_COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6', orange: '#e8643a', green: '#22c55e', red: '#ef4444',
  purple: '#a855f7', pink: '#ec4899', yellow: '#eab308', indigo: '#6366f1',
  cyan: '#06b6d4', gray: '#6b7280', violet: '#8b5cf6', rose: '#f43f5e',
  emerald: '#10b981', teal: '#14b8a6', sky: '#0ea5e9', amber: '#f59e0b',
};

function getNodeColor(colorName: string): string {
  return NODE_COLOR_MAP[colorName] || '#6b7280';
}

// ── Simple markdown renderer ──────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf('**');
    const codeIdx = remaining.indexOf('`');
    const first = Math.min(
      boldIdx >= 0 ? boldIdx : Infinity,
      codeIdx >= 0 ? codeIdx : Infinity,
    );

    if (first === Infinity) {
      parts.push(<React.Fragment key={idx++}>{remaining}</React.Fragment>);
      break;
    }

    if (first > 0) {
      parts.push(<React.Fragment key={idx++}>{remaining.slice(0, first)}</React.Fragment>);
      remaining = remaining.slice(first);
    }

    if (remaining.startsWith('**')) {
      const end = remaining.indexOf('**', 2);
      if (end === -1) { parts.push(<React.Fragment key={idx++}>{remaining}</React.Fragment>); break; }
      parts.push(<strong key={idx++} style={{ color: 'var(--t-tx)', fontWeight: 600 }}>{remaining.slice(2, end)}</strong>);
      remaining = remaining.slice(end + 2);
    } else {
      const end = remaining.indexOf('`', 1);
      if (end === -1) { parts.push(<React.Fragment key={idx++}>{remaining}</React.Fragment>); break; }
      parts.push(
        <code key={idx++} className="px-1 py-0.5 rounded text-[11px]"
          style={{ background: 'var(--t-s2)', color: 'var(--t-a)', fontFamily: 'monospace' }}>
          {remaining.slice(1, end)}
        </code>
      );
      remaining = remaining.slice(end + 1);
    }
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function MarkdownText({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-0.5 my-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    if (!line.trim()) {
      flushList();
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<p key={i} className="text-[11px] font-bold mt-2 mb-0.5" style={{ color: 'var(--t-tx)' }}>{renderInline(line.slice(4))}</p>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<p key={i} className="text-[11px] font-bold mt-2 mb-0.5" style={{ color: 'var(--t-a)' }}>{renderInline(line.slice(3))}</p>);
    } else if (line.match(/^[-•*] /)) {
      listItems.push(
        <li key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: 'var(--t-sub)' }}>
          <span className="shrink-0 mt-0.5" style={{ color: 'var(--t-m)' }}>•</span>
          <span>{renderInline(line.slice(2))}</span>
        </li>
      );
    } else {
      flushList();
      elements.push(<p key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--t-sub)' }}>{renderInline(line)}</p>);
    }
  });
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

// ── Mini workflow canvas preview ──────────────────────────────────────────────

const NODE_W = 130;
const NODE_H = 48;
const H_GAP = 60;
const V_GAP = 16;

interface CanvasNode {
  id: string;
  type: string;
  label: string;
  color: string;
  x: number;
  y: number;
  isNew: boolean;
  isExisting?: boolean;
}

interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

function AIWorkflowPreview({
  actions,
  existingNodes,
}: {
  actions: AIAction[];
  existingNodes: Node<NodeData>[];
}) {
  const { t } = useTranslation();
  // ── Build node set ────────────────────────────────────────────────────────
  const addNodeActions = actions.filter(a => a.type === 'add_node' && a.nodeType && a.tempId);
  const addEdgeActions = actions.filter(a => a.type === 'add_edge' && a.source && a.target);

  // IDs referenced in edges that are existing nodes
  const referencedExistingIds = new Set<string>();
  for (const ea of addEdgeActions) {
    if (ea.source && !addNodeActions.find(n => n.tempId === ea.source)) referencedExistingIds.add(ea.source);
    if (ea.target && !addNodeActions.find(n => n.tempId === ea.target)) referencedExistingIds.add(ea.target);
  }

  // Collect all canvas nodes
  const rawNodes: Omit<CanvasNode, 'x' | 'y'>[] = [];

  for (const id of referencedExistingIds) {
    const found = existingNodes.find(n => n.id === id);
    if (found) {
      const cfg = NODE_TYPES[found.data.type];
      rawNodes.push({
        id,
        type: found.data.type,
        label: found.data.label,
        color: getNodeColor(cfg?.color ?? 'gray'),
        isNew: false,
        isExisting: true,
      });
    }
  }
  for (const a of addNodeActions) {
    const cfg = NODE_TYPES[a.nodeType!];
    rawNodes.push({
      id: a.tempId!,
      type: a.nodeType!,
      label: (a.config?.label as string) || a.nodeType!,
      color: getNodeColor(cfg?.color ?? 'gray'),
      isNew: true,
    });
  }

  // ── Topological layout (column = longest-path depth) ─────────────────────
  const depth: Record<string, number> = {};
  const getDepth = (id: string, visited = new Set<string>()): number => {
    if (id in depth) return depth[id];
    if (visited.has(id)) return 0;
    visited.add(id);
    const incomers = addEdgeActions.filter(e => e.target === id).map(e => e.source!);
    const d = incomers.length === 0 ? 0 : Math.max(...incomers.map(s => getDepth(s, visited) + 1));
    depth[id] = d;
    return d;
  };
  rawNodes.forEach(n => getDepth(n.id));

  // Group by column
  const columns: string[][] = [];
  for (const n of rawNodes) {
    const col = depth[n.id] || 0;
    if (!columns[col]) columns[col] = [];
    columns[col].push(n.id);
  }

  const nodes: CanvasNode[] = rawNodes.map(n => {
    const col = depth[n.id] || 0;
    const row = columns[col].indexOf(n.id);
    return {
      ...n,
      x: col * (NODE_W + H_GAP),
      y: row * (NODE_H + V_GAP),
    };
  });

  const totalCols = columns.length;
  const maxRows = Math.max(...columns.map(c => c?.length ?? 0), 1);
  const svgW = totalCols * (NODE_W + H_GAP) - H_GAP + 4;
  const svgH = maxRows * (NODE_H + V_GAP) - V_GAP + 4;

  if (nodes.length === 0) return null;

  const canvasEdges: CanvasEdge[] = addEdgeActions.map((a, i) => ({
    id: `ce_${i}`,
    source: a.source!,
    target: a.target!,
    label: a.sourceHandle || undefined,
  }));

  const getNode = (id: string) => nodes.find(n => n.id === id);

  return (
    <div
      className="rounded-lg overflow-auto"
      style={{ background: 'var(--t-bg)', border: '1px solid var(--t-bd)', padding: '10px' }}
    >
      <div style={{ position: 'relative', width: svgW, minWidth: '100%', height: svgH + 4 }}>
        {/* SVG edges layer */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: svgW, height: svgH + 4, overflow: 'visible', pointerEvents: 'none' }}
        >
          <defs>
            <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--t-a)" opacity="0.5" />
            </marker>
          </defs>
          {canvasEdges.map(e => {
            const s = getNode(e.source);
            const tgt = getNode(e.target);
            if (!s || !tgt) return null;
            const x1 = s.x + NODE_W + 2;
            const y1 = s.y + NODE_H / 2 + 2;
            const x2 = tgt.x + 2;
            const y2 = tgt.y + NODE_H / 2 + 2;
            const cx = (x1 + x2) / 2;
            return (
              <g key={e.id}>
                <path
                  d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke="var(--t-a)" opacity="0.4"
                  strokeWidth="1.5"
                  markerEnd="url(#arr)"
                />
                {e.label && e.label !== 'output' && (
                  <text
                    x={cx}
                    y={(y1 + y2) / 2 - 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="var(--t-a)"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Node cards */}
        {nodes.map(n => {
          const cfg = NODE_TYPES[n.type as NodeType];
          const Icon = cfg?.icon;
          return (
            <div
              key={n.id}
              style={{
                position: 'absolute',
                left: n.x + 2,
                top: n.y + 2,
                width: NODE_W,
                height: NODE_H,
                borderRadius: 8,
                background: 'var(--t-s)',
                border: `1px solid ${n.color}50`,
                borderLeft: `3px solid ${n.color}`,
                boxShadow: n.isNew ? `0 0 0 1px ${n.color}20` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 8px',
                overflow: 'hidden',
              }}
            >
              {Icon && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: `${n.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: n.color, display: 'flex' }}>
                    <Icon className="w-3 h-3" />
                  </span>
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--t-tx)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {n.label}
                </div>
                <div style={{ fontSize: 8, color: 'var(--t-m)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {n.isNew ? <span style={{ color: '#22c55e' }}>{t.aiChat.newLabel}</span> : null}
                  {n.type}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Action helpers ──────────────────────────────────────────────────────────

function actionBadgeColor(type: AIAction['type']): string {
  if (type === 'add_node' || type === 'add_edge') return '#22c55e';
  if (type === 'delete_node' || type === 'delete_edge') return '#ef4444';
  return 'var(--t-a)';
}

function actionBadgeLabel(type: AIAction['type'], t: ReturnType<typeof import('../hooks/useTranslation').useTranslation>['t']): string {
  return { add_node: t.aiChat.addNode, edit_node: t.aiChat.editNode, delete_node: t.aiChat.deleteNode, add_edge: t.aiChat.addEdge, delete_edge: t.aiChat.deleteEdge }[type] ?? type;
}

function describeAction(a: AIAction, nodes: Node<NodeData>[], t: ReturnType<typeof import('../hooks/useTranslation').useTranslation>['t']): string {
  const getLabel = (id?: string) => {
    if (!id) return '?';
    const found = nodes.find(n => n.id === id);
    return found ? `"${found.data.label}"` : id;
  };
  if (a.type === 'add_node') return t.aiChat.addNodeDesc.replace('{nodeType}', a.nodeType || '').replace('{tempId}', a.tempId ? ` (id: ${a.tempId})` : '');
  if (a.type === 'edit_node') return t.aiChat.editNodeDesc.replace('{label}', getLabel(a.nodeId)).replace('{keys}', Object.keys(a.config || {}).join(', '));
  if (a.type === 'delete_node') return t.aiChat.deleteNodeDesc.replace('{label}', getLabel(a.nodeId));
  if (a.type === 'add_edge') return t.aiChat.addEdgeDesc.replace('{source}', getLabel(a.source)).replace('{target}', getLabel(a.target)).replace('{handle}', a.sourceHandle || 'success');
  if (a.type === 'delete_edge') return t.aiChat.deleteEdgeDesc.replace('{edgeId}', a.edgeId || '?');
  return JSON.stringify(a);
}

function countActionSummary(actions: AIAction[]): Array<{ type: AIAction['type']; count: number }> {
  const map = new Map<AIAction['type'], number>();
  for (const a of actions) map.set(a.type, (map.get(a.type) || 0) + 1);
  return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
}

// ── Suggestion chips ─────────────────────────────────────────────────────────

function getSuggestions(t: ReturnType<typeof import('../hooks/useTranslation').useTranslation>['t']) {
  return [
    t.aiChat.suggestionAnalyze,
    t.aiChat.suggestionAddCommand,
    t.aiChat.suggestionWelcome,
    t.aiChat.suggestionDebug,
    t.aiChat.suggestionExplain,
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AIChatPanel({
  workflowId,
  workflowName,
  nodes,
  edges,
  selectedNode,
  onApplyActions,
  onRestoreSnapshot,
}: AIChatPanelProps) {
  const storageKey = `ai_chat_${workflowId || 'new'}`;
  const { t } = useTranslation();

  const [messages, setMessages] = useState<AIMessage[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSelection, setUseSelection] = useState(false);
  // Set of expanded collapsible sections keyed by "preview_<msgId>" or "actions_<msgId>"
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Count for re-render when historyStack changes
  const [historyLen, setHistoryLen] = useState(0);

  const historyStack = useRef<Array<{ nodes: Node<NodeData>[]; edges: Edge[]; label: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages to localStorage (keep last 80)
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages.slice(-80))); }
    catch { /* storage full */ }
  }, [messages, storageKey]);

  // Auto-scroll on new messages / loading change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleExpand = (key: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  // Build workflow context for the API call
  const buildWorkflowContext = useCallback(() => {
    const contextNodes = (useSelection && selectedNode) ? [selectedNode] : nodes;
    return {
      name: workflowName || t.aiChat.untitledWorkflow,
      nodes: contextNodes.map(n => ({
        id: n.id,
        type: n.data.type,
        label: n.data.label,
        config: n.data.config ?? {},
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
    };
  }, [nodes, edges, selectedNode, useSelection, workflowName]);

  const sendMessage = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || loading) return;

    const userMsg: AIMessage = { id: `u_${Date.now()}`, role: 'user', content: text, ts: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const resp = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          workflow: buildWorkflowContext(),
          selectedNodeId: (useSelection && selectedNode) ? selectedNode.id : undefined,
        }),
      });

      const parsed: AIReply = resp.reply ?? { text: t.aiChat.invalidResponse };
      const aiMsg: AIMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: parsed.text || '',
        ts: Date.now(),
        parsed,
        applied: false,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: err?.message || t.aiChat.communicationError,
        ts: Date.now(),
        error: err?.message ?? 'unknown',
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, buildWorkflowContext, useSelection, selectedNode]);

  const handleApply = useCallback((msgId: string, actions: AIAction[]) => {
    // Snapshot current state for undo
    historyStack.current.push({ nodes: [...nodes], edges: [...edges], label: new Date().toLocaleTimeString() });
    setHistoryLen(historyStack.current.length);

    onApplyActions(actions);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } : m));
  }, [nodes, edges, onApplyActions]);

  const handleUndo = useCallback(() => {
    const snapshot = historyStack.current.pop();
    setHistoryLen(historyStack.current.length);
    if (snapshot) onRestoreSnapshot(snapshot.nodes, snapshot.edges);
  }, [onRestoreSnapshot]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const autoResizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--t-bg)' }}>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-1 shrink-0" style={{ borderBottom: '1px solid var(--t-bd)' }}>
        <Sparkles className="w-3 h-3 shrink-0" style={{ color: 'var(--t-a)' }} />
        <span className="text-[11px] font-semibold mr-auto" style={{ color: 'var(--t-sub)' }}>
          {t.aiChat.toolbarTitle}{selectedNode ? ` · ${selectedNode.data.label}` : ''}
        </span>

        {/* Focus on selected node toggle */}
        {selectedNode && (
          <button
            onClick={() => setUseSelection(v => !v)}
            title={useSelection ? t.aiChat.contextNodeOnly : t.aiChat.contextFullWorkflow}
            className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition"
            style={{
              background: useSelection ? 'var(--t-aa)' : '',
              color: useSelection ? 'var(--t-a)' : 'var(--t-m)',
              border: `1px solid ${useSelection ? 'var(--t-aa)' : 'var(--t-bd)'}`,
            }}
          >
            {useSelection ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {t.aiChat.selectionLabel}
          </button>
        )}

        {/* Undo button */}
        {historyLen > 0 && (
          <button
            onClick={handleUndo}
            title={t.aiChat.undoTooltip}
            className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition"
            style={{ color: 'var(--t-m)', border: '1px solid var(--t-bd)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--t-tx)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--t-m)')}
          >
            <Undo2 className="w-3 h-3" />
            {t.aiChat.undoLabel} ({historyLen})
          </button>
        )}

        {/* Clear chat */}
        <button
          onClick={() => { if (confirm(t.aiChat.clearConfirm)) setMessages([]); }}
          title={t.aiChat.clearTooltip}
          className="p-1 rounded transition"
          style={{ color: 'var(--t-m)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--t-tx)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--t-m)')}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 min-h-0">

        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center gap-3 text-center py-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--t-a)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--t-tx)' }}>{t.aiChat.emptyTitle}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--t-m)' }}>
                {t.aiChat.emptyDescription.split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>)}
              </p>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {getSuggestions(t).map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] px-2.5 py-1 rounded-full transition"
                  style={{ background: 'var(--t-s)', color: 'var(--t-sub)', border: '1px solid var(--t-bd)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--t-aa)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-a)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--t-bd)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-sub)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: msg.role === 'user' ? 'var(--t-aa)' : 'var(--t-s)', border: `1px solid ${msg.role === 'user' ? 'var(--t-aa)' : 'var(--t-bd)'}` }}
            >
              {msg.role === 'user'
                ? <User className="w-3 h-3" style={{ color: 'var(--t-a)' }} />
                : <Bot className="w-3 h-3" style={{ color: 'var(--t-sub)' }} />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[88%] min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className="rounded-xl px-3 py-2 min-w-0"
                style={
                  msg.role === 'user'
                    ? { background: 'color-mix(in srgb, var(--t-a) 7%, transparent)', border: '1px solid color-mix(in srgb, var(--t-a) 15%, transparent)', borderRadius: '12px 4px 12px 12px' }
                    : msg.error
                      ? { background: 'color-mix(in srgb, #ef4444 10%, var(--t-bg))', border: '1px solid color-mix(in srgb, #ef4444 25%, transparent)', borderRadius: '4px 12px 12px 12px' }
                      : { background: 'var(--t-s)', border: '1px solid var(--t-bd)', borderRadius: '4px 12px 12px 12px' }
                }
              >
                {/* ─ User message ─ */}
                {msg.role === 'user' && (
                  <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--t-tx)' }}>{msg.content}</p>
                )}

                {/* ─ Error message ─ */}
                {msg.role === 'assistant' && msg.error && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <p className="text-[11px] leading-relaxed" style={{ color: '#f87171' }}>{msg.content}</p>
                  </div>
                )}

                {/* ─ AI message ─ */}
                {msg.role === 'assistant' && !msg.error && msg.parsed && (
                  <div className="space-y-2.5">

                    {/* Explanation text */}
                    {msg.parsed.text && <MarkdownText text={msg.parsed.text} />}

                    {/* ── Workflow canvas preview ── */}
                    {msg.parsed.actions && msg.parsed.actions.length > 0 && (
                      (() => {
                        const hasNodes = msg.parsed.actions.some(a => a.type === 'add_node');
                        const hasEdges = msg.parsed.actions.some(a => a.type === 'add_edge');
                        if (!hasNodes && !hasEdges) return null;
                        return (
                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--t-bd)' }}>
                            <button
                              onClick={() => toggleExpand(`preview_${msg.id}`)}
                              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] transition"
                              style={{ background: 'var(--t-bg)', color: 'var(--t-sub)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--t-s)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'var(--t-bg)')}
                            >
                              {expanded.has(`preview_${msg.id}`)
                                ? <ChevronDown className="w-3 h-3" />
                                : <ChevronRight className="w-3 h-3" />}
                              <span className="font-medium" style={{ color: 'var(--t-sub)' }}>
                                {t.aiChat.canvasPreview}
                              </span>
                            </button>
                            {expanded.has(`preview_${msg.id}`) && (
                              <div className="p-2" style={{ background: 'var(--t-bg)' }}>
                                <AIWorkflowPreview actions={msg.parsed.actions} existingNodes={nodes} />
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}

                    {/* ── Actions block ── */}
                    {msg.parsed.actions && msg.parsed.actions.length > 0 && (
                      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--t-bd)', background: 'var(--t-bg)' }}>
                        {/* Header: chips + apply button */}
                        <div className="flex items-center flex-wrap gap-1.5 px-2.5 py-2" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                            {countActionSummary(msg.parsed.actions).map(({ type, count }) => (
                              <span
                                key={type}
                                className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-medium"
                                style={{ background: `${actionBadgeColor(type)}18`, color: actionBadgeColor(type), border: `1px solid ${actionBadgeColor(type)}30` }}
                              >
                                {count}× {actionBadgeLabel(type, t)}
                              </span>
                            ))}
                          </div>

                          {msg.applied ? (
                            <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: '#34d399' }}>
                              <Check className="w-3 h-3" /> {t.aiChat.applied}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApply(msg.id, msg.parsed!.actions!)}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium transition shrink-0"
                              style={{ background: 'var(--t-a)', color: 'var(--t-btn-text)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--t-ah)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'var(--t-a)')}
                            >
                              <Check className="w-3 h-3" /> {t.aiChat.apply}
                            </button>
                          )}
                        </div>

                        {/* Collapsible details */}
                        <button
                          onClick={() => toggleExpand(`actions_${msg.id}`)}
                          className="w-full flex items-center gap-1.5 px-2.5 py-1 text-[10px] transition"
                          style={{ color: 'var(--t-m)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--t-sub)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--t-m)')}
                        >
                          {expanded.has(`actions_${msg.id}`)
                            ? <ChevronDown className="w-3 h-3" />
                            : <ChevronRight className="w-3 h-3" />}
                          {t.aiChat.detailsOf} {msg.parsed.actions.length} {msg.parsed.actions.length > 1 ? t.aiChat.modifications : t.aiChat.modification}
                        </button>

                        {expanded.has(`actions_${msg.id}`) && (
                          <div className="px-2.5 pb-2 space-y-1">
                            {msg.parsed.actions.map((a, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <span
                                  className="shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold mt-0.5"
                                  style={{ background: actionBadgeColor(a.type), color: 'var(--t-btn-text)' }}
                                >
                                  {a.type.startsWith('add') ? '+' : a.type.startsWith('delete') ? '×' : '~'}
                                </span>
                                <span className="text-[10px] leading-relaxed" style={{ color: 'var(--t-sub)' }}>
                                  {describeAction(a, nodes, t)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ─ Fallback (no parsed) ─ */}
                {msg.role === 'assistant' && !msg.error && !msg.parsed && (
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--t-sub)' }}>{msg.content}</p>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[9px] px-1" style={{ color: 'var(--t-bd)' }}>
                {new Date(msg.ts).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}>
              <Bot className="w-3 h-3" style={{ color: 'var(--t-sub)' }} />
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', borderRadius: '4px 12px 12px 12px' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--t-a)' }} />
              <span className="text-[11px]" style={{ color: 'var(--t-m)' }}>{t.aiChat.analyzing}</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ───────────────────────────────────────────── */}
      <div className="px-3 py-2 shrink-0" style={{ borderTop: '1px solid var(--t-bd)' }}>
        {/* Context hint */}
        {selectedNode && (
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px]" style={{ color: 'var(--t-m)' }}>
            <Info className="w-2.5 h-2.5 shrink-0" />
            {useSelection
              ? <>{t.aiChat.contextNodeHint} <span style={{ color: 'var(--t-a)' }}>"{selectedNode.data.label}"</span></>
              : <>{t.aiChat.contextWorkflowHint} ({nodes.length} {t.aiChat.nodesInWorkflow})</>}
          </div>
        )}

        <div className="flex gap-1.5 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={e => autoResizeTextarea(e.currentTarget)}
            placeholder={selectedNode && useSelection ? t.aiChat.placeholderNode.replace('{label}', selectedNode.data.label) : t.aiChat.placeholderDefault}
            rows={1}
            className="flex-1 text-[11px] rounded-lg px-2.5 py-2 outline-none resize-none"
            style={{
              background: 'var(--t-s)',
              border: '1px solid var(--t-bd)',
              color: 'var(--t-tx)',
              minHeight: '34px',
              maxHeight: '120px',
              lineHeight: '1.5',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition"
            style={{
              background: !input.trim() || loading ? 'var(--t-s)' : 'var(--t-a)',
              border: '1px solid var(--t-bd)',
            }}
            onMouseEnter={e => { if (input.trim() && !loading) (e.currentTarget as HTMLElement).style.background = 'var(--t-ah)'; }}
            onMouseLeave={e => { if (input.trim() && !loading) (e.currentTarget as HTMLElement).style.background = 'var(--t-a)'; }}
          >
            <Send className="w-3 h-3" style={{ color: !input.trim() || loading ? 'var(--t-bd)' : 'var(--t-btn-text)' }} />
          </button>
        </div>

        <p className="text-[9px] mt-1" style={{ color: 'var(--t-bd)' }}>
          {t.aiChat.shortcutSend} · {t.aiChat.shortcutNewline} · {nodes.length} {t.aiChat.nodesInWorkflow}
        </p>
      </div>
    </div>
  );
}
