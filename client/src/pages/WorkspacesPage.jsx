import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Server,
  Activity,
  Shield,
  Clock,
  ExternalLink,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Workspace creation modal
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);
  const [wsFormData, setWsFormData] = useState({
    name: '',
    department: '',
    description: '',
    default_governance_mode: 'HITL_GOVERNED',
  });

  // System registration modal
  const [isSysModalOpen, setIsSysModalOpen] = useState(false);
  const [targetWsId, setTargetWsId] = useState(null);
  const [sysFormData, setSysFormData] = useState({
    system_name: '',
    system_type: 'ERP',
    endpoint_reference: '',
    status: 'HEALTHY',
    sla_target_minutes: 30,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/workspaces');
      if (res.data.success) {
        setWorkspaces(res.data.workspaces || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/workspaces', wsFormData);
      if (res.data.success) {
        setIsWsModalOpen(false);
        setWsFormData({
          name: '',
          department: '',
          description: '',
          default_governance_mode: 'HITL_GOVERNED',
        });
        fetchWorkspaces();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSystem = async (e) => {
    e.preventDefault();
    if (!targetWsId) return;
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/workspaces/${targetWsId}/systems`, sysFormData);
      if (res.data.success) {
        setIsSysModalOpen(false);
        setSysFormData({
          system_name: '',
          system_type: 'ERP',
          endpoint_reference: '',
          status: 'HEALTHY',
          sla_target_minutes: 30,
        });
        fetchWorkspaces();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to register system');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSystem = async (systemId) => {
    if (!window.confirm('Are you sure you want to remove this enterprise system connection?')) return;
    try {
      await axiosClient.delete(`/workspaces/systems/${systemId}`);
      fetchWorkspaces();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete system');
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    if (!window.confirm('Delete this workspace and all associated systems? This action is irreversible.')) return;
    try {
      await axiosClient.delete(`/workspaces/${workspaceId}`);
      fetchWorkspaces();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete workspace');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <span>Workspaces & Enterprise System Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure operational business units, connect fragmented APIs (ERP, CRM, ITSM, FinOps), and govern SLA targets
          </p>
        </div>

        <button
          onClick={() => setIsWsModalOpen(true)}
          className="px-4 py-2 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          Loading workspace registries and system health...
        </div>
      ) : workspaces.length === 0 ? (
        <div className="p-12 rounded-lg bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No Workspaces Configured</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create an operational workspace to organize your systems and dispatch autonomous missions.
          </p>
          <button
            onClick={() => setIsWsModalOpen(true)}
            className="px-4 py-2 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
          >
            Create First Workspace
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="rounded-lg bg-slate-900/40 border border-slate-800/80 overflow-hidden"
            >
              {/* Workspace Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-base font-bold text-slate-100">{ws.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {ws.department}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ws.default_governance_mode}
                    </span>
                  </div>
                  {ws.description && (
                    <p className="text-xs text-slate-400 max-w-2xl">{ws.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setTargetWsId(ws.id);
                      setIsSysModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect System</span>
                  </button>
                  <button
                    onClick={() => handleDeleteWorkspace(ws.id)}
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete Workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Connected Systems Grid */}
              <div className="p-4 sm:p-5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Registered Enterprise Endpoints ({ws.systems?.length || 0})
                </div>

                {!ws.systems || ws.systems.length === 0 ? (
                  <div className="p-4 rounded border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    No enterprise systems connected yet. Click "Connect System" to register SAP ERP, Zendesk, CloudWatch, or Stripe.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {ws.systems.map((sys) => (
                      <div
                        key={sys.id}
                        className="p-3.5 rounded bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="font-mono text-cyan-400 font-semibold">{sys.system_type}</span>
                            <span
                              className={`flex items-center space-x-1 text-[10px] font-semibold ${
                                sys.status === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              <span>{sys.status}</span>
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-200 truncate">{sys.system_name}</div>
                          <div className="text-[10px] font-mono text-slate-500 truncate mt-1">
                            {sys.endpoint_reference}
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-900 mt-3 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Target SLA: {sys.sla_target_minutes}m</span>
                          </span>
                          <button
                            onClick={() => handleDeleteSystem(sys.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                            title="Disconnect System"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Workspace */}
      {isWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-100">Create Operational Workspace</h3>
              <button onClick={() => setIsWsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMEA Supply Chain Operations"
                  value={wsFormData.name}
                  onChange={(e) => setWsFormData({ ...wsFormData, name: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Logistics & Procurement"
                  value={wsFormData.department}
                  onChange={(e) => setWsFormData({ ...wsFormData, department: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of this operational unit..."
                  value={wsFormData.description}
                  onChange={(e) => setWsFormData({ ...wsFormData, description: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Governance Mode</label>
                <select
                  value={wsFormData.default_governance_mode}
                  onChange={(e) => setWsFormData({ ...wsFormData, default_governance_mode: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="HITL_GOVERNED">HITL_GOVERNED (High-risk actions pause for human approval)</option>
                  <option value="AUTONOMOUS">AUTONOMOUS (Fully automated execution)</option>
                  <option value="DRY_RUN_SIMULATION">DRY_RUN_SIMULATION (Simulation only - zero mutation)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsWsModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Connect System */}
      {isSysModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-100">Register Enterprise System</h3>
              <button onClick={() => setIsSysModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSystem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">System Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NetSuite ERP Production"
                  value={sysFormData.system_name}
                  onChange={(e) => setSysFormData({ ...sysFormData, system_name: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">System Type</label>
                  <select
                    value={sysFormData.system_type}
                    onChange={(e) => setSysFormData({ ...sysFormData, system_type: e.target.value })}
                    className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ERP">ERP</option>
                    <option value="CRM">CRM</option>
                    <option value="ITSM">ITSM</option>
                    <option value="FINOPS">FINOPS</option>
                    <option value="HRIS">HRIS</option>
                    <option value="LOGISTICS">LOGISTICS</option>
                    <option value="MESSAGING">MESSAGING</option>
                    <option value="CLOUD_INFRA">CLOUD_INFRA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target SLA (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sysFormData.sla_target_minutes}
                    onChange={(e) => setSysFormData({ ...sysFormData, sla_target_minutes: e.target.value })}
                    className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Endpoint Reference / Webhook URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://api.internal.enterprise.com/v1/orders"
                  value={sysFormData.endpoint_reference}
                  onChange={(e) => setSysFormData({ ...sysFormData, endpoint_reference: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Health Status</label>
                <select
                  value={sysFormData.status}
                  onChange={(e) => setSysFormData({ ...sysFormData, status: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="HEALTHY">HEALTHY</option>
                  <option value="DEGRADED">DEGRADED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSysModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
