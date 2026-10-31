/**
 * PrivacyGuard AI - Zero-Persistence Privacy & Threat Analysis Service
 * 
 * Supports both deterministic offline heuristics and live Google Gemini AI
 * models (e.g. gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-flash-8b).
 */

// Helper to mask emails safely (e.g. j***@example.com)
function maskEmail(email) {
  const parts = email.split('@');
  if (parts.length !== 2) return '[MASKED_EMAIL]';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

// Helper to mask phone numbers safely (e.g. +91 98*** **345)
function maskPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
  }
  return '[MASKED_PHONE]';
}

// Helper to mask Aadhaar-like 12 digit numbers (e.g. XXXX-XXXX-1234)
function maskAadhaar(aadhaar) {
  const digits = aadhaar.replace(/\D/g, '');
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

// Helper to mask PAN IDs (e.g. ABCDE****F)
function maskPan(pan) {
  const clean = pan.toUpperCase();
  return `${clean.slice(0, 5)}****${clean.slice(-1)}`;
}

// Helper to mask Credit / Debit cards (e.g. ****-****-****-1234)
function maskCard(card) {
  const digits = card.replace(/\D/g, '');
  return `****-****-****-${digits.slice(-4)}`;
}

// Helper to defang suspicious URLs (e.g. hxxp://bad[.]link)
function defangUrl(url) {
  return url
    .replace(/^https?:\/\//i, 'hxxp://')
    .replace(/\./g, '[.]')
    .slice(0, 35) + '...';
}

/**
 * Resolves and normalizes the Gemini model identifier
 */
export function resolveGeminiModel(rawModel) {
  if (!rawModel) return 'gemini-2.0-flash';
  const clean = rawModel.trim().toLowerCase();
  
  // Handle colloquial names like "3.8 flash", "flash-8b", "2.0 flash"
  if (clean.includes('3.8') || clean.includes('8b')) return 'gemini-1.5-flash-8b';
  if (clean.includes('2.0') || clean === 'flash' || clean === 'gemini-flash') return 'gemini-2.0-flash';
  if (clean.includes('1.5') && clean.includes('pro')) return 'gemini-1.5-pro';
  if (clean.includes('1.5')) return 'gemini-1.5-flash';

  return rawModel.trim();
}

/**
 * Deterministic Regex & Heuristic Engine (Always available, zero persistence)
 */
function analyzeWithHeuristics(text) {
  const findings = [];
  let calculatedScore = 0;
  const actions = new Set();
  const reasons = [];

  // 1. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex) || [];
  if (emails.length > 0) {
    calculatedScore += Math.min(emails.length * 12, 25);
    const masked = emails.slice(0, 3).map(maskEmail);
    findings.push({
      category: 'Email Address Exposure',
      severity: 'MEDIUM',
      count: emails.length,
      examples: masked,
      description: 'Plaintext personal or corporate email address detected in text.',
    });
    reasons.push(`${emails.length} email address(es) exposed`);
    actions.add('Redact personal email addresses before posting or sharing publicly.');
  }

  // 2. Phone Numbers
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b[6-9]\d{9}\b/g;
  const rawPhones = text.match(phoneRegex) || [];
  const phones = rawPhones.filter((p) => p.replace(/\D/g, '').length >= 10);
  if (phones.length > 0) {
    calculatedScore += Math.min(phones.length * 15, 30);
    const masked = phones.slice(0, 3).map(maskPhone);
    findings.push({
      category: 'Phone Number Exposure',
      severity: 'HIGH',
      count: phones.length,
      examples: masked,
      description: 'Contact phone numbers detected, enabling targeted SMS phishing or spam.',
    });
    reasons.push(`${phones.length} phone number(s) exposed`);
    actions.add('Mask contact phone numbers to prevent unsolicited social engineering.');
  }

  // 3. Aadhaar-like 12-digit numbers
  const aadhaarRegex = /\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/g;
  const aadhaars = text.match(aadhaarRegex) || [];
  if (aadhaars.length > 0) {
    calculatedScore += 50;
    const masked = aadhaars.slice(0, 2).map(maskAadhaar);
    findings.push({
      category: 'Aadhaar / National ID Pattern',
      severity: 'CRITICAL',
      count: aadhaars.length,
      examples: masked,
      description: 'Sensitive 12-digit Indian national identity number exposed.',
    });
    reasons.push('High-risk Indian Aadhaar National ID detected');
    actions.add('Immediately tokenize or mask all 12-digit national identification numbers.');
  }

  // 4. PAN-like IDs
  const panRegex = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}\b/g;
  const pans = text.match(panRegex) || [];
  if (pans.length > 0) {
    calculatedScore += 40;
    const masked = pans.slice(0, 2).map(maskPan);
    findings.push({
      category: 'Permanent Account Number (PAN)',
      severity: 'HIGH',
      count: pans.length,
      examples: masked,
      description: 'Indian tax identity number (PAN) identified in plaintext.',
    });
    reasons.push('Indian PAN tax identification string detected');
    actions.add('Never transmit plaintext PAN credentials across unverified channels.');
  }

  // 5. Credit / Debit Card-like numbers
  const cardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  const cards = (text.match(cardRegex) || []).filter((c) => {
    const d = c.replace(/\D/g, '');
    return d.length >= 13 && d.length <= 19;
  });
  if (cards.length > 0) {
    calculatedScore += 55;
    const masked = cards.slice(0, 2).map(maskCard);
    findings.push({
      category: 'Payment Card Number (PCI-DSS)',
      severity: 'CRITICAL',
      count: cards.length,
      examples: masked,
      description: '16-digit debit or credit card sequence exposed in unencrypted text.',
    });
    reasons.push('Exposed credit/debit card numbers');
    actions.add('Adhere to PCI-DSS: redact full PAN card numbers and never retain CVV strings.');
  }

  // 6. OTP / Password requests
  const otpRegex = /\b(?:otp|one[- ]?time[- ]?password|verification[- ]?code|pin|cvv|cvc|passcode)\b/gi;
  const otpMatches = text.match(otpRegex) || [];
  if (otpMatches.length > 0) {
    calculatedScore += 35;
    findings.push({
      category: 'OTP / Credential Request Coercion',
      severity: 'HIGH',
      count: otpMatches.length,
      examples: otpMatches.slice(0, 3).map((m) => `[Referenced credential: "${m}"]`),
      description: 'Solicitation or transmission of temporary authentication codes or CVV codes.',
    });
    reasons.push('Direct request for OTP or security authentication tokens');
    actions.add('Legitimate organizations never ask for your one-time passwords (OTP) or CVV.');
  }

  // 7. Urgency / Scam Phrases
  const urgencyPatterns = [
    /\baccount (?:suspended|blocked|locked|terminated)\b/gi,
    /\b(?:urgent|immediately|within \d+ (?:hours?|mins?|minutes?)|act now|final notice)\b/gi,
    /\b(?:wire transfer|crypto deposit|gift card|escrow payment|send money)\b/gi,
    /\b(?:lottery winner|cash prize|claim reward|inheritance)\b/gi,
    /\b(?:update kyc|kyc pending|aadhaar link|pan link)\b/gi,
  ];

  let matchedUrgency = [];
  for (const regex of urgencyPatterns) {
    const hits = text.match(regex);
    if (hits) matchedUrgency = matchedUrgency.concat(hits);
  }

  if (matchedUrgency.length > 0) {
    calculatedScore += 35;
    findings.push({
      category: 'Social Engineering & Urgent Action Coercion',
      severity: 'HIGH',
      count: matchedUrgency.length,
      examples: matchedUrgency.slice(0, 3).map((u) => `[Trigger phrase: "${u}..."]`),
      description: 'High-pressure urgency, coercion, or financial redirection keywords identified.',
    });
    reasons.push('High-pressure urgency or scam heuristics detected');
    actions.add('Pause and verify sender identity through official, out-of-band channels.');
    actions.add('Do not initiate rushed financial transfers under deadline pressure.');
  }

  // 8. Suspicious Links
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const urls = text.match(urlRegex) || [];
  const suspiciousUrls = urls.filter((u) => {
    const lower = u.toLowerCase();
    return (
      lower.includes('bit.ly') ||
      lower.includes('tinyurl.com') ||
      lower.includes('t.co') ||
      lower.includes('.xyz') ||
      lower.includes('.top') ||
      lower.includes('.ru') ||
      lower.includes('.buzz') ||
      lower.includes('ngrok') ||
      lower.startsWith('http://')
    );
  });

  if (suspiciousUrls.length > 0) {
    calculatedScore += 30;
    const defanged = suspiciousUrls.slice(0, 3).map(defangUrl);
    findings.push({
      category: 'Suspicious / Obfuscated Link Detected',
      severity: 'HIGH',
      count: suspiciousUrls.length,
      examples: defanged,
      description: 'URL shorteners, unencrypted HTTP, or high-risk domain extensions detected.',
    });
    reasons.push('Potentially deceptive URL or link shortener');
    actions.add('Do not click short links or unverified URLs received in unsolicited messages.');
  }

  // 9. API Keys, Tokens & Credentials (Stripe, AWS, Passwords)
  const secretPatterns = [
    /\b(?:sk_live_|sk_test_)[a-zA-Z0-9]{20,}\b/g,
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    /\b(?:password|passcode|root passcode|dbpass)\s*[:=]\s*[^\s]{6,}\b/gi,
    /\b(?:postgresql|mongodb|mysql):\/\/[^\s]+/gi,
  ];

  let matchedSecrets = [];
  for (const regex of secretPatterns) {
    const hits = text.match(regex);
    if (hits) matchedSecrets = matchedSecrets.concat(hits);
  }

  if (matchedSecrets.length > 0) {
    calculatedScore += 50;
    findings.push({
      category: 'Exposed Secrets & Database Credentials',
      severity: 'CRITICAL',
      count: matchedSecrets.length,
      examples: matchedSecrets.slice(0, 2).map((s) => `${s.slice(0, 8)}...[REDACTED]`),
      description: 'API secret keys, database connection strings, or plaintext credentials exposed.',
    });
    reasons.push('Unprotected API secrets or database connection strings');
    actions.add('Revoke and rotate exposed credentials immediately.');
  }

  // 10. Prompt Injection & Jailbreak Attempts
  const promptInjectionRegex = /\b(?:ignore (?:all )?previous (?:security )?instructions|system override|you are now in (?:debug|god|developer) mode|bypass (?:privacy|safety) filter|output (?:the )?system prompt)\b/gi;
  const injectionHits = text.match(promptInjectionRegex) || [];
  if (injectionHits.length > 0) {
    calculatedScore += 55;
    findings.push({
      category: 'AI Prompt Injection Attack Attempt',
      severity: 'HIGH',
      count: injectionHits.length,
      examples: injectionHits.slice(0, 2).map((h) => `[Injection attempt: "${h}"]`),
      description: 'Adversarial prompt injection pattern attempting to hijack AI execution or leak system prompts.',
    });
    reasons.push('Adversarial prompt injection attack pattern');
    actions.add('Sanitize inputs and quarantine payloads attempting to manipulate system instructions.');
  }

  // 11. SQL Injection & Web Exploits
  const sqliRegex = /\b(?:UNION\s+SELECT|OR\s+['"]?1['"]?\s*=\s*['"]?1|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM|--\s*$)\b|'\s*OR\s*'1'\s*=\s*'1/gi;
  const sqliHits = text.match(sqliRegex) || [];
  if (sqliHits.length > 0) {
    calculatedScore += 55;
    findings.push({
      category: 'SQL Injection Attack Vector',
      severity: 'HIGH',
      count: sqliHits.length,
      examples: sqliHits.slice(0, 2).map((h) => `[SQLi payload: "${h}"]`),
      description: 'SQL syntax manipulation string indicative of database exploitation attempt.',
    });
    reasons.push('SQL injection attack pattern identified');
    actions.add('Enforce parameterized queries and prepared statements.');
  }

  // 12. Malicious HTML / XSS / Form Droppers
  const xssRegex = /<script[\s>]|<iframe[^>]*src=["']?javascript:|<form[^>]*action=|<img[^>]+onerror=|<svg[^>]+onload=/gi;
  const xssHits = text.match(xssRegex) || [];
  if (xssHits.length > 0) {
    calculatedScore += 55;
    findings.push({
      category: 'XSS & Malicious HTML Payload',
      severity: 'HIGH',
      count: xssHits.length,
      examples: xssHits.slice(0, 2).map((h) => `[Script/DOM trigger: "${h.slice(0, 25)}..."]`),
      description: 'Executable JavaScript, fake credential phishing form, or DOM injection string detected.',
    });
    reasons.push('Cross-Site Scripting (XSS) or phishing DOM injection detected');
    actions.add('Apply strict HTML entity encoding and Content Security Policy (CSP).');
  }

  // 13. Obfuscated Email Representation
  const obfuscatedEmailRegex = /\b[a-zA-Z0-9._%+-]+\s*(?:\[at\]|\(at\))\s*[a-zA-Z0-9.-]+\s*(?:\[dot\]|\(dot\))\s*[a-zA-Z]{2,}\b/gi;
  const obfEmailHits = text.match(obfuscatedEmailRegex) || [];
  if (obfEmailHits.length > 0) {
    calculatedScore += 25;
    findings.push({
      category: 'Obfuscated Email Address',
      severity: 'MEDIUM',
      count: obfEmailHits.length,
      examples: obfEmailHits.slice(0, 2),
      description: 'Obfuscated email string designed to bypass naive regex filters.',
    });
    reasons.push('Obfuscated contact email detected');
    actions.add('Mask contact information to prevent scraping.');
  }

  // 14. Multilingual Threat & Coercion (Hindi / Devanagari Regional)
  const regionalThreatRegex = /(?:आधार|खाता|निलंबित|ओटीपी|सत्यापन|पैन|बैंक)/gu;
  const regionalHits = text.match(regionalThreatRegex) || [];
  if (regionalHits.length > 0) {
    calculatedScore += 45;
    findings.push({
      category: 'Multilingual Coercion & Bank Scams',
      severity: 'HIGH',
      count: regionalHits.length,
      examples: regionalHits.slice(0, 3).map((w) => `[Regional marker: "${w}"]`),
      description: 'Regional language high-pressure banking coercion or Aadhaar/OTP solicitation.',
    });
    reasons.push('Regional language urgency or identity verification trigger');
    actions.add('Exercise caution with unsolicited regional language messages requesting OTPs.');
  }

  const finalScore = Math.min(Math.max(calculatedScore, 0), 100);

  let riskLevel = 'LOW';
  if (finalScore >= 80) {
    riskLevel = 'CRITICAL';
  } else if (finalScore >= 55) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 25) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
    if (findings.length === 0) {
      actions.add('Payload does not display obvious sensitive data leakage or scam markers.');
    }
  }

  let explanation = '';
  if (reasons.length > 0) {
    explanation = `Identified ${reasons.join(', ')}. This presents an elevated privacy and security risk requiring containment.`;
  } else {
    explanation = 'No overt sensitive PII, plaintext financial tokens, or known social-engineering triggers were detected.';
  }

  return {
    engine: 'HEURISTIC_REGEX',
    riskLevel,
    riskScore: finalScore,
    findings,
    explanation,
    recommendedActions: Array.from(actions),
    disclaimer: 'PRIVACYGUARD AI analysis is advisory and provided for defensive risk mitigation. It does not constitute legal counsel or definitive forensic proof of fraud.',
  };
}

