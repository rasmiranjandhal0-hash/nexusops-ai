import React from 'react';

export default function KpiStatCard({ label, value, unit = '', subtext, change, positive, badge }) {
  return (
    <div className="p-4 sm:p-5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
        <span>{label}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5 mb-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      <div className="flex items-center space-x-2 text-xs">
        {change && (
          <span
            className={`font-medium tabular-nums ${
              positive === true
                ? 'text-emerald-400'
                : positive === false
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {change}
          </span>
        )}
        {subtext && <span className="text-slate-500 text-[11px] truncate">{subtext}</span>}
      </div>
    </div>
  );
}
