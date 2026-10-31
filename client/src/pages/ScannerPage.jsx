import React, { useState } from 'react';
import {
  Scan,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileWarning,
  CheckCircle,
  Copy,
  RefreshCw,
  Sparkles,
  Info,
  Lock,
  ArrowRight,
} from 'lucide-react';

const PRESETS = [
  {
    label: 'PII & Financial Leak',
    text: `Hello Support, please update my profile. My full legal name is David Vance, SSN: 142-99-4821, born 05/12/1988. My current address is 442 Market Street, San Francisco CA. Please bill my new Visa: 4111-2091-8842-1092, Exp: 09/28, CVV: 842. Password for verification is Vance#2026!`,
  },
  {
    label: 'Exposed Cloud Secrets & API Key',
    text: `Deploying the production scraper. Database connection: postgresql://admin:SuperSecret2026!@db.internal.company.io:5432/user_vault. Also make sure to inject AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY and OPENAI_API_KEY=sk-proj-94819283019283019283019283 into the worker container.`,
  },
  {
    label: 'Urgent Wire Transfer Scam / Phishing',
    text: `URGENT ACTION REQUIRED: This is Marcus Henderson, Executive CFO. Due to an ongoing audit with Merrill Lynch, please immediately dispatch a wire transfer of $48,500 to our acquisition escrow account #8829103948 (Routing: 121000358). Do not verify via telephone as I am currently boarding an international flight. Respond with transfer receipt within 45 minutes.`,
  },
  {
    label: 'Clean Text (No Sensitive Data)',
    text: `Nexus team, please review the release notes for version 2.4. We improved user interface contrast, resolved minor navigation latency, and documented the public API endpoints on docs.example.com. Let's schedule the all-hands demo for Thursday at 3 PM.`,
  },
];

