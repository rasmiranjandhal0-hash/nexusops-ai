import React from 'react';

export default function KpiCard({ title, value, change, icon: Icon, color = 'amethyst', subtext }) {
  const colorMap = {
    amethyst: 'text-violet-300 bg-violet-600/10 border-violet-500/25',
    cyan: 'text-cyan-300 bg-cyan-500/10 border-cyan-400/25',
    rose: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
    amber: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
    emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  };

  return (
    <div className="matte-glass rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-violet-500/40 hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.25)] group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight font-mono">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.amethyst} shadow-sm group-hover:scale-105 transition-transform`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>
      </div>
      {change && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center text-xs font-mono">
          <span className="text-cyan-400 font-semibold">{change}</span>
          <span className="text-slate-500 ml-1.5">vs last 7 days</span>
        </div>
      )}
    </div>
  );
}
