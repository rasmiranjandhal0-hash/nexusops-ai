-- =========================================================================
-- NEXUSOPS AI: PRODUCTION POSTGRESQL SCHEMA INITIALIZATION
-- =========================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE (JWT + bcrypt Authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  organization_name VARCHAR(150) NOT NULL DEFAULT 'Nexus Enterprise Ops',
  role VARCHAR(60) NOT NULL DEFAULT 'Systems Architect',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WORKSPACES TABLE (Business Units / Environments)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(140) NOT NULL,
  department VARCHAR(100) NOT NULL,
  description TEXT,
  default_governance_mode VARCHAR(40) NOT NULL DEFAULT 'HITL_GOVERNED'
    CHECK (default_governance_mode IN ('AUTONOMOUS', 'HITL_GOVERNED', 'DRY_RUN_SIMULATION')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CONNECTED_SYSTEMS TABLE (Fragmented Enterprise Systems Registry)
CREATE TABLE IF NOT EXISTS connected_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system_name VARCHAR(120) NOT NULL,
  system_type VARCHAR(60) NOT NULL
    CHECK (system_type IN ('ERP', 'CRM', 'ITSM', 'FINOPS', 'HRIS', 'LOGISTICS', 'MESSAGING', 'CLOUD_INFRA')),
  endpoint_reference VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY'
    CHECK (status IN ('HEALTHY', 'DEGRADED', 'MAINTENANCE')),
  sla_target_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. AGENT_MISSIONS TABLE (Core Autonomous Orchestration Runs)
CREATE TABLE IF NOT EXISTS agent_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  domain VARCHAR(60) NOT NULL
    CHECK (domain IN (
      'SUPPLY_CHAIN_OPS',
      'ITSM_INCIDENT_RESPONSE',
      'CUSTOMER_SLA_TRIAGE',
      'FINOPS_RECONCILIATION',
      'HR_ONBOARDING_ACCESS',
      'REVENUE_OPS_PIPELINE'
    )),
  urgency VARCHAR(20) NOT NULL DEFAULT 'HIGH'
    CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  execution_mode VARCHAR(30) NOT NULL DEFAULT 'HITL_GOVERNED'
    CHECK (execution_mode IN ('AUTONOMOUS', 'HITL_GOVERNED', 'DRY_RUN_SIMULATION')),
  trigger_context TEXT NOT NULL,
  involved_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(40) NOT NULL DEFAULT 'COMPLETED'
    CHECK (status IN ('PLANNING', 'AWAITING_HITL', 'COMPLETED', 'REPLANNING', 'FAILED')),
  confidence_score INTEGER NOT NULL DEFAULT 88 CHECK (confidence_score BETWEEN 0 AND 100),
  risk_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
    CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  estimated_manual_minutes INTEGER NOT NULL DEFAULT 180,
  autonomous_execution_seconds INTEGER NOT NULL DEFAULT 42,
  estimated_cost_savings_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  ai_analysis_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MISSION_TASKS TABLE (Decomposed Multi-Agent DAG Steps)
CREATE TABLE IF NOT EXISTS mission_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES agent_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  agent_role VARCHAR(80) NOT NULL,
  task_title VARCHAR(180) NOT NULL,
  target_system VARCHAR(120) NOT NULL,
  action_type VARCHAR(80) NOT NULL,
  reasoning_rationale TEXT NOT NULL,
  execution_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  requires_human_approval BOOLEAN NOT NULL DEFAULT FALSE,
  task_status VARCHAR(40) NOT NULL DEFAULT 'EXECUTED'
    CHECK (task_status IN ('PENDING', 'AWAITING_APPROVAL', 'APPROVED_EXECUTED', 'EXECUTED', 'FAILED', 'SKIPPED')),
  verification_criteria TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MISSION_AUDIT_LOGS TABLE (Immutable Traceability & Governance Trail)
CREATE TABLE IF NOT EXISTS mission_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES agent_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_type VARCHAR(40) NOT NULL CHECK (actor_type IN ('SYSTEM', 'AI_AGENT', 'HUMAN_OPERATOR')),
  actor_name VARCHAR(100) NOT NULL,
  event_action VARCHAR(120) NOT NULL,
  event_details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_systems_workspace_id ON connected_systems(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_missions_user_id ON agent_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_missions_workspace_id ON agent_missions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_missions_domain ON agent_missions(domain);
CREATE INDEX IF NOT EXISTS idx_mission_tasks_mission_id ON mission_tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_audit_logs_mission_id ON mission_audit_logs(mission_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_audit_logs ENABLE ROW LEVEL SECURITY;

-- SERVICE ROLE POLICIES (Full administrative bypass for backend application connection)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_users') THEN
    CREATE POLICY service_role_all_users ON users FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_workspaces') THEN
    CREATE POLICY service_role_all_workspaces ON workspaces FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_connected_systems') THEN
    CREATE POLICY service_role_all_connected_systems ON connected_systems FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_agent_missions') THEN
    CREATE POLICY service_role_all_agent_missions ON agent_missions FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_mission_tasks') THEN
    CREATE POLICY service_role_all_mission_tasks ON mission_tasks FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_mission_audit_logs') THEN
    CREATE POLICY service_role_all_mission_audit_logs ON mission_audit_logs FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
END $$;
