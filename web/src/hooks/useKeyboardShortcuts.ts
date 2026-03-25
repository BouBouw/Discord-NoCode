import { useCallback, useEffect, useRef } from 'react';
import type { Node, Edge } from 'reactflow';
import type { NodeData } from '../constants/nodeTypes';

interface ClipboardData {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

interface UseKeyboardShortcutsOptions {
  nodes: Node<NodeData>[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDirty?: () => void;
  pushSnapshot?: (nodes: Node<NodeData>[], edges: Edge[]) => void;
}

export function useKeyboardShortcuts({
  nodes,
  edges,
  setNodes,
  setEdges,
  onSave,
  onUndo,
  onRedo,
  onDirty,
  pushSnapshot,
}: UseKeyboardShortcutsOptions) {
  const clipboardRef = useRef<ClipboardData | null>(null);

  const getSelectedNodes = useCallback(() => {
    return nodes.filter(n => (n as any).selected && n.id !== 'coreBot');
  }, [nodes]);

  const getSelectedEdges = useCallback(() => {
    return edges.filter(e => (e as any).selected);
  }, [edges]);

  /** Edges fully contained within the given node set */
  const getInternalEdges = useCallback((nodeIds: Set<string>) => {
    return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [edges]);

  /** Select all nodes */
  const selectAll = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: true })));
    setEdges(eds => eds.map(e => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  /** Copy selected nodes + their internal edges to clipboard */
  const copySelected = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length === 0) return;
    const nodeIds = new Set(selected.map(n => n.id));
    const internal = getInternalEdges(nodeIds);
    clipboardRef.current = {
      nodes: structuredClone(selected),
      edges: structuredClone(internal),
    };
  }, [getSelectedNodes, getInternalEdges]);

  /** Paste clipboard at +40,+40 offset with new IDs */
  const paste = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip || clip.nodes.length === 0) return;

    pushSnapshot?.(nodes, edges);

    const idMap: Record<string, string> = {};
    const now = Date.now();
    clip.nodes.forEach((n, i) => {
      idMap[n.id] = `${now}_${i}`;
    });

    const newNodes: Node<NodeData>[] = clip.nodes.map((n) => ({
      ...n,
      id: idMap[n.id],
      position: { x: n.position.x + 40, y: n.position.y + 40 },
      selected: true,
    }));

    const newEdges: Edge[] = clip.edges.map((e, i) => ({
      ...e,
      id: `e_paste_${now}_${i}`,
      source: idMap[e.source] ?? e.source,
      target: idMap[e.target] ?? e.target,
    }));

    // Deselect existing, add pasted
    setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), ...newNodes]);
    setEdges(prev => [...prev.map(e => ({ ...e, selected: false })), ...newEdges]);
    onDirty?.();
  }, [nodes, edges, setNodes, setEdges, onDirty, pushSnapshot]);

  /** Cut = copy + delete selected */
  const cutSelected = useCallback(() => {
    copySelected();
    pushSnapshot?.(nodes, edges);
    const selected = getSelectedNodes();
    const selectedEdges = getSelectedEdges();
    if (selected.length === 0 && selectedEdges.length === 0) return;
    const removedIds = new Set(selected.map(n => n.id));
    const removedEdgeIds = new Set(selectedEdges.map(e => e.id));
    setNodes(prev => prev.filter(n => !removedIds.has(n.id)));
    setEdges(prev => prev.filter(e => !removedEdgeIds.has(e.id) && !removedIds.has(e.source) && !removedIds.has(e.target)));
    onDirty?.();
  }, [copySelected, getSelectedNodes, getSelectedEdges, nodes, edges, setNodes, setEdges, onDirty, pushSnapshot]);

  /** Duplicate selected (copy + immediate paste) */
  const duplicateSelected = useCallback(() => {
    copySelected();
    // Need a microtask so clipboardRef is updated
    queueMicrotask(() => paste());
  }, [copySelected, paste]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when an input/textarea/select is focused
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (ctrl && key === 's') {
        e.preventDefault();
        onSave?.();
      } else if (ctrl && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      } else if (ctrl && (key === 'y' || (key === 'z' && e.shiftKey))) {
        e.preventDefault();
        onRedo?.();
      } else if (ctrl && key === 'a') {
        e.preventDefault();
        selectAll();
      } else if (ctrl && key === 'c') {
        e.preventDefault();
        copySelected();
      } else if (ctrl && key === 'v') {
        e.preventDefault();
        paste();
      } else if (ctrl && key === 'x') {
        e.preventDefault();
        cutSelected();
      } else if (ctrl && key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, onUndo, onRedo, selectAll, copySelected, paste, cutSelected, duplicateSelected]);
}
