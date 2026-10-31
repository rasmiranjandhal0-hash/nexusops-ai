import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  GitBranch,
  Terminal,
  Activity,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  Server,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DOMAIN_OPTIONS } from '../utils/scenarioPresets';

export default function LandingPage() {
  const { isAuthenticated, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-base text-slate-100">NexusOps AI</span>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
            Autonomous Orchestration
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/blueprint"
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5"
          >
            Architecture Blueprint
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center space-x-1.5"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <button
                onClick={handleDemo}
                className="px-3 py-1.5 rounded text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900/60 transition-colors"
              >
                1-Click Demo
              </button>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-20 pb-16 px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Theme: Agentic AI & Intelligent Systems</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-mono text-[11px]">Powered by Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
            Autonomous Multi-Agent Enterprise Workflow & Decision Orchestrator
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate repetitive operational decision-making. NexusOps AI dispatches a synchronized 4-Agent Council to decompose ambiguous business triggers, evaluate trade-off policies, synthesize cross-system API payloads, and verify audit compliance.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-lg text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center space-x-2 shadow-lg shadow-cyan-950/20"
              >
                <span>Open Mission Control</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleDemo}
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center space-x-2 shadow-lg shadow-cyan-950/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch 1-Click Interactive Demo</span>
                </button>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-lg text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  Create Architect Account
                </Link>
              </>
            )}
            <Link
              to="/blueprint"
              className="px-5 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              View System Architecture &rarr;
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Resolution Latency</div>
              <div className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">&lt; 45s</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Autonomous vs 4 hrs manual</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Confidence Score</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1 tabular-nums">94.2%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Policy compliance validation</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Governance Gates</div>
              <div className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">HITL Guarded</div>
              <div className="text-[11px] text-slate-400 mt-0.5">1-Click operator authorization</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Self-Healing</div>
              <div className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">Dynamic Re-Plan</div>
              <div className="text-[11px] text-cyan-400 mt-0.5">Automated failover rerouting</div>
            </div>
          </div>
        </section>

        {/* 4-Agent Architecture Pipeline Showcase */}
        <section className="py-16 px-4 sm:px-8 border-t border-slate-800 bg-slate-900/20">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
                Agentic Council Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Four Specialized Gemini Agents Working in Synchrony
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Each agent encapsulates a specific operational discipline, communicating through structured JSON schema constraints to eliminate hallucination.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs">
                  01
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Planner Agent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Decomposes unstructured business goals into an execution DAG with assigned system endpoints, dependency order, and baseline SLA metrics.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                  02
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Reasoner & Policy Agent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Constructs a quantitative Decision Matrix comparing 3 strategic options, evaluating pros/cons, budget envelopes, and risk levels.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                  03
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Collaborator & Executor Agent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Synthesizes production-grade JSON API payloads, ERP mutations, and webhooks. Marks high-impact mutations for Human-in-the-Loop review.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                  04
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Auditor & Advisory Agent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Validates transaction checksums, seals an immutable governance audit log, calculates ROI hours saved, and produces architectural advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Target Operational Domains */}
        <section className="py-16 px-4 sm:px-8 border-t border-slate-800 max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400 tracking-wider">
              Cross-Departmental Scope
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Pre-Configured for 6 Enterprise Domains
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              NexusOps AI connects fragmented silos across ERP, CRM, ITSM, FinOps, and HR with specialized operational playbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DOMAIN_OPTIONS.map((domain) => (
              <div
                key={domain.code}
                className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold mb-1">
                  {domain.code.replace(/_/g, ' ')}
                </div>
                <h3 className="text-xs font-semibold text-slate-200 mb-1">{domain.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{domain.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-8 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">NexusOps AI</span>
            <span>&bull; Hackathon Submission for "Agentic AI & Intelligent Systems"</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/blueprint" className="hover:text-slate-300 transition-colors">
              System Blueprint
            </Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <span className="font-mono text-[11px] text-slate-600">Google Antigravity IDE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
