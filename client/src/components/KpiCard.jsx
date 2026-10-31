import React from 'react';

export default function KpiCard({ title, value, change, icon: Icon, color = 'blue', subtext }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md relative overflow-hidden shadow-lg hover:border-slate-700/80 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1.5 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      {change && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center text-xs">
          <span className="text-emerald-400 font-semibold">{change}</span>
          <span className="text-slate-500 ml-1.5">vs last 7 days</span>
        </div>
      )}
    </div>
  );
}

