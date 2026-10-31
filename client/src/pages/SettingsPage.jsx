import React, { useState } from 'react';
import {
  Shield,
  Sliders,
  Key,
  CheckCircle,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [gdprMode, setGdprMode] = useState(true);
  const [hipaaMode, setHipaaMode] = useState(true);
  const [autoRedact, setAutoRedact] = useState(true);
  const [quarantineThreshold, setQuarantineThreshold] = useState(80);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Spatial Compliance & Policy Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure detection sensitivity, compliance policy rules, and future backend integration endpoints.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Compliance Guardrails */}
        <div className="matte-glass rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Shield className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Regulatory Compliance Safeguards</h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl matte-glass-subtle">
              <div>
                <p className="text-xs font-semibold text-slate-200">Aadhaar Statutory & GDPR Protection</p>
                <p className="text-[10px] text-slate-400">
                  Flags 12-digit Indian national identity numbers, PAN taxpayer IDs, and international PII.
                </p>
              </div>
              <input
                type="checkbox"
                checked={gdprMode}
                onChange={(e) => setGdprMode(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-violet-600 bg-black/60 border-violet-500/30 focus:ring-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl matte-glass-subtle">
              <div>
                <p className="text-xs font-semibold text-slate-200">HIPAA & Medical Information Masking</p>
                <p className="text-[10px] text-slate-400">
                  Detects medical diagnostic terms, prescription codes, and patient identifiers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hipaaMode}
                onChange={(e) => setHipaaMode(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-violet-600 bg-black/60 border-violet-500/30 focus:ring-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl matte-glass-subtle">
              <div>
                <p className="text-xs font-semibold text-slate-200">Automatic Client-Side Masking</p>
                <p className="text-[10px] text-slate-400">
                  Pre-redacts detected credit card numbers, Aadhaar numbers, and SSNs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoRedact}
                onChange={(e) => setAutoRedact(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-violet-600 bg-black/60 border-violet-500/30 focus:ring-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="matte-glass rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Detection Risk Sensitivity</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Automatic Quarantine Threshold</span>
              <span className="text-cyan-400 font-bold">{quarantineThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={quarantineThreshold}
              onChange={(e) => setQuarantineThreshold(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Payloads scoring above this threshold will immediately trigger critical alerts and quarantine.
            </p>
          </div>
        </div>

        {/* Backend & AI Connection Status */}
        <div className="matte-glass rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Key className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Zero-Persistence Backend Node</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl matte-glass-subtle space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-mono">Backend Engine</span>
              <p className="font-semibold text-white">Express + Heuristic Inspector</p>
              <p className="text-[11px] text-cyan-400 font-mono">POST /api/analyze</p>
            </div>

            <div className="p-3 rounded-xl matte-glass-subtle space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-mono">Phase 3 AI Pipeline</span>
              <p className="font-semibold text-white">Server-Side LLM Inspection</p>
              <p className="text-[11px] text-emerald-400 font-mono">AI_API_KEY Ready</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {saved ? (
            <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Policy settings updated!</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">Spatial preferences cached</span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)] flex items-center space-x-1.5 hover:scale-105"
          >
            <Save className="w-3.5 h-3.5 text-cyan-300" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
