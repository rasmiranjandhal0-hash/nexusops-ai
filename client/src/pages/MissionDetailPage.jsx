import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Clock,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import AgentPipelineVisualizer from '../components/AgentPipelineVisualizer';
import DecisionMatrixTable from '../components/DecisionMatrixTable';
import TaskDagTimeline from '../components/TaskDagTimeline';
import AuditTrailFeed from '../components/AuditTrailFeed';
import SelfHealingModal from '../components/SelfHealingModal';

export default function MissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // HITL decision processing state
  const [isDeciding, setIsDeciding] = useState(false);

  // Self-healing re-planner modal state
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);

  const fetchMission = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get(`/missions/${id}`);
      if (res.data.success && res.data.mission) {
        setMission(res.data.mission);
      } else {
        throw new Error(res.data.error || 'Mission not found');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load mission details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();
  }, [id]);

  // Handle human-in-the-loop decision
  const handleTaskDecision = async (taskId, decision) => {
    setIsDeciding(true);
    try {
      const res = await axiosClient.patch(`/missions/${id}/tasks/${taskId}/decision`, {
        decision,
        notes: `Operator action triggered from Mission Control interface at ${new Date().toLocaleTimeString()}`,
      });
      if (res.data.success) {
        // Refresh mission state
        fetchMission();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to apply decision');
    } finally {
      setIsDeciding(false);
    }
  };

  // Handle autonomous self-healing re-planning
  const handleReplan = async (replanData) => {
    setIsReplanning(true);
    try {
      const res = await axiosClient.post(`/missions/${id}/replan`, replanData);
      if (res.data.success) {
        setIsReplanModalOpen(false);
        fetchMission();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Self-healing re-planning failed');
    } finally {
      setIsReplanning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 font-mono">Loading Multi-Agent Mission DAG...</p>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="p-8 rounded-lg bg-slate-900/40 border border-slate-800 text-center space-y-4 max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-slate-100">Unable to Load Mission</h2>
        <p className="text-xs text-slate-400">{error || 'Mission record does not exist or access is restricted.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const analysis = mission.ai_analysis_payload || {};
  const rootCause = analysis.root_cause_diagnosis || {};
  const decisionMatrix = analysis.decision_matrix || [];
  const synergyNotes = analysis.cross_system_synergy_notes || [];
  const advisories = analysis.continuous_improvement_advisory || [];
  const disclaimer = analysis.governance_disclaimer;

  const hasAwaitingApproval = (mission.tasks || []).some(
    (t) => t.task_status === 'AWAITING_APPROVAL'
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link to="/history" className="hover:text-slate-200 transition-colors flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mission Ledger</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-mono font-medium truncate max-w-xs">{mission.title}</span>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setIsReplanModalOpen(true)}
            className="px-3 py-1.5 rounded text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800 transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Anomaly & Re-Plan</span>
          </button>
          <button
            onClick={fetchMission}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            title="Refresh DAG state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mission Header Banner */}
      <div className="p-5 sm:p-6 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                {mission.domain.replace(/_/g, ' ')}
              </span>
              <span
                className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                  mission.urgency === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {mission.urgency} URGENCY
              </span>
              <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                Mode: {mission.execution_mode}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              {mission.title}
            </h1>

            <p className="text-xs text-slate-400">
              Workspace: <span className="text-slate-300 font-medium">{mission.workspace_name}</span> ({mission.workspace_department}) &bull; Initialized {new Date(mission.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-end gap-1.5 shrink-0">
            <span
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                mission.status === 'COMPLETED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : mission.status === 'AWAITING_HITL'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
              }`}
            >
              {mission.status.replace('_', ' ')}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Confidence: <strong className="text-cyan-400">{mission.confidence_score}%</strong>
            </span>
          </div>
        </div>

        {/* Operational ROI Bar */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Autonomous Duration</div>
            <div className="text-sm font-bold text-slate-100 font-mono tabular-nums">
              {mission.autonomous_execution_seconds}s
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Manual Hours Saved</div>
            <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
              {Math.round(mission.estimated_manual_minutes / 60 * 10) / 10} hrs
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Estimated Cost Savings</div>
            <div className="text-sm font-bold text-cyan-400 font-mono tabular-nums">
              ${parseFloat(mission.estimated_cost_savings_usd || 0).toLocaleString()} USD
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Risk Classification</div>
            <div
              className={`text-sm font-bold font-mono ${
                mission.risk_level === 'CRITICAL'
                  ? 'text-rose-400'
                  : mission.risk_level === 'HIGH'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {mission.risk_level}
            </div>
          </div>
        </div>
      </div>

      {/* HITL Global Notification Banner if pending */}
      {hasAwaitingApproval && (
        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/80 flex items-start space-x-3 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">Human-in-the-Loop Approval Required</span>
            <p className="text-amber-200/90 leading-relaxed">
              Downstream execution has paused at a high-risk mutation gate. Review the agent task rationale and verification criteria below to either <strong>Approve & Execute</strong> or <strong>Skip Step</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Root Cause Diagnosis & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Executive Summary */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2.5">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Executive Autonomous Synthesis</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {analysis.executive_summary || 'No summary payload provided.'}
          </p>
        </div>

        {/* Root Cause Breakdown */}
        <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-3">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Root-Cause Diagnosis
          </h2>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Primary Bottleneck:</span>
              <span className="text-slate-200">{rootCause.primary_bottleneck || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Silo Fragmentation Impact:</span>
              <span className="text-slate-200">{rootCause.fragmentation_impact || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Primary KPI Impacted:</span>
              <span className="text-cyan-400 font-mono text-[11px]">{rootCause.affected_kpi || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Agent Pipeline Visualizer */}
      <AgentPipelineVisualizer
        tasks={mission.tasks || []}
        missionStatus={mission.status}
      />

      {/* Strategic Decision Matrix */}
      <DecisionMatrixTable options={decisionMatrix} />

      {/* Decomposed Task DAG Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <span>Decomposed Multi-Agent Task DAG</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ordered dependency steps with executable system payloads and verification criteria
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {(mission.tasks || []).length} Execution Nodes
          </span>
        </div>

        <TaskDagTimeline
          tasks={mission.tasks || []}
          onDecision={handleTaskDecision}
          isDeciding={isDeciding}
        />
      </div>

      {/* Continuous Improvement & Synergy Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cross-System Synergy */}
        <div className="p-4 sm:p-5 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cross-System Synergy Notes</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {synergyNotes.map((note, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-cyan-400 font-mono text-xs">&bull;</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Continuous Improvement Advisory */}
        <div className="p-4 sm:p-5 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5 uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Continuous Improvement Advisory</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {advisories.map((adv, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400 font-mono text-xs">&bull;</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Governance Disclaimer */}
      {disclaimer && (
        <div className="p-3.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
          <strong className="text-slate-300">Operational Governance Disclaimer: </strong>
          {disclaimer}
        </div>
      )}

      {/* Immutable Audit Trail Feed */}
      <AuditTrailFeed logs={mission.audit_logs || []} />

      {/* Self-Healing Modal */}
      <SelfHealingModal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        onReplan={handleReplan}
        isReplanning={isReplanning}
        currentBudget={mission.constraints_config?.maxBudgetUsd || 2500}
      />
    </div>
  );
}
