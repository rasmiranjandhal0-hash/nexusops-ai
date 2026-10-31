import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  FileCheck,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function PublicVerifyPage() {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [publishedDatasets, setPublishedDatasets] = useState([]);

  useEffect(() => {
    // Check if query param or path has an ID
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      setCertId(idParam);
      handleLookup(idParam);
    }

    // Fetch published datasets
    axiosClient
      .get('/public/datasets')
      .then((res) => {
        if (res.data && res.data.datasets) {
          setPublishedDatasets(res.data.datasets);
        }
      })
      .catch(() => {});
  }, []);

  const handleLookup = async (idToQuery = certId) => {
    if (!idToQuery.trim()) return;
    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const res = await axiosClient.get(`/public/verify/${encodeURIComponent(idToQuery.trim())}`);
      if (res.data && res.data.verification) {
        setCertificate(res.data.verification);
      } else {
        setError('Verification certificate not found or record has expired.');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Verification certificate not found in the public ledger.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-mono py-4">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>NEXUSOPS PUBLIC VERIFICATION PORTAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Audit Authenticity
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Validate cryptographic inspection certificates issued by the NexusOps AI threat detection core.
        </p>
      </div>

      {/* Certificate Search Box */}
      <div className="matte-glass rounded-2xl p-6 border border-violet-500/25 space-y-4">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Enter Certificate ID / Fingerprint:
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. verif-1730368800000 or scan-12345"
              className="w-full bg-[#080612]/70 border border-violet-500/25 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <button
            onClick={() => handleLookup()}
            disabled={loading || !certId.trim()}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>Verify Record</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Authenticated Certificate Display */}
      {certificate && (
        <div className="matte-glass rounded-2xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Certificate Verified Genuine
                </h3>
                <p className="text-xs text-emerald-400">
                  {certificate.status || 'AUTHENTICATED_RECORD'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Audit Timestamp</span>
              <span className="text-xs text-white">
                {new Date(certificate.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Certificate Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-violet-500/15 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Certificate ID</span>
              <p className="font-mono text-cyan-300 break-all">{certificate.id}</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-violet-500/15 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Inspection Vector</span>
              <p className="font-semibold text-white">{certificate.type}</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-violet-500/15 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Target Entity (Redacted)</span>
              <p className="font-mono text-slate-200">{certificate.targetPreview}</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-violet-500/15 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Recorded Threat Level</span>
              <p
                className={`font-bold ${
                  certificate.riskLevel === 'CRITICAL' || certificate.riskLevel === 'HIGH'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {certificate.riskLevel} ({certificate.riskScore}/100)
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-slate-400 text-[11px] leading-relaxed">
            <p className="font-semibold text-slate-300 mb-1">Public Verification Disclaimer:</p>
            {certificate.disclaimer}
          </div>
        </div>
      )}

      {/* Published Datasets Section */}
      {publishedDatasets.length > 0 && (
        <div className="matte-glass rounded-2xl p-6 border border-violet-500/25 space-y-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Publicly Released Security Datasets
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Datasets explicitly marked as public by authorized tenant organizations.
          </p>

          <div className="space-y-2">
            {publishedDatasets.map((ds) => (
              <div
                key={ds.id}
                className="p-3.5 rounded-xl bg-black/40 border border-violet-500/15 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{ds.name || ds.filename}</p>
                  <p className="text-[11px] text-slate-400">
                    {ds.totalRecords} records • Quality: {ds.dataQualityScore}%
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                  PUBLIC DATASET
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
