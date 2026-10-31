import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  Cpu,
  Layers,
  ShieldCheck,
  Clock,
  DollarSign,
  Check,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ScenarioPresetBar from '../components/ScenarioPresetBar';
import { DOMAIN_OPTIONS } from '../utils/scenarioPresets';

export default function NewMissionPage() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const [formData, setFormData] = useState({
    workspace_id: '',
    title: '',
    domain: 'SUPPLY_CHAIN_OPS',
    urgency: 'HIGH',
    execution_mode: 'HITL_GOVERNED',
    trigger_context: '',
    involved_systems: ['SAP S/4HANA Inventory ERP', 'Zendesk Enterprise CRM'],
    constraints_config: {
      maxBudgetUsd: 5000,
      targetSlaMinutes: 30,
      complianceStrictness: 'STANDARD',
    },
  });

  const [customSystemInput, setCustomSystemInput] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        setLoadingWorkspaces(true);
        const res = await axiosClient.get('/workspaces');
        if (res.data.success && res.data.workspaces?.length > 0) {
          setWorkspaces(res.data.workspaces);
          setFormData((prev) => ({
            ...prev,
            workspace_id: res.data.workspaces[0].id,
          }));
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      } finally {
        setLoadingWorkspaces(false);
      }
    }
    loadWorkspaces();
  }, []);

  const handleSelectPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      domain: preset.domain,
      urgency: preset.urgency,
      execution_mode: preset.execution_mode,
      involved_systems: preset.involved_systems,
      constraints_config: preset.constraints_config,
      trigger_context: preset.trigger_context,
    }));
  };

  const handleAddSystem = () => {
    if (!customSystemInput.trim()) return;
    if (!formData.involved_systems.includes(customSystemInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        involved_systems: [...prev.involved_systems, customSystemInput.trim()],
      }));
    }
    setCustomSystemInput('');
  };

  const handleRemoveSystem = (sys) => {
    setFormData((prev) => ({
      ...prev,
      involved_systems: prev.involved_systems.filter((s) => s !== sys),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.involved_systems.length === 0) {
      setError('Please select or add at least one enterprise system.');
      return;
    }

    if (formData.trigger_context.length < 20) {
      setError('Operational trigger context must be at least 20 characters.');
      return;
    }

    setIsDeploying(true);
    try {
      const res = await axiosClient.post('/missions/orchestrate', formData);
      if (res.data.success && res.data.mission) {
        navigate(`/missions/${res.data.mission.id}`);
      } else {
        throw new Error(res.data.error || 'Orchestration failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (err.response?.data?.details && JSON.stringify(err.response.data.details)) ||
          err.message ||
          'Failed to orchestrate mission'
      );
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
          <span>Deploy Autonomous Multi-Agent Mission</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dispatch the 4-Agent Council to analyze operational bottlenecks, evaluate policy options, synthesize cross-system mutations, and enforce governance.
        </p>
      </div>

      {/* 1-Click Scenario Preset Bar */}
      <ScenarioPresetBar onSelectPreset={handleSelectPreset} />

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Orchestration Error</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 sm:p-6 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-5">
          {/* Workspace & Urgency Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Operational Workspace <span className="text-rose-400">*</span>
              </label>
              {loadingWorkspaces ? (
                <div className="text-xs text-slate-500 font-mono py-2">Loading workspaces...</div>
              ) : workspaces.length === 0 ? (
                <div className="text-xs text-rose-400 py-1">No workspaces found. Please create one first.</div>
              ) : (
                <select
                  required
                  value={formData.workspace_id}
                  onChange={(e) => setFormData({ ...formData, workspace_id: e.target.value })}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} ({ws.department})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Urgency & Priority Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: u })}
                    className={`py-2 text-[11px] font-semibold rounded border transition-colors ${
                      formData.urgency === u
                        ? u === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : u === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-slate-800 text-cyan-300 border-cyan-700'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mission Title / Operational Trigger Goal <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={160}
              placeholder="e.g. Critical Port Congestion Stockout Recovery for SKU-402"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Domain & Governance Mode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Operational Domain <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full rounded bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Execution Governance Mode
              </label>
              <select
                value={formData.execution_mode}
                onChange={(e) => setFormData({ ...formData, execution_mode: e.target.value })}
                className="w-full rounded bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="HITL_GOVERNED">HITL_GOVERNED (High-impact steps pause for human approval)</option>
                <option value="AUTONOMOUS">AUTONOMOUS (Fully automated execution pipeline)</option>
                <option value="DRY_RUN_SIMULATION">DRY_RUN_SIMULATION (Simulation only - zero external calls)</option>
              </select>
            </div>
          </div>

          {/* Involved Enterprise Systems Multi-Select Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Involved Enterprise Systems & Gateways <span className="text-rose-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {formData.involved_systems.map((sys) => (
                <span
                  key={sys}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <span>{sys}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSystem(sys)}
                    className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add another system (e.g. Workday HRIS, AWS APM, Stripe)..."
                value={customSystemInput}
                onChange={(e) => setCustomSystemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSystem();
                  }
                }}
                className="flex-1 rounded bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddSystem}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Add System
              </button>
            </div>
          </div>

          {/* Operational Guardrails & Constraints */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quantitative Operational Guardrails & Constraints</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Max Budget Envelope ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formData.constraints_config.maxBudgetUsd}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        constraints_config: {
                          ...formData.constraints_config,
                          maxBudgetUsd: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded bg-slate-900 border border-slate-800 pl-6 pr-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target SLA (Minutes)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.constraints_config.targetSlaMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        constraints_config: {
                          ...formData.constraints_config,
                          targetSlaMinutes: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Compliance Tier</label>
                <select
                  value={formData.constraints_config.complianceStrictness}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints_config: {
                        ...formData.constraints_config,
                        complianceStrictness: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="STANDARD">STANDARD (Internal Ops)</option>
                  <option value="STRICT">STRICT (SOX / SOC-2)</option>
                  <option value="REGULATED">REGULATED (Banking / HIPAA)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trigger Context Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Raw Operational Problem & Trigger Context <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              minLength={20}
              maxLength={2500}
              placeholder="Describe the business anomaly, fragmented workflow symptoms, affected services, and desired target state..."
              value={formData.trigger_context}
              onChange={(e) => setFormData({ ...formData, trigger_context: e.target.value })}
              className="w-full rounded bg-slate-950 border border-slate-800 p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
            />
            <div className="text-[11px] text-slate-500 flex justify-between mt-1">
              <span>Detailed context produces tighter DAG steps and payload accuracy.</span>
              <span>{formData.trigger_context.length} / 2500 chars</span>
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="submit"
            disabled={isDeploying}
            className="w-full sm:w-auto px-8 py-3 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/30 disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Dispatching Gemini 4-Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Deploy Autonomous Multi-Agent Council</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
