import React from 'react';
import { Check, X, ShieldAlert, Award } from 'lucide-react';

export default function DecisionMatrixTable({ options = [] }) {
  if (!options || options.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        No decision trade-off matrix available for this mission.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>PolicyReasonerAgent — Strategic Decision Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantitative evaluation of alternative execution pathways, cost impact, and SLA trade-offs
          </p>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {options.length} Strategies Assessed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold">
              <th className="py-3 px-4">Evaluated Strategy</th>
              <th className="py-3 px-4">Advantages (Pros)</th>
              <th className="py-3 px-4">Trade-offs (Cons)</th>
              <th className="py-3 px-4 text-right">Est. Cost</th>
              <th className="py-3 px-4 text-right">SLA Impact</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {options.map((opt, idx) => (
              <tr
                key={idx}
                className={`transition-colors ${
                  opt.is_selected
                    ? 'bg-cyan-950/20 hover:bg-cyan-950/30'
                    : 'hover:bg-slate-900/40 opacity-80 hover:opacity-100'
                }`}
              >
                <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs">
                  <div className="flex items-start space-x-2">
                    {opt.is_selected ? (
                      <Award className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-4 h-4 text-slate-500 text-center font-mono text-[11px] shrink-0">
                        {idx + 1}.
                      </span>
                    )}
                    <div>
                      <div>{opt.option_name}</div>
                      {opt.selection_rationale && (
                        <div className="text-[11px] text-cyan-300/80 mt-1 font-normal leading-relaxed">
                          <span className="font-semibold text-cyan-400">Rationale: </span>
                          {opt.selection_rationale}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                  <div className="flex items-start space-x-1.5 text-emerald-400/90">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="text-slate-300">{opt.pros}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-400 max-w-xs leading-relaxed">
                  <div className="flex items-start space-x-1.5 text-rose-400/80">
                    <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="text-slate-400">{opt.cons}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200">
                  ${parseFloat(opt.estimated_cost_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-200">
                  {opt.sla_impact_minutes}m
                </td>
                <td className="py-3.5 px-4 text-center">
                  {opt.is_selected ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      SELECTED
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                      REJECTED
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
