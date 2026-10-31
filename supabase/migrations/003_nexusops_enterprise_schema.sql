-- =========================================================================
-- NEXUSOPS AI / PRIVACYGUARD AI: ENTERPRISE DATABASE SCHEMA MIGRATION 003
-- Comprehensive Multi-Tenant Security, Verification & Audit Infrastructure
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Security Officers & Enterprise Operators)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('visitor', 'user', 'admin')),
  organization VARCHAR(200) NOT NULL DEFAULT 'Independent Security Officer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DATASETS (Ingested file collections)
CREATE TABLE IF NOT EXISTS datasets (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  row_count INTEGER NOT NULL DEFAULT 0,
  column_count INTEGER NOT NULL DEFAULT 0,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_quality_score INTEGER NOT NULL CHECK (data_quality_score BETWEEN 0 AND 100),
  risk_level VARCHAR(30) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. UPLOADED_FILES (File storage reference tracking)
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id VARCHAR(64) REFERENCES datasets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  sha256_checksum VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROCESSED_RECORDS (Structured dataset records & row validation status)
CREATE TABLE IF NOT EXISTS processed_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id VARCHAR(64) NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  record_data JSONB NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(40) NOT NULL DEFAULT 'VALID',
  detected_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. VERIFICATION_REQUESTS (Multi-vector verification inputs)
CREATE TABLE IF NOT EXISTS verification_requests (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verification_type VARCHAR(40) NOT NULL CHECK (verification_type IN ('URL', 'EMAIL', 'PHONE', 'DOCUMENT', 'PRIVACY_SCAN')),
  target_hash VARCHAR(64),
  status VARCHAR(40) NOT NULL DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VERIFICATION_RESULTS (Structured explainable outcomes)
CREATE TABLE IF NOT EXISTS verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(64) NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
  risk_level VARCHAR(30) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'INSUFFICIENT DATA')),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  detected_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  supporting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_source VARCHAR(80) NOT NULL,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FRAUD_INDICATORS (Known indicator dictionary & heuristics)
CREATE TABLE IF NOT EXISTS fraud_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  severity VARCHAR(30) NOT NULL CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  description TEXT NOT NULL,
  regex_pattern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RISK_REPORTS (Compliance & risk assessment exports)
CREATE TABLE IF NOT EXISTS risk_reports (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_title VARCHAR(200) NOT NULL,
  export_format VARCHAR(20) NOT NULL CHECK (export_format IN ('PDF', 'CSV', 'JSON')),
  summary_stats JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICATIONS (User and system security alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  alert_level VARCHAR(30) NOT NULL DEFAULT 'INFO' CHECK (alert_level IN ('INFO', 'HIGH', 'CRITICAL')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  target_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT_LOGS (Immutable compliance tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_id VARCHAR(64),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. DATASET_PUBLICATIONS (Public verification catalog)
CREATE TABLE IF NOT EXISTS dataset_publications (
  id VARCHAR(64) PRIMARY KEY,
  dataset_id VARCHAR(64) NOT NULL UNIQUE REFERENCES datasets(id) ON DELETE CASCADE,
  public_token VARCHAR(128) NOT NULL UNIQUE,
  published_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- =========================================================================
-- PERFORMANCE INDEXES
-- =========================================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_datasets_user ON datasets(user_id);
CREATE INDEX idx_datasets_published ON datasets(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_processed_records_dataset ON processed_records(dataset_id);
CREATE INDEX idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX idx_verification_results_request ON verification_results(request_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- =========================================================================
-- STRICT ROW-LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_publications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users access only their own profile; Admins access all
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Datasets: Users manage own datasets; Public can read published datasets
CREATE POLICY "Users manage own datasets"
  ON datasets FOR ALL
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Public read published datasets"
  ON datasets FOR SELECT
  USING (is_published = TRUE);

-- Processed Records: Access granted through dataset ownership or publication
CREATE POLICY "Users read own dataset records"
  ON processed_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM datasets
      WHERE datasets.id = processed_records.dataset_id
      AND (datasets.user_id = auth.uid() OR datasets.is_published = TRUE)
    )
  );

-- Notifications: Strictly private to recipient
CREATE POLICY "Users access own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- Audit Logs: Read-only access to own logs; Admins read all
CREATE POLICY "Users view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "System insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);
