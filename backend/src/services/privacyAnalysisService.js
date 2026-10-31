/**
 * PrivacyGuard AI - Zero-Persistence Privacy & Threat Analysis Service
 * 
 * Analyzes arbitrary text for sensitive PII, credentials, financial markers,
 * and social-engineering scam patterns without saving or logging the input.
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

export function analyzePrivacyText(text) {
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

  // 2. Phone Numbers (10-digit Indian & international formatted)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b[6-9]\d{9}\b/g;
  const rawPhones = text.match(phoneRegex) || [];
  // Filter out timestamps or small numbers
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
    reasons.push(`${phones.length} phone number(s) detected`);
    actions.add('Mask or tokenize direct phone numbers in public tickets and prompts.');
  }

  // 3. Aadhaar-like 12-digit Indian Identification Numbers
  const aadhaarRegex = /\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/g;
  const aadhaarMatches = text.match(aadhaarRegex) || [];
  if (aadhaarMatches.length > 0) {
    calculatedScore += 45;
    const masked = aadhaarMatches.slice(0, 2).map(maskAadhaar);
    findings.push({
      category: 'Aadhaar / National ID Pattern',
      severity: 'CRITICAL',
      count: aadhaarMatches.length,
      examples: masked,
      description: 'High-sensitivity 12-digit national identity number identified.',
    });
    reasons.push('Aadhaar / National identity number exposed');
    actions.add('Never transmit 12-digit Aadhaar numbers in unencrypted messages or LLM prompts.');
    actions.add('Apply statutory Masked Aadhaar masking (showing only last 4 digits).');
  }

  // 4. PAN-like Indian Tax IDs (5 letters, 4 digits, 1 letter)
  const panRegex = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}\b/g;
  const panMatches = text.match(panRegex) || [];
  if (panMatches.length > 0) {
    calculatedScore += 35;
    const masked = panMatches.slice(0, 2).map(maskPan);
    findings.push({
      category: 'Permanent Account Number (PAN) ID',
      severity: 'HIGH',
      count: panMatches.length,
      examples: masked,
      description: 'Indian tax identity number detected, vulnerable to identity theft.',
    });
    reasons.push('PAN taxpayer identifier found');
    actions.add('Quarantine documents containing full PAN identity strings.');
  }

  // 5. Payment Card Numbers (Credit / Debit card-like sequences)
  const cardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  const cardMatches = text.match(cardRegex) || [];
  if (cardMatches.length > 0) {
    calculatedScore += 50;
    const masked = cardMatches.slice(0, 2).map(maskCard);
    findings.push({
      category: 'Payment Card Details (PCI-DSS)',
      severity: 'CRITICAL',
      count: cardMatches.length,
      examples: masked,
      description: '16-digit cardholder PAN sequence detected, violating PCI-DSS standards.',
    });
    reasons.push('Plaintext payment card sequence identified');
    actions.add('Immediately purge card details and never persist CVV or full card numbers.');
    actions.add('Use PCI-certified payment gateways for tokenized transactions.');
  }

  // 6. OTP & Password Requests / Exposures
  const otpRegex = /\b(?:otp|one[- ]?time password|verification code|pin is|password is|cvv[:\s]*\d{3,4}|security code)\b/gi;
  if (otpRegex.test(text)) {
    calculatedScore += 40;
    findings.push({
      category: 'OTP / Credential Request or Exposure',
      severity: 'CRITICAL',
      count: 1,
      examples: ['[OTP/Credential Sensitive Marker Detected]'],
      description: 'Text explicitly references OTPs, passwords, CVV codes, or security pins.',
    });
    reasons.push('Active OTP or credential request marker');
    actions.add('Never disclose OTPs, PINs, or account passwords to anyone, even if claiming to be support.');
  }

  // 7. Urgency, Coercion, or Scam Phrases
  const urgencyPatterns = [
    /\burgent\b/i,
    /\bwire transfer\b/i,
    /\baccount (?:will be|has been) (?:suspended|blocked|terminated)\b/i,
    /\bimmediate action required\b/i,
    /\belectricity (?:will be|power) cut\b/i,
    /\bkyc (?:update|verification|pending|expire)\b/i,
    /\blottery winner\b/i,
    /\bcash prize\b/i,
    /\barrest warrant\b/i,
    /\bdo not (?:call|verify via phone)\b/i,
    /\bcustoms fee\b/i,
    /\bpart-time job.*telegram\b/i,
  ];

  const matchedUrgency = urgencyPatterns
    .filter((regex) => regex.test(text))
    .map((regex) => regex.source.replace(/[\\^$b]/g, '').slice(0, 25));

  if (matchedUrgency.length > 0) {
    calculatedScore += Math.min(matchedUrgency.length * 20, 45);
    findings.push({
      category: 'Social Engineering & Scam Indicators',
      severity: matchedUrgency.length >= 2 ? 'CRITICAL' : 'HIGH',
      count: matchedUrgency.length,
      examples: matchedUrgency.slice(0, 3).map((u) => `[Trigger phrase: "${u}..."]`),
      description: 'High-pressure urgency, coercion, or financial redirection keywords identified.',
    });
    reasons.push('High-pressure urgency or scam heuristics detected');
    actions.add('Pause and verify sender identity through official, out-of-band channels.');
    actions.add('Do not initiate rushed financial transfers under deadline pressure.');
  }

  // 8. Suspicious Links & Shorteners
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

  // Cap score between 0 and 100
  const finalScore = Math.min(Math.max(calculatedScore, 0), 100);

  // Determine Risk Level
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

  // Synthesize Explanation
  let explanation = '';
  if (reasons.length > 0) {
    explanation = `Identified ${reasons.join(', ')}. This presents an elevated privacy and security risk requiring containment.`;
  } else {
    explanation = 'No overt sensitive PII, plaintext financial tokens, or known social-engineering triggers were detected.';
  }

  return {
    riskLevel,
    riskScore: finalScore,
    findings,
    explanation,
    recommendedActions: Array.from(actions),
    disclaimer: 'PRIVACYGUARD AI analysis is advisory and provided for defensive risk mitigation. It does not constitute legal counsel or definitive forensic proof of fraud.',
  };
}

