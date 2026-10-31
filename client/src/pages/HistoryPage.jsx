import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Download,
  Trash2,
} from 'lucide-react';

const INITIAL_HISTORY = [
  {
    id: 'SCN-9021',
    name: 'Customer Support Transcript #412',
    date: 'Oct 31, 2026 12:30 PM',
    risk: 'Critical',
    score: 94,
    detectedCount: 3,
    categories: ['SSN', 'Credit Card', 'Password'],
    status: 'Quarantined',
  },
  {
    id: 'SCN-9020',
    name: 'Executive Wire Transfer Request Email',
    date: 'Oct 31, 2026 11:15 AM',
    risk: 'High',
    score: 86,
    detectedCount: 2,
    categories: ['Wire Fraud / BEC', 'Urgency Coercion'],
    status: 'Flagged',
  },
  {
    id: 'SCN-9019',
    name: 'Developer Prompt with Supabase Key',
    date: 'Oct 31, 2026 09:40 AM',
    risk: 'Critical',
    score: 98,
    detectedCount: 1,
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
    categories: ['Personal Email', 'US Phone #'],
    status: 'Reviewed',
  },
  {
    id: 'SCN-9017',
    name: 'Marketing Newsletter Draft Q4',
    date: 'Oct 30, 2026 01:10 PM',
    risk: 'Low',
    score: 8,
    detectedCount: 0,
    categories: ['Clean Text'],
    status: 'Clean',
  },
  {
    id: 'SCN-9016',
    name: 'Salesforce API Webhook Payload Sample',
    date: 'Oct 29, 2026 06:45 PM',
    risk: 'High',
    score: 82,
    detectedCount: 2,
    categories: ['OAuth Token', 'Customer Email'],
    status: 'Flagged',
  },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY);

  const filtered = historyList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || item.risk.toUpperCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Analysis & Scan History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable inspection audit trail of examined documents, messages, and simulated detections.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">{filtered.length} records</span>
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
            className="w-full bg-slate-900/70 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filterRisk === risk
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4">Scan ID & Document</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Detected Vectors</th>
                <th className="py-3 px-4">Enforcement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{row.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{row.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        row.risk === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : row.risk === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : row.risk === 'Moderate'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {row.risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    {row.score} / 100
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {row.categories.map((c, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-300 px-2 py-1 rounded bg-slate-950 border border-slate-800">
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

