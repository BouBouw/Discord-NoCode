import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange } from 'reactflow';
import { ArrowLeft, Save, Play, Bot, MessageSquare, Terminal, SplitSquareHorizontal, SplitSquareVertical, X, ChevronDown, Download, Upload, Keyboard } from 'lucide-react';
import { getWorkflow, createWorkflow, updateWorkflow, deployWorkflow } from '../../../services/workflowService';
import { type NodeType, type NodeData, NODE_TYPES, type CommandHandlerConfig, type EventHandlerConfig } from '../../../constants/nodeTypes';
import type { TemplateNode, TemplateEdge } from '../../../constants/templates';
import NodeSidebar from '../../../components/NodeSidebar';
import WorkflowCanvas from '../../../components/WorkflowCanvas';
import NodeConfigPanel from '../../../components/NodeConfigPanel';
import WorkflowLeftSidebar from '../../../components/WorkflowLeftSidebar';
import AIChatPanel, { type AIAction } from '../../../components/AIChatPanel';
import CollaborationAvatars from '../../../components/CollaborationAvatars';
import { botAPI } from '../../../services/api';
import type { Node, Edge } from 'reactflow';
import { useUserSettings, getBotThemeConfig } from '../../../hooks/useUserSettings';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCollaboration } from '../../../hooks/useCollaboration';
import { useUndoRedo } from '../../../hooks/useUndoRedo';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { useOnboarding } from '../../../contexts/OnboardingContext';

// Proper types for API workflow data
interface WorkflowNode {
  id: number | string;
  type: NodeType;
  label: string;
  category: string;
  x: number;
  y: number;
  color: string;
  config?: CommandHandlerConfig | EventHandlerConfig | Record<string, any> | null;
}

interface WorkflowConnection {
  id: string | undefined;
  source: number | string;
  target: number | string;
  source_handle: string | null | undefined;
  target_handle: string | null | undefined;
}

interface WorkflowData {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

interface ApiWorkflow {
  id: number;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export default function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { t } = useTranslation();
  const { completeAction, jumpToCategory } = useOnboarding();
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [configNode, setConfigNode] = useState<Node<NodeData> | null>(null);
  const [botInfo, setBotInfo] = useState<{ id: number; name: string; status: string } | null>(null);
  const [isDirty,    setIsDirty]    = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);

  // ── Canvas settings (driven by WorkflowLeftSidebar Settings panel) ─────────
  const [canvasSettings, setCanvasSettings] = useState({
    snapToGrid:  false,
    showMinimap: true,
    autoSave:    false,
  });

