import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ScanEye,
  Lock,
  ArrowRight,
  EyeOff,
  CheckCircle2,
  Cpu,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { GenerativeArtScene } from '../components/ui/anomalous-matter-hero';

export default function LandingPage() {
  const securityVectors = [
    { title: 'PII & National ID Leaks', desc: 'Aadhaar 12-digit strings, PAN identifiers, passport credentials, phone numbers', risk: 'Critical' },
    { title: 'Cloud Secrets & API Tokens', desc: 'Unprotected AWS secret keys, database URIs, OpenAI tokens exposed in prompts', risk: 'Critical' },
    { title: 'Social Engineering & Coercion', desc: 'Urgent wire transfers, spoofed bank verification, coercion triggers', risk: 'High' },
    { title: 'PCI-DSS Payment Records', desc: '16-digit debit/credit card sequences with plaintext CVVs and expiry dates', risk: 'Critical' },
  ];

  return (
    <div className="relative min-h-screen bg-black text-slate-100 flex flex-col selection:bg-sky-500 selection:text-black overflow-x-hidden">
      {/* 3D Generative Art Scene Background */}
      <div className="fixed inset-0 pointer-events-auto z-0 opacity-60">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <GenerativeArtScene />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black pointer-events-none" />
      </div>

      {/* Spatial Glass Header */}
      <header className="relative z-40 h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              PRIVACYGUARD <span className="text-sky-400">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-xs font-mono text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-400/30 transition-colors flex items-center space-x-1"
          >
            <span>Sign In</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/scanner"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-sky-400 hover:bg-sky-300 transition-all shadow-lg shadow-sky-400/20 flex items-center space-x-1.5"
          >
            <span>Launch Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 flex-1">
        <section className="pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel-subtle text-xs font-mono text-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            <span>OBSERVATION LOG: ANOMALOUS THREAT MATRIX</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-400 text-[11px]">ZERO-PERSISTENCE DEFENSE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Spatial Privacy & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">
              Data Leak Defense
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Matter in constant, beautiful flux. PRIVACYGUARD AI inspects confidential communications, customer support logs, and developer prompts to quarantine sensitive leaks before exposure.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/scanner"
              className="px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold text-black bg-sky-400 hover:bg-sky-300 transition-all shadow-[0_0_30px_rgba(56,189,248,0.35)] flex items-center space-x-2 hover:scale-105"
            >
              <ScanEye className="w-4 h-4" />
              <span>Analyze Text Payload</span>
            </Link>

            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-lg text-xs sm:text-sm font-medium text-slate-200 glass-panel hover:border-sky-400/50 transition-all flex items-center space-x-2"
            >
              <span>Security Dashboard</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </Link>
          </div>
        </section>

        {/* Spatial Glass Defense Vectors */}
        <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-mono uppercase tracking-widest text-sky-400">Continuous Flux Monitoring</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">Multi-Vector Sensitive Inspection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {securityVectors.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-xl p-5 hover:border-sky-400/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      Vector 0{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.risk === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {item.risk}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-sky-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center text-xs text-sky-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Defensive Shield Active</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Zero-Persistence Spatial Card */}
        <section className="py-12 px-4 sm:px-8 max-w-3xl mx-auto text-center">
          <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mx-auto mb-4 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono">Zero-Knowledge Client Sandbox</h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
              Analyzed content is strictly inspected in transient memory. We never persist, record, or train models on your proprietary or sensitive data.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>Test Interactive Privacy Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-20 border-t border-white/10 py-6 px-4 sm:px-8 text-center text-xs font-mono text-slate-500">
        <p>PRIVACYGUARD AI © 2026 — Spatial Glass Generative Art & Privacy Engine.</p>
      </footer>
    </div>
  );
}
