import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Scan, Activity } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  return (
    <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full glass-panel-subtle text-xs font-mono text-sky-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span>ANOMALY FLUX: HEURISTIC ZERO-PERSISTENCE ENGINE</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Link
          to="/scanner"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-sky-400 hover:bg-sky-300 text-black shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all hover:scale-105"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>New Scan</span>
        </Link>

        {/* Status Pill */}
        <div className="flex items-center space-x-2 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-xs font-mono font-bold text-sky-400">
            PG
          </div>
          <div className="hidden md:block text-left font-mono">
            <p className="text-xs font-semibold text-white leading-tight">Security Officer</p>
            <p className="text-[10px] text-sky-400/80 leading-tight">Spatial Session</p>
          </div>
        </div>
      </div>
    </header>
  );
}
