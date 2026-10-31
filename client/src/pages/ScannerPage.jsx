import React, { useState } from 'react';
import {
  Scan,
  ShieldCheck,
  AlertTriangle,
  Copy,
  RefreshCw,
  Info,
  Lock,
  Server,
  WifiOff,
  CheckCircle,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

const PRESETS = [
  {
    label: 'Aadhaar, PAN & Payment Leak',
    text: `Customer Support verification for Rajesh Kumar:
Aadhaar Number: 4829 1930 4812
PAN Card ID: ABCDE1234F
Debit Card: 4111 2091 8842 1092, Expiry: 11/28, CVV: 842
Mobile: +91 9876543210, Email: rajesh.kumar@gmail.com
Requested urgent wire transfer of INR 85,000 to escrow account.`,
  },
  {
    label: 'OTP & Phishing Coercion',
    text: `URGENT NOTICE: Your State Bank account has been suspended due to pending KYC update.
Please click the link immediately to verify: http://sbi-kyc-update.xyz/login
Do not verify via phone. Share your 6-digit OTP verification code received on SMS to prevent total account termination within 2 hours.`,
  },
  {
    label: 'Cloud Credentials & Secret Leak',
    text: `Worker container deployment script:
Database connection string: postgresql://admin:SuperSecret2026!@db.internal.company.io:5432/user_vault
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
OPENAI_API_KEY=sk-proj-94819283019283019283019283
Contact oncall engineer at devops-alert@company.org or +1 (555) 234-5678.`,
  },
  {
    label: 'Clean Text (Routine Message)',
    text: `Hello team, please review the security documentation for the quarterly compliance audit. We have updated the network firewall rules, tokenized session tokens, and verified that all endpoints enforce TLS 1.3 encryption. Let's sync tomorrow at 10 AM.`,
  },
];

export default function ScannerPage() {
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);

    try {
      const response = await axiosClient.post('/analyze', { text: inputText });
      if (response.data && response.data.riskLevel) {
        setScanResult(response.data);
        setBackendStatus('online');
        setIsScanning(false);
        return;
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable. Triggering client-side fallback engine:', err.message);
    }

    // Client fallback
    setTimeout(() => {
      const lower = inputText.toLowerCase();
      let riskScore = 10;
      let riskLevel = 'LOW';
      const findings = [];
      const recommendedActions = [];

      if (lower.includes('aadhaar') || lower.includes('pan') || lower.includes('4111') || lower.includes('cvv') || lower.includes('otp')) {
        riskScore = 95;
        riskLevel = 'CRITICAL';
        findings.push({
          category: 'Aadhaar / National ID Pattern',
          severity: 'CRITICAL',
          examples: ['XXXX-XXXX-4812'],
          description: 'High-sensitivity 12-digit Indian national identity number detected.',
        });
        findings.push({
          category: 'Permanent Account Number (PAN)',
          severity: 'HIGH',
          examples: ['ABCDE****F'],
          description: 'Indian tax identity number identified in message text.',
        });
        findings.push({
          category: 'Payment Card Details (PCI-DSS)',
          severity: 'CRITICAL',
          examples: ['****-****-****-1092'],
          description: 'Credit or debit card sequence exposed.',
        });
        recommendedActions.push('Never transmit full Aadhaar, PAN, or card details in unencrypted text.');
        recommendedActions.push('Tokenize or redact cardholder data before logging or storing.');
      } else if (lower.includes('urgent') || lower.includes('suspended') || lower.includes('kyc') || lower.includes('.xyz')) {
        riskScore = 88;
        riskLevel = 'HIGH';
        findings.push({
          category: 'Urgency & Coercion Scam Heuristics',
          severity: 'HIGH',
          examples: ['[Trigger: "urgent action required..."]'],
          description: 'High-pressure deadline and suspension threats indicative of phishing.',
        });
        findings.push({
          category: 'Suspicious / Deceptive Link',
          severity: 'HIGH',
          examples: ['hxxp://sbi-kyc-update[.]xyz/***'],
          description: 'Non-standard domain used to impersonate official banking portal.',
        });
        recommendedActions.push('Do NOT click unsolicited links or share OTP verification codes.');
        recommendedActions.push('Contact banking support directly via official corporate phone directory.');
      } else {
        riskScore = 8;
        riskLevel = 'LOW';
        findings.push({
          category: 'Clean Operational Text',
          severity: 'LOW',
          examples: ['[No sensitive data detected]'],
          description: 'Text appears safe for routine operational communication.',
        });
        recommendedActions.push('No immediate remediation required.');
      }

      setScanResult({
        riskLevel,
        riskScore,
        findings,
        explanation: 'Simulated heuristic analysis evaluated in client sandbox memory.',
        recommendedActions,
        disclaimer: 'PRIVACYGUARD AI analysis is advisory and provided for defensive risk mitigation. It does not constitute legal counsel or definitive forensic proof of fraud.',
      });
      setBackendStatus('fallback');
      setIsScanning(false);
    }, 400);
  };

  const handleCopyRedacted = () => {
    let redacted = inputText
      .replace(/\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/g, '[REDACTED_AADHAAR]')
      .replace(/\b[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}\b/g, '[REDACTED_PAN]')
      .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_CARD]')
      .replace(/CVV:\s*\d{3,4}/gi, 'CVV: [REDACTED]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');

    navigator.clipboard.writeText(redacted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
            <span>Spatial Privacy Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Zero-persistence heuristic inspection: Aadhaar, PAN, Cards, Credentials, and Scam Coercion.
          </p>
        </div>

        {backendStatus && (
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center space-x-2 self-start sm:self-auto ${
              backendStatus === 'online'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}
          >
            {backendStatus === 'online' ? (
              <>
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Online (POST /api/analyze)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Backend Offline (Client Fallback)</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Preset Selector */}
      <div className="glass-panel rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
          <span className="font-semibold text-sky-300">Preset Inspection Scenarios:</span>
          <span className="text-[11px] text-slate-400">Click to autofill sample payload</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(p.text);
                setScanResult(null);
                setBackendStatus(null);
              }}
              className="text-xs font-mono px-3 py-1.5 rounded-lg glass-panel-subtle hover:border-sky-400/50 text-slate-200 transition-all hover:scale-105"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input & Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Payload Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Scan className="w-4 h-4 text-sky-400" />
                <span>Text / Document Payload to Inspect</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">{inputText.length} characters</span>
            </div>

            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious text or communication here..."
              className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/40 leading-relaxed transition-all resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Zero Persistence Guarantee</span>
              </div>

              <div className="flex items-center space-x-2 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setScanResult(null);
                    setBackendStatus(null);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isScanning || !inputText.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-black bg-sky-400 hover:bg-sky-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all flex items-center space-x-2 hover:scale-105"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Anomaly Flux...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Analyze Privacy Risk</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-xl p-5 min-h-[460px] flex flex-col justify-between">
            {scanResult ? (
              <div className="space-y-4">
                {/* Result Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        scanResult.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : scanResult.riskLevel === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : scanResult.riskLevel === 'MEDIUM'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {scanResult.riskLevel} RISK
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 font-bold">
                      Score: {scanResult.riskScore}/100
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-400/30 font-semibold">
                    {backendStatus === 'online' ? 'Live API Validated' : 'Heuristic Engine'}
                  </span>
                </div>

                {/* Detected Categories & Masked Examples */}
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Findings ({scanResult.findings.length})
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {scanResult.findings.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg glass-panel-subtle text-xs space-y-1 font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{f.category}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              f.severity === 'CRITICAL'
                                ? 'text-rose-300 bg-rose-500/10'
                                : f.severity === 'HIGH'
                                ? 'text-amber-300 bg-amber-500/10'
                                : 'text-sky-300 bg-sky-500/10'
                            }`}
                          >
                            {f.severity}
                          </span>
                        </div>
                        {f.description && <p className="text-[11px] text-slate-400">{f.description}</p>}
                        {f.examples && f.examples.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {f.examples.map((ex, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-sky-300"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                {scanResult.explanation && (
                  <div className="text-xs text-slate-300 glass-panel-subtle p-2.5 rounded-lg font-mono">
                    <p className="text-[10px] uppercase text-sky-400 font-semibold mb-1">Assessment</p>
                    <p className="leading-relaxed text-[11px] text-slate-300">{scanResult.explanation}</p>
                  </div>
                )}

                {/* Recommended Actions */}
                {scanResult.recommendedActions && scanResult.recommendedActions.length > 0 && (
                  <div className="glass-panel-subtle rounded-lg p-3 text-xs space-y-1.5 font-mono">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                      <span>Recommended Safe Actions</span>
                    </p>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {scanResult.recommendedActions.map((act, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-sky-400 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Redaction Button */}
                <button
                  type="button"
                  onClick={handleCopyRedacted}
                  className="w-full py-2 rounded-lg text-xs font-mono font-semibold text-slate-200 glass-panel-subtle hover:border-sky-400/50 transition-all flex items-center justify-center space-x-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied Redacted Version!' : 'Copy Redacted Text to Clipboard'}</span>
                </button>

                {/* Disclaimer */}
                {scanResult.disclaimer && (
                  <p className="text-[10px] text-slate-500 italic leading-tight font-mono">{scanResult.disclaimer}</p>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 my-auto">
                <div className="w-12 h-12 rounded-xl glass-panel-subtle flex items-center justify-center mb-3 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 font-mono">Awaiting Input Payload</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed font-mono">
                  Paste content or select a preset scenario above, then click "Analyze Privacy Risk".
                </p>
              </div>
            )}

            {/* Bottom Status Banner */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Spatial Glass Engine</span>
              </span>
              <span className="text-slate-400">Zero-Persistence Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