  const handleSettingsChange = useCallback((key: 'snapToGrid' | 'showMinimap' | 'autoSave', value: boolean) => {
    setCanvasSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Batch sync counter — incremented after AI/template/snapshot operations to trigger full state sync
  const [batchSyncCounter, setBatchSyncCounter] = useState(0);

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const { pushSnapshot, undo, redo } = useUndoRedo<Node<NodeData>, Edge>(setNodes, setEdges);

  // ── Keyboard shortcuts modal ───────────────────────────────────────────────
  const [showShortcuts, setShowShortcuts] = useState(false);

  // ── Import file ref ────────────────────────────────────────────────────────
  const importInputRef = useRef<HTMLInputElement>(null);

  // Auto-save: trigger save 30s after last change when autoSave is on and there are dirty changes
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!canvasSettings.autoSave || !isDirty || !id || id === 'new') return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave();
    }, 30_000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSettings.autoSave, isDirty, id]);

  // ── Execution highlighting ─────────────────────────────────────────────────
  // nodeId → 'running' | 'done' | 'error'
  const [nodeExec, setNodeExec] = useState<Record<string, 'running' | 'done' | 'error'>>({});
  // "sourceId->targetId" keys of currently active edges
  const [activeEdgeKeys, setActiveEdgeKeys] = useState<Set<string>>(new Set());
  const doneTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Console panel logs
  const [consoleLogs, setConsoleLogs] = useState<Array<{ ts: number; level: string; message: string }>>([]);

  // Execution snapshots per node (for the config panel live view)
  const [nodeExecData, setNodeExecData] = useState<Record<string, {
    snapshot?: Record<string, any>; nextHandle?: string; error?: string; ts: number;
  }>>({});

  const setNodeStatus = useCallback((nodeId: string, status: 'running' | 'done' | 'error') => {
    setNodeExec(prev => ({ ...prev, [nodeId]: status }));
    if (status === 'done' || status === 'error') {
      doneTimers.current[nodeId] = setTimeout(() => {
        setNodeExec(prev => { const n = { ...prev }; delete n[nodeId]; return n; });
      }, 1200);
    }
  }, []);

  // ── Collaboration hook (WebSocket for real-time sync + execution events) ──
  const handleExecutionEvent = useCallback((msg: any) => {
    if (msg.type === 'node_start') {
      setNodeStatus(String(msg.nodeId), 'running');
      if (msg.snapshot) setNodeExecData(prev => ({ ...prev, [String(msg.nodeId)]: { snapshot: msg.snapshot, ts: Date.now() } }));
    }
    else if (msg.type === 'node_done') {
      setNodeStatus(String(msg.nodeId), 'done');
      if (msg.nextHandle) setNodeExecData(prev => ({
        ...prev,
        [String(msg.nodeId)]: { ...(prev[String(msg.nodeId)] ?? { ts: Date.now() }), nextHandle: msg.nextHandle },
      }));
    }
    else if (msg.type === 'node_error') {
      setNodeStatus(String(msg.nodeId), 'error');
      setNodeExecData(prev => ({
        ...prev,
        [String(msg.nodeId)]: { ...(prev[String(msg.nodeId)] ?? { ts: Date.now() }), error: msg.error ?? 'Unknown error' },
      }));
    }
    else if (msg.type === 'edge_active') {
      const key = `${msg.sourceId}->${msg.targetId}`;
      setActiveEdgeKeys(prev => new Set(prev).add(key));
      setTimeout(() => setActiveEdgeKeys(prev => { const s = new Set(prev); s.delete(key); return s; }), 900);
    }
    else if (msg.type === 'log') {
      setConsoleLogs(prev => {
        const next = [...prev, { ts: Date.now(), level: msg.level ?? 'info', message: msg.message ?? '' }];
        return next.length > 500 ? next.slice(-500) : next;
      });
    }
  }, [setNodeStatus]);

  const handleRemoteWorkflowSaved = useCallback((_userId: number) => {
    toast('info', t.workflow.remoteUserSaved);
  }, [toast, t]);

  const {
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
  } = useCollaboration({
    workflowId: id,
    setNodes,
    setEdges,
    onExecutionEvent: handleExecutionEvent,
    onRemoteWorkflowSaved: handleRemoteWorkflowSaved,
  });

  // Clean up execution timers on unmount
  useEffect(() => {
    return () => { Object.values(doneTimers.current).forEach(clearTimeout); };
  }, []);

  // Sync full state to collaborators after batch operations (AI, template, snapshot restore)
  const batchSyncInit = useRef(true);
  useEffect(() => {
    if (batchSyncInit.current) { batchSyncInit.current = false; return; }
    sendNodesEdgesSync(nodes, edges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchSyncCounter]);

  // Bottom panel
  const [bottomPanel, setBottomPanel] = useState<'chat' | 'console' | 'split' | null>(null);
  const [splitDir, setSplitDir] = useState<'vertical' | 'horizontal'>('vertical');
  const [panelSize, setPanelSize] = useState(260);
  const [splitMenuOpen, setSplitMenuOpen] = useState(false);
  const splitMenuRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startX: number; startSize: number } | null>(null);

  // Chat = solo chat, Console = solo console, split → go solo; same panel = close
  const togglePanel = (panel: 'chat' | 'console') => {
    setBottomPanel(prev =>
      prev === 'split' ? panel : prev === panel ? null : panel
    );
  };

  // Close split menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (splitMenuRef.current && !splitMenuRef.current.contains(e.target as globalThis.Node)) {
        setSplitMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Drag-to-resize handler (panel vs canvas)
  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startX: e.clientX, startSize: panelSize };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      setPanelSize(Math.max(120, Math.min(600, dragRef.current.startSize + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [panelSize]);

  // Helper function to transform React Flow nodes to API format
  const transformNodesToApi = useCallback((nodes: Node<NodeData>[]): WorkflowNode[] => {
    const result: WorkflowNode[] = [];
    for (const node of nodes) {
      if (node.data.type === 'coreBot') {
        // Always persist coreBot so its edges have a valid source/target reference
        result.push({
          id: 'coreBot',
          type: node.data.type,
          label: node.data.label,
          category: node.data.category,
          x: node.position.x,
          y: node.position.y,
          color: node.data.color || 'blue',
          config: node.data.config ?? null,
        });
        continue;
      }
      const nodeId = parseInt(node.id);
      if (isNaN(nodeId)) {
        console.warn(`[Workflow] Skipping node with non-integer ID: ${node.id}`);
        continue;
      }
      result.push({
        id: nodeId,
        type: node.data.type,
        label: node.data.label,
        category: node.data.category,
        x: node.position.x,
        y: node.position.y,
        color: node.data.color || 'blue',
        config: node.data.config ?? null,
      });
    }
    return result;
  }, []);

  // Helper function to transform React Flow edges to API format
  const transformEdgesToApi = useCallback((edges: Edge[]): WorkflowConnection[] => {
    const result: WorkflowConnection[] = [];
    for (const edge of edges) {
      const resolveId = (raw: string): number | string => {
        if (raw === 'coreBot') return 'coreBot';
        const n = parseInt(raw);
        return isNaN(n) ? raw : n;
      };
      const sourceId = resolveId(edge.source);
      const targetId = resolveId(edge.target);

      if (typeof sourceId === 'number' && isNaN(sourceId)) {
        console.warn(`Invalid edge source: ${edge.source}`);
        continue;
      }

      result.push({
        id: edge.id,
        source: sourceId,
        target: targetId,
        source_handle: edge.sourceHandle,
        target_handle: edge.targetHandle,
      });
    }
    return result;
  }, []);

  // Load workflow data on mount
  useEffect(() => {
    async function loadWorkflow() {
      if (id && id !== 'new') {
        setLoading(true);
        try {
          const workflow: ApiWorkflow = await getWorkflow(parseInt(id));

          // Set workflow details
          setName(workflow.name || '');
          setDescription(workflow.description || '');

          // Convert stored nodes to React Flow format
          const loadedNodes: Node<NodeData>[] = workflow.nodes.map((node) => {
            const nodeConfig = NODE_TYPES[node.type];
            const isCoreBot = node.type === 'coreBot';
            return {
              id: isCoreBot ? 'coreBot' : node.id.toString(),
              type: isCoreBot ? 'coreBot' : 'custom',
              position: { x: node.x || 0, y: node.y || 0 },
              draggable: isCoreBot ? false : true,
              deletable: isCoreBot ? false : true,
              data: {
                label: node.label,
                type: node.type,
                category: node.category as any,
                icon: nodeConfig?.icon,
                color: node.color,
                isRequired: nodeConfig?.required || false,
                config: (node as any).config ?? null,
              },
            };
          });

          // Ensure coreBot is always present
          const hasCoreBot = loadedNodes.some((n) => n.id === 'coreBot');
          if (!hasCoreBot) {
            loadedNodes.unshift({
              id: 'coreBot',
              type: 'coreBot',
              position: { x: 250, y: 100 },
              draggable: false,
              deletable: false,
              data: {
                label: 'Core Bot',
                type: 'coreBot',
                category: 'core',
                icon: NODE_TYPES.coreBot.icon,
                color: 'blue',
                isRequired: true,
              },
            });
          }

          // Convert stored connections to edges
          const loadedEdges: Edge[] = workflow.connections.map((conn) => ({
            id: conn.id || `${conn.source}-${conn.target}`,
            source: String(conn.source),
            target: String(conn.target),
            sourceHandle: conn.source_handle,
            targetHandle: conn.target_handle,
          }));

          setNodes(loadedNodes);
          setEdges(loadedEdges);
          setIsDirty(false);
          setIsDeployed(false);

          // Fetch the bot associated with this workflow
          try {
            const bots = await botAPI.list();
            const bot = bots.find((b: any) => b.workflow_id === parseInt(id));
            if (bot) setBotInfo({ id: bot.id, name: bot.name, status: bot.status });
          } catch {
            // non-critical — bot info is only displayed in the CoreBot panel
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to load workflow:', error);
          toast('error', `${t.workflow.loadFailed}: ${errorMessage}`);
        } finally {
          setLoading(false);
        }
      } else {
        // Initialize with Core Bot node — fixed, non-deletable
        const coreBotNode: Node<NodeData> = {
          id: 'coreBot',
          type: 'coreBot',
          position: { x: 250, y: 100 },
          draggable: false,
          deletable: false,
          selectable: true,
          data: {
            label: 'Core Bot',
            type: 'coreBot',
            category: 'core',
            icon: NODE_TYPES.coreBot.icon,
            color: 'blue',
            isRequired: true,
          },
        };
        setNodes([coreBotNode]);
      }
    }

    loadWorkflow();
    jumpToCategory('workflow');
  }, [id, setNodes, setEdges, jumpToCategory]);

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: NodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const onAddNode = useCallback((nodeType: NodeType) => {
    const nodeConfig = NODE_TYPES[nodeType];
    if (!nodeConfig) return;
    if (nodeType === 'coreBot' && nodes.some(n => n.id === 'coreBot')) return;

    const TRIGGER_TYPES = new Set(['commandHandlerSuite', 'eventHandlerSuite', 'buttonInteractionHandler', 'selectMenuInteractionHandler', 'modalSubmitHandler']);
    const coreNode = nodes.find(n => n.id === 'coreBot');
    const isTrigger = TRIGGER_TYPES.has(nodeType);

    let position: { x: number; y: number };
    if (isTrigger && coreNode) {
      const existingTriggers = nodes.filter(n => TRIGGER_TYPES.has(n.data.type)).length;
      position = { x: coreNode.position.x + 300, y: coreNode.position.y + existingTriggers * 130 };
    } else {
      position = { x: 180 + Math.random() * 160, y: 140 + Math.random() * 120 };
    }

    const newNodeId = `${Date.now()}`;
    const newNode: Node<NodeData> = {
      id: newNodeId,
      type: 'custom',
      position,
      data: {
        label: nodeConfig.label,
        type: nodeType,
        category: nodeConfig.category,
        icon: nodeConfig.icon,
        color: nodeConfig.color,
        isRequired: nodeConfig.required,
      },
    };
    setNodes(prev => [...prev, newNode]);
    sendNodeAdd(newNode);
    completeAction('node-added');
    if (isTrigger && coreNode) {
      const newEdge: Edge = {
        id: `e_core_${newNodeId}`,
        source: 'coreBot',
        target: newNodeId,
        sourceHandle: 'output',
        targetHandle: 'input',
      };
      setEdges(prev => [...prev, newEdge]);
      sendEdgeAdd(newEdge);
    }
    setIsDirty(true);
    setIsDeployed(false);
  }, [nodes, setNodes, setEdges, sendNodeAdd, sendEdgeAdd]);

  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setConfigNode(node);
    sendNodeSelect(node.id);
  }, [sendNodeSelect]);

  const handleConfigSave = useCallback(
    (nodeId: string, config: CommandHandlerConfig | EventHandlerConfig | Record<string, any> | null) => {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, config } } : n));
      sendNodeConfigUpdate(nodeId, config);
      setIsDirty(true);
      setIsDeployed(false);
      setConfigNode(null);
    },
    [sendNodeConfigUpdate]
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast('warning', t.workflow.enterWorkflowName);
      return;
    }

    setSaving(true);
    try {
      // Transform to API format
      const nodesData = transformNodesToApi(nodes);
      const connectionsData = transformEdgesToApi(edges);

      const workflowData: WorkflowData = {
        name: name.trim(),
        description: description.trim(),
        nodes: nodesData,
        connections: connectionsData,
      };

      if (id && id !== 'new') {
        await updateWorkflow(parseInt(id), workflowData);
      } else {
        const newWorkflow = await createWorkflow({ ...workflowData, nodes: [], connections: [] });
        navigate(`/workflow/${newWorkflow.id}`);
      }

      setIsDirty(false);
      setIsDeployed(false);
      sendWorkflowSaved();
      completeAction('workflow-saved');
      toast('success', t.workflow.workflowSaved);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save workflow:', error);
      toast('error', `${t.workflow.saveFailed}: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!name.trim()) {
      toast('warning', t.workflow.enterWorkflowName);
      return;
    }

    setDeploying(true);
    try {
      if (id && id !== 'new') {
        // Save latest workflow state first
        const nodesData = transformNodesToApi(nodes);
        const connectionsData = transformEdgesToApi(edges);

        const workflowData: WorkflowData = {
          name: name.trim(),
          description: description.trim(),
          nodes: nodesData,
          connections: connectionsData,
        };

        await updateWorkflow(parseInt(id), workflowData);
        const result = await deployWorkflow(parseInt(id));
        setIsDirty(false);
        setIsDeployed(true);

        if (result?.deploying && result?.botId) {
          toast('success', t.workflow.savedRebuilding);
        } else if (!result?.botId) {
          toast('warning', t.workflow.noBotLinked);
        } else {
          toast('success', t.workflow.deploySuccess);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to deploy workflow:', error);
      toast('error', `${t.workflow.deployFailed}: ${errorMessage}`);
    } finally {
      setDeploying(false);
    }
  };

  // ── AI chat action handler ───────────────────────────────────────────────
  const handleAIApplyActions = useCallback((actions: AIAction[]) => {
    const TRIGGER_TYPES = new Set(['commandHandlerSuite', 'eventHandlerSuite', 'buttonInteractionHandler', 'selectMenuInteractionHandler', 'modalSubmitHandler']);
    // Pre-generate real IDs for new nodes so we can reference them in edge actions
    const tempIdMap: Record<string, string> = {};
    for (const a of actions) {
      if (a.type === 'add_node' && a.tempId) {
        tempIdMap[a.tempId] = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      }
    }

    // Track new trigger nodes added by AI so we can auto-connect them
    const newTriggerIds: string[] = [];

    setNodes(prev => {
      let curr = [...prev];
      for (const action of actions) {
        if (action.type === 'add_node') {
          const cfg = NODE_TYPES[action.nodeType!];
          if (!cfg) continue;
          const newId = (action.tempId && tempIdMap[action.tempId]) || `ai_${Date.now()}`;
          if (TRIGGER_TYPES.has(action.nodeType!)) newTriggerIds.push(newId);
          const coreNode = curr.find(n => n.id === 'coreBot');
          const existingTriggers = curr.filter(n => TRIGGER_TYPES.has(n.data.type)).length;
          const autoPos = coreNode && TRIGGER_TYPES.has(action.nodeType!)
            ? { x: coreNode.position.x + 300, y: coreNode.position.y + existingTriggers * 130 }
            : undefined;
          curr = [...curr, {
            id: newId,
            type: 'custom',
            position: autoPos ?? action.position ?? { x: 300 + Math.random() * 400, y: 200 + Math.random() * 300 },
            data: { label: cfg.label, type: action.nodeType!, category: cfg.category, icon: cfg.icon, color: cfg.color, isRequired: cfg.required, config: action.config ?? null },
          }];
        } else if (action.type === 'edit_node') {
          curr = curr.map(n => n.id !== action.nodeId ? n
            : { ...n, data: { ...n.data, config: { ...(n.data.config as any ?? {}), ...action.config } } }
          );
        } else if (action.type === 'delete_node') {
          curr = curr.filter(n => n.id !== action.nodeId);
        }
      }
      return curr;
    });

    setEdges(prev => {
      let curr = [...prev];
      // Auto-connect new trigger nodes to coreBot
      for (const triggerId of newTriggerIds) {
        const alreadyConnected = curr.some(e => e.source === 'coreBot' && e.target === triggerId);
        if (!alreadyConnected) {
          curr = [...curr, {
            id: `e_core_${triggerId}`,
            source: 'coreBot',
            target: triggerId,
            sourceHandle: 'output',
            targetHandle: 'input',
          }];
        }
      }
      for (const action of actions) {
        if (action.type === 'add_edge') {
          const src = tempIdMap[action.source!] || action.source!;
          const tgt = tempIdMap[action.target!] || action.target!;
          curr = [...curr, { id: `e_ai_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, source: src, target: tgt, sourceHandle: action.sourceHandle || 'success', targetHandle: action.targetHandle || 'input' }];
        } else if (action.type === 'delete_edge') {
          curr = curr.filter(e => e.id !== action.edgeId);
        }
      }
      return curr;
    });

    setIsDirty(true);
    setIsDeployed(false);
    setBatchSyncCounter(c => c + 1);
    toast('success', `✨ ${t.workflow.aiModified} (${actions.length} action${actions.length > 1 ? 's' : ''})`);
  }, [setNodes, setEdges, toast]);

  const handleAIRestoreSnapshot = useCallback((snapNodes: Node<NodeData>[], snapEdges: Edge[]) => {
    setNodes(snapNodes);
    setEdges(snapEdges);
    setIsDirty(true);
    setIsDeployed(false);
    setBatchSyncCounter(c => c + 1);
    toast('info', t.workflow.aiReverted);
  }, [setNodes, setEdges, toast]);

  const handleApplyTemplate = useCallback((tplNodes: TemplateNode[], tplEdges: TemplateEdge[]) => {
    const maxX = nodes.reduce((m, n) => Math.max(m, n.position.x + 160), 0);
    const offsetX = maxX > 0 ? maxX + 120 : 160;
    const offsetY = 160;
    const idMap = tplNodes.map((_, i) => `tpl_${Date.now()}_${i}`);

    const newNodes = tplNodes.flatMap((tn, i) => {
      const cfg = NODE_TYPES[tn.type as NodeType];
      if (!cfg) return [];
      const node: Node<NodeData> = {
        id: idMap[i],
        type: 'custom',
        position: { x: offsetX + tn.position.x, y: offsetY + tn.position.y },
        data: {
          label: cfg.label,
          type: tn.type as NodeType,
          category: cfg.category,
          icon: cfg.icon,
          color: cfg.color,
          isRequired: cfg.required,
          config: (tn.config ?? null) as any,
        },
      };
      return [node];
    });

    const newEdges: Edge[] = tplEdges.map((te, i) => ({
      id: `etpl_${Date.now()}_${i}`,
      source: idMap[te.fromIdx],
      target: idMap[te.toIdx],
      sourceHandle: te.fromHandle ?? 'output',
      targetHandle: te.toHandle ?? 'input',
    }));

    setNodes(prev => [...prev, ...newNodes]);
    setEdges(prev => [...prev, ...newEdges]);
    setIsDirty(true);
    setIsDeployed(false);
    setBatchSyncCounter(c => c + 1);
    toast('success', `✅ ${t.workflow.templateInserted} (${newNodes.length} ${t.workflow.nodeCount})`);
  }, [nodes, setNodes, setEdges, toast]);

  // ── Export workflow as JSON ────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const data = {
      name,
      description,
      nodes: transformNodesToApi(nodes),
      connections: transformEdgesToApi(edges),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name || 'workflow').replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('success', t.workflow.exportSuccess);
  }, [name, description, nodes, edges, transformNodesToApi, transformEdgesToApi, toast, t]);

  // ── Import workflow from JSON ─────────────────────────────────────────────
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result;
        if (typeof raw !== 'string') return;
        const data = JSON.parse(raw);

        // Validate basic structure
        if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.connections)) {
          toast('error', t.workflow.importInvalidFormat);
          return;
        }

        pushSnapshot(nodes, edges);

        if (data.name) setName(data.name);
        if (data.description !== undefined) setDescription(data.description);

        // Convert imported nodes to React Flow format
        const loadedNodes: Node<NodeData>[] = data.nodes.map((node: any) => {
          const nodeConfig = NODE_TYPES[node.type as NodeType];
          const isCoreBot = node.type === 'coreBot';
          return {
            id: isCoreBot ? 'coreBot' : String(node.id),
            type: isCoreBot ? 'coreBot' : 'custom',
            position: { x: node.x || 0, y: node.y || 0 },
            draggable: !isCoreBot,
            deletable: !isCoreBot,
            data: {
              label: node.label,
              type: node.type,
              category: node.category as any,
              icon: nodeConfig?.icon,
              color: node.color,
              isRequired: nodeConfig?.required || false,
              config: node.config ?? null,
            },
          };
        });

        // Ensure coreBot
        if (!loadedNodes.some(n => n.id === 'coreBot')) {
          loadedNodes.unshift({
            id: 'coreBot',
            type: 'coreBot',
            position: { x: 250, y: 100 },
            draggable: false,
            deletable: false,
            data: {
              label: 'Core Bot',
              type: 'coreBot',
              category: 'core',
              icon: NODE_TYPES.coreBot.icon,
              color: 'blue',
              isRequired: true,
            },
          });
        }

        const loadedEdges: Edge[] = data.connections.map((conn: any) => ({
          id: conn.id || `${conn.source}-${conn.target}`,
          source: String(conn.source),
          target: String(conn.target),
          sourceHandle: conn.source_handle,
          targetHandle: conn.target_handle,
        }));

        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setIsDirty(true);
        setIsDeployed(false);
        setBatchSyncCounter(c => c + 1);
        toast('success', t.workflow.importSuccess);
      } catch {
        toast('error', t.workflow.importInvalidJson);
      }
    };
    reader.readAsText(file);
    // Reset input so re-importing the same file triggers onChange
    e.target.value = '';
  }, [nodes, edges, setNodes, setEdges, pushSnapshot, toast, t]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const markDirty = useCallback(() => { setIsDirty(true); setIsDeployed(false); }, []);

  useKeyboardShortcuts({
    nodes,
    edges,
    setNodes,
    setEdges,
    onSave: () => handleSave(),
    onUndo: undo,
    onRedo: redo,
    onDirty: markDirty,
    pushSnapshot,
  });

  // The currently selected node (for AI context)
  const selectedNodeForAI = nodes.find(n => (n as any).selected) ?? null;

  // Handle node changes from React Flow + broadcast via collaboration WS
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasStructural = changes.some(c => c.type === 'remove' || c.type === 'add');
      if (hasStructural) pushSnapshot(nodes, edges);
      setNodes((nds) => applyNodeChanges(changes, nds));
      for (const c of changes) {
        if (c.type === 'position' && (c as any).position && c.id !== 'coreBot') {
          const pos = (c as any).position as { x: number; y: number };
          if ((c as any).dragging) sendNodeDrag(c.id, pos.x, pos.y);
          else sendNodeDragEnd(c.id, pos.x, pos.y);
        }
        if (c.type === 'remove' && c.id !== 'coreBot') sendNodeRemove(c.id);
      }
      if (changes.some(c => c.type !== 'select' && c.type !== 'dimensions')) {
        setIsDirty(true);
        setIsDeployed(false);
      }
    },
    [sendNodeDrag, sendNodeDragEnd, sendNodeRemove, pushSnapshot, nodes, edges]
  );

  // Handle edge changes from React Flow + broadcast via collaboration WS
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const hasStructural = changes.some(c => c.type === 'remove' || c.type === 'add');
      if (hasStructural) pushSnapshot(nodes, edges);
      setEdges((eds) => applyEdgeChanges(changes, eds));
      for (const c of changes) {
        if (c.type === 'remove') sendEdgeRemove(c.id);
      }
      if (changes.some(c => c.type !== 'select')) {
        setIsDirty(true);
        setIsDeployed(false);
      }
      if (changes.some(c => c.type === 'add')) {
        completeAction('edge-added');
      }
    },
    [sendEdgeRemove, completeAction]
  );

  const { settings } = useUserSettings();
  const th = getBotThemeConfig(settings.defaultBotTheme ?? 'dark');
  const thV = {
    '--t-bg': th.bg, '--t-s': th.surface, '--t-s2': th.surface2,
    '--t-bd': th.border, '--t-a': th.accent, '--t-ah': th.accentHover,
    '--t-aa': th.accentAlpha, '--t-tx': th.text, '--t-sub': th.subtext, '--t-m': th.muted,
  } as React.CSSProperties;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ ...thV, background: 'var(--t-bg)' }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--t-a) var(--t-bd) var(--t-bd) var(--t-bd)' }} />
          <p style={{ color: 'var(--t-m)' }}>{t.workflow.loadingWorkflow}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ ...thV, background: 'var(--t-bg)' }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        data-onboarding="wf-header"
        className="h-14 flex items-center px-4 gap-4 shrink-0"
        style={{ background: 'var(--t-s)', borderBottom: '1px solid var(--t-bd)' }}
      >
        {/* Left: back + breadcrumb + editable name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg transition shrink-0"
            style={{ color: 'var(--t-m)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--t-m)' }}>
            <span>{t.workflow.instancesBreadcrumb}</span>
            <span style={{ color: 'var(--t-bd)', margin: '0 2px' }}>/</span>
          </div>
          <Bot className="w-4 h-4 shrink-0" style={{ color: 'var(--t-a)' }} strokeWidth={1.5} />
          <div className="relative flex items-center gap-1.5 min-w-0">
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setIsDirty(true); setIsDeployed(false); }}
              placeholder={t.workflow.workflowNamePlaceholder}
              className="bg-transparent text-sm font-semibold placeholder-[var(--t-m)] border-b border-transparent hover:border-[var(--t-s2)] focus:border-[var(--t-a)] focus:outline-none px-0.5 w-52 min-w-0 transition-colors"
              style={{ color: 'var(--t-tx)' }}
            />
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--t-a)' }} title={t.workflow.unsavedChanges} />
            )}
          </div>
        </div>

        {/* Right: bot status + collaborators + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {botInfo && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
              style={botInfo.status === 'running'
                ? { background: 'color-mix(in srgb, #34d399 8%, transparent)', color: '#34d399', border: '1px solid color-mix(in srgb, #34d399 15%, transparent)' }
                : { background: 'var(--t-s)', color: 'var(--t-m)', border: '1px solid var(--t-bd)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: botInfo.status === 'running' ? '#34d399' : 'var(--t-bd)' }} />
              {botInfo.name ?? botInfo.status}
            </span>
          )}

          <CollaborationAvatars collaborators={collaborators} />

          {/* Import (hidden file input + button) */}
          <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition"
            style={{ color: 'var(--t-m)', borderColor: 'var(--t-bd)', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
            title={t.workflow.importWorkflow}
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden lg:inline">{t.workflow.importWorkflow}</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition"
            style={{ color: 'var(--t-m)', borderColor: 'var(--t-bd)', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
            title={t.workflow.exportWorkflow}
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden lg:inline">{t.workflow.exportWorkflow}</span>
          </button>

          {/* Keyboard shortcuts */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-1.5 rounded-lg border transition"
            style={{ color: 'var(--t-m)', borderColor: 'var(--t-bd)', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
            title={t.workflow.keyboardShortcuts}
          >
            <Keyboard className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>

          {/* Save */}
          <button
            data-onboarding="save-btn"
            onClick={handleSave}
            disabled={saving || (!isDirty && !!id && id !== 'new')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition"
            style={
              (saving || (!isDirty && !!id && id !== 'new'))
                ? { color: 'var(--t-bd)', borderColor: 'var(--t-s2)', cursor: 'not-allowed' }
                : { color: 'var(--t-a)', borderColor: 'var(--t-a)', cursor: 'pointer' }
            }
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--t-aa)'; }}
            onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = ''; }}
          >
            {saving
              ? <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--t-a) transparent transparent transparent' }} />
              : <Save className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {t.workflow.save}
          </button>

          {/* Deploy */}
          {id && id !== 'new' && (
            <button
              data-onboarding="deploy-btn"
              onClick={handleDeploy}
              disabled={deploying || (!isDirty && isDeployed)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
              style={
                (deploying || (!isDirty && isDeployed))
                  ? { background: 'var(--t-s)', color: 'var(--t-bd)', cursor: 'not-allowed' }
                  : { background: 'var(--t-a)', color: 'white', cursor: 'pointer' }
              }
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--t-ah)'; }}
              onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--t-a)'; }}
            >
              {deploying
                ? <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Play className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {t.workflow.deploy}
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content + Bottom Panel wrapper ─────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Canvas area */}
        <div className="flex-1 flex overflow-hidden">
          <div data-onboarding="wf-left-sidebar">
            <WorkflowLeftSidebar settings={canvasSettings} onSettingsChange={handleSettingsChange} workflowId={id} onApplyTemplate={handleApplyTemplate} description={description} onDescriptionChange={(v) => { setDescription(v); setIsDirty(true); setIsDeployed(false); }} />
          </div>
          <WorkflowCanvas
            data-onboarding="canvas"
            nodes={nodes.map(n => {
              const selectedBy = [...collaborators.values()].find(c => c.selectedNodeId === n.id);
              return {
                ...n,
                className: nodeExec[n.id] ? `node-exec-${nodeExec[n.id]}` : undefined,
                style: selectedBy ? { outline: `2px solid ${selectedBy.color}`, outlineOffset: 2, borderRadius: 8 } : undefined,
              };
            })}
            edges={edges.map(e => {
              const key = `${e.source}->${e.target}`;
              return activeEdgeKeys.has(key)
                ? { ...e, className: 'edge-exec-active', animated: true }
                : e;
            })}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDoubleClick={handleNodeDoubleClick}
            snapToGrid={canvasSettings.snapToGrid}
            showMinimap={canvasSettings.showMinimap}
            collaborators={collaborators}
            onFlowMouseMove={sendCursorMove}
          />
          <NodeSidebar data-onboarding="node-sidebar" onDragStart={onDragStart} onAddNode={onAddNode} />
        </div>

        {/* Resizable divider + panel */}
        {bottomPanel && (
          <>
            {/* Drag handle */}
            <div
              onMouseDown={onDividerMouseDown}
              className="h-px w-full cursor-row-resize shrink-0 z-10 transition-colors"
              style={{ background: 'var(--t-bd)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-aa)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-bd)'; }}
            />

            {/* Panel container */}
            <div
              className="flex flex-col overflow-hidden shrink-0"
              style={{ height: panelSize, background: 'var(--t-s)', borderTop: '1px solid var(--t-bd)' }}
            >
              {bottomPanel === 'split' ? (
                <div className={`flex-1 flex overflow-hidden ${splitDir === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
                  {/* Chat pane */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 shrink-0" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                      <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--t-m)' }}>
                        <MessageSquare className="w-3 h-3" strokeWidth={1.5} /> {t.workflow.iaChat}
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <AIChatPanel
                        workflowId={id}
                        workflowName={name}
                        nodes={nodes}
                        edges={edges}
                        selectedNode={selectedNodeForAI}
                        onApplyActions={handleAIApplyActions}
                        onRestoreSnapshot={handleAIRestoreSnapshot}
                      />
                    </div>
                  </div>
                  <div className={splitDir === 'horizontal' ? 'w-px shrink-0' : 'h-px shrink-0'} style={{ background: 'var(--t-bd)' }} />
                  {/* Console pane */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 shrink-0" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                      <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--t-m)' }}>
                        <Terminal className="w-3 h-3" strokeWidth={1.5} /> {t.workflow.console}
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <ConsolePanel logs={consoleLogs} onClear={() => setConsoleLogs([])} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-3 py-1.5 shrink-0" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--t-m)' }}>
                      {bottomPanel === 'chat'
                        ? <><MessageSquare className="w-3 h-3" strokeWidth={1.5} /> {t.workflow.iaChat}</>
                        : <><Terminal className="w-3 h-3" strokeWidth={1.5} /> {t.workflow.console}</>}
                    </span>
                    <button
                      onClick={() => setBottomPanel(null)}
                      className="p-0.5 rounded transition"
                      style={{ color: 'var(--t-m)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  {bottomPanel === 'console'
                    ? <div className="flex-1 overflow-hidden"><ConsolePanel logs={consoleLogs} onClear={() => setConsoleLogs([])} /></div>
                    : <div className="flex-1 overflow-hidden">
                        <AIChatPanel
                          workflowId={id}
                          workflowName={name}
                          nodes={nodes}
                          edges={edges}
                          selectedNode={selectedNodeForAI}
                          onApplyActions={handleAIApplyActions}
                          onRestoreSnapshot={handleAIRestoreSnapshot}
                        />
                      </div>
                  }
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom status bar ─────────────────────────────────────── */}
      <div
        data-onboarding="wf-bottom-bar"
        className="flex items-center justify-between h-8 px-3 shrink-0"
        style={{ background: 'var(--t-s)', borderTop: '1px solid var(--t-bd)' }}
      >
        {/* Left: panel toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePanel('chat')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition"
            style={{
              background: (bottomPanel === 'chat' || bottomPanel === 'split') ? 'var(--t-aa)' : '',
              color:      (bottomPanel === 'chat' || bottomPanel === 'split') ? 'var(--t-a)' : 'var(--t-m)',
            }}
            onMouseEnter={e => { if (bottomPanel !== 'chat' && bottomPanel !== 'split') { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; } }}
            onMouseLeave={e => { if (bottomPanel !== 'chat' && bottomPanel !== 'split') { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; } }}
          >
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t.workflow.chat}
          </button>
          <button
            onClick={() => togglePanel('console')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition"
            style={{
              background: (bottomPanel === 'console' || bottomPanel === 'split') ? 'var(--t-aa)' : '',
              color:      (bottomPanel === 'console' || bottomPanel === 'split') ? 'var(--t-a)' : 'var(--t-m)',
            }}
            onMouseEnter={e => { if (bottomPanel !== 'console' && bottomPanel !== 'split') { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; } }}
            onMouseLeave={e => { if (bottomPanel !== 'console' && bottomPanel !== 'split') { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; } }}
          >
            <Terminal className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t.workflow.console}
          </button>
        </div>

        {/* Right: split direction */}
        <div className="relative" ref={splitMenuRef}>
          <button
            onClick={() => setSplitMenuOpen(o => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition"
            style={{
              background: bottomPanel === 'split' ? 'var(--t-aa)' : '',
              color:      bottomPanel === 'split' ? 'var(--t-a)' : 'var(--t-m)',
            }}
            onMouseEnter={e => { if (bottomPanel !== 'split') { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; } }}
            onMouseLeave={e => { if (bottomPanel !== 'split') { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; } }}
          >
            {splitDir === 'vertical'
              ? <SplitSquareVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
              : <SplitSquareHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {t.workflow.split}
            <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
          </button>
          {splitMenuOpen && (
            <div
              className="absolute bottom-full right-0 mb-1 w-48 rounded-lg shadow-xl overflow-hidden z-50"
              style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}
            >
              <button
                onClick={() => { setSplitDir('vertical'); setBottomPanel('split'); setSplitMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs transition"
                style={{ color: bottomPanel === 'split' && splitDir === 'vertical' ? 'var(--t-a)' : 'var(--t-sub)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <SplitSquareVertical className="w-4 h-4" strokeWidth={1.5} />
                {t.workflow.topBottom}
              </button>
              <button
                onClick={() => { setSplitDir('horizontal'); setBottomPanel('split'); setSplitMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs transition"
                style={{ color: bottomPanel === 'split' && splitDir === 'horizontal' ? 'var(--t-a)' : 'var(--t-sub)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <SplitSquareHorizontal className="w-4 h-4" strokeWidth={1.5} />
                {t.workflow.leftRight}
              </button>
            </div>
          )}
        </div>
      </div>

      {configNode && (
        <NodeConfigPanel
          node={configNode}
          botInfo={botInfo}
          graphNodes={nodes}
          graphEdges={edges}
          execData={nodeExecData[configNode.id]}
          allExecData={nodeExecData}
          onClose={() => setConfigNode(null)}
          onSave={handleConfigSave}
        />
      )}

      {/* ── Keyboard Shortcuts Modal ─────────────────────────────────── */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative rounded-xl shadow-2xl p-6 w-full max-w-md"
            style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--t-tx)' }}>
                <Keyboard className="w-4 h-4" strokeWidth={1.5} style={{ color: 'var(--t-a)' }} />
                {t.workflow.keyboardShortcuts}
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded transition"
                style={{ color: 'var(--t-m)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; }}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-2 text-xs" style={{ color: 'var(--t-sub)' }}>
              {([
                ['Ctrl + S', t.workflow.shortcutSave],
                ['Ctrl + Z', t.workflow.shortcutUndo],
                ['Ctrl + Y', t.workflow.shortcutRedo],
                ['Ctrl + A', t.workflow.shortcutSelectAll],
                ['Ctrl + C', t.workflow.shortcutCopy],
                ['Ctrl + V', t.workflow.shortcutPaste],
                ['Ctrl + X', t.workflow.shortcutCut],
                ['Ctrl + D', t.workflow.shortcutDuplicate],
                ['Delete', t.workflow.shortcutDelete],
                ['Drag', t.workflow.shortcutPan],
                ['Ctrl + Drag', t.workflow.shortcutSelection],
                ['Shift + Click', t.workflow.shortcutMultiSelect],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-1.5 px-1" style={{ borderBottom: '1px solid var(--t-bd)' }}>
                  <span style={{ color: 'var(--t-tx)' }}>{label}</span>
                  <kbd
                    className="px-2 py-0.5 rounded text-[11px] font-mono"
                    style={{ background: 'var(--t-bg)', border: '1px solid var(--t-bd)', color: 'var(--t-m)' }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Placeholder panels ────────────────────────────────────────────────────────

function ConsolePanel({ logs, onClear }: { logs: Array<{ ts: number; level: string; message: string }>; onClear: () => void }) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
  }, [logs]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--t-bg)' }}>
      {/* toolbar */}
      <div className="flex items-center px-3 py-1 shrink-0" style={{ borderBottom: '1px solid var(--t-bd)' }}>
        <span className="text-xs font-mono mr-auto" style={{ color: 'var(--t-m)' }}>{logs.length} {t.workflow.lines}</span>
        <button
          onClick={onClear}
          className="text-xs transition px-2 py-0.5 rounded"
          style={{ color: 'var(--t-m)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-tx)'; (e.currentTarget as HTMLElement).style.background = 'var(--t-s2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-m)'; (e.currentTarget as HTMLElement).style.background = ''; }}
        >
          {t.workflow.clear}
        </button>
      </div>
      {/* log entries */}
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs space-y-0.5">
        {logs.length === 0 ? (
          <p style={{ color: 'var(--t-bd)' }}>— {t.workflow.waitingLogs} —</p>
        ) : (
          logs.map((entry, i) => (
            <div key={i} className="flex gap-2 leading-5 min-w-0">
              <span className="shrink-0 select-none" style={{ color: 'var(--t-m)' }}>
                {new Date(entry.ts).toLocaleTimeString()}
              </span>
              <span
                style={{
                  color: entry.level === 'error' ? '#f87171' : entry.level === 'warn' ? '#facc15' : 'var(--t-tx)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {entry.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}


