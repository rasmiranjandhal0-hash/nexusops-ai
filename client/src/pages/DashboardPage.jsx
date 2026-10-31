import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ScanEye,
  FileWarning,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import KpiCard from '../components/KpiCard';

export default function DashboardPage() {
  const recentActivities = [
    {
      id: 'SCN-9021',
      source: 'Customer Support Verification Rajesh',
      risk: 'Critical',
      itemsCount: 3,
      categories: ['Aadhaar Number', 'PAN Tax ID', 'Payment Card'],
      timestamp: '14m ago',
      status: 'Quarantined',
    },
    {
      id: 'SCN-9020',
      source: 'State Bank KYC Suspension Scam Email',
      risk: 'High',
      itemsCount: 2,
      categories: ['Phishing Heuristics', 'Urgent Wire Transfer'],
      timestamp: '1h ago',
      status: 'Flagged',
    },
    {
      id: 'SCN-9019',
      source: 'Developer Prompt with Supabase Key',
      risk: 'Critical',
      itemsCount: 1,
      categories: ['Exposed API Secret', 'PostgreSQL URI'],
      timestamp: '3h ago',
      status: 'Redacted',
    },
    {
      id: 'SCN-9018',
      source: 'Employee Onboarding Document Excerpt',
      risk: 'Moderate',
      itemsCount: 2,
      categories: ['Personal Email', 'Phone Number'],
      timestamp: '5h ago',
      status: 'Reviewed',
    },
    {
      id: 'SCN-9017',
      source: 'Security Audit Documentation Q4',
      risk: 'Low',
      itemsCount: 0,
      categories: ['Clean Text'],
      timestamp: '1d ago',
      status: 'Clean',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
            <span>Spatial Security Command</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Observation telemetry posture, sensitive asset exposure & scam indicators.
          </p>
        </div>

        <Link
          to="/scanner"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)] transition-all self-start sm:self-auto hover:scale-105"
        >
          <ScanEye className="w-3.5 h-3.5 text-cyan-300" />
          <span>Launch Privacy Scanner</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Privacy Risk Score"
          value="78 / 100"
          subtext="Elevated posture (3 critical leaks)"
          change="-4 pts improvement"
          icon={ShieldAlert}
          color="rose"
        />
        <KpiCard
          title="Data Scans Completed"
          value="1,429"
          subtext="Zero-persistence evaluations"
          change="+18% volume"
          icon={ScanEye}
          color="amethyst"
        />
        <KpiCard
          title="Sensitive Items Found"
          value="348"
          subtext="Aadhaar, PAN, PCI-DSS, Keys"
          change="32 quarantined today"
          icon={FileWarning}
          color="amber"
        />
        <KpiCard
          title="High-Risk Alerts"
          value="14"
          subtext="Action required immediately"
          change="-2 resolved"
          icon={AlertTriangle}
          color="cyan"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Posture Breakdown */}
        <div className="matte-glass rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-xs sm:text-sm font-semibold text-white font-mono">Risk Vector Distribution</h3>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Active Engine</span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Credentials & Cloud Secrets</span>
                  </span>
                  <span className="text-rose-400 font-bold">42%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>National IDs (Aadhaar, PAN)</span>
                  </span>
                  <span className="text-amber-400 font-bold">31%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '31%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                    <span>Urgency & Coercion Scams</span>
                  </span>
                  <span className="text-violet-400 font-bold">18%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>Payment Cards & CVVs</span>
                  </span>
                  <span className="text-cyan-400 font-bold">9%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '9%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] matte-glass-subtle p-3 rounded-lg text-xs space-y-1.5">
            <div className="flex items-center text-violet-300 font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              <span>Recommended Defense Action</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Apply automated Aadhaar statutory 4-digit masking across all incoming support transcripts.
            </p>
          </div>
        </div>

        {/* Right Column: Recent Scans Activity */}
        <div className="lg:col-span-2 matte-glass rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-white font-mono">Recent Telemetric Activity</h3>
                <p className="text-[11px] text-slate-400 font-mono">Inspected streams and isolated risk payloads</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-3 divide-y divide-white/[0.04] overflow-x-auto">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-violet-400 font-semibold">{act.id}</span>
                      <span className="font-medium text-slate-200 truncate">{act.source}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {act.categories.map((c, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-300 font-mono border border-white/[0.05]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 font-mono">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        act.risk === 'Critical'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                          : act.risk === 'High'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                          : act.risk === 'Moderate'
                          ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                      }`}
                    >
                      {act.risk}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing recent stream assessments</span>
            <Link to="/scanner" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Run New Scan &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
