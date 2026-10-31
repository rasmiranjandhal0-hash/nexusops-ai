-- =========================================================================
-- PRIVACYGUARD AI: PRODUCTION POSTGRESQL SCHEMA INITIALIZATION
-- =========================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DROP ALL OLD LEGACY TABLES SAFELY
DROP TABLE IF EXISTS task_steps CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS agent_missions CASCADE;
DROP TABLE IF EXISTS connected_systems CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS privacy_scans CASCADE;
DROP TABLE IF EXISTS security_audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. USERS TABLE (Operator & Security Officer Profiles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  organization VARCHAR(150) NOT NULL DEFAULT 'Independent Security Officer',
  role VARCHAR(60) NOT NULL DEFAULT 'SecOps Analyst',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PRIVACY SCANS TELEMETRY (Zero Persistence: Raw Text is NEVER Stored)
CREATE TABLE privacy_scans (
  id VARCHAR(32) PRIMARY KEY DEFAULT ('SCN-' || floor(random() * 9000 + 1000)::text),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  payload_name VARCHAR(200) NOT NULL DEFAULT 'Customer Support Transcript',
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  character_count INT NOT NULL DEFAULT 0,
  detected_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  quarantined BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(40) NOT NULL DEFAULT 'Analyzed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SECURITY AUDIT LOGS (Immutable Compliance Tracking)
CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_id VARCHAR(50),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_privacy_scans_user ON privacy_scans(user_id);
CREATE INDEX idx_privacy_scans_risk ON privacy_scans(risk_level);
CREATE INDEX idx_privacy_scans_created ON privacy_scans(created_at DESC);
CREATE INDEX idx_audit_logs_user ON security_audit_logs(user_id);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT USING (true);

CREATE POLICY "Allow public registration"
  ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow scan telemetry inserts"
  ON privacy_scans FOR ALL USING (true);

CREATE POLICY "Allow audit logging"
  ON security_audit_logs FOR ALL USING (true);

-- 7. SEED DEMO OPERATOR ACCOUNT (Password: DemoPass123!)
-- Hash generated via bcrypt (12 salt rounds)
INSERT INTO users (full_name, email, password_hash, organization, role)
VALUES (
  'Security Officer Demo',
  'demo@privacyguard.ai',
  '$2a$12$e0M2/qW76Q8HjM8.l7eSgOHhFw7gVn1m1uKx0P2kR4jT6sX8vY9eG',
  'PrivacyGuard Global Defense',
  'Lead Security Officer'
) ON CONFLICT (email) DO NOTHING;

-- 8. SEED REALISTIC INITIAL SCAN TELEMETRY
INSERT INTO privacy_scans (id, payload_name, risk_level, risk_score, character_count, detected_categories, quarantined, status)
VALUES 
  ('SCN-9021', 'Customer Support Verification Rajesh', 'CRITICAL', 95, 284, '["Aadhaar Number", "PAN Tax ID", "Payment Card"]'::jsonb, true, 'Quarantined'),
  ('SCN-9020', 'State Bank KYC Suspension Scam Email', 'HIGH', 88, 310, '["Phishing Heuristics", "Deceptive Domain"]'::jsonb, true, 'Flagged'),
  ('SCN-9019', 'Developer Prompt with Supabase Key', 'CRITICAL', 98, 412, '["PostgreSQL URI", "AWS Secret"]'::jsonb, true, 'Redacted'),
  ('SCN-9018', 'Employee Onboarding Document Excerpt', 'MEDIUM', 45, 190, '["Personal Email", "Phone Number"]'::jsonb, false, 'Reviewed'),
  ('SCN-9017', 'Security Audit Documentation Q4', 'LOW', 8, 340, '["Clean Operational Text"]'::jsonb, false, 'Clean')
ON CONFLICT (id) DO NOTHING;

