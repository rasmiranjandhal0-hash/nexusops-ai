import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Default starter history
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
      customers: {},
      scans: [...DEFAULT_DEMO_HISTORY],
      verifications: [],
      datasets: [],
      datasetRecords: [],
      notifications: [],
      auditLogs: [],
    };

    this.initFileStore();
    this.ensureSeedAccounts();
  }

  initFileStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.memoryStore = {
            customers: parsed.customers || {},
            scans: Array.isArray(parsed.scans) ? parsed.scans : [...DEFAULT_DEMO_HISTORY],
            verifications: Array.isArray(parsed.verifications) ? parsed.verifications : [],
            datasets: Array.isArray(parsed.datasets) ? parsed.datasets : [],
            datasetRecords: Array.isArray(parsed.datasetRecords) ? parsed.datasetRecords : [],
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
            auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
          };
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

  ensureSeedAccounts() {
    // 1. Seed Demo Operator
    if (!this.memoryStore.customers['demo@privacyguard.ai']) {
      const demoHash = bcrypt.hashSync('DemoPass123!', 12);
      this.memoryStore.customers['demo@privacyguard.ai'] = {
        id: 'demo@privacyguard.ai',
        email: 'demo@privacyguard.ai',
        name: 'Lead Security Officer (Demo)',
        role: 'user',
        passwordHash: demoHash,
        organization: 'NexusOps Global Defense',
        createdAt: new Date().toISOString(),
      };
    }

    // 2. Seed Enterprise Administrator
    if (!this.memoryStore.customers['admin@nexusops.ai']) {
      const adminHash = bcrypt.hashSync('AdminPass2026!', 12);
      this.memoryStore.customers['admin@nexusops.ai'] = {
        id: 'admin@nexusops.ai',
        email: 'admin@nexusops.ai',
        name: 'Principal Security Admin',
        role: 'admin',
        passwordHash: adminHash,
        organization: 'NexusOps AI Security Operations',
        createdAt: new Date().toISOString(),
      };
    }

    this.saveToFile();
  }

  // --- Customer / User Management ---
  findCustomer(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return this.memoryStore.customers[normalized] || null;
  }

  verifyPassword(candidatePassword, storedHash) {
    if (!storedHash) return false;
    // Check if it's a bcrypt hash
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
      return bcrypt.compareSync(candidatePassword, storedHash);
    }
    // Backward compatibility for unhashed demo pass
    return candidatePassword === storedHash;
  }

  registerCustomer(email, name, password, role = 'user') {
    if (!email) throw new Error('Email is required');
    const normalized = email.trim().toLowerCase();

    if (this.memoryStore.customers[normalized]) {
      return this.memoryStore.customers[normalized];
    }

    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(password || 'default_sec_pass_2026', salt);

    const newCustomer = {
      id: normalized,
      email: normalized,
      name: name?.trim() || normalized.split('@')[0],
      role: role === 'admin' ? 'admin' : 'user',
      passwordHash,
      organization: 'Independent Security Operations',
      createdAt: new Date().toISOString(),
    };

    this.memoryStore.customers[normalized] = newCustomer;
    this.logAudit(normalized, 'USER_REGISTERED', normalized, { name: newCustomer.name, role: newCustomer.role });
    this.saveToFile();
    return newCustomer;
  }

  getAllUsers() {
    return Object.values(this.memoryStore.customers).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      organization: u.organization,
      createdAt: u.createdAt,
    }));
  }

  // --- Scan Telemetry Management ---
  saveScan(customerId, scanRecord) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();

    if (!this.memoryStore.customers[custId]) {
      this.registerCustomer(custId, custId.split('@')[0], 'auto_gen');
    }

    const record = {
      ...scanRecord,
      customerId: custId,
      timestamp: scanRecord.timestamp || new Date().toISOString(),
    };

    this.memoryStore.scans.unshift(record);
    this.logAudit(custId, 'PRIVACY_SCAN_EXECUTED', record.id, {
      risk: record.risk,
      score: record.score,
      categories: record.categories,
    });

    if (record.score >= 80) {
      this.addNotification(custId, {
        title: 'Critical Exposure Detected',
        message: `High risk score (${record.score}/100) identified in ${record.title}. Immediate containment required.`,
        level: 'CRITICAL',
        targetId: record.id,
      });
    }

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
    this.logAudit(custId, 'LEDGER_CLEARED', custId, { deletedCount: countBefore - this.memoryStore.scans.length });
    this.saveToFile();
    return { cleared: countBefore - this.memoryStore.scans.length };
  }

  deleteScan(customerId, scanId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const initialLen = this.memoryStore.scans.length;
    this.memoryStore.scans = this.memoryStore.scans.filter(
      (s) => !(s.customerId === custId && s.id === scanId)
    );
    this.logAudit(custId, 'RECORD_DELETED', scanId, {});
    this.saveToFile();
    return { deleted: this.memoryStore.scans.length < initialLen };
  }

  // --- Multi-Vector Verification Storage ---
  saveVerification(customerId, verificationRecord) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const record = {
      ...verificationRecord,
      customerId: custId,
      timestamp: verificationRecord.timestamp || new Date().toISOString(),
    };
    this.memoryStore.verifications.unshift(record);
    this.logAudit(custId, `VERIFICATION_${record.type?.toUpperCase() || 'GENERAL'}`, record.id, {
      target: record.target,
      riskLevel: record.riskLevel,
      score: record.riskScore,
    });

    if (record.riskScore >= 75) {
      this.addNotification(custId, {
        title: `High Threat Flagged (${record.type})`,
        message: `Verification for "${record.target}" flagged risk score ${record.riskScore}/100.`,
        level: 'HIGH',
        targetId: record.id,
      });
    }

    this.saveToFile();
    return record;
  }

  getVerifications(customerId, type = null) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    return this.memoryStore.verifications.filter(
      (v) => v.customerId === custId && (!type || v.type === type)
    );
  }

  getVerificationById(id) {
    return this.memoryStore.verifications.find((v) => v.id === id) || null;
  }

  // --- Dataset & File Processing Storage ---
  saveDataset(customerId, dataset) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const record = {
      ...dataset,
      customerId: custId,
      isPublished: dataset.isPublished || false,
      createdAt: dataset.createdAt || new Date().toISOString(),
    };
    this.memoryStore.datasets.unshift(record);
    this.logAudit(custId, 'DATASET_UPLOADED', record.id, {
      filename: record.filename,
      rowCount: record.rowCount,
      fileSize: record.fileSize,
    });
    this.saveToFile();
    return record;
  }

  saveDatasetRecords(datasetId, records) {
    const tagged = records.map((r, idx) => ({
      ...r,
      datasetId,
      rowIndex: idx + 1,
    }));
    this.memoryStore.datasetRecords = this.memoryStore.datasetRecords.concat(tagged);
    this.saveToFile();
    return tagged;
  }

  getCustomerDatasets(customerId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    return this.memoryStore.datasets.filter((d) => d.customerId === custId);
  }

  getDatasetById(datasetId) {
    return this.memoryStore.datasets.find((d) => d.id === datasetId) || null;
  }

  getDatasetRecords(datasetId) {
    return this.memoryStore.datasetRecords.filter((r) => r.datasetId === datasetId);
  }

  toggleDatasetPublication(customerId, datasetId, isPublished) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const dataset = this.memoryStore.datasets.find(
      (d) => d.id === datasetId && d.customerId === custId
    );
    if (!dataset) return null;
    dataset.isPublished = Boolean(isPublished);
    dataset.publishedAt = isPublished ? new Date().toISOString() : null;
    this.logAudit(custId, isPublished ? 'DATASET_PUBLISHED' : 'DATASET_UNPUBLISHED', datasetId, {});
    this.saveToFile();
    return dataset;
  }

  getPublishedDatasets() {
    return this.memoryStore.datasets.filter((d) => d.isPublished === true);
  }

  deleteDataset(customerId, datasetId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    this.memoryStore.datasets = this.memoryStore.datasets.filter(
      (d) => !(d.id === datasetId && d.customerId === custId)
    );
    this.memoryStore.datasetRecords = this.memoryStore.datasetRecords.filter(
      (r) => r.datasetId !== datasetId
    );
    this.logAudit(custId, 'DATASET_DELETED', datasetId, {});
    this.saveToFile();
    return true;
  }

  // --- Notifications ---
  addNotification(customerId, { title, message, level = 'INFO', targetId = null }) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const notif = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: custId,
      title,
      message,
      level,
      targetId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.memoryStore.notifications.unshift(notif);
    this.saveToFile();
    return notif;
  }

  getNotifications(customerId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    return this.memoryStore.notifications.filter((n) => n.customerId === custId);
  }

  markNotificationRead(customerId, notifId) {
    const custId = (customerId || 'demo@privacyguard.ai').trim().toLowerCase();
    const notif = this.memoryStore.notifications.find(
      (n) => n.id === notifId && n.customerId === custId
    );
    if (notif) {
      notif.read = true;
      this.saveToFile();
    }
    return notif;
  }

  // --- Audit Logging ---
  logAudit(userId, action, targetId = null, details = {}) {
    const log = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: (userId || 'system').trim().toLowerCase(),
      action,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.memoryStore.auditLogs.unshift(log);
    // Keep max 1000 audit logs
    if (this.memoryStore.auditLogs.length > 1000) {
      this.memoryStore.auditLogs = this.memoryStore.auditLogs.slice(0, 1000);
    }
    this.saveToFile();
    return log;
  }

  getAuditLogs(customerId = null, isAdmin = false) {
    if (isAdmin) {
      return this.memoryStore.auditLogs;
    }
    const custId = (customerId || '').trim().toLowerCase();
    return this.memoryStore.auditLogs.filter((a) => a.userId === custId);
  }
}

export const storageService = new StorageService();
export default storageService;
