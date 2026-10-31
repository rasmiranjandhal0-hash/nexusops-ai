import dns from 'dns';
import { promisify } from 'util';

const resolveMxAsync = promisify(dns.resolveMx);

// Known disposable email services
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'throwawaymail.com', 'sharklasers.com', 'yopmail.com',
  'trashmail.com', 'getairmail.com', 'dispostable.com', 'fakemailgenerator.com',
]);

// Common typos of major consumer email providers
const TYPO_DOMAINS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
};

export async function verifyEmailSecurity(email) {
  if (!email || typeof email !== 'string') {
    return {
      riskLevel: 'INSUFFICIENT DATA',
      riskScore: 0,
      target: email || '',
      type: 'EMAIL',
      detectedIndicators: ['Empty Email String'],
      supportingEvidence: ['No valid email string provided.'],
      evidenceSource: 'DETERMINISTIC_VALIDATOR',
      confidenceScore: 100,
      recommendedActions: ['Provide a valid email address.'],
      timestamp: new Date().toISOString(),
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(cleanEmail)) {
    return {
      id: `VRF-EML-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'EMAIL',
      target: email,
      riskLevel: 'HIGH',
      riskScore: 85,
      detectedIndicators: ['Invalid RFC 5322 Email Syntax'],
      supportingEvidence: ['Email string fails standard specification structure (missing @ or invalid domain).'],
      evidenceSource: 'SYNTAX_VALIDATOR',
      confidenceScore: 100,
      recommendedActions: ['Verify email formatting.'],
      timestamp: new Date().toISOString(),
    };
  }

  const [localPart, domainPart] = cleanEmail.split('@');
  const indicators = [];
  const evidence = [];
  const actions = [];
  let calculatedScore = 5;

  // 1. Check Typosquatting of Major Providers
  if (TYPO_DOMAINS[domainPart]) {
    indicators.push(`Domain Typosquatting: Did you mean "${TYPO_DOMAINS[domainPart]}"?`);
    evidence.push(`Domain "${domainPart}" is a common typo of the authoritative service "${TYPO_DOMAINS[domainPart]}". Often used to intercept misdirected mail.`);
    calculatedScore += 50;
    actions.push(`Double-check spelling: recipient likely intended "${localPart}@${TYPO_DOMAINS[domainPart]}".`);
  }

  // 2. Check Disposable Email Domain
  if (DISPOSABLE_DOMAINS.has(domainPart)) {
    indicators.push('Disposable / Burner Email Service');
    evidence.push(`Domain "${domainPart}" is an ephemeral disposable email service frequently utilized in fraudulent registrations.`);
    calculatedScore += 65;
    actions.push('Require identity verification or phone number confirmation for burner email addresses.');
  }

  // 3. Excessive Length or High-Entropy Local Part
  if (localPart.length > 30) {
    indicators.push('Unusually Long Username String');
    evidence.push('Local part exceeds 30 characters, consistent with automated dictionary generation.');
    calculatedScore += 15;
  }

  // 4. MX Record Verification
  let hasValidMx = false;
  try {
    const mxRecords = await resolveMxAsync(domainPart);
    if (mxRecords && mxRecords.length > 0) {
      hasValidMx = true;
      evidence.push(`Verified ${mxRecords.length} active Mail Exchange (MX) records for domain: ${mxRecords[0].exchange} (priority ${mxRecords[0].priority}).`);
    } else {
      indicators.push('No Mail Exchange (MX) Records Found');
      evidence.push(`Domain "${domainPart}" has no active MX records configured. Incoming mail will fail to deliver.`);
      calculatedScore += 45;
      actions.push('Domain cannot receive inbound mail. Suspect fraudulent or non-functional contact.');
    }
  } catch (err) {
    indicators.push('Unresolvable Mail Domain / MX Lookup Failed');
    evidence.push(`DNS MX query failed for domain "${domainPart}": ${err.code || err.message}`);
    calculatedScore += 45;
    actions.push('Verify domain registration status.');
  }

  const finalScore = Math.min(Math.max(calculatedScore, 0), 100);

  let riskLevel = 'LOW';
  if (finalScore >= 75) riskLevel = 'CRITICAL';
  else if (finalScore >= 50) riskLevel = 'HIGH';
  else if (finalScore >= 25) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  if (actions.length === 0) {
    actions.push('Email syntax and MX routing appear legitimate.');
  }

  return {
    id: `VRF-EML-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'EMAIL',
    target: email,
    localPart,
    domainPart,
    hasValidMx,
    isDisposable: DISPOSABLE_DOMAINS.has(domainPart),
    riskLevel,
    riskScore: finalScore,
    detectedIndicators: indicators.length > 0 ? indicators : ['Deliverable & Valid Syntax'],
    supportingEvidence: evidence,
    evidenceSource: 'NEXUSOPS_MAIL_INTEL',
    confidenceScore: hasValidMx ? 92 : 80,
    recommendedActions: actions,
    timestamp: new Date().toISOString(),
  };
}
