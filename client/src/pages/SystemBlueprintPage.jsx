import React from 'react';
import {
  Layers,
  FileCode2,
  CheckCircle2,
  Cpu,
  Database,
  ShieldCheck,
  GitBranch,
  Terminal,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function SystemBlueprintPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
          <FileCode2 className="w-4 h-4" />
          <span>Technical Architecture & Submission Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          NexusOps AI — System Blueprint
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete architectural specification, multi-agent reasoning design, database persistence, and evaluation walkthrough for the Hackathon review committee.
        </p>
      </div>

      {/* 1. Problem Statement */}
      <section className="p-5 sm:p-6 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <span className="w-6 h-6 rounded bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 text-xs font-mono font-bold">
            01
          </span>
          <span>The Real-World Problem Addressed</span>
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
          <p>
            Modern enterprises run on fragmented software ecosystems: <strong>SAP S/4HANA</strong> for inventory ERP, <strong>Zendesk</strong> for customer CRM, <strong>AWS CloudWatch</strong> for infrastructure telemetry, <strong>Stripe</strong> for billing ledgers, and <strong>Okta/Workday</strong> for identity.
          </p>
          <p>
            When cross-system incidents occur—such as a critical semiconductor stockout, checkout microservice latency spikes, or contract billing variances—human operators spend <strong>3 to 6 hours</strong> manually copying data, coordinating approvals over Slack, and writing brittle one-off API scripts. This creates massive SLA breaches, operational friction, and inconsistent decision outcomes.
          </p>
        </div>
      </section>

      {/* 2. Autonomous Agentic Solution */}
      <section className="p-5 sm:p-6 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <span className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 text-xs font-mono font-bold">
            02
          </span>
          <span>The Autonomous Multi-Agent Solution</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>NexusOps AI</strong> replaces fragmented manual triage with a synchronized four-agent council powered by <strong>Google Gemini (<code className="text-cyan-400">@google/genai</code>, <code className="text-cyan-400">gemini-2.5-flash</code>)</strong>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs">
              <GitBranch className="w-4 h-4" />
              <span>1. Planner Agent (Goal Decomposition)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests complex business goals and deconstructs them into a dependency-aware execution DAG with assigned target systems, SLA targets, and order constraints.
            </p>
          </div>

          <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
              <Cpu className="w-4 h-4" />
              <span>2. Policy & Reasoner Agent (Decision Matrix)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates 3 distinct strategic options in a quantitative Decision Matrix, calculating cost, SLA trade-offs, and compliance risk before selecting the optimal path.
            </p>
          </div>

          <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
              <Terminal className="w-4 h-4" />
              <span>3. Executor Agent (Payload Synthesis & HITL)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes concrete JSON REST payloads and database mutations. Enforces Human-in-the-Loop (HITL) gates for high-impact financial or rollback actions.
            </p>
          </div>

          <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>4. Auditor Agent (Verification & Self-Healing)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Defines strict verification criteria, calculates ROI hours saved, writes an immutable audit trail, and coordinates dynamic self-healing re-planning if downstream tasks fail.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Tech Stack Specification */}
      <section className="p-5 sm:p-6 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <span className="w-6 h-6 rounded bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-mono font-bold">
            03
          </span>
          <span>Technology Stack & Antigravity Architecture</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Layer</th>
                <th className="py-2.5 px-3">Technology</th>
                <th className="py-2.5 px-3">Purpose & Architectural Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-400">Frontend SPA</td>
                <td className="py-2.5 px-3 font-mono">React 18 + Vite</td>
                <td className="py-2.5 px-3">High-contrast dark-mode command center, interactive DAG timeline, and payload inspection</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-400">Styling & Icons</td>
                <td className="py-2.5 px-3 font-mono">Tailwind CSS + Lucide React</td>
                <td className="py-2.5 px-3">Anti-slop design aesthetic following empirical study of 247 curated SaaS command screens</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-400">Backend API</td>
                <td className="py-2.5 px-3 font-mono">Node.js + Express.js</td>
                <td className="py-2.5 px-3">Modular RESTful routing, Zod payload validation, and rate-limiting security middleware</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-400">Authentication</td>
                <td className="py-2.5 px-3 font-mono">JWT + bcryptjs (12 rounds)</td>
                <td className="py-2.5 px-3">Stateless 7-day JWT tokens, tenant data isolation with strict user_id query scoping</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-400">AI Reasoning Engine</td>
                <td className="py-2.5 px-3 font-mono">@google/genai (gemini-2.5-flash)</td>
                <td className="py-2.5 px-3">Official Google Gen AI SDK utilizing strict JSON schema enforcement and zero mock fallbacks</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-400">Database & RLS</td>
                <td className="py-2.5 px-3 font-mono">Supabase Cloud PostgreSQL / pg Pool</td>
                <td className="py-2.5 px-3">Relational persistence for users, workspaces, systems, missions, tasks, and immutable audit logs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Evaluator Walkthrough Guide */}
      <section className="p-5 sm:p-6 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <span className="w-6 h-6 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold">
            04
          </span>
          <span>Hackathon Evaluator Walkthrough (5-Minute Tour)</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start space-x-3 p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-cyan-400 font-bold">Step 1:</span>
            <div>
              <strong className="text-slate-100">1-Click Authentication:</strong> Go to the login screen and click the <strong>"1-Click Login"</strong> button to authenticate instantly as the Lead Systems Architect (<code className="text-cyan-400">demo@nexusops.ai</code>).
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-cyan-400 font-bold">Step 2:</span>
            <div>
              <strong className="text-slate-100">Examine Systems & Workspaces:</strong> Visit <code className="text-cyan-400">/workspaces</code> to inspect the pre-seeded enterprise environment: SAP S/4HANA ERP, Zendesk CRM, AWS CloudWatch, and Stripe FinOps.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-cyan-400 font-bold">Step 3:</span>
            <div>
              <strong className="text-slate-100">Deploy an Autonomous Mission:</strong> Click <strong>"Deploy Agent Mission"</strong> (<code className="text-cyan-400">/missions/new</code>). Click any of the 4 instant scenario presets (e.g., <em>"Port Congestion Semiconductor Stockout"</em> or <em>"Production Payment 502 Spike"</em>) and click <strong>"Deploy Autonomous Multi-Agent Council"</strong>.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-cyan-400 font-bold">Step 4:</span>
            <div>
              <strong className="text-slate-100">Inspect Multi-Agent Blueprint:</strong> On the Mission Detail page, observe the 4-Agent Pipeline, Root Cause Diagnosis, Strategic Decision Matrix, and clickable JSON system payloads with copy functions.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-cyan-400 font-bold">Step 5:</span>
            <div>
              <strong className="text-slate-100">Execute HITL Approval & Test Self-Healing:</strong> Click <strong>"Approve & Execute"</strong> on human-gated steps, or click <strong>"Simulate Anomaly & Re-Plan"</strong> to watch the Reasoner Agent adaptively regenerate the downstream execution DAG.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
