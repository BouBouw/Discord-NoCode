import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  type Connection,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  useReactFlow,
  type Node,
  type Edge,
  type BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NODE_TYPES, type NodeType, type NodeData } from '../constants/nodeTypes';
import CustomNode from './NodeTypes/CustomNode';
import { useToast } from '../contexts/ToastContext';
import CoreBotNode from './NodeTypes/CoreBotNode';
import CollaborationCursors from './CollaborationCursors';
import type { Collaborator } from '../hooks/useCollaboration';

const HANDLER_TYPES = ['commandHandlerSuite', 'eventHandlerSuite'];

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  coreBot: CoreBotNode,
};

interface WorkflowCanvasProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node<NodeData>) => void;
  snapToGrid?: boolean;
  showMinimap?: boolean;
  collaborators?: Map<number, Collaborator>;
  onFlowMouseMove?: (x: number, y: number) => void;
  'data-onboarding'?: string;
}

function WorkflowCanvasContent({ nodes, edges, onNodesChange, onEdgesChange, onNodeDoubleClick, snapToGrid = false, showMinimap = true, collaborators, onFlowMouseMove, 'data-onboarding': dataOnboarding }: WorkflowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const toast = useToast();

  // Mouse move handler for collaboration cursor broadcasting
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!onFlowMouseMove) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      onFlowMouseMove(pos.x, pos.y);
    },
    [onFlowMouseMove, screenToFlowPosition]
  );

  // Track Ctrl key: when held, switch from pan mode to rubber-band selection mode
  const [ctrlHeld, setCtrlHeld] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Control') setCtrlHeld(true); };
    const onKeyUp   = (e: KeyboardEvent) => { if (e.key === 'Control') setCtrlHeld(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, []);

  // Block deletion and position changes for the coreBot node
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      const filtered = changes.filter((c) => {
        if (c.type === 'remove' && c.id === 'coreBot') return false;
        if (c.type === 'position' && c.id === 'coreBot') return false;
        return true;
      });
      if (filtered.length > 0) onNodesChange(filtered);
    },
    [onNodesChange]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      onEdgesChange([{ type: 'add', item: params }]);
    },
    [onEdgesChange]
  );

  // Handler nodes' input handle only accepts connections from coreBot
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!targetNode) return true;
      const targetType = (targetNode.data as NodeData).type;
      if (HANDLER_TYPES.includes(targetType) && connection.targetHandle === 'input') {
        return connection.source === 'coreBot';
      }
      return true;
    },
    [nodes]
  );

  const addNode = useCallback(
    (nodeType: NodeType, position: { x: number; y: number }) => {
      // Validate node type exists
      if (!(nodeType in NODE_TYPES)) {
        console.error(`Invalid node type: ${nodeType}`);
        toast('error', `Invalid node type: ${nodeType}`);
        return;
      }

      const nodeConfig = NODE_TYPES[nodeType];
      if (!nodeConfig) {
        console.error(`Node config not found for type: ${nodeType}`);
        return;
      }

      const newNode: Node<NodeData> = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: nodeConfig.label,
          type: nodeConfig.type,
          category: nodeConfig.category,
          icon: nodeConfig.icon,
          color: nodeConfig.color,
          isRequired: nodeConfig.required,
        },
      };

      onNodesChange([{
        type: 'add',
        item: newNode,
      }]);
    },
    [onNodesChange]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) {
        console.warn('No node type data found in drag event');
        return;
      }

      // Validate node type before adding
      if (!(nodeType in NODE_TYPES)) {
        console.error(`Invalid node type: ${nodeType}`);
        toast('error', `Invalid node type: ${nodeType}`);
        return;
      }

      // Prevent dropping a second coreBot
      if (nodeType === 'coreBot' && nodes.some((n) => n.id === 'coreBot')) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(nodeType as NodeType, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Use the proper BackgroundVariant type
  const backgroundVariant: BackgroundVariant = 'dots' as BackgroundVariant;

  return (
    <div data-onboarding={dataOnboarding} className="flex-1 h-full relative" onMouseMove={handleMouseMove}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        selectionOnDrag={ctrlHeld}
        selectionKeyCode={null}
        multiSelectionKeyCode="Shift"
        panOnDrag={!ctrlHeld}
        snapToGrid={snapToGrid}
        snapGrid={[16, 16]}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--t-bg)' }}
      >
        <Controls style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', borderRadius: 8 }} />
        {showMinimap && (
          <MiniMap
            style={{ background: 'var(--t-s)', border: '1px solid var(--t-bd)', borderRadius: 8 }}
            nodeColor="var(--t-a)"
            maskColor="rgba(0,0,0,0.4)"
          />
        )}
        <Background variant={backgroundVariant} gap={12} size={1} color="var(--t-bd)" />
      </ReactFlow>
      {collaborators && <CollaborationCursors collaborators={collaborators} />}
    </div>
  );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return <WorkflowCanvasContent {...props} />;
}

export type { WorkflowCanvasProps };
