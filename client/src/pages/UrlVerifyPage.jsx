import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

const URL_PRESETS = [
  { label: 'Official Brand (Clean)', url: 'https://www.paypal.com' },
  { label: 'Phishing Brand Spoof (.xyz)', url: 'http://sbi-kyc-update.xyz/login' },
  { label: 'Typosquatting Subdomain', url: 'http://microsoft-support.login-verify.top' },
  { label: 'SSRF Cloud Probing (Blocked)', url: 'http://169.254.169.254/latest/meta-data/' },
];

export default function UrlVerifyPage() {
  const [url, setUrl] = useState(URL_PRESETS[1].url);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (targetUrl = url) => {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axiosClient.post('/verify/url', { url: targetUrl.trim() });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              <span>Website & URL Fraud Verification</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              SSRF PROTECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze domain reputation, brand impersonation, transport encryption, and DNS infrastructure safely.
          </p>
        </div>
      </div>

      {/* Input Box & Presets */}
      <div className="matte-glass rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Target URL or Hostname to Inspect:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com or domain.xyz/path"
                className="w-full bg-[#080612]/70 border border-violet-500/25 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !url.trim()}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Inspecting...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-cyan-300" />
                  <span>Verify URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset scenario shortcuts */}
        <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400">Sample Vectors:</span>
          {URL_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrl(p.url);
                handleVerify(p.url);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg matte-glass-subtle hover:text-white text-slate-300 border border-white/[0.06] transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in-long">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inspection Results Display */}
      {result && (
        <div className="matte-glass rounded-xl p-5 space-y-5 animate-fade-in-long">
          {/* Header Score Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400">ID: {result.id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    result.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : result.riskLevel === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : result.riskLevel === 'MODERATE'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {result.riskLevel} RISK ({result.riskScore}/100)
                </span>
                <span className="text-[10px] text-cyan-400">Confidence: {result.confidenceScore}%</span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 break-all">
                {result.target}
              </h2>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className={`px-2 py-1 rounded-md text-[11px] font-semibold ${result.isHttps ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'}`}>
                {result.isHttps ? 'HTTPS ENCRYPTED' : 'PLAIN HTTP'}
              </span>
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detected Threat Indicators</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.detectedIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-400">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supporting Technical Evidence</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-400 font-sans">
                {result.supportingEvidence.map((ev, i) => (
                  <li key={i} className="leading-relaxed">
                    {ev}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remediation Recommendations */}
          {result.recommendedActions && result.recommendedActions.length > 0 && (
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/25 space-y-2">
              <h3 className="text-xs font-semibold text-violet-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recommended Operational Action</span>
              </h3>
              <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc list-inside">
                {result.recommendedActions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
