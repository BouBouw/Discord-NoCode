import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Edit2, Trash2, Bot as BotIcon, FileText, Clock, Power, PowerOff, AlertCircle } from 'lucide-react';
import { getWorkflows, deleteWorkflow, deployWorkflow } from '../services/workflowService.js';
import { botAPI, type Bot, type BotCreateData, type BotUpdateData } from '../services/api';
import BotModal from '../components/BotModal';

interface Workflow {
  id: number;
  name: string;
  description: string | null;
  nodes: any[];
  connections: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple';
  total?: number;
}

interface WorkflowItemProps {
  workflow: Workflow;
  onEdit: () => void;
  onDelete: () => void;
  onDeploy: () => void;
}

interface BotItemProps {
  bot: Bot;
  loading?: 'delete' | 'start' | 'stop' | null;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

type LoadingState = 'delete' | 'deploy' | 'start' | 'stop' | null;

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<number, LoadingState>>({});
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [workflowsData, botsData] = await Promise.all([
        getWorkflows(),
        botAPI.list(),
      ]);
      setWorkflows(workflowsData);
      setBots(botsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      alert(`Failed to load dashboard data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    setLoadingStates(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await deleteWorkflow(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workflow';
      alert(`Failed to delete workflow: ${errorMessage}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: null }));
    }
  }

  async function handleDeploy(id: number) {
    setLoadingStates(prev => ({ ...prev, [id]: 'deploy' }));
    try {
      await deployWorkflow(id);
      await loadData();
      alert('Workflow deployed successfully!');
    } catch (error) {
      console.error('Failed to deploy workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to deploy workflow';
      alert(`Failed to deploy workflow: ${errorMessage}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: null }));
    }
  }

  async function handleDeleteBot(id: number) {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    setLoadingStates(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await botAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete bot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bot';
      alert(`Failed to delete bot: ${errorMessage}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: null }));
    }
  }

  async function handleStartBot(id: number) {
    setLoadingStates(prev => ({ ...prev, [id]: 'start' }));
    try {
      await botAPI.start(id);
      await loadData();
      alert('Bot started successfully!');
    } catch (error) {
      console.error('Failed to start bot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start bot';
      alert(`Failed to start bot: ${errorMessage}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: null }));
    }
  }

  async function handleStopBot(id: number) {
    setLoadingStates(prev => ({ ...prev, [id]: 'stop' }));
    try {
      await botAPI.stop(id);
      await loadData();
      alert('Bot stopped successfully!');
    } catch (error) {
      console.error('Failed to stop bot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop bot';
      alert(`Failed to stop bot: ${errorMessage}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: null }));
    }
  }

  function openBotModal(bot: Bot | null = null) {
    setEditingBot(bot);
    setShowBotModal(true);
  }

  async function handleSaveBot(data: BotCreateData | BotUpdateData, id?: number) {
    try {
      if (id) {
        // Editing: validate that data is valid for update
        const updateData: BotUpdateData = {
          name: 'name' in data ? data.name : undefined,
          workflow_id: 'workflow_id' in data ? data.workflow_id : undefined,
        };
        await botAPI.update(id, updateData);
        await loadData();
        alert('Bot updated successfully!');
      } else {
        // Creating: validate that data includes discord_token
        if ('discord_token' in data && data.discord_token) {
          await botAPI.create(data as BotCreateData);
          await loadData();
          alert('Bot created successfully!');
        } else {
          throw new Error('Discord token is required for creating a bot');
        }
      }
    } catch (error) {
      console.error('Failed to save bot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save bot';
      alert(`Failed to save bot: ${errorMessage}`);
      throw error; // Re-throw to let the modal handle it
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Manage your Discord bots and workflows</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<BotIcon className="w-8 h-8" />}
          title="Active Bots"
          value={bots.filter(b => b.status === 'running').length}
          total={bots.length}
          color="blue"
        />
        <StatCard
          icon={<FileText className="w-8 h-8" />}
          title="Workflows"
          value={workflows.length}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-8 h-8" />}
          title="Max Bots"
          value="3"
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Your Bots</h2>
            <button
              onClick={() => openBotModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Bot</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {bots.length === 0 ? (
            <div className="text-center py-12">
              <BotIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No bots yet</h3>
              <p className="text-slate-600 mb-4">Create your first bot to start automating Discord</p>
              <button
                onClick={() => openBotModal()}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Bot</span>
              </button>
            </div>
          ) : (
            <div className="divide-y-4">
              {bots.map((bot) => (
                <BotItem
                  key={bot.id}
                  bot={bot}
                  loading={(
                    loadingStates[bot.id] === 'delete' ||
                    loadingStates[bot.id] === 'start' ||
                    loadingStates[bot.id] === 'stop'
                  ) ? loadingStates[bot.id] as 'delete' | 'start' | 'stop' | null : null}
                  onStart={() => handleStartBot(bot.id)}
                  onStop={() => handleStopBot(bot.id)}
                  onEdit={() => openBotModal(bot)}
                  onDelete={() => handleDeleteBot(bot.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-8 mt-8">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Your Workflows</h2>
              <button
                onClick={() => navigate('/workflow/new')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Workflow</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {workflows.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No workflows yet</h3>
                <p className="text-slate-600 mb-4">Create your first workflow to start building your bot</p>
                <Link
                  to="/workflow/new"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Workflow</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y-4">
                {workflows.map((workflow) => (
                  <WorkflowItem
                    key={workflow.id}
                    workflow={workflow}
                    loading={loadingStates[workflow.id] as 'delete' | 'deploy' | null}
                    onEdit={() => navigate(`/workflow/${workflow.id}`)}
                    onDelete={() => handleDelete(workflow.id)}
                    onDeploy={() => handleDeploy(workflow.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showBotModal && (
        <BotModal
          bot={editingBot}
          workflows={workflows}
          onClose={() => setShowBotModal(false)}
          onSave={handleSaveBot}
        />
      )}
    </div>
  );
}

const StatCard = memo(function StatCard({ icon, title, value, color, total }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg ${colorClasses[color]}`}>
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mt-2">
        {value}
        {total !== undefined && <span className="text-lg text-slate-600"> / {total}</span>}
      </h3>
      <p className="text-slate-600 mt-1">{title}</p>
    </div>
  );
});

const WorkflowItem = memo(function WorkflowItem({ workflow, loading, onEdit, onDelete, onDeploy }: WorkflowItemProps & { loading?: 'delete' | 'deploy' | null }) {
  const isDeleting = loading === 'delete';
  const isDeploying = loading === 'deploy';

  return (
    <div className="p-6 hover:bg-slate-50 transition rounded-lg border border-l-2 border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-900">{workflow.name}</h3>
          <p className="text-slate-600 text-sm mt-1">
            {workflow.description || 'No description'}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Created {new Date(workflow.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {workflow.is_active && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              Active
            </span>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 hover:text-white transition"
            disabled={isDeleting || isDeploying}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDeploy}
            className="p-2 text-green-600 hover:bg-green-50 hover:text-white transition"
            disabled={isDeleting || isDeploying}
          >
            {isDeploying ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 hover:text-white transition"
            disabled={isDeleting || isDeploying}
          >
            {isDeleting ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

const BotItem = memo(function BotItem({ bot, loading, onStart, onStop, onEdit, onDelete }: BotItemProps) {
  const isDeleting = loading === 'delete';
  const isStarting = loading === 'start';
  const isStopping = loading === 'stop';

  const statusConfig = {
    idle: { color: 'bg-slate-100 text-slate-700', label: 'Idle', icon: null },
    running: { color: 'bg-green-100 text-green-700', label: 'Running', icon: null },
    stopped: { color: 'bg-red-100 text-red-700', label: 'Stopped', icon: null },
    error: { color: 'bg-red-100 text-red-700', label: 'Error', icon: <AlertCircle className="w-4 h-4" /> },
  };

  const status = statusConfig[bot.status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div className="p-6 hover:bg-slate-50 transition rounded-lg border border-l-2 border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-900">{bot.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-3 py-1 text-sm rounded-full flex items-center ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-2">
            Created {new Date(bot.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {bot.status === 'idle' || bot.status === 'stopped' ? (
            <button
              onClick={onStart}
              className="p-2 text-green-600 hover:bg-green-50 hover:text-white transition"
              disabled={isDeleting || isStarting || isStopping}
              title="Start bot"
            >
              {isStarting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
              ) : (
                <Power className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              onClick={onStop}
              className="p-2 text-red-600 hover:bg-red-50 hover:text-white transition"
              disabled={isDeleting || isStarting || isStopping}
              title="Stop bot"
            >
              {isStopping ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              ) : (
                <PowerOff className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 hover:text-white transition"
            disabled={isDeleting || isStarting || isStopping}
            title="Edit bot"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 hover:text-white transition"
            disabled={isDeleting || isStarting || isStopping}
            title="Delete bot"
          >
            {isDeleting ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
