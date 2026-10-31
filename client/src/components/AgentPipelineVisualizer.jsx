import React from 'react';
import { GitBranch, BrainCircuit, Terminal, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export default function AgentPipelineVisualizer({ tasks = [], missionStatus = 'COMPLETED' }) {
  const agents = [
    {
      role: 'PlannerAgent',
      name: 'Goal & DAG Decomposition',
      icon: GitBranch,
      desc: 'Breaks down ambiguous operational triggers into dependency-aware execution steps across systems.',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
    },
    {
      role: 'PolicyReasonerAgent',
      name: 'Policy & Decision Matrix',
      icon: BrainCircuit,
      desc: 'Evaluates trade-offs, budget limits, SLA risks, and determines optimal decision pathways.',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    },
    {
      role: 'SystemExecutorAgent',
      name: 'Cross-System Action Synthesis',
      icon: Terminal,
      desc: 'Generates concrete API payloads, webhook dispatches, ERP mutations, and manages HITL gates.',
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    },
    {
      role: 'ComplianceAuditorAgent',
      name: 'Audit & Governance Verification',
      icon: ShieldCheck,
      desc: 'Verifies transaction criteria, logs immutable audit traces, and calculates ROI metrics.',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    },
  ];

  return (
    <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>Synchronized 4-Agent Autonomous Council</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Gemini 2.5 Flash
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-agent reasoning, policy evaluation, action dispatch, and audit loop
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Pipeline State:</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${
              missionStatus === 'COMPLETED'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : missionStatus === 'AWAITING_HITL'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
            }`}
          >
            {missionStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const assignedTasks = tasks.filter(
            (t) =>
              t.agent_role === agent.role ||
              (agent.role === 'SystemExecutorAgent' && t.agent_role === 'CommunicationAgent')
          );
          const hasPendingHitl = assignedTasks.some((t) => t.task_status === 'AWAITING_APPROVAL');

          return (
            <div
              key={agent.role}
              className={`p-3.5 rounded-lg border flex flex-col justify-between ${agent.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200">{agent.name}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-80">Phase 0{index + 1}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{agent.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {assignedTasks.length} {assignedTasks.length === 1 ? 'task' : 'tasks'} dispatched
                </span>
                {hasPendingHitl ? (
                  <span className="flex items-center space-x-1 text-amber-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>Gate Active</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
