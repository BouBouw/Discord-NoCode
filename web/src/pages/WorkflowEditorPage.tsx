import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange } from 'reactflow';
import { ArrowLeft, Save, Play, Bot } from 'lucide-react';
import { getWorkflow, createWorkflow, updateWorkflow, deployWorkflow } from '../services/workflowService';
import { type NodeType, type NodeData, NODE_TYPES } from '../constants/nodeTypes';
import NodeSidebar from '../components/NodeSidebar';
import WorkflowCanvas from '../components/WorkflowCanvas';
import type { Node, Edge } from 'reactflow';

// Proper types for API workflow data
interface WorkflowNode {
  id: number;
  type: NodeType;
  label: string;
  category: string;
  x: number;
  y: number;
  color: string;
}

interface WorkflowConnection {
  id: string | undefined;
  source: number;
  target: number;
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

  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);

  // Helper function to transform React Flow nodes to API format
  const transformNodesToApi = useCallback((nodes: Node<NodeData>[]): WorkflowNode[] => {
    const result: WorkflowNode[] = [];
    for (const node of nodes) {
      const nodeId = parseInt(node.id);
      if (isNaN(nodeId)) {
        console.warn(`Invalid node ID: ${node.id}`);
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
      });
    }
    return result;
  }, []);

  // Helper function to transform React Flow edges to API format
  const transformEdgesToApi = useCallback((edges: Edge[]): WorkflowConnection[] => {
    const result: WorkflowConnection[] = [];
    for (const edge of edges) {
      const sourceId = parseInt(edge.source);
      const targetId = parseInt(edge.target);

      if (isNaN(sourceId) || isNaN(targetId)) {
        console.warn(`Invalid edge source/target: ${edge.source} -> ${edge.target}`);
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
            return {
              id: node.id.toString(),
              type: 'custom',
              position: { x: node.x || 0, y: node.y || 0 },
              data: {
                label: node.label,
                type: node.type,
                category: node.category as any,
                icon: nodeConfig?.icon,
                color: node.color,
                isRequired: nodeConfig?.required || false,
              },
            };
          });

          // Convert stored connections to edges
          const loadedEdges: Edge[] = workflow.connections.map((conn) => ({
            id: conn.id || `${conn.source}-${conn.target}`,
            source: conn.source.toString(),
            target: conn.target.toString(),
            sourceHandle: conn.source_handle,
            targetHandle: conn.target_handle,
          }));

          setNodes(loadedNodes);
          setEdges(loadedEdges);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to load workflow:', error);
          alert(`Failed to load workflow: ${errorMessage}`);
        } finally {
          setLoading(false);
        }
      } else {
        // Initialize with Core Bot node for new workflow
        const coreBotNode: Node<NodeData> = {
          id: 'coreBot',
          type: 'custom',
          position: { x: 250, y: 0 },
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
  }, [id, setNodes, setEdges]);

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: NodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a workflow name');
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

      alert('Workflow saved successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save workflow:', error);
      alert(`Failed to save workflow: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setDeploying(true);
    try {
      if (id && id !== 'new') {
        // Transform to API format
        const nodesData = transformNodesToApi(nodes);
        const connectionsData = transformEdgesToApi(edges);

        const workflowData: WorkflowData = {
          name: name.trim(),
          description: description.trim(),
          nodes: nodesData,
          connections: connectionsData,
        };

        await updateWorkflow(parseInt(id), workflowData);
        await deployWorkflow(parseInt(id));
        alert('Workflow deployed successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to deploy workflow:', error);
      alert(`Failed to deploy workflow: ${errorMessage}`);
    } finally {
      setDeploying(false);
    }
  };

  // Handle node changes from React Flow
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  // Handle edge changes from React Flow
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">
                {id && id !== 'new' ? 'Edit Workflow' : 'Create New Workflow'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
            {id && id !== 'new' && (
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deploying ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Deploy</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Workflow Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Awesome Bot"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What does this workflow do?"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar onDragStart={onDragStart} />
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
      </div>
    </div>
  );
}
