# PRIVACYGUARD AI — AI Security, Privacy & Trust Platform

PRIVACYGUARD AI is a zero-persistence privacy and threat inspection platform. It helps users paste suspicious text, communications, or documents, identify sensitive information exposure (Aadhaar, PAN, Credit Cards, PII, Credentials, Scam/Phishing Urgency), explain the risks clearly, and suggest immediate safe remediation actions.

---

## Architecture Overview

- **Frontend:** React 18, Vite, React Router DOM, Tailwind CSS, Lucide React, Axios.
- **Backend:** Node.js, Express, CORS, Zero-Persistence Privacy Heuristics Engine.
- **Security:** Raw text inputs are never saved, persisted, or logged to disk or database. Masked examples only are returned.

---

## Directory Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── analysisController.js      # Input validation & response generation
│   │   ├── middleware/
│   │   │   └── errorHandler.js            # Secure error handler without data leaks
│   │   ├── routes/
│   │   │   └── analysisRoutes.js          # POST /api/analyze router
│   │   ├── services/
│   │   │   └── privacyAnalysisService.js  # Regex & heuristic privacy inspector
│   │   └── server.js                      # Express application entrypoint
│   ├── .env.example                       # Port and future AI API key placeholder
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/                    # Sidebar, Navbar, KpiCard, Layout
│   │   └── pages/                         # Landing, Dashboard, Scanner, History, Settings
│   └── package.json
└── README.md
```

---

## Quickstart Instructions

### 1. Run the Backend API Server
```bash
npm --prefix backend install
npm --prefix backend start
```
*Backend runs on `http://localhost:5000` (`POST /api/analyze`, `GET /api/health`).*

### 2. Run the Frontend Client
```bash
npm --prefix client install
npm --prefix client run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## API Reference

### `POST /api/analyze`
Inspects an arbitrary text payload with zero persistence.

**Request Body:**
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

---

## Phase 3 AI Readiness
For Phase 3, inject `AI_API_KEY=` into `backend/.env`. All AI calls are processed server-side only; keys are never exposed to the client.
