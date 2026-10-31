import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, ScanEye, History, Settings, Lock } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navItems = [
    { label: 'Security Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Privacy Scanner', path: '/scanner', icon: ScanEye, badge: 'Live' },
    { label: 'Analysis History', path: '/history', icon: History },
    { label: 'Settings & Policy', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-black/60 border-r border-white/10 backdrop-blur-2xl flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)] group-hover:border-sky-400/70 transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="font-bold tracking-tight text-white text-xs">PRIVACYGUARD</span>
                <span className="text-[10px] px-1 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Spatial Security Core</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-sky-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Ambient Node Info */}
        <div className="p-3 border-t border-white/10">
          <div className="glass-panel-subtle rounded-lg p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5 text-[11px] font-mono font-medium text-sky-300">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Persistence</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Observation Anomaly flux active in background.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
