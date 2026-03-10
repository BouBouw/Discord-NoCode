import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Plus, Play, Edit2, Trash2, Bot, FileText, Clock } from 'lucide-react';
import { apiRequest } from '../services/api.ts';

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [workflowsData, botsData] = await Promise.all([
        apiRequest('/workflows'),
        apiRequest('/bots'),
      ]);
      setWorkflows(workflowsData);
      setBots(botsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    setLoading(true);
    try {
      await apiRequest(`/workflows/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      alert('Failed to delete workflow');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeploy(id) {
    try {
      await apiRequest(`/workflows/${id}/deploy`, { method: 'POST' });
      loadData();
      alert('Workflow deployed successfully!');
    } catch (error) {
      alert('Failed to deploy workflow');
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
          icon={<Bot className="w-8 h-8" />}
          title="Active Bots"
          value={bots.filter(b => b.status === 'active').length}
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

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Your Workflows</h2>
              <button
                onClick={() => window.location.href = '/workflow/new'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>New Workflow</span>
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
                  <span>Create Workflow</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y-4">
                {workflows.map((workflow) => (
                  <WorkflowItem
                    key={workflow.id}
                    workflow={workflow}
                    onEdit={() => window.location.href = `/workflow/${workflow.id}`}
                    onDelete={() => handleDelete(workflow.id)}
                    onDeploy={() => handleDeploy(workflow.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, total, color }) {
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
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
      <p className="text-slate-600 mt-1">{title}</p>
    </div>
  );
}

function WorkflowItem({ workflow, onEdit, onDelete, onDeploy }) {
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
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDeploy}
            className="p-2 text-green-600 hover:bg-green-50 hover:text-white transition"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 hover:text-white transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
