import React, { useState } from 'react';
import {
  Phone,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  Radio,
  FileWarning,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

const PHONE_PRESETS = [
  { label: 'Standard Mobile (IN)', phone: '+91 9876543210' },
  { label: 'Standard Mobile (US)', phone: '+1 415 555 2671' },
  { label: 'Premium Rate Toll Scam', phone: '+1 900 555 0199' },
  { label: 'Repetitive Dummy Digits', phone: '+91 9999999999' },
  { label: 'Sequential Fake Digits', phone: '+1 1234567890' },
];

export default function PhoneVerifyPage() {
  const [phone, setPhone] = useState(PHONE_PRESETS[2].phone);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (targetPhone = phone) => {
    if (!targetPhone.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axiosClient.post('/verify/phone', { phone: targetPhone.trim() });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Phone verification failed.');
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
              <Phone className="w-6 h-6 text-cyan-400" />
              <span>Phone Number & Telecom Fraud Verification</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              E.164 & CARRIER HEURISTICS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit high-risk premium toll prefixes, international spoofing, repetitive dummy numbers, and SIM-swap risk factors.
          </p>
        </div>
      </div>

      {/* Input Box & Presets */}
      <div className="matte-glass rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            International Phone Number (E.164 Format):
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567 or +91 9876543210"
                className="w-full bg-[#080612]/70 border border-violet-500/25 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !phone.trim()}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Verifying Line...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-cyan-300" />
                  <span>Verify Phone</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-[11px] text-slate-400 mb-2">Or select a live test scenario:</p>
          <div className="flex flex-wrap gap-2">
            {PHONE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPhone(p.phone);
                  handleVerify(p.phone);
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
                    Confidence: {result.confidenceScore || 90}%
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mt-1 break-all">
                  {result.formattedPhone || result.phone}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Jurisdiction:{' '}
                  <span className="text-cyan-300">
                    {result.countryName || result.countryCode || 'International'} (Dial Code: +{result.dialCode})
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end justify-center font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Fraud Verdict</span>
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
                  ? 'HIGH SCAM RISK / SUSPEND'
                  : result.riskScore >= 40
                  ? 'MANUAL REVIEW'
                  : 'LEGITIMATE TELECOM LINE'}
              </span>
            </div>
          </div>

          {/* Telecom Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">Line Type</span>
              <div className="flex items-center space-x-2 mt-1">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">
                  {result.lineType || 'Mobile / Standard Line'}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">
                Carrier: {result.carrierGuess || 'Major Telecom Provider'}
              </p>
            </div>

            <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">Premium Toll Prefix</span>
              <div className="flex items-center space-x-2 mt-1">
                <Radio className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">
                  {result.isPremiumRate ? 'Premium Rate Toll Detected' : 'Standard Rate Tariff'}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">
                {result.isPremiumRate ? 'High fraud correlation (IRS/Bank impersonation)' : 'No toll surcharge detected'}
              </p>
            </div>

            <div className="matte-glass p-4 rounded-xl border border-violet-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">Digit Distribution</span>
              <div className="flex items-center space-x-2 mt-1">
                {result.isDummy ? (
                  <FileWarning className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-semibold text-white">
                  {result.isDummy ? 'Synthetic / Fake Digits' : 'Natural Distribution'}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">
                {result.isDummy ? 'Sequential or repeated pattern' : 'Valid telecom entropy'}
              </p>
            </div>
          </div>

          {/* Detected Indicators */}
          <div className="matte-glass rounded-xl p-5 border border-violet-500/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
              Telecom Threat Indicators ({result.detectedIndicators?.length || 0})
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
                <span>No anomalous telecom prefixes or spoof patterns detected.</span>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="matte-glass rounded-xl p-5 border border-violet-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Telecom Fraud Policy
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              {result.riskScore >= 70 ? (
                <>
                  <li>Block automated outbound SMS OTP dispatch to prevent toll-fraud billing drained.</li>
                  <li>Enforce hardware token or authenticator app (TOTP) instead of SMS.</li>
                  <li>Log account attempt into security audit trail for IP correlation.</li>
                </>
              ) : result.riskScore >= 40 ? (
                <>
                  <li>Apply rate-limiting on SMS delivery to prevent rapid exhaustion attacks.</li>
                  <li>Require CAPTCHA verification before sending authentication codes.</li>
                </>
              ) : (
                <>
                  <li>Carrier number conforms to standard international mobile formats.</li>
                  <li>Eligible for standard 2FA SMS and voice transaction alerts.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
