import React from 'react';
import { ShieldCheck, UserCheck, Cpu, Terminal, Clock } from 'lucide-react';

export default function AuditTrailFeed({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
        No audit log records recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable Governance Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed chronological log of autonomous decisions, payloads, and HITL approvals
          </p>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {logs.length} Log Entries
        </span>
      </div>

      <div className="p-4 space-y-3">
        {logs.map((log, idx) => {
          let actorBadge = (
            <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              <Cpu className="w-3 h-3" />
              <span>AI AGENT</span>
            </span>
          );

          if (log.actor_type === 'HUMAN_OPERATOR') {
            actorBadge = (
              <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                <UserCheck className="w-3 h-3" />
                <span>HUMAN OPERATOR</span>
              </span>
            );
          } else if (log.actor_type === 'SYSTEM') {
            actorBadge = (
              <span className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                <Terminal className="w-3 h-3 text-slate-400" />
                <span>SYSTEM</span>
              </span>
            );
          }

          return (
            <div
              key={log.id || idx}
              className="p-3 rounded bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {actorBadge}
                  <span className="font-semibold text-slate-200">{log.actor_name}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="font-mono text-[11px] text-cyan-400/90">{log.event_action}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed pt-0.5">
                  {log.event_details}
                </p>
              </div>

              <div className="shrink-0 text-[10px] font-mono text-slate-500 flex items-center space-x-1 mt-1 sm:mt-0">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>{new Date(log.created_at || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
