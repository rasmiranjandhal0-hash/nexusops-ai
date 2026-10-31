import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  FileSpreadsheet,
  Cpu,
  Lock,
  Code2,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-5xl font-mono pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <HelpCircle className="w-6 h-6 text-cyan-400" />
              <span>Cybersecurity Documentation & Architecture</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              VERSION 2.0.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative documentation for NexusOps AI threat detection heuristics, API integrations, and tenant isolation.
          </p>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="matte-glass rounded-xl p-6 border border-violet-500/20 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-300 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>System Architecture & Zero-Persistence Threat Pipeline</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          NexusOps AI operates an enterprise-grade defense platform that combines high-performance deterministic heuristic engines with Google Gemini Flash intelligence models. All multi-vector inspections execute with zero persistence of raw sensitive customer payloads, preventing accidental data exfiltration while recording immutable forensic audit certificates.
        </p>

        <div className="p-4 rounded-xl bg-black/50 border border-violet-500/20 text-xs font-mono text-cyan-300 space-y-1">
          <p>INPUT TARGET (URL, Email, Phone, File, Text)</p>
          <p className="text-slate-500">  ↓ [Transport Layer Security & Token Authentication]</p>
          <p>SSRF & PAYLOAD SANITIZER (Blocks 127.0.0.1, 10.0.0.0/8, 169.254.169.254, AWS Metadata)</p>
          <p className="text-slate-500">  ↓ [Parallel Heuristic Evaluation]</p>
          <p>DETECTION ENGINES (RFC 5322 MX, E.164 Telecom, Brand Typosquatting, PII Regex)</p>
          <p className="text-slate-500">  ↓ [Context Enriched Prompting]</p>
          <p>GEMINI FLASH AI REASONING (Explainable Evidence & Mitigation Action)</p>
          <p className="text-slate-500">  ↓ [Tenant Isolated Storage]</p>
          <p>IMMUTABLE AUDIT CERTIFICATE (Cryptographic ID & Compliance Proof)</p>
        </div>
      </div>

      {/* Detection Engines Deep-Dive */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Multi-Vector Threat Detection Engines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="matte-glass p-5 rounded-xl border border-violet-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-300">
              <Globe className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">1. Website & URL Engine</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Defends against Server-Side Request Forgery (SSRF) by blocking private IPv4/IPv6 ranges (e.g. 169.254.169.254 cloud metadata). Inspects homoglyphs, Punycode deception, high-risk TLDs (.xyz, .top, .buzz), and brand impersonation traps.
            </p>
          </div>

          <div className="matte-glass p-5 rounded-xl border border-violet-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-violet-300">
              <Mail className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">2. Email & Mailbox Engine</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Validates RFC 5322 syntax and initiates live DNS MX lookups to verify deliverability. Cross-references known burner and disposable domains (temp-mail, guerrillamail) and flags typosquatting domains targeting major providers.
            </p>
          </div>

          <div className="matte-glass p-5 rounded-xl border border-violet-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-amber-300">
              <Phone className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">3. Telecom & Phone Engine</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Normalizes numbers into international E.164 formats, matches country dial codes, and detects high-risk premium toll prefixes (e.g. +1 900) commonly leveraged for toll-fraud billing drainage and sequential dummy digits.
            </p>
          </div>

          <div className="matte-glass p-5 rounded-xl border border-violet-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-300">
              <FileSpreadsheet className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">4. Dataset & File Engine</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ingests CSV, JSON, and text datasets up to 25MB. Performs column type inference, missing/duplicate detection, and audits row-level PII leaks (Aadhaar, PAN, Credit Cards, Secrets) before datasets can be published.
            </p>
          </div>
        </div>
      </div>

      {/* Developer API Reference */}
      <div className="matte-glass rounded-xl p-6 border border-violet-500/20 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-violet-300 flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span>Developer API Reference (REST)</span>
        </h3>
        <p className="text-xs text-slate-300">
          Programmatic access to NexusOps AI verification engines via standard RESTful endpoints. Include your Bearer token in the <code>Authorization</code> header:
        </p>

        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-cyan-300 block mb-1">
              POST /api/verify/url - Inspect Website
            </span>
            <pre className="p-3 rounded-lg bg-black/60 border border-violet-500/20 text-[11px] text-slate-300 overflow-x-auto">
{`curl -X POST https://nexusops-ai-nine.vercel.app/api/verify/url \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
  -d '{"url": "https://sbi-kyc-update.xyz/login"}'`}
            </pre>
          </div>

          <div>
            <span className="text-[11px] font-bold text-cyan-300 block mb-1">
              POST /api/verify/email - Inspect Mailbox
            </span>
            <pre className="p-3 rounded-lg bg-black/60 border border-violet-500/20 text-[11px] text-slate-300 overflow-x-auto">
{`curl -X POST https://nexusops-ai-nine.vercel.app/api/verify/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
  -d '{"email": "user@temp-mail.org"}'`}
            </pre>
          </div>

          <div>
            <span className="text-[11px] font-bold text-cyan-300 block mb-1">
              POST /api/verify/phone - Inspect Phone
            </span>
            <pre className="p-3 rounded-lg bg-black/60 border border-violet-500/20 text-[11px] text-slate-300 overflow-x-auto">
{`curl -X POST https://nexusops-ai-nine.vercel.app/api/verify/phone \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
  -d '{"phone": "+19005550199"}'`}
            </pre>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Security Standards */}
      <div className="matte-glass rounded-xl p-6 border border-violet-500/20 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
          <Lock className="w-5 h-5 text-cyan-400" />
          <span>Tenant Privacy & Row Level Security</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          NexusOps AI enforces complete isolation between customer accounts. Every scan and dataset is mapped to an authenticated uploader context. PostgreSQL Row Level Security (RLS) policies guarantee that visitors and neighboring tenants can never access private inspection logs or unmasked records.
        </p>
      </div>
    </div>
  );
}
