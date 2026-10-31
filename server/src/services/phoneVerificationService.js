// Country dial codes and national length definitions
const COUNTRY_CODES = [
  { code: '+91', country: 'India', length: 10, prefixRegex: /^[6-9]\d{9}$/ },
  { code: '+1', country: 'United States / Canada', length: 10, prefixRegex: /^[2-9]\d{9}$/ },
  { code: '+44', country: 'United Kingdom', length: 10, prefixRegex: /^7\d{9}$/ },
  { code: '+61', country: 'Australia', length: 9, prefixRegex: /^4\d{8}$/ },
  { code: '+971', country: 'United Arab Emirates', length: 9, prefixRegex: /^5\d{8}$/ },
  { code: '+49', country: 'Germany', length: 10, prefixRegex: /^\d{10}$/ },
  { code: '+33', country: 'France', length: 9, prefixRegex: /^[67]\d{8}$/ },
  { code: '+65', country: 'Singapore', length: 8, prefixRegex: /^[89]\d{7}$/ },
];

export function verifyPhoneSecurity(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      riskLevel: 'INSUFFICIENT DATA',
      riskScore: 0,
      target: rawPhone || '',
      type: 'PHONE',
      detectedIndicators: ['Empty Phone String'],
      supportingEvidence: ['No valid phone number provided.'],
      evidenceSource: 'DETERMINISTIC_VALIDATOR',
      confidenceScore: 100,
      recommendedActions: ['Provide a phone number with country dial code.'],
      timestamp: new Date().toISOString(),
    };
  }

  const clean = rawPhone.trim();
  const digitsOnly = clean.replace(/\D/g, '');

  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      id: `VRF-PHN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'PHONE',
      target: rawPhone,
      riskLevel: 'HIGH',
      riskScore: 80,
      detectedIndicators: ['Invalid ITU-T E.164 Digit Count'],
      supportingEvidence: [`Phone sequence has ${digitsOnly.length} digits. International standard requires 7 to 15 digits.`],
      evidenceSource: 'E164_PARSER',
      confidenceScore: 95,
      recommendedActions: ['Verify complete international number format including country code.'],
      timestamp: new Date().toISOString(),
    };
  }

  const indicators = [];
  const evidence = [];
  const actions = [];
  let calculatedScore = 5;

  // 1. Detect Country Dial Code
  let detectedCountry = null;
  let nationalNumber = digitsOnly;

  for (const c of COUNTRY_CODES) {
    const rawCodeDigits = c.code.replace('+', '');
    if (digitsOnly.startsWith(rawCodeDigits)) {
      detectedCountry = c;
      nationalNumber = digitsOnly.slice(rawCodeDigits.length);
      break;
    }
  }

  // If not prefixed with dial code, fallback heuristic for 10-digit Indian or US number
  if (!detectedCountry && digitsOnly.length === 10) {
    if (/^[6-9]/.test(digitsOnly)) {
      detectedCountry = COUNTRY_CODES[0]; // India
    } else {
      detectedCountry = COUNTRY_CODES[1]; // US
    }
  }

  if (detectedCountry) {
    evidence.push(`Identified routing jurisdiction: ${detectedCountry.country} (${detectedCountry.code}).`);
    if (detectedCountry.prefixRegex && !detectedCountry.prefixRegex.test(nationalNumber)) {
      indicators.push(`Irregular National Number Pattern for ${detectedCountry.country}`);
      evidence.push(`National digits "${nationalNumber}" do not match the expected carrier prefix allocation for ${detectedCountry.country}.`);
      calculatedScore += 35;
      actions.push('Verify number with mobile carrier lookup before dispatching critical verification codes.');
    }
  } else {
    indicators.push('Unrecognized Country Calling Code');
    evidence.push('Number does not match major standard telecommunication country prefix allocations.');
    calculatedScore += 25;
  }

  // 2. Repetitive or Sequential Dummy Numbers
  const isRepetitive = /^(\d)\1+$/.test(digitsOnly);
  const isSequential = '01234567890123456789'.includes(digitsOnly) || '98765432109876543210'.includes(digitsOnly);

  if (isRepetitive) {
    indicators.push('Dummy Repetitive Digit Sequence');
    evidence.push(`Sequence composed entirely of repeating digit "${digitsOnly[0]}". Highly indicative of fraudulent placeholder input.`);
    calculatedScore += 75;
    actions.push('Reject dummy phone numbers during customer onboarding.');
  }

  if (isSequential) {
    indicators.push('Sequential Placeholder Digits');
    evidence.push('Sequence contains consecutive incremental/decremental digits (e.g. 123456... or 987654...).');
    calculatedScore += 65;
    actions.push('Require live OTP verification to confirm subscriber ownership.');
  }

  // 3. Known Premium Rate / High-Risk Prefixes
  if (nationalNumber.startsWith('900') || nationalNumber.startsWith('809') || nationalNumber.startsWith('876')) {
    indicators.push('Potential High-Cost Premium Rate or Caribbean One-Ring Scam Prefix');
    evidence.push('Area code historically associated with unauthorized toll charges and premium tariff billing scams.');
    calculatedScore += 45;
    actions.push('Do not return missed calls to unfamiliar international numbers.');
  }

  const finalScore = Math.min(Math.max(calculatedScore, 0), 100);

  let riskLevel = 'LOW';
  if (finalScore >= 75) riskLevel = 'CRITICAL';
  else if (finalScore >= 50) riskLevel = 'HIGH';
  else if (finalScore >= 25) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  if (actions.length === 0) {
    actions.push('Phone sequence conforms to standard carrier allocations.');
  }

  return {
    id: `VRF-PHN-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'PHONE',
    target: rawPhone,
    digitsCount: digitsOnly.length,
    country: detectedCountry ? detectedCountry.country : 'International',
    countryCode: detectedCountry ? detectedCountry.code : 'Unknown',
    riskLevel,
    riskScore: finalScore,
    detectedIndicators: indicators.length > 0 ? indicators : ['Standard Subscriber Number'],
    supportingEvidence: evidence,
    evidenceSource: 'NEXUSOPS_TELCO_TELEMETRY',
    confidenceScore: detectedCountry ? 90 : 75,
    recommendedActions: actions,
    timestamp: new Date().toISOString(),
  };
}
