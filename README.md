# PRIVACYGUARD AI — AI Security, Privacy & Trust Platform

PRIVACYGUARD AI is a zero-persistence privacy and threat inspection platform. It helps users paste suspicious text, communications, or documents, identify sensitive information exposure (Aadhaar, PAN, Credit Cards, PII, Credentials, Scam/Phishing Urgency), explain the risks clearly, and suggest immediate safe remediation actions.

---

## Architecture & Deployment Setup

- **Backend (Render):** Node.js + Express in `/server` (Root Directory on Render: `server`).
- **Frontend (Vercel):** React 18 + Vite + Tailwind CSS in `/client` (Root Directory on Vercel: `client`).
- **Zero-Persistence Guarantee:** Raw text inputs are strictly evaluated in volatile memory and never persisted or logged.

---

## Directory Structure

```text
├── server/                                # Render Web Service (Root: server)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── analysisController.js      # Input validation & response generation
│   │   ├── middleware/
│   │   │   └── errorHandler.js            # Leak-safe error handler
│   │   ├── routes/
│   │   │   └── analysisRoutes.js          # POST /api/analyze router
│   │   ├── services/
│   │   │   └── privacyAnalysisService.js  # Heuristic privacy inspection engine
│   │   ├── server.js                      # Express application entrypoint
│   │   └── index.js                       # Module redirect to server.js
│   ├── .env.example                       # Port & future AI API key placeholder
│   └── package.json
│
├── client/                                # Vercel Web App (Root: client)
│   ├── src/
│   │   ├── components/                    # DeskLamp, Navbar, Sidebar, KpiCard, Layout
│   │   └── pages/                         # LoginPage, LandingPage, Dashboard, Scanner, History, Settings
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 002_privacyguard_schema.sql    # Clean SQL schema & drop script
└── README.md
```

---

## Local Development Instructions

### 1. Run the Backend API Server
```bash
npm --prefix server install
npm --prefix server start
```
*Backend runs on `http://localhost:5000` with endpoints `POST /api/analyze` and `GET /api/health`.*

### 2. Run the Frontend Client
```bash
npm --prefix client install
npm --prefix client run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## Production Deployment Mapping

| Service | Host | Root Directory | Build Command | Start Command |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | **Render** | `server` | `npm install` | `npm start` |
| **Frontend** | **Vercel** | `client` | `npm run build` | `dist` (default) |

### Render Environment Variables (Web Service)
- `PORT`: `5000`
- `NODE_ENV`: `production`
- `CLIENT_URL`: `*` (or your Vercel domain)
- `AI_API_KEY`: *(leave blank until Phase 3)*

### Vercel Environment Variables (Frontend)
- `VITE_API_BASE_URL`: `https://<YOUR-RENDER-BACKEND-URL>/api`

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
