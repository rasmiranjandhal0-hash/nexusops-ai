# PRIVACYGUARD AI — AI Security, Privacy & Trust Platform

PRIVACYGUARD AI is a zero-persistence privacy and threat inspection platform. It allows users to paste suspicious text, communications, or documents, detect sensitive data exposure (Aadhaar, PAN, Payment Cards, PII, API Keys, Scam/Phishing Urgency), explain the risks clearly, and suggest immediate safe remediation actions.

---

## Architecture & Deployment Mapping

- **Frontend (Vercel):** React 18 + Vite + Tailwind CSS (`/client`)
- **Backend (Render):** Node.js + Express API (`/server`)
- **Zero-Persistence Guarantee:** Raw text inputs are strictly evaluated in volatile memory and never persisted or logged.

---

## Exact Deployment Settings

### 1. Vercel Deployment Settings (Frontend)

| Setting | Required Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` ⚠️ *(Click "Edit" and choose `client`)* |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node.js Version** | `18.x` or `20.x` |

#### Vercel Environment Variables:
| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://privacyguard-ai-api.onrender.com` | Your live Render backend URL (auto-normalizes `/api`) |

*(Vercel SPA rewrite rules are pre-configured in [`client/vercel.json`](client/vercel.json) so direct routes like `/scanner`, `/dashboard`, `/history`, and `/login` load cleanly on page refresh).*

---

### 2. Render Deployment Settings (Backend)

| Setting | Required Value |
| :--- | :--- |
| **Service Type** | **Web Service** |
| **Runtime** | `Node` |
| **Root Directory** | `server` ⚠️ *(Must be set to `server`)* |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free / Starter |

#### Render Environment Variables:
| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port provided by Render or default |
| `HOST` | `0.0.0.0` | Host binding for cloud container routing |
| `NODE_ENV` | `production` | Production environment flag |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Allowed CORS origin (or `*` for public evaluation) |
| `GEMINI_API_KEY` | *(Optional)* | Google AI Studio Gemini API Key (Server-Side Only) |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model: `gemini-2.0-flash`, `gemini-1.5-flash`, or `gemini-1.5-flash-8b` |
| `DATABASE_URL` | *(Optional)* | Supabase PostgreSQL connection string |

---

## Database Architecture Notes

1. **Zero-Persistence Core:** The core privacy scanner performs in-memory analysis and never writes raw input payloads to any database or log files.
2. **Local Development (SQLite):** If an ephemeral SQLite database is used locally, note that it is suitable for local development/single-session demo testing only and resets upon container restart.
3. **Cloud Production (Supabase PostgreSQL):** For persistent user accounts and scan metadata telemetry (scores and detected categories only, never raw text), a complete SQL migration script is provided at [`supabase/migrations/002_privacyguard_schema.sql`](supabase/migrations/002_privacyguard_schema.sql). Connect via the optional `DATABASE_URL` environment variable.

---

## Local Development Quickstart

### 1. Run the Backend API Server
```bash
npm --prefix server install
npm --prefix server start
```
*Backend listens on `http://0.0.0.0:5000` with endpoints `POST /api/analyze` and `GET /api/health`.*

### 2. Run the Frontend Client
```bash
npm --prefix client install
npm --prefix client run dev
```
*Frontend runs on `http://localhost:5173` with live connection to backend and graceful offline fallback.*

---

## API Reference

### `POST /api/analyze`
Inspects an arbitrary text payload with zero persistence.

**Request:**
```json
{
  "text": "Hello support, my Aadhaar is 4829 1930 4812 and my PAN is ABCDE1234F. Please transfer funds urgently."
}
```

**Response:**
```json
{
  "success": true,
  "riskLevel": "CRITICAL",
  "riskScore": 95,
  "findings": [
    {
      "category": "Aadhaar / National ID Pattern",
      "severity": "CRITICAL",
      "count": 1,
      "examples": ["XXXX-XXXX-4812"],
      "description": "High-sensitivity 12-digit national identity number identified."
    },
    {
      "category": "Permanent Account Number (PAN) ID",
      "severity": "HIGH",
      "count": 1,
      "examples": ["ABCDE****F"],
      "description": "Indian tax identity number detected."
    }
  ],
  "explanation": "Identified Aadhaar / National identity number exposed, PAN taxpayer identifier found. This presents an elevated privacy and security risk requiring containment.",
  "recommendedActions": [
    "Never transmit 12-digit Aadhaar numbers in unencrypted messages.",
    "Apply statutory Masked Aadhaar masking (showing only last 4 digits)."
  ],
  "disclaimer": "PRIVACYGUARD AI analysis is advisory and provided for defensive risk mitigation. It does not constitute legal counsel or definitive forensic proof of fraud."
}
```
