import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, X, Shield, ArrowRight } from 'lucide-react';

const REPLAN_PRESETS = [
  'Primary vendor API returned HTTP 503 Service Unavailable with connection timeout.',
  'Logistics freight hub announced immediate 72-hour air-cargo embargo on semiconductor batches.',
  'Enterprise finance desk reduced maximum authorized emergency budget by 35%.',
  'Downstream database deadlock detected during ERP inventory table reservation.',
];

export default function SelfHealingModal({ isOpen, onClose, onReplan, isReplanning = false, currentBudget = 2500 }) {
  const [failureReason, setFailureReason] = useState(
    'Primary vendor API returned HTTP 503 Service Unavailable with connection timeout.'
  );
  const [updatedBudget, setUpdatedBudget] = useState(currentBudget);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!failureReason.trim()) return;
    onReplan({
      failure_reason: failureReason,
      updated_max_budget_usd: Number(updatedBudget),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <RefreshCw className={`w-4 h-4 ${isReplanning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Autonomous Self-Healing & Dynamic Re-Planner
              </h3>
              <p className="text-xs text-slate-400">
                Simulate downstream failure or constraint change to invoke Gemini re-planning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isReplanning}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Simulated Downstream Anomaly / Failure Context
            </label>
            <textarea
              rows={3}
              required
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Describe the downstream error, API failure, or operational constraint change..."
              className="w-full rounded bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick presets */}
          <div>
            <div className="text-[11px] font-medium text-slate-400 mb-1.5">
              Quick Failure Scenario Presets:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {REPLAN_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFailureReason(p)}
                  className="text-[11px] px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 text-left truncate max-w-xs transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Updated Budget Cap */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Updated Emergency Budget Cap (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-500">$</span>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={updatedBudget}
                onChange={(e) => setUpdatedBudget(e.target.value)}
                className="w-full rounded bg-slate-950 border border-slate-800 pl-7 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="p-3 rounded bg-amber-950/20 border border-amber-900/50 flex items-start space-x-2 text-xs text-amber-200/90 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              Triggering re-planning will instruct the PolicyReasonerAgent to prune unexecuted tasks, synthesize redundant pathways, and dynamically recalculate task sequence under the revised constraints.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isReplanning}
              className="px-3 py-2 rounded text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReplanning}
              className="px-4 py-2 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isReplanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Invoking Gemini Re-Planner...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Execute Self-Healing Re-Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
