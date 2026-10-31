import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ScanEye,
  AlertTriangle,
  Lock,
  ArrowRight,
  EyeOff,
  FileCheck,
  FileSearch,
  CheckCircle2,
  Cpu,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const sampleExposures = [
    { title: 'PII Exposure', desc: 'Social Security numbers, passport IDs, personal emails, physical addresses', risk: 'High' },
    { title: 'API & Secret Leak', desc: 'Unprotected AWS keys, Stripe tokens, database credentials in chat or prompts', risk: 'Critical' },
    { title: 'Phishing & Scam Triggers', desc: 'Urgent wire transfers, spoofed bank verification, deceptive domains', risk: 'High' },
    { title: 'Regulatory Non-Compliance', desc: 'GDPR, HIPAA, and CCPA violations in customer communications', risk: 'Moderate' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-tight text-white">PRIVACYGUARD <span className="text-blue-400">AI</span></span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/scanner"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-600/25 flex items-center space-x-1.5"
          >
            <span>Launch Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="pt-20 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-800/60 text-xs text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Next-Gen AI Security, Privacy & Trust Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Stop Sensitive Data Leaks & Scam Risks <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Before Exposure</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Paste suspicious communications, customer logs, or prompts. PRIVACYGUARD AI identifies sensitive data exposure, explains the severity, and provides immediate safe remediation steps.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/scanner"
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 transition-all flex items-center space-x-2"
            >
              <ScanEye className="w-4 h-4" />
              <span>Scan Suspicious Data Now</span>
            </Link>

            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-lg text-sm font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center space-x-2"
            >
              <span>Explore Security Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-12 px-4 sm:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Privacy Protection Architecture</h2>
            <p className="text-xs text-slate-400 mt-1">Simulated heuristic defense against multi-vector information leaks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleExposures.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 backdrop-blur hover:border-blue-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      Vector 0{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.risk === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.risk} Risk
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center text-xs text-blue-400">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>Automated Detection</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Promise Banner */}
        <section className="py-12 px-4 sm:px-8 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-b from-blue-950/30 to-purple-950/30 border border-blue-900/40 rounded-2xl p-8 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Zero Data Persistence Guarantee</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-6">
              In this preview mode, all text analysis runs locally in your browser session. Your confidential data is never shared or used to train third-party machine learning models.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Test the Privacy Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 sm:px-8 text-center text-xs text-slate-400">
        <p>PRIVACYGUARD AI © 2026 — AI Security, Privacy & Trust Platform. Hackathon MVP.</p>
      </footer>
    </div>
  );
}
