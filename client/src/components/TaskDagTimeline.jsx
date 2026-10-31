import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  Clock,
  SkipForward,
  Server,
  Zap,
} from 'lucide-react';

export default function TaskDagTimeline({ tasks = [], onDecision, isDeciding = false }) {
  const [expandedPayloads, setExpandedPayloads] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const togglePayload = (id) => {
    setExpandedPayloads((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (id, payload) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
        No decomposed tasks found for this mission.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, idx) => {
        const isExpanded = Boolean(expandedPayloads[task.id]);
        const isAwaitingApproval = task.task_status === 'AWAITING_APPROVAL';
        const isApproved = task.task_status === 'APPROVED_EXECUTED';
        const isExecuted = task.task_status === 'EXECUTED';
        const isSkipped = task.task_status === 'SKIPPED';

        let statusBadge = (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
            <CheckCircle className="w-3 h-3 text-slate-400" />
            <span>EXECUTED</span>
          </span>
        );

        if (isAwaitingApproval) {
          statusBadge = (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
              <Clock className="w-3 h-3" />
              <span>AWAITING APPROVAL</span>
            </span>
          );
        } else if (isApproved) {
          statusBadge = (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <Check className="w-3 h-3" />
              <span>APPROVED & EXECUTED</span>
            </span>
          );
        } else if (isSkipped) {
          statusBadge = (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
              <SkipForward className="w-3 h-3" />
              <span>SKIPPED</span>
            </span>
          );
        }

        return (
          <div
            key={task.id || idx}
            className={`p-4 rounded-lg border transition-all ${
              isAwaitingApproval
                ? 'bg-amber-950/20 border-amber-600/50 shadow-lg shadow-amber-950/10'
                : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                  {task.step_order || idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {task.task_title}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {statusBadge}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400">
                  {task.action_type}
                </span>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span className="flex items-center space-x-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300 font-medium">{task.agent_role}</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                <Server className="w-3 h-3 text-indigo-400" />
                <span className="text-slate-300">{task.target_system}</span>
              </span>
              {task.requires_human_approval && (
                <span className="flex items-center space-x-1 text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60 text-[11px] font-medium">
                  <ShieldAlert className="w-3 h-3" />
                  <span>HITL Governance Flagged</span>
                </span>
              )}
            </div>

            {/* Reasoning Rationale */}
            <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/60 mb-3 leading-relaxed">
              <span className="font-semibold text-slate-400">Agent Reasoning: </span>
              {task.reasoning_rationale}
            </div>

            {/* Verification Criteria */}
            <div className="text-xs text-slate-400 flex items-start space-x-1.5 mb-3">
              <span className="font-semibold text-emerald-400/90 shrink-0">Verification:</span>
              <span className="text-slate-300">{task.verification_criteria}</span>
            </div>

            {/* Collapsible Execution Payload Viewer */}
            {task.execution_payload && Object.keys(task.execution_payload).length > 0 && (
              <div className="border border-slate-800 rounded bg-slate-950/80 overflow-hidden mb-3">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800/80 text-[11px]">
                  <button
                    onClick={() => togglePayload(task.id)}
                    className="flex items-center space-x-1.5 text-slate-300 hover:text-slate-100 font-mono"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    <Code className="w-3 h-3 text-cyan-400" />
                    <span>Dispatched System Payload (JSON)</span>
                  </button>

                  <button
                    onClick={() => handleCopy(task.id, task.execution_payload)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-[10px]"
                  >
                    {copiedId === task.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <pre className="p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify(task.execution_payload, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Human in the loop approval controls */}
            {isAwaitingApproval && onDecision && (
              <div className="p-3 rounded bg-amber-950/30 border border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                <div className="text-xs text-amber-200">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Human Operator Sign-Off Required</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    This step executes external state changes or financial commitments. Please verify criteria above before approving.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    disabled={isDeciding}
                    onClick={() => onDecision(task.id, 'SKIP')}
                    className="px-3 py-1.5 rounded text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Skip Step
                  </button>
                  <button
                    disabled={isDeciding}
                    onClick={() => onDecision(task.id, 'APPROVE')}
                    className="px-3.5 py-1.5 rounded text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Execute</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
