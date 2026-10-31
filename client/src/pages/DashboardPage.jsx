import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  ScanEye,
  FileWarning,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import KpiCard from '../components/KpiCard';

export default function DashboardPage() {
  const recentActivities = [
    {
      id: 'SCN-9021',
      source: 'Customer Support Transcript #412',
      risk: 'Critical',
      itemsCount: 3,
      categories: ['Credit Card #', 'CVV Code', 'User Password'],
      timestamp: '14 minutes ago',
      status: 'Quarantined',
    },
    {
      id: 'SCN-9020',
      source: 'Executive Wire Transfer Request Email',
      risk: 'High',
      itemsCount: 2,
      categories: ['Phishing Heuristics', 'Urgent Financial Trigger'],
      timestamp: '1 hour ago',
      status: 'Flagged',
    },
    {
      id: 'SCN-9019',
      source: 'Developer Prompt with Supabase Key',
      risk: 'Critical',
      itemsCount: 1,
      categories: ['Exposed API Secret'],
      timestamp: '3 hours ago',
      status: 'Redacted',
    },
    {
      id: 'SCN-9018',
      source: 'Employee Onboarding Document Excerpt',
      risk: 'Moderate',
      itemsCount: 2,
      categories: ['Personal Email', 'US Phone #'],
      timestamp: '5 hours ago',
      status: 'Reviewed',
    },
    {
      id: 'SCN-9017',
      source: 'Marketing Newsletter Draft',
      risk: 'Low',
      itemsCount: 0,
      categories: ['Clean Text'],
      timestamp: '1 day ago',
      status: 'Clean',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Security Command Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time privacy exposure posture, scam indicators, and sensitive asset leakage overview.
          </p>
        </div>

        <Link
          to="/scanner"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <ScanEye className="w-3.5 h-3.5" />
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
          subtext="Simulated heuristic runs"
          change="+18% volume"
          icon={ScanEye}
          color="blue"
        />
        <KpiCard
          title="Sensitive Items Found"
          value="348"
          subtext="PII, Credentials, Financials"
          change="32 quarantined today"
          icon={FileWarning}
          color="amber"
        />
        <KpiCard
          title="High-Risk Alerts"
          value="14"
          subtext="Immediate action required"
          change="-2 resolved"
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Two Column Grid: Risk Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Posture Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-semibold text-white">Privacy Risk Breakdown</h3>
              <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Simulated Telemetry</span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Credentials & API Keys</span>
                  </span>
                  <span className="font-mono text-rose-400 font-bold">42%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>PII (SSN, Phone, Passports)</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">31%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '31%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Scam & Phishing Heuristics</span>
                  </span>
                  <span className="font-mono text-purple-400 font-bold">18%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Payment & Card Data</span>
                  </span>
                  <span className="font-mono text-blue-400 font-bold">9%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '9%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-950/40 p-3 rounded-lg text-xs space-y-2">
            <div className="flex items-center text-blue-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              <span>Recommended Action</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Enable automated client-side redaction for all outgoing customer support notes.
            </p>
          </div>
        </div>

        {/* Right Column: Recent Scans Activity */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Analysis Activity</h3>
                <p className="text-[11px] text-slate-400">Audited streams and suspicious payload inspections</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>View Full Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-800/60 overflow-x-auto">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{act.id}</span>
                      <span className="font-medium text-slate-200 truncate">{act.source}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {act.categories.map((c, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        act.risk === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : act.risk === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : act.risk === 'Moderate'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {act.risk}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Showing latest 5 heuristic evaluations</span>
            <Link to="/scanner" className="text-blue-400 hover:text-blue-300 font-medium">
              Run New Scan &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
