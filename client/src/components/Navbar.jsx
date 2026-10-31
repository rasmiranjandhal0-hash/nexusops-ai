import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Scan, Shield } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#030306]/50 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full matte-glass-subtle text-xs font-mono text-violet-300 border border-violet-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>SPATIAL INSPECTOR: ZERO-PERSISTENCE HEURISTICS</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Link
          to="/login"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-violet-300 hover:text-white border border-violet-500/25 hover:border-violet-500/50 bg-violet-950/20 transition-all hover:scale-105"
        >
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Operator Login</span>
        </Link>

        <Link
          to="/scanner"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)] transition-all hover:scale-105"
        >
          <Scan className="w-3.5 h-3.5 text-cyan-300" />
          <span>New Scan</span>
        </Link>

        {/* User Pill */}
        <Link
          to="/login"
          className="flex items-center space-x-2 pl-3 border-l border-white/10 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
            PG
          </div>
          <div className="hidden md:block text-left font-mono">
            <p className="text-xs font-semibold text-white leading-tight">SecOps Lead</p>
            <p className="text-[10px] text-cyan-400/80 leading-tight">Spatial Console</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
