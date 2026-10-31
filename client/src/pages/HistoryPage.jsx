import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';

const INITIAL_HISTORY = [
  {
    id: 'SCN-9021',
    name: 'Customer Support Verification Rajesh',
    date: 'Oct 31, 2026 12:30 PM',
    risk: 'Critical',
    score: 95,
    detectedCount: 3,
    categories: ['Aadhaar Number', 'PAN Tax ID', 'Payment Card'],
    status: 'Quarantined',
  },
  {
    id: 'SCN-9020',
    name: 'State Bank KYC Suspension Scam Email',
    date: 'Oct 31, 2026 11:15 AM',
    risk: 'High',
    score: 88,
    detectedCount: 2,
    categories: ['Phishing Heuristics', 'Deceptive Domain'],
    status: 'Flagged',
  },
  {
    id: 'SCN-9019',
    name: 'Developer Prompt with Supabase Key',
    date: 'Oct 31, 2026 09:40 AM',
    risk: 'Critical',
    score: 98,
    detectedCount: 2,
    categories: ['PostgreSQL URI', 'AWS Secret'],
    status: 'Redacted',
  },
  {
    id: 'SCN-9018',
    name: 'Employee Onboarding Document Excerpt',
    date: 'Oct 30, 2026 04:22 PM',
    risk: 'Moderate',
    score: 45,
    detectedCount: 2,
    categories: ['Personal Email', 'Phone Number'],
    status: 'Reviewed',
  },
  {
    id: 'SCN-9017',
    name: 'Security Audit Documentation Q4',
    date: 'Oct 30, 2026 01:10 PM',
    risk: 'Low',
    score: 8,
    detectedCount: 0,
    categories: ['Clean Text'],
    status: 'Clean',
  },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const filtered = INITIAL_HISTORY.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || item.risk.toUpperCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06] font-mono">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Spatial Inspection Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable inspection audit trail of examined documents, messages, and simulated detections.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-cyan-400">{filtered.length} records</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search scans by identifier or document name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full matte-glass rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80"
          />
        </div>

        <div className="flex items-center space-x-2 font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filterRisk === risk
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                  : 'matte-glass-subtle text-slate-400 hover:text-white'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Table in Spatial Matte Glass Panel */}
      <div className="matte-glass rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] bg-black/40 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4">Scan ID & Payload</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Detected Vectors</th>
                <th className="py-3 px-4">Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{row.name}</div>
                    <div className="font-mono text-[10px] text-cyan-400">{row.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        row.risk === 'Critical'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                          : row.risk === 'High'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                          : row.risk === 'Moderate'
                          ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                      }`}
                    >
                      {row.risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {row.score} / 100
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {row.categories.map((c, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-white/[0.06]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded matte-glass-subtle">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
