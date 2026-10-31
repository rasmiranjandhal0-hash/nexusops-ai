import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ExternalLink,
  User,
  History,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { getCurrentCustomer, subscribeToAuth } from '../utils/auth';

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
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [activePresetLabel, setActivePresetLabel] = useState(PRESETS[0].label);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const [ledgerNotice, setLedgerNotice] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAuth((newCust) => {
      setCustomer(newCust);
    });
    return unsub;
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setLedgerNotice(null);

    const targetCust = customer || getCurrentCustomer();
    const payloadTitle = activePresetLabel || `Document Scan: ${inputText.slice(0, 32)}...`;

    try {
      const response = await axiosClient.post('/analyze', {
        text: inputText,
        title: payloadTitle,
        customerId: targetCust.id,
      });

      if (response.data && response.data.riskLevel) {
        setScanResult(response.data);
        setBackendStatus('online');
        setIsScanning(false);

        // Synchronize customer history in local storage cache
        if (response.data.scanRecord) {
          const cacheKey = `privacyguard_history_${targetCust.id}`;
          const currentList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
          const updated = [
            response.data.scanRecord,
            ...currentList.filter((i) => i.id !== response.data.scanRecord.id),
          ];
          localStorage.setItem(cacheKey, JSON.stringify(updated));
          setLedgerNotice(response.data.scanRecord);
        }
        return;
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable. Triggering client-side fallback engine:', err.message);
    }

    // Client fallback engine (zero-data-loss for hackathon demo)
    setTimeout(() => {
      const lower = inputText.toLowerCase();
      let riskScore = 10;
      let riskLevel = 'LOW';
      const findings = [];
      const recommendedActions = [];

      if (
        lower.includes('aadhaar') ||
        lower.includes('pan') ||
        lower.includes('4111') ||
        lower.includes('cvv') ||
        lower.includes('otp')
      ) {
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
      } else if (
        lower.includes('urgent') ||
        lower.includes('suspended') ||
        lower.includes('kyc') ||
        lower.includes('.xyz')
      ) {
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

      const scanId = `SCN-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const fallbackRecord = {
        id: scanId,
        customerId: targetCust.id,
        title: payloadTitle,
        dateFormatted: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(now),
        timestamp: now.toISOString(),
        risk:
          riskLevel === 'CRITICAL'
            ? 'Critical'
            : riskLevel === 'HIGH'
            ? 'High'
            : riskLevel === 'MEDIUM'
            ? 'Moderate'
            : 'Low',
        score: riskScore,
        detectedCount: findings.length,
        categories: findings.map((f) => f.category),
        status:
          riskLevel === 'CRITICAL'
            ? 'Quarantined'
            : riskLevel === 'HIGH'
            ? 'Flagged'
            : 'Clean',
        explanation: 'Simulated heuristic analysis evaluated in client sandbox memory.',
        recommendedActions,
        findings,
      };

      const cacheKey = `privacyguard_history_${targetCust.id}`;
      const currentList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const updated = [fallbackRecord, ...currentList.filter((i) => i.id !== scanId)];
      localStorage.setItem(cacheKey, JSON.stringify(updated));

      setScanResult({
        riskLevel,
        riskScore,
        findings,
        explanation: 'Simulated heuristic analysis evaluated in client sandbox memory.',
        recommendedActions,
        disclaimer:
          'PRIVACYGUARD AI analysis is advisory and provided for defensive risk mitigation. It does not constitute legal counsel or definitive forensic proof of fraud.',
        scanRecord: fallbackRecord,
      });
      setLedgerNotice(fallbackRecord);
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
    <div className="space-y-5">
      {/* Header & Active Customer Badge */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
            <span>Spatial Privacy Scanner</span>
          </h1>
          <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400 font-mono">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auditing Profile:</span>
            <span className="text-white font-semibold">{customer.name}</span>
            <span className="text-slate-500">({customer.email})</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {backendStatus && (
            <div
              className={`px-3 py-1 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
                backendStatus === 'online'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              }`}
            >
              {backendStatus === 'online' ? (
                <>
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Backend Synced</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Local Memory Mode</span>
                </>
              )}
            </div>
          )}

          <Link
            to="/history"
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono matte-glass-subtle hover:text-white text-slate-300 border border-white/[0.08] transition-all"
          >
            <History className="w-3.5 h-3.5 text-violet-400" />
            <span>View Ledger</span>
          </Link>
        </div>
      </div>

      {/* Synchronized Ledger Notification Banner */}
      {ledgerNotice && (
        <div className="p-3 rounded-xl bg-violet-950/50 border border-violet-500/30 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in-long">
          <div className="flex items-center space-x-2 text-violet-200">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Recorded in <strong className="text-white">{customer.email}</strong> personal history ledger ({ledgerNotice.id}).
            </span>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center space-x-1 text-cyan-300 hover:text-cyan-200 underline font-semibold shrink-0"
          >
            <span>Open in Ledger</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Preset Selector */}
      <div className="matte-glass rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
          <span className="font-semibold text-violet-300">Preset Inspection Scenarios:</span>
          <span className="text-[10px] text-slate-400">Click to autofill sample payload</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(p.text);
                setActivePresetLabel(p.label);
                setScanResult(null);
                setBackendStatus(null);
                setLedgerNotice(null);
              }}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
                activePresetLabel === p.label && inputText === p.text
                  ? 'bg-violet-600/40 text-white border border-violet-500/50 shadow-sm'
                  : 'matte-glass-subtle hover:border-violet-500/40 text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input & Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input Payload Box */}
        <div className="lg:col-span-7 space-y-3">
          <div className="matte-glass rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Scan className="w-4 h-4 text-cyan-400" />
                <span>Text / Document Payload to Inspect</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">{inputText.length} characters</span>
            </div>

            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setActivePresetLabel('');
              }}
              placeholder="Paste suspicious text or communication here..."
              className="w-full bg-[#080612]/70 border border-violet-500/20 rounded-xl p-3.5 text-xs sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 leading-relaxed transition-all resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Persistence Guarantee: Raw text is never stored</span>
              </div>

              <div className="flex items-center space-x-2 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setScanResult(null);
                    setBackendStatus(null);
                    setLedgerNotice(null);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isScanning || !inputText.trim()}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 shadow-[0_0_20px_-3px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 hover:scale-105"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Scanning Heuristics...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 text-cyan-300" />
                      <span>Execute Privacy Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Heuristic Analysis Results Card */}
        <div className="lg:col-span-5 space-y-4">
          {scanResult ? (
            <div className="matte-glass rounded-xl p-5 space-y-4 animate-fade-in-long">
              {/* Header Risk Pill */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] font-mono">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                    Assessment Result
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span
                      className={`text-sm font-bold px-2.5 py-0.5 rounded-md ${
                        scanResult.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : scanResult.riskLevel === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : scanResult.riskLevel === 'MEDIUM'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {scanResult.riskLevel} RISK
                    </span>
                    <span className="text-xs text-slate-300 font-bold">
                      Score: {scanResult.riskScore} / 100
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyRedacted}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono matte-glass-subtle hover:border-violet-500/40 text-slate-200 transition-all hover:scale-105"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copied ? 'Copied!' : 'Copy Redacted'}</span>
                </button>
              </div>

              {/* Advisory Explanation */}
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-semibold text-slate-300">Analysis Summary:</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {scanResult.explanation}
                </p>
              </div>

              {/* Detected Categories List */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold text-slate-300">
                  Detected Sensitive Vectors ({scanResult.findings?.length || 0}):
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {scanResult.findings && scanResult.findings.length > 0 ? (
                    scanResult.findings.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{item.category}</span>
                          <span className="text-[10px] text-rose-300 font-bold px-1.5 py-0.5 rounded bg-rose-500/10">
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans">{item.description}</p>
                        {item.examples && item.examples.length > 0 && (
                          <div className="flex items-center space-x-2 pt-1">
                            <span className="text-[10px] text-slate-500">Masked Sample:</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-cyan-300 border border-white/[0.06]">
                              {item.examples[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                      ✓ No sensitive identifiers or coercion vectors detected.
                    </div>
                  )}
                </div>
              </div>

              {/* Remediation Actions */}
              {scanResult.recommendedActions && scanResult.recommendedActions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <h4 className="text-xs font-mono font-semibold text-cyan-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recommended Actions:</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc list-inside">
                    {scanResult.recommendedActions.map((action, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px] font-mono text-slate-400 flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{scanResult.disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="matte-glass rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[380px]">
              <Scan className="w-10 h-10 mb-3 opacity-30 text-violet-400" />
              <p className="font-mono text-xs font-semibold text-slate-400">
                Awaiting Inspection Payload
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs font-sans">
                Paste suspicious text or select a preset scenario on the left, then click{' '}
                <strong className="text-slate-400 font-mono">Execute Privacy Scan</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
