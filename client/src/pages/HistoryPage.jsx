import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  ExternalLink,
  RefreshCw,
  User,
  X,
  FileText,
  Scan,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { getCurrentCustomer, subscribeToAuth } from '../utils/auth';

export default function HistoryPage() {
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [selectedScan, setSelectedScan] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  // Fetch customer-specific history from backend or cached fallback
  const fetchCustomerHistory = async (custId) => {
    setLoading(true);
    const targetCustId = (custId || customer.id || 'demo@privacyguard.ai').trim().toLowerCase();
    const cacheKey = `privacyguard_history_${targetCustId}`;

    try {
      const res = await axiosClient.get(`/history?customerId=${encodeURIComponent(targetCustId)}`);
      if (res.data && Array.isArray(res.data.history)) {
        setHistory(res.data.history);
        localStorage.setItem(cacheKey, JSON.stringify(res.data.history));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend history fetch unavailable, using customer cache:', err.message);
    }

    // Local cache fallback
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setHistory(JSON.parse(cached));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomerHistory(customer.id);

    // Subscribe to customer auth switches
    const unsubscribe = subscribeToAuth((newCustomer) => {
      setCustomer(newCustomer);
      fetchCustomerHistory(newCustomer.id);
    });

    return unsubscribe;
  }, []);

  // Handle single scan deletion
  const handleDeleteScan = async (scanId, e) => {
    e.stopPropagation();
    try {
      await axiosClient.delete(`/history/${scanId}`);
    } catch (err) {
      console.warn('Backend delete failed, applying local update:', err.message);
    }

    const updated = history.filter((item) => item.id !== scanId);
    setHistory(updated);
    localStorage.setItem(`privacyguard_history_${customer.id}`, JSON.stringify(updated));
    if (selectedScan && selectedScan.id === scanId) {
      setSelectedScan(null);
    }
    setActionNotice(`Deleted record ${scanId}`);
    setTimeout(() => setActionNotice(''), 2500);
  };

  // Handle clearing the entire ledger
  const handleClearLedger = async () => {
    if (!window.confirm(`Clear all personal scan records for ${customer.email}?`)) {
      return;
    }

    try {
      await axiosClient.post('/history/clear', { customerId: customer.id });
    } catch (err) {
      console.warn('Backend clear failed, applying local update:', err.message);
    }

    setHistory([]);
    localStorage.setItem(`privacyguard_history_${customer.id}`, JSON.stringify([]));
    setSelectedScan(null);
    setActionNotice('Personal audit ledger cleared.');
    setTimeout(() => setActionNotice(''), 2500);
  };

  // Filtered entries
  const filtered = history.filter((item) => {
    const title = item.title || item.name || '';
    const id = item.id || '';
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());
    const risk = (item.risk || 'LOW').toUpperCase();
    const matchesRisk = filterRisk === 'ALL' || risk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header & Customer Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06] font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Personal Inspection Ledger</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              CUSTOMER ISOLATED
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-400">
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span>Customer:</span>
            <span className="text-white font-semibold">{customer.name}</span>
            <span className="text-slate-500">({customer.email})</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => fetchCustomerHistory(customer.id)}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono matte-glass-subtle hover:text-white text-slate-300 transition-all border border-white/[0.08]"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearLedger}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Ledger</span>
            </button>
          )}

          <Link
            to="/scanner"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all hover:scale-105"
          >
            <Scan className="w-3.5 h-3.5 text-cyan-300" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {actionNotice && (
        <div className="p-2.5 rounded-xl bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono flex items-center justify-between animate-fade-in-long">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search personal scans by ID or payload description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full matte-glass rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80"
          />
        </div>

        <div className="flex items-center space-x-2 font-mono overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
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

      {/* Ledger Table */}
      <div className="matte-glass rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] bg-black/40 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4">Identifier & Subject</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Detected Exposure</th>
                <th className="py-3 px-4">Posture</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No inspection records found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm || filterRisk !== 'ALL'
                        ? 'Try adjusting your search criteria or risk filter.'
                        : `No scans logged for ${customer.email} yet. Run a scan from the Privacy Scanner.`}
                    </p>
                    <Link
                      to="/scanner"
                      className="inline-flex items-center space-x-1.5 mt-4 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-violet-600/30 text-violet-300 border border-violet-500/40 hover:bg-violet-600/50"
                    >
                      <Scan className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Start First Scan</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedScan(row)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {row.title || row.name}
                      </div>
                      <div className="font-mono text-[10px] text-cyan-400/90">{row.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {row.dateFormatted || row.date}
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
                        {(row.categories || []).length === 0 ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-slate-400 border border-white/[0.06]">
                            Clean Document
                          </span>
                        ) : (
                          (row.categories || []).map((c, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-white/[0.06]"
                            >
                              {c}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded matte-glass-subtle">
                        {row.status || 'Audited'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScan(row);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                          title="View Full Report"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteScan(row.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Inspection Drawer / Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in-long">
          <div className="w-full max-w-2xl matte-glass rounded-2xl p-6 shadow-2xl border border-violet-500/30 max-h-[90vh] overflow-y-auto space-y-5 font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px]">
                    {selectedScan.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedScan.risk === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : selectedScan.risk === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : selectedScan.risk === 'Moderate'
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    RISK: {selectedScan.risk?.toUpperCase()} ({selectedScan.score}/100)
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1.5">
                  {selectedScan.title || selectedScan.name}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Logged on {selectedScan.dateFormatted || selectedScan.date} • Customer: {selectedScan.customerId || customer.email}
                </p>
              </div>

              <button
                onClick={() => setSelectedScan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation */}
            {selectedScan.explanation && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <h3 className="text-xs font-semibold text-slate-200 mb-1 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Advisory Explanation</span>
                </h3>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {selectedScan.explanation}
                </p>
              </div>
            )}

            {/* Detected Findings Breakdown */}
            {selectedScan.findings && selectedScan.findings.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-200 mb-2">
                  Detected Sensitive Vectors ({selectedScan.findings.length})
                </h3>
                <div className="space-y-2">
                  {selectedScan.findings.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-black/50 border border-white/[0.06] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{f.category}</span>
                        <span className="text-[10px] text-rose-300 font-bold px-1.5 py-0.5 rounded bg-rose-500/10">
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{f.description}</p>
                      {f.examples && f.examples.length > 0 && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] text-slate-500">Masked Sample:</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-cyan-300 border border-white/[0.06]">
                            {f.examples[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Remediation Actions */}
            {selectedScan.recommendedActions && selectedScan.recommendedActions.length > 0 && (
              <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20">
                <h3 className="text-xs font-semibold text-violet-300 mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recommended Remediation</span>
                </h3>
                <ul className="space-y-1.5 text-slate-300 font-sans text-xs">
                  {selectedScan.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <span className="text-[10px] text-slate-500">
                Zero-Persistence Heuristic Audit • Advisory Only
              </span>
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
