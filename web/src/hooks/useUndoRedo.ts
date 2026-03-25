import { useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';

interface Snapshot<N, E> {
  nodes: N[];
  edges: E[];
}

const MAX_HISTORY = 50;

/**
 * Undo / Redo stack for React Flow nodes & edges.
 *
 * Usage:
 *   const { pushSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo(setNodes, setEdges);
 *   // After every meaningful change call pushSnapshot(nodes, edges);
 */
export function useUndoRedo<N = Node, E = Edge>(
  setNodes: React.Dispatch<React.SetStateAction<N[]>>,
  setEdges: React.Dispatch<React.SetStateAction<E[]>>,
) {
  const past = useRef<Snapshot<N, E>[]>([]);
  const future = useRef<Snapshot<N, E>[]>([]);
  // Keep a ref to the latest snapshot so undo knows the "current" state to push to future
  const current = useRef<Snapshot<N, E> | null>(null);

  const pushSnapshot = useCallback((nodes: N[], edges: E[]) => {
    if (current.current) {
      past.current = [...past.current.slice(-(MAX_HISTORY - 1)), current.current];
    }
    current.current = { nodes: structuredClone(nodes), edges: structuredClone(edges) };
    future.current = [];
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    if (current.current) {
      future.current = [...future.current, current.current];
    }
    current.current = prev;
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    const next = future.current[future.current.length - 1];
    future.current = future.current.slice(0, -1);
    if (current.current) {
      past.current = [...past.current, current.current];
    }
    current.current = next;
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [setNodes, setEdges]);

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo: () => past.current.length > 0,
    canRedo: () => future.current.length > 0,
  };
}
