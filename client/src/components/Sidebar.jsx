import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  ScanEye,
  History,
  Settings,
  Lock,
  User,
  LogOut,
} from 'lucide-react';
import { getCurrentCustomer, subscribeToAuth, logoutCustomer } from '../utils/auth';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [customer, setCustomer] = useState(getCurrentCustomer());

  useEffect(() => {
    const unsub = subscribeToAuth((newCust) => setCustomer(newCust));
    return unsub;
  }, []);

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
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#06040b]/85 border-r border-violet-500/15 backdrop-blur-2xl flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-white/[0.06] flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:border-cyan-400/50 transition-colors">
              <ShieldCheck className="w-4 h-4 text-violet-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="font-bold tracking-tight text-white text-xs">PRIVACYGUARD</span>
                <span className="text-[9px] px-1 rounded bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-400/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Amethyst Spatial Core</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-violet-400/80">
            Control Plane
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600/20 text-white border border-violet-500/35 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-violet-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Active Customer Workspace Badge */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          <div className="p-2.5 rounded-xl bg-violet-950/20 border border-violet-500/20 flex items-center justify-between font-mono">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-300 flex items-center justify-center text-[10px] font-bold border border-cyan-400/30">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold text-white truncate">{customer.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{customer.email}</p>
              </div>
            </div>

            <Link
              to="/login"
              onClick={() => logoutCustomer()}
              title="Sign Out / Switch Customer"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="matte-glass-subtle rounded-xl p-2.5 text-[10px] space-y-1 font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5 text-violet-300">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Customer Isolated</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
            <p className="text-[9px] text-slate-400 leading-tight">
              Scans & reports isolated to this account profile.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