export default function ScannerPage() {
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Heuristic scanner that simulates PrivacyGuard AI analysis
  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const lower = inputText.toLowerCase();

      // Simple heuristic evaluation for realistic simulation
      let riskLevel = 'Low';
      let riskScore = 15;
      const detectedCategories = [];
      const findings = [];
      const actions = [];

      // Check for PII / Financials
      if (lower.includes('ssn') || lower.includes('cvv') || lower.includes('visa') || lower.includes('password') || lower.includes('born')) {
        riskLevel = 'Critical';
        riskScore = 94;
        detectedCategories.push({ name: 'Personally Identifiable Information (PII)', severity: 'Critical', count: 3 });
        detectedCategories.push({ name: 'Payment Card Details (PCI-DSS)', severity: 'Critical', count: 2 });
        detectedCategories.push({ name: 'Plaintext Credentials', severity: 'High', count: 1 });

        findings.push('Exposed Social Security Number (SSN pattern match).');
        findings.push('Full 16-digit credit card number with plaintext CVV and expiration date.');
        findings.push('Plaintext account verification password exposed in message body.');

        actions.push('Immediately quarantine this message from chat logs and ticket persistence.');
        actions.push('Tokenize or redact cardholder data before storing to maintain PCI-DSS compliance.');
        actions.push('Trigger an automated password reset for the referenced account.');
      } 
      // Check for Secrets / API Keys
      else if (lower.includes('aws_secret') || lower.includes('api_key') || lower.includes('postgresql://') || lower.includes('secret')) {
        riskLevel = 'Critical';
        riskScore = 98;
        detectedCategories.push({ name: 'Exposed Cloud Infrastructure Secret', severity: 'Critical', count: 2 });
        detectedCategories.push({ name: 'Database Connection URI with Password', severity: 'Critical', count: 1 });

        findings.push('Production database credentials embedded in plaintext URI.');
        findings.push('High-entropy AWS Secret Access Key identified.');
        findings.push('OpenAI / Third-party API token exposed in prompt text.');

        actions.push('Revoke the exposed AWS and API access keys immediately in the cloud console.');
        actions.push('Rotate database administrative passwords and inspect audit logs for anomalous queries.');
        actions.push('Configure pre-commit git hooks and secret scanners in developer CI/CD pipelines.');
      }
      // Check for Phishing / Wire Scam
      else if (lower.includes('wire transfer') || lower.includes('urgent') || lower.includes('escrow') || lower.includes('do not verify')) {
        riskLevel = 'High';
        riskScore = 86;
        detectedCategories.push({ name: 'Business Email Compromise (BEC)', severity: 'High', count: 2 });
        detectedCategories.push({ name: 'Urgency & Coercion Phishing Pattern', severity: 'High', count: 1 });

        findings.push('Executive impersonation requesting rapid wire transfer.');
        findings.push('Explicit instruction to bypass secondary out-of-band verification.');
        findings.push('Arbitrary routing and account numbers in untrusted text.');

        actions.push('Do NOT initiate the wire transfer under any circumstances.');
        actions.push('Perform secondary verification through verified corporate directory phone number.');
        actions.push('Report communication to the internal Security Operations Center (SOC).');
      }
      // Clean text fallback
      else {
        riskLevel = 'Low';
        riskScore = 8;
        detectedCategories.push({ name: 'Clean Operational Text', severity: 'Low', count: 0 });
        findings.push('No obvious plaintext PII, credit card numbers, or cryptographic tokens detected.');
        actions.push('Text appears safe for routine operational communication.');
      }

      setScanResult({
        riskLevel,
        riskScore,
        detectedCategories,
        findings,
        actions,
        characterCount: inputText.length,
        timestamp: new Date().toLocaleTimeString(),
      });
      setIsScanning(false);
    }, 600);
  };

  const handleCopyRedacted = () => {
    let redacted = inputText
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED_CARD]')
      .replace(/CVV:\s*\d{3,4}/gi, 'CVV: [REDACTED]')
      .replace(/password\s*for\s*verification\s*is\s*\S+/gi, 'password for verification is [REDACTED]');
    navigator.clipboard.writeText(redacted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Privacy & Data Leak Scanner</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Paste untrusted text, customer communications, or prompts to detect sensitive information exposure and scam indicators.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold text-slate-200">Load Realistic Test Scenarios:</span>
          <span className="text-[11px] text-slate-400">Click to autofill sample text</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(p.text);
                setScanResult(null);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input & Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Scan className="w-4 h-4 text-blue-400" />
                <span>Text / Document Payload to Inspect</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">{inputText.length} characters</span>
            </div>

            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious customer email, developer prompt, or server log here..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 leading-relaxed transition-all resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Client-Side Sandbox (Zero persistence)</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setScanResult(null);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isScanning || !inputText.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Heuristics...</span>
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
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur shadow-xl min-h-[420px] flex flex-col justify-between">
            {scanResult ? (
              <div className="space-y-4">
                {/* Result Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        scanResult.riskLevel === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : scanResult.riskLevel === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {scanResult.riskLevel} Risk Level
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Score: {scanResult.riskScore}/100</span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-semibold">
                    Simulated Heuristic
                  </span>
                </div>

                {/* Detected Categories */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Detected Sensitive Categories
                  </p>
                  <div className="space-y-1.5">
                    {scanResult.detectedCategories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <span className="text-slate-200 font-medium">{cat.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            cat.severity === 'Critical'
                              ? 'text-rose-400 bg-rose-500/10'
                              : cat.severity === 'High'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-emerald-400 bg-emerald-500/10'
                          }`}
                        >
                          {cat.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Explanation */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Risk Explanation
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {scanResult.findings.map((f, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Recommended Safe Actions</span>
                  </p>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {scanResult.actions.map((act, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Redaction Action */}
                <button
                  type="button"
                  onClick={handleCopyRedacted}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied Redacted Version!' : 'Copy Redacted Text to Clipboard'}</span>
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 my-auto">
                <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center mb-3 text-slate-400">
                  <ShieldCheck className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">Awaiting Input Payload</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                  Paste content or select one of the realistic test scenarios, then click "Analyze Privacy Risk".
                </p>
              </div>
            )}

            {/* Simulated Label Banner */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulated Heuristics Engine</span>
              </span>
              <span className="font-mono text-slate-400">v1.0-MVP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