/**
 * Live Google Gemini AI Call (Runs model specified via GEMINI_MODEL env var)
 */
async function analyzeWithGemini(text, apiKey, rawModelName) {
  const model = resolveGeminiModel(rawModelName);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const prompt = `You are PRIVACYGUARD AI, an expert privacy security auditor and threat intelligence model.
Evaluate the following text for sensitive data exposure (PII, Aadhaar, PAN, SSN, Credit Cards, Secrets, Passwords, API keys, DB connection strings) and social engineering scam vectors (KYC phishing, bank suspension coercion, urgency pressure, fraudulent wire transfers).

IMPORTANT PRIVACY RULE: Never reflect raw sensitive data in your output. Always mask any examples (e.g. XXXX-XXXX-1234 or j***@example.com).

Return ONLY valid JSON matching this exact structure:
{
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "riskScore": <integer between 0 and 100>,
  "explanation": "<2-3 sentence clear summary of the security/privacy risk>",
  "findings": [
    {
      "category": "<Category Name>",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "description": "<Why this constitutes a risk>",
      "examples": ["<Safe masked representation>"]
    }
  ],
  "recommendedActions": [
    "<Actionable step 1>",
    "<Actionable step 2>"
  ]
}

Text to inspect:
"""
${text.slice(0, 15000)}
"""`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[Gemini API] Request failed with HTTP ${res.status}:`, errorText.slice(0, 200));
      return null;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText);
    return {
      engine: `GEMINI_${model.toUpperCase()}`,
      riskLevel: parsed.riskLevel || 'MEDIUM',
      riskScore: Math.min(Math.max(Number(parsed.riskScore) || 50, 0), 100),
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      explanation: parsed.explanation || 'Analyzed via Google Gemini AI.',
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      disclaimer: 'PRIVACYGUARD AI analysis is advisory and powered by Google Gemini AI. It does not constitute legal counsel or definitive forensic proof of fraud.',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Gemini API] Failed to invoke model, falling back to heuristics:', err.message);
    return null;
  }
}

/**
 * Main Analysis Entry Point
 * Executes live Gemini if GEMINI_API_KEY is configured; otherwise executes zero-persistence heuristics.
 */
export async function analyzePrivacyText(text) {
  if (!text || typeof text !== 'string') {
    return {
      riskLevel: 'LOW',
      riskScore: 0,
      findings: [],
      explanation: 'No content provided for analysis.',
      recommendedActions: ['Provide a valid text or message payload to inspect.'],
      disclaimer: 'PRIVACYGUARD AI analysis is advisory and provided for defensive risk mitigation. It does not constitute legal counsel or definitive forensic proof of fraud.',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const rawModel = process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-2.0-flash';

  // Always compute heuristic findings
  const heuristicResult = analyzeWithHeuristics(text);

  // If Gemini API key is configured, invoke Gemini model
  if (apiKey && apiKey.trim().length > 5) {
    const geminiResult = await analyzeWithGemini(text, apiKey.trim(), rawModel);
    if (geminiResult) {
      // Merge: take highest risk score, combine unique findings, and keep Gemini explanation
      const combinedScore = Math.max(heuristicResult.riskScore, geminiResult.riskScore);
      let combinedLevel = geminiResult.riskLevel;
      if (heuristicResult.riskScore >= 80 || geminiResult.riskScore >= 80) {
        combinedLevel = 'CRITICAL';
      } else if (heuristicResult.riskScore >= 55 || geminiResult.riskScore >= 55) {
        combinedLevel = 'HIGH';
      }

      // Merge findings avoiding duplicate categories
      const existingCats = new Set(geminiResult.findings.map((f) => f.category));
      for (const hf of heuristicResult.findings) {
        if (!existingCats.has(hf.category)) {
          geminiResult.findings.push(hf);
        }
      }

      const mergedActions = Array.from(
        new Set([...geminiResult.recommendedActions, ...heuristicResult.recommendedActions])
      );

      return {
        ...geminiResult,
        riskScore: combinedScore,
        riskLevel: combinedLevel,
        findings: geminiResult.findings,
        recommendedActions: mergedActions,
      };
    }
  }

  return heuristicResult;
}
