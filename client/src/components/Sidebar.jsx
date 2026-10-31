import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Briefcase,
  FileCode2,
  Terminal,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Mission Control',
      icon: LayoutDashboard,
      description: 'Telemetry & resolution KPIs',
    },
    {
      to: '/missions/new',
      label: 'Deploy Agent Mission',
      icon: PlusCircle,
      description: 'Intake form & scenario presets',
    },
    {
      to: '/history',
      label: 'Mission Ledger',
      icon: History,
      description: 'Searchable orchestration history',
    },
    {
      to: '/workspaces',
      label: 'Workspaces & Systems',
      icon: Briefcase,
      description: 'Enterprise registry & SLAs',
    },
    {
      to: '/blueprint',
      label: 'System Blueprint',
      icon: FileCode2,
      description: 'Architecture & evaluation guide',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Workspace Scope Box */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span>ACTIVE WORKSPACE</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              HITL Guarded
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200 truncate">
            Global Enterprise Operations
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            Operations & IT Infrastructure
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 px-3 py-1">
            Orchestration Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-start space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-cyan-300 border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="truncate">
                  <div className="text-slate-200">{item.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">
                    {item.description}
                  </div>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Agent Engine</span>
            </span>
            <span className="text-cyan-400 font-mono text-[10px]">Gemini 2.5</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Planner &bull; Reasoner &bull; Executor &bull; Auditor
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>NexusOps v1.0 Production</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>SOX / SOC-2</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
