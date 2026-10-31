import React, { useState } from 'react';
import {
  Mail,
  ShieldCheck,
  AlertTriangle,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

const EMAIL_PRESETS = [
  { label: 'Clean Enterprise', email: 'security@google.com' },
  { label: 'Disposable Domain', email: 'burner-test@temp-mail.org' },
  { label: 'Brand Typosquatting', email: 'account-alert@gmial.com' },
  { label: 'Suspicious Subdomain', email: 'support@mail.paypal-security.xyz' },
];

export default function EmailVerifyPage() {
  const [email, setEmail] = useState(EMAIL_PRESETS[1].email);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (targetEmail = email) => {
    if (!targetEmail.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axiosClient.post('/verify/email', { email: targetEmail.trim() });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Email verification failed.');
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
              <Mail className="w-6 h-6 text-cyan-400" />
              <span>Email & Mailbox Risk Verification</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              LIVE MX & REPUTATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detect disposable burner domains, brand typosquatting, MX record deliverability, and deceptive sender aliases.
          </p>
        </div>
      </div>

      {/* Input Box & Presets */}
      <div className="matte-glass rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Email Address to Inspect:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#080612]/70 border border-violet-500/25 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !email.trim()}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Inspecting MX...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-cyan-300" />
                  <span>Verify Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-[11px] text-slate-400 mb-2">Or select a live test scenario:</p>
          <div className="flex flex-wrap gap-2">
            {EMAIL_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setEmail(p.email);
                  handleVerify(p.email);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/25 text-slate-300 hover:text-cyan-300 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Top Threat Banner */}
          <div
            className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              result.riskLevel === 'CRITICAL'
                ? 'bg-rose-950/25 border-rose-500/40 text-rose-200'
                : result.riskLevel === 'HIGH'
                ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                : result.riskLevel === 'MODERATE'
                ? 'bg-yellow-950/25 border-yellow-500/40 text-yellow-200'
                : 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-start space-x-3.5">
              {result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH' ? (
                <ShieldAlert className="w-7 h-7 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-current">
                    {result.riskLevel} RISK ({result.riskScore}/100)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Confidence: {result.confidenceScore || 95}%
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white mt-1 break-all">
                  {result.email}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Domain: <span className="text-cyan-300">{result.domain || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end justify-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Automated Verdict</span>
              <span
                className={`text-sm font-bold ${
                  result.riskScore >= 70
                    ? 'text-rose-400'
                    : result.riskScore >= 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {result.riskScore >= 70
                  ? 'SUSPICIOUS / BLOCK'
                  : result.riskScore >= 40
                  ? 'ELEVATED AUDIT'
                  : 'LEGITIMATE / ALLOW'}
              </span>
            </div>
          </div>

          {/* Technical Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">RFC 5322 Syntax</span>
              <div className="flex items-center space-x-2 mt-1">
                {result.details?.syntaxValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-xs font-semibold text-white">
                  {result.details?.syntaxValid ? 'Valid Format' : 'Malformed Syntax'}
                </span>
              </div>
            </div>

            <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">MX Mail Routing</span>
              <div className="flex items-center space-x-2 mt-1">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">
                  {result.details?.mxRecordFound ? 'MX Exists & Active' : 'No MX Records Found'}
                </span>
              </div>
              {result.details?.mxHosts?.length > 0 && (
                <p className="text-[9px] text-slate-400 mt-1 truncate">
                  Host: {result.details.mxHosts[0]}
                </p>
              )}
            </div>

            <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">Burner / Disposable</span>
              <div className="flex items-center space-x-2 mt-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">
                  {result.details?.isDisposable ? 'Disposable Provider Detected' : 'Permanent Domain'}
                </span>
              </div>
            </div>
          </div>

          {/* Detected Indicators */}
          <div className="matte-glass rounded-xl p-5 border border-violet-500/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
              Detected Security Indicators ({result.detectedIndicators?.length || 0})
            </h4>
            {result.detectedIndicators && result.detectedIndicators.length > 0 ? (
              <div className="space-y-2">
                {result.detectedIndicators.map((ind, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-black/40 border border-violet-500/15 flex items-start space-x-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-white">{ind.description || ind}</p>
                      {ind.weight && (
                        <span className="text-[10px] text-rose-300 font-mono">
                          Risk Weight: +{ind.weight} pts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No malicious indicators or spoofing patterns were identified.</span>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="matte-glass rounded-xl p-5 border border-violet-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Security Recommendations
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              {result.riskScore >= 70 ? (
                <>
                  <li>Reject registrations from this email or require external SMS verification.</li>
                  <li>Do not deliver sensitive reset tokens or password links to disposable inboxes.</li>
                  <li>Flag this email domain in identity firewalls to mitigate spam flood attacks.</li>
                </>
              ) : result.riskScore >= 40 ? (
                <>
                  <li>Verify MX deliverability before sending critical notifications.</li>
                  <li>Perform secondary authentication check on high-value transactions.</li>
                </>
              ) : (
                <>
                  <li>Email domain has standard deliverability and valid mail routing.</li>
                  <li>Safe for primary account registration and customer communications.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
