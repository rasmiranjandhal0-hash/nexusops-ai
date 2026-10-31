import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Activity, User, LogOut, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [serverHealth, setServerHealth] = useState({ online: true, db: false, gemini: false });
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await axiosClient.get('/health');
        if (isMounted && res.data) {
          setServerHealth({
            online: true,
            db: res.data.database?.connected || false,
            gemini: res.data.gemini_ai?.ready || false,
          });
        }
      } catch {
        if (isMounted) {
          setServerHealth({ online: false, db: false, gemini: false });
        }
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-slate-100 text-base">NexusOps</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                AI Core
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Autonomous Multi-Agent Orchestrator</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        {/* Live Engine Readiness Status */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                serverHealth.online ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                serverHealth.online ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className="text-slate-300 font-medium">
            {serverHealth.online ? 'Engine Active' : 'Offline'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">
            {serverHealth.gemini ? 'Gemini 2.5 Flash' : 'Synthetic Agent'}
          </span>
        </div>

        {/* System Blueprint Link */}
        <Link
          to="/blueprint"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Blueprint & Docs</span>
        </Link>

        {/* User Profile dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-semibold text-cyan-300">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {user.full_name || 'Operator'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {user.role || 'Systems Architect'}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md bg-slate-900 border border-slate-800 shadow-xl py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-xs">
                  <p className="font-semibold text-slate-100">{user.full_name}</p>
                  <p className="text-slate-400 truncate">{user.email}</p>
                  <p className="text-[11px] text-cyan-400 mt-1 font-mono">{user.organization_name}</p>
                </div>
                <Link
                  to="/workspaces"
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                >
                  Manage Workspaces & Systems
                </Link>
                <Link
                  to="/history"
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                >
                  Audit Trail & Mission History
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-slate-800/80 flex items-center space-x-2 border-t border-slate-800 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
