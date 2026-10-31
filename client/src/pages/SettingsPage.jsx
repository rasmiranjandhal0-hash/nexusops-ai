import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  Lock,
  Key,
  Database,
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Security & Compliance Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure detection sensitivity, compliance policy rules, and future backend integration endpoints.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Compliance Guardrails */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Regulatory Framework Compliance</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">GDPR & PII Leak Safeguards</p>
                <p className="text-[11px] text-slate-400">
                  Automatically flags European citizen personal identifiers, passport numbers, and phone records.
                </p>
              </div>
              <input
                type="checkbox"
                checked={gdprMode}
                onChange={(e) => setGdprMode(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">HIPAA Protected Health Information (PHI)</p>
                <p className="text-[11px] text-slate-400">
                  Detects medical diagnostic terms, prescription codes, and patient identifiers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hipaaMode}
                onChange={(e) => setHipaaMode(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-200">Automatic Client-Side Redaction</p>
                <p className="text-[11px] text-slate-400">
                  Pre-redacts detected credit card numbers and SSNs before generating export reports.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoRedact}
                onChange={(e) => setAutoRedact(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Detection Risk Sensitivity</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Automatic Quarantine Threshold</span>
              <span className="font-mono text-blue-400 font-bold">{quarantineThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={quarantineThreshold}
              onChange={(e) => setQuarantineThreshold(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Documents scoring above this threshold will immediately be marked as "Quarantined" with red critical alerts.
            </p>
          </div>
        </div>

        {/* Backend & AI Connection Status (Future Hook) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Backend Architecture Roadmap</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-mono">Backend Engine</span>
              <p className="font-semibold text-slate-200">Node.js + Express API</p>
              <p className="text-[11px] text-blue-400 font-mono">Prepared for /api/scan</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-mono">Database Persistence</span>
              <p className="font-semibold text-slate-200">Supabase PostgreSQL</p>
              <p className="text-[11px] text-emerald-400 font-mono">Configured with pg pool</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Settings successfully saved!</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Preferences cached in local state</span>
          )}

          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-600/25 flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
