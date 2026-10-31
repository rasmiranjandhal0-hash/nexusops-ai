import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Scan, Bell, User, LogOut, ShieldCheck } from 'lucide-react';
import { getCurrentCustomer, subscribeToAuth, logoutCustomer } from '../utils/auth';
import axiosClient from '../api/axiosClient';

export default function Navbar({ onMenuToggle }) {
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axiosClient.get('/notifications');
      if (res.data && res.data.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {}
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const unsub = subscribeToAuth((newCust) => {
      setCustomer(newCust);
      fetchUnreadNotifications();
    });
    return unsub;
  }, []);

  const initials = customer.name
    ? customer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'NO';

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#030306]/70 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full matte-glass-subtle text-xs font-mono text-violet-300 border border-violet-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>NEXUSOPS CORE: TENANT AUDIT ENGINE ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Quick Launch Verify Link */}
        <Link
          to="/scanner"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)] transition-all hover:scale-105"
        >
          <Scan className="w-3.5 h-3.5 text-cyan-300" />
          <span>Quick Scan</span>
        </Link>

        {/* Notifications Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Security Notifications"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
          )}
        </Link>

        {/* User / Customer Pill */}
        <div className="flex items-center space-x-2 pl-3 border-l border-white/10">
          <Link
            to="/login"
            className="flex items-center space-x-2 hover:opacity-85 transition-opacity"
            title="Click to switch or log in customer profile"
          >
            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
              {initials}
            </div>
            <div className="hidden md:block text-left font-mono">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                {customer.name}
              </p>
              <p className="text-[10px] text-cyan-400/80 leading-tight truncate max-w-[130px]">
                {customer.email}
              </p>
            </div>
          </Link>

          <Link
            to="/login"
            onClick={() => logoutCustomer()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors hidden sm:block"
            title="Switch Account / Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
