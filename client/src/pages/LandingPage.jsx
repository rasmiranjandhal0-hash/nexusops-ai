import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ScanEye,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { GenerativeArtScene } from '../components/ui/anomalous-matter-hero';

export default function LandingPage() {
  const securityVectors = [
    { title: 'National IDs & Sensitive PII', desc: 'Aadhaar 12-digit strings, PAN tax IDs, passport credentials, phone numbers', risk: 'Critical' },
    { title: 'Cloud Secrets & API Tokens', desc: 'Unprotected AWS keys, database URIs, OpenAI tokens exposed in prompts', risk: 'Critical' },
    { title: 'Social Engineering & Coercion', desc: 'Urgent wire transfers, spoofed bank verification, coercion triggers', risk: 'High' },
    { title: 'PCI-DSS Payment Records', desc: '16-digit debit/credit card sequences with plaintext CVVs and expiry dates', risk: 'Critical' },
  ];

  return (
    <div className="relative min-h-screen bg-[#030306] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black overflow-x-hidden font-sans">
      {/* Jet Black + Royal Amethyst + Electric Cyan Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Royal Amethyst upper orb */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[140px]" />
        {/* Electric Cyan touch orb */}
        <div className="absolute top-1/2 -right-24 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />
        {/* 3D Wireframe Scene - High Radiance */}
        <div className="absolute inset-0 opacity-85 sm:opacity-95">
          <Suspense fallback={null}>
            <GenerativeArtScene />
          </Suspense>
        </div>
        {/* Soft Depth Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030306]/40 to-[#030306]/90" />
      </div>

      {/* Spatial Matte Glass Header */}
      <header className="relative z-40 h-16 border-b border-white/[0.06] bg-[#030306]/40 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              PRIVACYGUARD <span className="text-cyan-400">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-xs font-mono text-violet-300 hover:text-white px-3 py-1.5 rounded-lg border border-violet-500/20 hover:border-violet-500/40 bg-violet-950/20 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 transition-colors hidden sm:inline"
          >
            Dashboard
          </Link>
          <Link
            to="/scanner"
            className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-[0_0_20px_-3px_rgba(124,58,237,0.4)] flex items-center space-x-1.5 hover:scale-105"
          >
            <span>Launch Scanner</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 flex-1">
        <section className="pt-20 sm:pt-28 pb-16 px-4 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full matte-glass-subtle text-xs font-mono text-violet-300 border border-violet-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>AMETHYST SPATIAL SECURITY MATRIX</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-400 text-[10px]">ZERO PERSISTENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Next-Gen Privacy & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400">
              Data Leak Defense
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop confidential data exposure before it reaches customer logs, public tickets, or AI prompts. Real-time zero-persistence heuristic inspection.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/scanner"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-[0_0_25px_-5px_rgba(124,58,237,0.5)] flex items-center space-x-2 hover:scale-105"
            >
              <ScanEye className="w-4 h-4 text-cyan-300" />
              <span>Analyze Text Payload</span>
            </Link>

            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-200 matte-glass hover:border-violet-500/40 transition-all flex items-center space-x-2 hover:scale-105"
            >
              <span>Operator Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
          </div>
        </section>

        {/* Spatial Matte Glass Vectors Grid */}
        <section className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-violet-400">Continuous Isolation</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">Multi-Vector Sensitive Inspection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {securityVectors.map((item, idx) => (
              <div
                key={idx}
                className="matte-glass rounded-xl p-4 sm:p-5 hover:border-violet-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-slate-300">
                      Vector 0{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        item.risk === 'Critical'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                          : 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                      }`}
                    >
                      {item.risk}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white mb-1.5 group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center text-[11px] text-violet-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  <span>Heuristic Active</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Minimalist Sandbox Guarantee Card */}
        <section className="py-10 px-4 sm:px-8 max-w-2xl mx-auto text-center">
          <div className="matte-glass rounded-2xl p-6 sm:p-7 relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center mx-auto mb-3 text-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 font-mono">Zero-Persistence Memory Sandbox</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-4">
              Raw payloads are strictly evaluated in volatile server memory. We never persist or store user texts.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Test Interactive Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Minimalist Footer */}
      <footer className="relative z-20 border-t border-white/[0.06] py-5 px-4 sm:px-8 text-center text-xs font-mono text-slate-500">
        <p>PRIVACYGUARD AI © 2026 — Jet Black, Royal Amethyst & Electric Cyan Spatial Security.</p>
      </footer>
    </div>
  );
}
