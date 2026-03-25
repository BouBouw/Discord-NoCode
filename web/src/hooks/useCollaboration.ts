import { useEffect, useRef, useCallback, useState } from 'react';
import type { Node, Edge } from 'reactflow';
import type { NodeData } from '../constants/nodeTypes';

export interface Collaborator {
  userId: number;
  email: string;
  color: string;
  cursorX?: number;
  cursorY?: number;
  selectedNodeId?: string | null;
}

interface UseCollaborationOptions {
  workflowId: string | undefined;
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onExecutionEvent?: (msg: any) => void;
  onRemoteWorkflowSaved?: (userId: number) => void;
}

export function useCollaboration({
  workflowId,
  setNodes,
  setEdges,
  onExecutionEvent,
  onRemoteWorkflowSaved,
}: UseCollaborationOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [collaborators, setCollaborators] = useState<Map<number, Collaborator>>(new Map());

  // Store callbacks in refs to avoid reconnecting when they change
  const onExecRef = useRef(onExecutionEvent);
  const onSavedRef = useRef(onRemoteWorkflowSaved);
  useEffect(() => { onExecRef.current = onExecutionEvent; }, [onExecutionEvent]);
  useEffect(() => { onSavedRef.current = onRemoteWorkflowSaved; }, [onRemoteWorkflowSaved]);

  useEffect(() => {
    if (!workflowId || workflowId === 'new') return;

    const token = localStorage.getItem('token');
    const wsBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3008/api')
      .replace(/^http/, 'ws').replace(/\/api.*$/, '');
    const ws = new WebSocket(wsBase);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', workflowId: parseInt(workflowId), token }));
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        switch (msg.type) {
          // ── Collaboration events ──────────────────────────────────
          case 'users_list':
            setCollaborators(() => {
              const m = new Map<number, Collaborator>();
              for (const u of msg.users) m.set(u.userId, { userId: u.userId, email: u.email, color: u.color });
              return m;
            });
            break;

          case 'user_joined':
            setCollaborators(prev => new Map(prev).set(msg.userId, { userId: msg.userId, email: msg.email, color: msg.color }));
            break;

          case 'user_left':
            setCollaborators(prev => { const m = new Map(prev); m.delete(msg.userId); return m; });
            break;

          case 'cursor_update':
            setCollaborators(prev => {
              const m = new Map(prev);
              const existing = m.get(msg.userId);
              m.set(msg.userId, { ...(existing ?? { userId: msg.userId, email: msg.email, color: msg.color }), cursorX: msg.x, cursorY: msg.y });
              return m;
            });
            break;

          case 'node_dragged':
          case 'node_drag_ended':
            setNodes(nds => nds.map(n =>
              n.id === String(msg.nodeId) ? { ...n, position: { x: msg.x, y: msg.y } } : n
            ));
            break;

          case 'node_added':
            setNodes(nds => nds.some(n => n.id === String(msg.node.id)) ? nds : [...nds, msg.node]);
            break;

          case 'node_removed':
            setNodes(nds => nds.filter(n => n.id !== String(msg.nodeId)));
            setEdges(eds => eds.filter(e => e.source !== String(msg.nodeId) && e.target !== String(msg.nodeId)));
            break;

          case 'edge_added':
            setEdges(eds => eds.some(e => e.id === msg.edge.id) ? eds : [...eds, msg.edge]);
            break;

          case 'edge_removed':
            setEdges(eds => eds.filter(e => e.id !== msg.edgeId));
            break;

          case 'node_config_updated':
            setNodes(nds => nds.map(n =>
              n.id === String(msg.nodeId) ? { ...n, data: { ...n.data, config: msg.config } } : n
            ));
            break;

          case 'node_selected':
            setCollaborators(prev => {
              const m = new Map(prev);
              const existing = m.get(msg.userId);
              if (existing) m.set(msg.userId, { ...existing, selectedNodeId: msg.nodeId });
              return m;
            });
            break;

          case 'nodes_edges_synced':
            setNodes(msg.nodes);
            setEdges(msg.edges);
            break;

          case 'workflow_saved':
            onSavedRef.current?.(msg.userId);
            break;

          // ── Execution events (forwarded to page) ──────────────────
          case 'node_start':
          case 'node_done':
          case 'node_error':
          case 'edge_active':
          case 'log':
            onExecRef.current?.(msg);
            break;
        }
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setCollaborators(new Map());
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setCollaborators(new Map());
    };
  }, [workflowId, setNodes, setEdges]);

  // ── Send helpers ──────────────────────────────────────────────────────
  const send = useCallback((data: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws?.readyState === 1) ws.send(JSON.stringify(data));
  }, []);

  const lastCursor = useRef(0);
  const sendCursorMove = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursor.current < 50) return;
    lastCursor.current = now;
    send({ type: 'cursor_move', x, y });
  }, [send]);

  const lastDrag = useRef(0);
  const sendNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    const now = Date.now();
    if (now - lastDrag.current < 30) return;
    lastDrag.current = now;
    send({ type: 'node_drag', nodeId, x, y });
  }, [send]);

  const sendNodeDragEnd = useCallback((nodeId: string, x: number, y: number) => {
    send({ type: 'node_drag_end', nodeId, x, y });
  }, [send]);

  const sendNodeAdd = useCallback((node: Node<NodeData>) => {
    send({ type: 'node_add', node });
  }, [send]);

  const sendNodeRemove = useCallback((nodeId: string) => {
    send({ type: 'node_remove', nodeId });
  }, [send]);

  const sendEdgeAdd = useCallback((edge: Edge) => {
    send({ type: 'edge_add', edge });
  }, [send]);

  const sendEdgeRemove = useCallback((edgeId: string) => {
    send({ type: 'edge_remove', edgeId });
  }, [send]);

  const sendNodeConfigUpdate = useCallback((nodeId: string, config: unknown) => {
    send({ type: 'node_config_update', nodeId, config });
  }, [send]);

  const sendNodeSelect = useCallback((nodeId: string | null) => {
    send({ type: 'node_select', nodeId });
  }, [send]);

  const sendNodesEdgesSync = useCallback((nodes: Node<NodeData>[], edges: Edge[]) => {
    send({ type: 'nodes_edges_sync', nodes, edges });
  }, [send]);

  const sendWorkflowSaved = useCallback(() => {
    send({ type: 'workflow_saved' });
  }, [send]);

  return {
    collaborators,
    sendCursorMove,
    sendNodeDrag,
    sendNodeDragEnd,
    sendNodeAdd,
    sendNodeRemove,
    sendEdgeAdd,
    sendEdgeRemove,
    sendNodeConfigUpdate,
    sendNodeSelect,
    sendNodesEdgesSync,
    sendWorkflowSaved,
  };
}
