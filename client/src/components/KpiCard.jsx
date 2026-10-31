import React from 'react';

export default function KpiCard({ title, value, change, icon: Icon, color = 'sky', subtext }) {
  const colorMap = {
    sky: 'text-sky-300 bg-sky-500/10 border-sky-400/30',
    purple: 'text-purple-300 bg-purple-500/10 border-purple-400/30',
    emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
    rose: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
    amber: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
  };

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden transition-all hover:border-sky-400/50 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight font-mono">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.sky} shadow-sm group-hover:scale-105 transition-transform`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      {change && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center text-xs font-mono">
          <span className="text-sky-400 font-semibold">{change}</span>
          <span className="text-slate-500 ml-1.5">vs last 7 days</span>
        </div>
      )}
    </div>
  );
}
