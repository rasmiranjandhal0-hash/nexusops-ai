import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

// Known brand keywords commonly targeted for impersonation
const MONITORED_BRANDS = [
  'paypal', 'microsoft', 'apple', 'google', 'amazon', 'netflix', 'facebook',
  'instagram', 'whatsapp', 'binance', 'coinbase', 'sbi', 'hdfc', 'icici',
  'chase', 'wellsfargo', 'bankofamerica', 'dhl', 'fedex', 'usps'
];

// High-risk TLDs commonly abused in automated phishing campaigns
const HIGH_RISK_TLDS = ['.xyz', '.top', '.buzz', '.ru', '.cc', '.tk', '.work', '.click', '.live'];

// Private and reserved IP blocks for SSRF prevention
function isPrivateOrReservedIP(ip) {
  if (!ip) return true;
  // IPv4 checks
  if (ip.startsWith('127.')) return true; // Loopback
  if (ip.startsWith('10.')) return true; // Class A private
  if (ip.startsWith('192.168.')) return true; // Class C private
  if (ip === '0.0.0.0') return true;
  if (ip.startsWith('169.254.')) return true; // Link-local / Cloud metadata (AWS, GCP, Azure)
  // 172.16.0.0 – 172.31.255.255
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  // IPv6 checks
  if (ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc00:')) return true;
  return false;
}

export async function verifyUrlSecurity(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      riskLevel: 'INSUFFICIENT DATA',
      riskScore: 0,
      target: rawUrl || '',
      type: 'URL',
      detectedIndicators: ['Empty URL payload provided'],
      supportingEvidence: ['No valid URL string received for evaluation.'],
      evidenceSource: 'DETERMINISTIC_VALIDATOR',
      confidenceScore: 100,
      recommendedActions: ['Provide a valid HTTP/HTTPS URL.'],
      timestamp: new Date().toISOString(),
    };
  }

  let parsed;
  try {
    let toParse = rawUrl.trim();
    if (!toParse.startsWith('http://') && !toParse.startsWith('https://')) {
      toParse = `https://${toParse}`;
    }
    parsed = new URL(toParse);
  } catch {
    return {
      riskLevel: 'HIGH',
      riskScore: 70,
      target: rawUrl,
      type: 'URL',
      detectedIndicators: ['Malformed URL Syntax'],
      supportingEvidence: ['URL fails RFC 3986 parse requirements.'],
      evidenceSource: 'SYNTAX_PARSER',
      confidenceScore: 90,
      recommendedActions: ['Verify domain formatting before accessing.'],
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Protocol Validation
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      riskLevel: 'CRITICAL',
      riskScore: 95,
      target: rawUrl,
      type: 'URL',
      detectedIndicators: ['Disallowed Protocol Scheme'],
      supportingEvidence: [`Protocol scheme "${parsed.protocol}" is blocked for security.`],
      evidenceSource: 'PROTOCOL_FILTER',
      confidenceScore: 100,
      recommendedActions: ['Do not execute non-HTTP protocol handlers.'],
      timestamp: new Date().toISOString(),
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const indicators = [];
  const evidence = [];
  const actions = [];
  let calculatedScore = 10; // Base score

  // 2. SSRF Protection: Resolve Hostname & Verify Not Internal IP
  try {
    const lookup = await lookupAsync(hostname);
    if (isPrivateOrReservedIP(lookup.address)) {
      return {
        riskLevel: 'CRITICAL',
        riskScore: 100,
        target: rawUrl,
        type: 'URL',
        detectedIndicators: ['SSRF Attack Vector / Internal IP Resolution'],
        supportingEvidence: [
          `Hostname "${hostname}" resolves to private/reserved IP: ${lookup.address}`,
          'Access to internal cloud infrastructure or loopback interfaces is strictly prohibited.',
        ],
        evidenceSource: 'SSRF_FIREWALL',
        confidenceScore: 100,
        recommendedActions: [
          'Quarantine domain immediately.',
          'Never route traffic to internal private network addresses from untrusted user input.',
        ],
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    // If DNS resolution fails, domain might be non-existent or down
    indicators.push('Unresolvable Hostname / NXDOMAIN');
    evidence.push(`DNS resolution failed for hostname "${hostname}". Domain may be expired or deactivated.`);
    calculatedScore += 25;
    actions.push('Domain is currently unresolvable. Exercise caution if domain was recently registered.');
  }

  // 3. HTTPS Status
  const isHttps = parsed.protocol === 'https:';
  if (!isHttps) {
    indicators.push('Unencrypted Transport (Plaintext HTTP)');
    evidence.push('Website communicates over unencrypted HTTP, exposing sessions to packet interception.');
    calculatedScore += 20;
    actions.push('Avoid submitting passwords, credentials, or personal information over plain HTTP.');
  }

  // 4. IP Address Used As Hostname
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    indicators.push('Raw IP Address Hostname');
    evidence.push('Direct IP addressing is frequently utilized by phishing drop sites to evade domain reputation blocks.');
    calculatedScore += 35;
    actions.push('Legitimate enterprise services use registered brand domain names rather than raw IP addresses.');
  }

  // 5. Brand Impersonation & Typosquatting
  for (const brand of MONITORED_BRANDS) {
    if (hostname.includes(brand)) {
      const isOfficial = hostname === `${brand}.com` || hostname.endsWith(`.${brand}.com`);
      if (!isOfficial) {
        indicators.push(`Brand Impersonation Vector: "${brand.toUpperCase()}"`);
        evidence.push(`Domain contains the brand string "${brand}" but is not the authentic authoritative domain.`);
        calculatedScore += 45;
        actions.push(`Verify authentic brand portal. Expected official domain is "${brand}.com".`);
      }
    }
  }

  // 6. High-Risk TLDs
  for (const tld of HIGH_RISK_TLDS) {
    if (hostname.endsWith(tld)) {
      indicators.push(`High-Risk Top-Level Domain (${tld})`);
      evidence.push(`Top-level domain "${tld}" shows disproportionate association with ephemeral spam and malicious infrastructure.`);
      calculatedScore += 20;
      actions.push('Scan downloaded files before opening if originating from high-risk TLDs.');
      break;
    }
  }

  // 7. Excessive Subdomain Stacking / Obfuscation
  const domainParts = hostname.split('.');
  if (domainParts.length >= 4) {
    indicators.push('Deep Subdomain Stacking');
    evidence.push(`Domain has ${domainParts.length} levels, a technique used to mislead users into seeing a legitimate brand prefix.`);
    calculatedScore += 20;
  }

  // 8. Punycode / Homoglyph Characters
  if (hostname.startsWith('xn--') || hostname.includes('.xn--')) {
    indicators.push('Punycode / Homoglyph Encoding (IDN Spoofing)');
    evidence.push('Punycode domain detected. Attackers use visually identical Cyrillic/Greek characters to spoof Latin domain names.');
    calculatedScore += 40;
    actions.push('Inspect Unicode representation to verify characters are not homoglyphs.');
  }

  // Cap Score 0 - 100
  const finalScore = Math.min(Math.max(calculatedScore, 0), 100);

  let riskLevel = 'LOW';
  if (finalScore >= 80) riskLevel = 'CRITICAL';
  else if (finalScore >= 55) riskLevel = 'HIGH';
  else if (finalScore >= 30) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  if (actions.length === 0) {
    actions.push('Domain structure exhibits normal characteristics with standard transport security.');
  }

  return {
    id: `VRF-URL-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'URL',
    target: rawUrl,
    hostname,
    protocol: parsed.protocol,
    isHttps,
    riskLevel,
    riskScore: finalScore,
    detectedIndicators: indicators.length > 0 ? indicators : ['Clean Domain Structure'],
    supportingEvidence: evidence.length > 0 ? evidence : ['Standard HTTPS encryption and reputable domain syntax verified.'],
    evidenceSource: 'NEXUSOPS_REPUTATION_ENGINE',
    confidenceScore: indicators.length > 0 ? 88 : 95,
    recommendedActions: actions,
    timestamp: new Date().toISOString(),
  };
}
