import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShieldAlert, Sparkles, Scan, Bell, User } from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-800/50 text-xs text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="font-medium">Sandbox Mode: Simulated Heuristic Engine</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Link
          to="/scanner"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>New Privacy Scan</span>
        </Link>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xs font-bold text-blue-300">
              PG
            </div>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Security Officer</p>
            <p className="text-[10px] text-slate-400 leading-tight">Demo Sandbox</p>
          </div>
        </div>
      </div>
    </header>
  );
}
