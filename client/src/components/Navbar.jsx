import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Scan, Shield, User, LogOut } from 'lucide-react';
import { getCurrentCustomer, subscribeToAuth, logoutCustomer } from '../utils/auth';

export default function Navbar({ onMenuToggle }) {
  const [customer, setCustomer] = useState(getCurrentCustomer());

  useEffect(() => {
    const unsub = subscribeToAuth((newCust) => setCustomer(newCust));
    return unsub;
  }, []);

  const initials = customer.name
    ? customer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PG';

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
          <span>SPATIAL INSPECTOR: CUSTOMER-ISOLATED TELEMETRY</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Link
          to="/scanner"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)] transition-all hover:scale-105"
        >
          <Scan className="w-3.5 h-3.5 text-cyan-300" />
          <span>New Scan</span>
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
