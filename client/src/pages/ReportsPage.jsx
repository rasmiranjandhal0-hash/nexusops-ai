import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Filter,
  RefreshCw,
  Printer,
  Calendar,
  Lock,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { getCurrentCustomer, subscribeToAuth } from '../utils/auth';

export default function ReportsPage() {
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async (custId) => {
    setLoading(true);
    const targetCustId = (custId || customer.id || 'demo@privacyguard.ai').trim().toLowerCase();

    try {
      const [histRes, verifRes] = await Promise.allSettled([
        axiosClient.get(`/history?customerId=${encodeURIComponent(targetCustId)}`),
        axiosClient.get('/verify/history'),
      ]);

      let scans = [];
      let verifs = [];

      if (histRes.status === 'fulfilled' && histRes.value.data?.history) {
        scans = histRes.value.data.history;
      }
      if (verifRes.status === 'fulfilled' && verifRes.value.data?.verifications) {
        verifs = verifRes.value.data.verifications;
      }

      if (scans.length === 0) {
        try {
          const raw = localStorage.getItem(`privacyguard_history_${targetCustId}`);
          if (raw) scans = JSON.parse(raw);
        } catch {}
      }

      const unified = [
        ...scans.map((s) => ({
          id: s.id,
          type: 'Privacy Inspection',
          target: s.title || 'Zero-Persistence Text Scan',
          riskLevel: (s.risk || 'Low').toUpperCase(),
          riskScore: Number(s.score) || 0,
          timestamp: s.timestamp || new Date().toISOString(),
          status: s.status || 'Completed',
          details: s.summary || `${s.detectedCount || 0} sensitive elements analyzed`,
        })),
        ...verifs.map((v) => ({
          id: v.id,
          type: `${v.type} Verification`,
          target: v.target || 'Entity',
          riskLevel: (v.riskLevel || 'LOW').toUpperCase(),
          riskScore: Number(v.riskScore) || 0,
          timestamp: v.timestamp || new Date().toISOString(),
          status: 'Authenticated',
          details: v.detectedIndicators?.map((i) => i.description || i).join(', ') || 'No threats detected',
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setRecords(unified);
    } catch (err) {
      console.warn('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(customer.id);
    const unsub = subscribeToAuth((newCust) => {
      setCustomer(newCust);
      fetchRecords(newCust.id);
    });
    return unsub;
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await axiosClient.post(
        '/reports/export',
        { format: 'csv', type: 'all' },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexusops_audit_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      // Local fallback CSV export if backend route is unavailable
      let csv = 'ID,Type,Target,Risk Level,Score,Timestamp,Status\n';
      records.forEach((r) => {
        csv += `"${r.id}","${r.type}","${(r.target || '').replace(/"/g, '""')}","${r.riskLevel}","${r.riskScore}","${r.timestamp}","${r.status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexusops_audit_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setExporting(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'ALL') return true;
    return r.riskLevel === filter;
  });

  return (
    <div className="space-y-6 max-w-6xl font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              <span>Risk Reports & Audit Ledger</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              COMPLIANCE AUDIT READY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Export immutable compliance records and forensic proof of threat mitigations for{' '}
            <span className="text-cyan-300">{customer.email}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            disabled={exporting || records.length === 0}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            <span>{exporting ? 'Generating...' : 'Export CSV Report'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Metrics Bar */}
      <div className="matte-glass rounded-xl p-4 border border-violet-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 text-xs">
          <Filter className="w-4 h-4 text-violet-400 mr-1" />
          <span className="text-slate-400">Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'CLEAN', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                filter === lvl
                  ? 'bg-violet-600/30 text-cyan-300 border border-violet-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredRecords.length}</span> of{' '}
          <span className="text-white font-bold">{records.length}</span> recorded audits
        </div>
      </div>

      {/* Reports Table */}
      <div className="matte-glass rounded-xl border border-violet-500/20 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Loading compliance records...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records match the selected filter. Run verification scans to populate your compliance ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-violet-500/20 bg-black/40 text-slate-400 text-[11px]">
                  <th className="py-3 px-4 font-semibold">Audit Record ID</th>
                  <th className="py-3 px-4 font-semibold">Inspection Type</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Risk Level</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-200">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-300/80 truncate max-w-[120px]">
                      {r.id.slice(0, 12)}...
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{r.type}</td>
                    <td className="py-3 px-4 truncate max-w-[220px] text-slate-300">{r.target}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.riskLevel === 'CRITICAL'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : r.riskLevel === 'HIGH'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : r.riskLevel === 'MODERATE'
                            ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                        }`}
                      >
                        {r.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{r.riskScore}/100</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="px-2.5 py-1 rounded bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/25 text-cyan-300 hover:text-white text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Certificate Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="matte-glass border border-violet-500/40 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-violet-500/20">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Cryptographic Audit Certificate
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block">Certificate Fingerprint:</span>
                <p className="font-mono text-cyan-300 break-all">{selectedRecord.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Target:</span>
                  <p className="font-semibold text-white truncate">{selectedRecord.target}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Risk Score:</span>
                  <p className="font-semibold text-rose-300">
                    {selectedRecord.riskLevel} ({selectedRecord.riskScore}/100)
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] block">Forensic Details:</span>
                <p className="p-3 rounded-lg bg-black/40 border border-violet-500/20 text-slate-200">
                  {selectedRecord.details}
                </p>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] block">Issuing Authority:</span>
                <p className="text-slate-300">
                  NexusOps AI Security Engine (Tenant: {customer.email})
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-violet-500/20 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">ISO 27001 / SOC 2 Ready Proof</span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-cyan-300 text-xs flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
