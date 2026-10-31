import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Default starter history for demo@privacyguard.ai
const DEFAULT_DEMO_HISTORY = [
  {
    id: 'SCN-9021',
    customerId: 'demo@privacyguard.ai',
    title: 'Customer Support Verification Rajesh',
    dateFormatted: 'Oct 31, 2026, 12:30 PM',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    risk: 'Critical',
    score: 95,
    detectedCount: 3,
    categories: ['Aadhaar Number', 'PAN Tax ID', 'Payment Card'],
    status: 'Quarantined',
    explanation: 'Detected critical exposure of Indian national identity numbers (Aadhaar & PAN) alongside unmasked 16-digit debit card credentials.',
    recommendedActions: [
      'Immediately redact Aadhaar and PAN numbers before storing in support tickets.',
      'Tokenize cardholder primary account numbers in accordance with PCI-DSS.',
    ],
    findings: [
      { category: 'Aadhaar / National ID Pattern', severity: 'CRITICAL', examples: ['XXXX-XXXX-4812'], description: '12-digit Indian national identity number.' },
      { category: 'Permanent Account Number (PAN)', severity: 'HIGH', examples: ['ABCDE****F'], description: 'Indian tax identity number.' },
      { category: 'Payment Card Details (PCI-DSS)', severity: 'CRITICAL', examples: ['****-****-****-1092'], description: 'Debit card sequence exposed.' },
    ],
  },
  {
    id: 'SCN-9020',
    customerId: 'demo@privacyguard.ai',
    title: 'State Bank KYC Suspension Scam Email',
    dateFormatted: 'Oct 31, 2026, 11:15 AM',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    risk: 'High',
    score: 88,
    detectedCount: 2,
    categories: ['Phishing Heuristics', 'Urgent Wire Transfer'],
    status: 'Flagged',
    explanation: 'High probability phishing coercion requesting immediate OTP sharing under threat of bank account suspension.',
    recommendedActions: [
      'Never disclose one-time passwords (OTP) or authentication codes.',
      'Quarantine message and block sender domain.',
    ],
    findings: [
      { category: 'OTP / Credential Request Coercion', severity: 'HIGH', examples: ['6-digit OTP verification code'], description: 'High-risk solicitation of temporary credentials.' },
      { category: 'Social Engineering & Urgent Action Coercion', severity: 'HIGH', examples: ['account has been suspended', 'within 2 hours'], description: 'Urgency tactics commonly seen in fraudulent campaigns.' },
    ],
  },
  {
    id: 'SCN-9019',
    customerId: 'demo@privacyguard.ai',
    title: 'Developer Prompt with Supabase Key',
    dateFormatted: 'Oct 31, 2026, 09:40 AM',
    timestamp: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    risk: 'Critical',
    score: 98,
    detectedCount: 2,
    categories: ['Exposed API Secret', 'PostgreSQL URI'],
    status: 'Redacted',
    explanation: 'Unprotected database URI credentials with embedded password and OpenAI API tokens.',
    recommendedActions: [
      'Rotate database passwords immediately.',
      'Revoke exposed API keys and migrate to backend environment variables.',
    ],
    findings: [
      { category: 'Cloud Credentials & Secret Leak', severity: 'CRITICAL', examples: ['sk-proj-****', 'postgresql://admin:****'], description: 'Sensitive access tokens.' },
    ],
  },
];

class StorageService {
  constructor() {
    this.memoryStore = {
      customers: {
        'demo@privacyguard.ai': {
          id: 'demo@privacyguard.ai',
          email: 'demo@privacyguard.ai',
          name: 'Security Officer (Demo)',
          passwordHash: 'DemoPass123!',
          createdAt: new Date().toISOString(),
        },
      },
      scans: [...DEFAULT_DEMO_HISTORY],
    };

    this.initFileStore();
  }

  initFileStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.customers && parsed.scans) {
          this.memoryStore = parsed;
        }
      } else {
        this.saveToFile();
      }
    } catch (err) {
      console.warn('[StorageService] Error loading store.json, using in-memory store:', err.message);
    }
  }

  saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryStore, null, 2), 'utf8');
    } catch (err) {
      console.warn('[StorageService] Failed to persist to store.json:', err.message);
    }
  }

  // Customer Management
  findCustomer(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return this.memoryStore.customers[normalized] || null;
  }

  registerCustomer(email, name, password) {
    if (!email) throw new Error('Email is required');
    const normalized = email.trim().toLowerCase();
    
    if (this.memoryStore.customers[normalized]) {
      return this.memoryStore.customers[normalized];
    }

    const newCustomer = {
      id: normalized,
      email: normalized,
      name: name?.trim() || normalized.split('@')[0],
      passwordHash: password || 'default_sec_pass',
      createdAt: new Date().toISOString(),
    };

    this.memoryStore.customers[normalized] = newCustomer;
    this.saveToFile();
    return newCustomer;
  }

  // Scan Management
  saveScan(customerId, scanRecord) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();

    // Ensure customer profile exists
    if (!this.memoryStore.customers[custId]) {
      this.registerCustomer(custId, custId.split('@')[0], 'auto_gen');
    }

    const record = {
      ...scanRecord,
      customerId: custId,
      timestamp: scanRecord.timestamp || new Date().toISOString(),
    };

    // Prepend to array so newest is first
    this.memoryStore.scans.unshift(record);
    this.saveToFile();
    return record;
  }

  getCustomerHistory(customerId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    return this.memoryStore.scans.filter((s) => s.customerId === custId);
  }

  getCustomerStats(customerId) {
    const history = this.getCustomerHistory(customerId);
    const totalScans = history.length;
    
    if (totalScans === 0) {
      return {
        totalScans: 0,
        avgRiskScore: 0,
        criticalCount: 0,
        highCount: 0,
        moderateCount: 0,
        cleanCount: 0,
        recentActivity: [],
      };
    }

    const totalScore = history.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
    const avgRiskScore = Math.round(totalScore / totalScans);

    let criticalCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    let cleanCount = 0;

    history.forEach((item) => {
      const riskUpper = (item.risk || '').toUpperCase();
      if (riskUpper === 'CRITICAL') criticalCount++;
      else if (riskUpper === 'HIGH') highCount++;
      else if (riskUpper === 'MODERATE' || riskUpper === 'MEDIUM') moderateCount++;
      else cleanCount++;
    });

    return {
      totalScans,
      avgRiskScore,
      criticalCount,
      highCount,
      moderateCount,
      cleanCount,
      recentActivity: history.slice(0, 5),
    };
  }

  clearCustomerHistory(customerId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const countBefore = this.memoryStore.scans.length;
    this.memoryStore.scans = this.memoryStore.scans.filter((s) => s.customerId !== custId);
    this.saveToFile();
    return { cleared: countBefore - this.memoryStore.scans.length };
  }

  deleteScan(customerId, scanId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const initialLen = this.memoryStore.scans.length;
    this.memoryStore.scans = this.memoryStore.scans.filter(
      (s) => !(s.customerId === custId && s.id === scanId)
    );
    this.saveToFile();
    return { deleted: this.memoryStore.scans.length < initialLen };
  }
}

export const storageService = new StorageService();
export default storageService;

