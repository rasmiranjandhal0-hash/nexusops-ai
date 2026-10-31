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
  Globe,
  Mail,
  Phone,
  FileSpreadsheet,
  BarChart3,
  FileText,
  Bell,
  KeyRound,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { getCurrentCustomer, subscribeToAuth, logoutCustomer } from '../utils/auth';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [customer, setCustomer] = useState(getCurrentCustomer());

  useEffect(() => {
    const unsub = subscribeToAuth((newCust) => setCustomer(newCust));
    return unsub;
  }, []);

  const navSections = [
    {
      title: 'Control Plane',
      items: [
        { label: 'Security Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Privacy Text Scanner', path: '/scanner', icon: ScanEye, badge: 'Live' },
        { label: 'Analysis History', path: '/history', icon: History },
      ],
    },
    {
      title: 'Verification Suite',
      items: [
        { label: 'Website & URL Risk', path: '/verify-url', icon: Globe },
        { label: 'Email & Mailbox', path: '/verify-email', icon: Mail },
        { label: 'Phone & Telecom', path: '/verify-phone', icon: Phone },
        { label: 'Dataset & Files', path: '/verify-file', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'Telemetry & Compliance',
      items: [
        { label: 'Fraud Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Risk Reports & Audit', path: '/reports', icon: FileText },
        { label: 'Security Alerts', path: '/notifications', icon: Bell },
      ],
    },
    {
      title: 'Governance & Docs',
      items: [
        { label: 'Platform Admin', path: '/admin', icon: KeyRound, badge: customer.role === 'admin' ? 'Root' : undefined },
        { label: 'Public Portal', path: '/verify-public', icon: ExternalLink },
        { label: 'Help & API Docs', path: '/help', icon: HelpCircle },
        { label: 'Settings & Policy', path: '/settings', icon: Settings },
      ],
    },
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
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#06040b]/90 border-r border-violet-500/15 backdrop-blur-2xl flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:border-cyan-400/50 transition-colors">
              <ShieldCheck className="w-4 h-4 text-violet-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="font-bold tracking-tight text-white text-xs">NEXUSOPS</span>
                <span className="text-[9px] px-1 rounded bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-400/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Cybersecurity Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[9px] font-mono uppercase tracking-widest text-violet-400/80">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-200 ${
                        isActive
                          ? 'bg-violet-600/20 text-white border border-violet-500/35 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-mono flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Active Customer Workspace Badge */}
        <div className="p-3 border-t border-white/[0.06] space-y-2 flex-shrink-0">
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

          <div className="matte-glass-subtle rounded-xl p-2 text-[10px] space-y-1 font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5 text-violet-300 text-[10px]">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Tenant Isolated</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
