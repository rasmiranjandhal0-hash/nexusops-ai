import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Server,
  Layers,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import KpiStatCard from '../components/KpiStatCard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/dashboard/summary');
      if (res.data.success) {
        setData(res.data.summary);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load telemetry summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const kpis = data?.kpis || {
    totalMissions: 0,
    autonomousResolutionRate: 100,
    totalManualHoursSaved: 0,
    totalCostSavingsUsd: 0,
    avgConfidenceScore: 92,
    awaitingHitlMissions: 0,
    totalSystems: 4,
    healthySystems: 4,
  };

  const domainDist = data?.domainDistribution || {};
  const recentMissions = data?.recentMissions || [];

  return (
    <div className="space-y-6">
      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <span>Mission Control</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-agent execution metrics, autonomous ROI, and operational health telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchSummary}
            className="p-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/missions/new"
            className="px-4 py-2 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center space-x-1.5 shadow-md shadow-cyan-950/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deploy Agent Mission</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchSummary} className="underline font-semibold ml-2">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Total Agent Missions"
          value={kpis.totalMissions}
          badge="PostgreSQL"
          subtext="Executed across enterprise workspaces"
        />
        <KpiStatCard
          label="Autonomous Resolution Rate"
          value={kpis.autonomousResolutionRate}
          unit="%"
          positive={true}
          change="+18.4%"
          subtext="vs legacy manual ticket escalation"
        />
        <KpiStatCard
          label="Manual Hours Saved"
          value={kpis.totalManualHoursSaved}
          unit="hrs"
          positive={true}
          change="~4.2 hrs/run"
          subtext="Decomposed DAG execution efficiency"
        />
        <KpiStatCard
          label="Projected Cost Avoidance"
          value={`$${kpis.totalCostSavingsUsd.toLocaleString()}`}
          unit="USD"
          positive={true}
          change="ROI 12.8x"
          subtext="Eliminating downtime & SLA breach"
        />
      </div>

      {/* Secondary Metrics: HITL Alert & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* HITL Governance card */}
        <div className="p-4 sm:p-5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
              <span>HUMAN-IN-THE-LOOP (HITL) STATUS</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-100 tabular-nums">
                {kpis.awaitingHitlMissions}
              </span>
              <span className="text-xs text-slate-400">missions awaiting sign-off</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              High-impact financial disbursements, production rollback scripts, or customer status page alerts require 1-click human verification.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <Link
              to="/history?status=AWAITING_HITL"
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>Review Pending Approval Gates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Connected Enterprise Systems Health */}
        <div className="p-4 sm:p-5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
              <span>CONNECTED ENTERPRISE SYSTEMS</span>
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-100 tabular-nums">
                {kpis.healthySystems}/{kpis.totalSystems}
              </span>
              <span className="text-xs text-emerald-400 font-medium">100% Operational</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              SAP S/4HANA ERP, Zendesk CRM, AWS CloudWatch, and Stripe FinOps reporting nominal latency.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <Link
              to="/workspaces"
              className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage System Endpoints & SLAs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Agent Confidence & Model Telemetry */}
        <div className="p-4 sm:p-5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
              <span>REASONING CONFIDENCE INDEX</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-100 tabular-nums">
                {kpis.avgConfidenceScore}%
              </span>
              <span className="text-xs text-indigo-300 font-medium">High Precision</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Calculated across Gemini 2.5 Flash DAG decomposition, constraint compliance, and deterministic schema enforcement.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Model: gemini-2.5-flash</span>
            <span className="font-mono text-cyan-400">Structured JSON</span>
          </div>
        </div>
      </div>

      {/* Recent Missions Table */}
      <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <span>Recent Autonomous Missions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest multi-agent orchestration runs and execution status
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentMissions.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-slate-400">
              No autonomous missions have been launched yet.
            </p>
            <Link
              to="/missions/new"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Deploy First Agent Mission</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Mission Title & Workspace</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                  <th className="py-3 px-4 text-right">Time Saved</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentMissions.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/missions/${m.id}`}
                        className="font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                      >
                        {m.title}
                      </Link>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {m.workspace_name} ({m.workspace_department})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-cyan-400/90">
                        {m.domain.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold text-[11px] ${
                          m.urgency === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {m.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : m.status === 'AWAITING_HITL'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200 tabular-nums">
                      {m.confidence_score}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums">
                      {Math.round(m.estimated_manual_minutes / 60 * 10) / 10}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/missions/${m.id}`}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        Inspect DAG
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
