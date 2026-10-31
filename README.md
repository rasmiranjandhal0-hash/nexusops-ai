# NexusOps AI — Autonomous Multi-Agent Enterprise Workflow & Decision Orchestrator

[![Theme: Agentic AI & Intelligent Systems](https://img.shields.io/badge/Theme-Agentic_AI_%26_Intelligent_Systems-06b6d4?style=for-the-badge)](https://devpost.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![React 18](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js & Express](https://img.shields.io/badge/Backend-Node.js_%2B_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL & Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

## 1. Executive Summary & Problem Statement

### The Enterprise Fragmentation Crisis
Modern organizations rely on specialized, siloed SaaS platforms for every operational function:
- **ERP:** SAP S/4HANA / NetSuite (Inventory, Bills of Materials, Purchase Orders)
- **CRM:** Zendesk / Salesforce (Customer tickets, VIP accounts, SLA escalations)
- **ITSM & Telemetry:** AWS CloudWatch / Datadog / PagerDuty (APM traces, microservice alerts)
- **FinOps:** Stripe / Oracle NetSuite (Billing ledgers, contract variance audits)
- **HR & IAM:** Workday / Okta (User provisioning, access control lists)

When cross-system incidents occur—such as a critical semiconductor stockout, checkout microservice latency spikes, or contract billing variances—human operators spend **3 to 6 hours** manually copying data across browser tabs, coordinating approvals over Slack, and writing brittle one-off API scripts. This fragmentation leads to severe delays, SLA breaches, operational inefficiencies, and inconsistent outcomes.

### The Autonomous Multi-Agent Solution
**NexusOps AI** is an Autonomous Multi-Agent Enterprise Workflow & Decision Orchestration Platform. Rather than relying on rigid if-this-then-that scripts or hallucination-prone chatbots, NexusOps AI dispatches a synchronized **4-Agent Council** powered by **Google Gemini (`gemini-2.5-flash` via `@google/genai`)**:

1. **Planner Agent (Goal & DAG Decomposition):** Analyzes ambiguous business triggers and decomposes them into a dependency-aware Directed Acyclic Graph (DAG) with assigned enterprise system endpoints, action types, and SLA targets.
2. **Policy & Reasoner Agent (Decision Matrix):** Evaluates at least 3 distinct strategic options in a quantitative Decision Matrix, calculating pros/cons, cost impact, and SLA trade-offs before selecting the optimal path.
3. **Collaborator & Executor Agent (Cross-System Action Synthesis):** Generates concrete, production-ready JSON API payloads, ERP state mutations, and stakeholder alerts. Flags high-impact financial or production-critical mutations for Human-in-the-Loop (HITL) approval.
4. **Auditor & Advisory Agent (Verification & Continuous Self-Healing):** Verifies transaction criteria, logs an immutable audit trail, computes ROI metrics (hours and dollars saved), and triggers dynamic self-healing re-planning if downstream tasks fail.

---

## 2. Agentic Architecture & Data Flow

```
                      ┌──────────────────────────────────────────────┐
                      │    OPERATOR / BUSINESS TRIGGER INTAKE        │
                      │ (Supply Chain, ITSM, FinOps, CRM, HR, RevOps) │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │    NEXUSOPS AI MULTI-AGENT ORCHESTRATOR      │
                      │             (@google/genai)                  │
                      └──────────────────────┬───────────────────────┘
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         │                   │                               │                   │
         ▼                   ▼                               ▼                   ▼
┌─────────────────┐ ┌─────────────────┐             ┌─────────────────┐ ┌─────────────────┐
│  PLANNER AGENT  │ │ REASONER AGENT  │             │ EXECUTOR AGENT  │ │  AUDITOR AGENT  │
│                 │ │                 │             │                 │ │                 │
│ • Deconstruct   │ │ • Root-Cause    │             │ • Synthesize    │ │ • Verification  │
│   Trigger       │ │   Diagnosis     │             │   JSON Payloads │   Criteria        │
│ • Assign System │ │ • 3-Option      │             │ • Enforce HITL  │ │ • Immutable     │
│   Endpoints     │ │   Decision      │             │   Approval Gate │   Audit Trail     │
│ • Form Exec DAG │ │   Matrix        │             │ • Dispatch API  │ │ • Self-Healing  │
└────────┬────────┘ └────────┬────────┘             └────────┬────────┘ └────────┬────────┘
         │                   │                               │                   │
         └───────────────────┴───────────────┬───────────────┴───────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │       POSTGRESQL RELATIONAL PERSISTENCE      │
                      │  (Supabase Cloud PostgreSQL / pg Connection) │
                      │  • agent_missions     • mission_tasks        │
                      │  • workspaces         • mission_audit_logs   │
                      │  • connected_systems  • users (bcrypt+JWT)   │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │        INTERACTIVE SAAS COMMAND CENTER       │
                      │ • DAG Execution Timeline & Payload Inspector │
                      │ • 1-Click HITL Approval / Skip Decision      │
                      │ • Simulated Downstream Anomaly Re-Planner    │
                      └──────────────────────────────────────────────┘
```

---

## 3. Key Features

- **JWT + bcrypt Authentication:** Full registration, login, and session validation with 12 salt rounds and stateless 7-day JWT tokens. Tenant isolation enforced on every SQL query via `WHERE user_id = $1`.
- **Operational Workspaces & System Registry:** Create business units (e.g., EMEA Logistics, Core Payments) and connect fragmented enterprise systems (SAP ERP, Zendesk CRM, AWS CloudWatch, Stripe FinOps) with custom SLA targets and health statuses.
- **Synchronized 4-Agent Council:** Real server-side Google Gemini (`gemini-2.5-flash`) orchestration with strict JSON schema enforcement via Zod.
- **Interactive DAG Timeline & Payload Inspector:** Expandable JSON payloads for every decomposed task with syntax styling and 1-click clipboard copy.
- **Human-in-the-Loop (HITL) Governance:** High-risk steps pause in an `AWAITING_APPROVAL` state, enabling operators to review the rationale and either **Approve & Execute** or **Skip Step**.
- **Autonomous Self-Healing Re-Planner:** Simulate downstream system failures (e.g., "Primary vendor API returned HTTP 503") or budget cutbacks. Gemini dynamically restructures the remaining DAG, recalculates the decision path, and persists changes.
- **Executive Analytics & ROI Telemetry:** Real-time KPI counters calculating total missions, autonomous completion rate, manual hours saved, and cost avoidance in USD.
- **Built-in System Blueprint Page (`/blueprint`):** Full interactive architectural documentation accessible directly inside the web UI for evaluators.

---

## 4. Supported Operational Domains

NexusOps AI includes specialized playbooks for 6 core enterprise domains:
1. `SUPPLY_CHAIN_OPS`: Inventory replenishment, port delay rerouting, PO generation, and freight TMS coordination.
2. `ITSM_INCIDENT_RESPONSE`: Microservice error spikes, APM trace correlation, automated canary rollbacks, and Statuspage sync.
3. `CUSTOMER_SLA_TRIAGE`: Tier-1 billing webhook discrepancies, credit note issuance, and Zendesk ticket de-escalation.
4. `FINOPS_RECONCILIATION`: Three-way matching between vendor cloud invoices, purchase orders, and telemetry; disputed variance holds.
5. `HR_ONBOARDING_ACCESS`: Cross-system provisioning across Workday HRIS, Okta IAM, least-privilege RBAC roles, and hardware shipping.
6. `REVENUE_OPS_PIPELINE`: Deal desk contract discount approval, net-90 payment terms sensitivity analysis, and CPQ DocuSign routing.

---

## 5. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React.js | 18.3.1 | Modular SPA architecture, hooks, and responsive dark UI |
| **Build Tool** | Vite | 5.4.14 | Ultra-fast client compilation and development server |
| **Styling** | Tailwind CSS | 3.4.17 | Bespoke anti-slop design aesthetic with slate/cyan/amber accents |
| **Icons** | Lucide React | 0.475.0 | Crisp, semantic SVG iconography |
| **HTTP Client** | Axios | 1.7.9 | Configured with automatic JWT Bearer token interceptor |
| **Backend Runtime** | Node.js | v24+ / v18+ | High-performance asynchronous event loop |
| **Web Server** | Express.js | 4.21.2 | RESTful routing, error handling, and security middleware |
| **Security** | Helmet & CORS | 8.0.0 / 2.8.5 | HTTP header hardening and origin protection |
| **Rate Limiting** | express-rate-limit | 7.5.0 | Abuse prevention on auth and AI orchestration endpoints |
| **Validation** | Zod | 3.24.1 | Strict schema validation on HTTP inputs and AI output parsing |
| **AI SDK** | @google/genai | 0.2.0 | Official Google Gen AI client with `gemini-2.5-flash` |
| **Database** | Supabase PostgreSQL | `pg` 8.13.1 | Relational database with automated migrations and RLS |

---

## 6. Local Quickstart (Google Antigravity / Local Dev)

### Prerequisites
- Node.js 18+ (Node 24 recommended)
- (Optional) Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
- (Optional) Supabase Cloud PostgreSQL or local PostgreSQL instance

### 1. Clone & Setup Backend
```bash
cd server
npm install

# Copy environment template
cp .env.example .env
```

Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=nexusops_enterprise_secret_super_secure_key_2026_change_in_production
GEMINI_API_KEY=your_google_ai_studio_gemini_api_key
DATABASE_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres
```
> **Note:** If `DATABASE_URL` is omitted, NexusOps AI automatically initializes with a resilient local memory repository pre-seeded with the demo account so you can test immediately without setting up a remote database!

Run migrations and start backend:
```bash
npm run migrate
npm start
```
The server will start at `http://localhost:5000`.

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

---

## 7. Supabase Database Migration

Execute the idempotent schema migration located at `/supabase/migrations/001_initial_schema.sql` via:
1. **Automated CLI:** Run `npm run migrate` in `/server`.
2. **Supabase Web Console:** Open the **SQL Editor** in your Supabase project dashboard, paste the contents of `001_initial_schema.sql`, and click **Run**.

Tables created:
- `users`: User profiles with bcrypt password hashes
- `workspaces`: Business departments and governance configurations
- `connected_systems`: Connected APIs (ERP, CRM, ITSM, FinOps) with SLA targets
- `agent_missions`: Core multi-agent execution runs and ROI metrics
- `mission_tasks`: Decomposed DAG steps with system payloads and HITL flags
- `mission_audit_logs`: Immutable chronological governance records

---

## 8. Deployment Guide

### Deploying Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set the **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add the environment variables from `server/.env.example` (`JWT_SECRET`, `GEMINI_API_KEY`, `DATABASE_URL`, `CLIENT_URL`).

### Deploying Frontend to Vercel
1. Create a new **Project** on [Vercel](https://vercel.com).
2. Connect your repository and set the **Root Directory** to `client`.
3. Set Framework Preset to **Vite**.
4. Add environment variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`.
5. Deploy.

---

## 9. 1-Click Evaluator Walkthrough

For rapid hackathon testing:
1. Open the web app and click **"1-Click Interactive Demo"** on the landing page or login page (auto-authenticates as `demo@nexusops.ai`).
2. Navigate to **"Deploy Agent Mission"** (`/missions/new`).
3. Click any of the **1-Click Scenario Presets** (e.g. *Port Congestion Semiconductor Stockout* or *Production Payment 502 Spike*).
4. Click **"Deploy Autonomous Multi-Agent Council"**.
5. Observe the synchronized 4-agent reasoning pipeline, DAG task timeline, and collapsible JSON payloads.
6. Click **"Approve & Execute"** on the Human-in-the-Loop task.
7. Click **"Simulate Anomaly & Re-Plan"** to inject a simulated downstream failure and watch the Reasoner Agent adapt the DAG in real time!
