import { z } from 'zod';

// 1. User Registration Schema
export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(120),
  email: z.string().email('Valid enterprise email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  organization_name: z.string().min(2).max(150).optional().default('Nexus Enterprise Ops'),
  role: z.string().min(2).max(60).optional().default('Systems Architect'),
});

// 2. User Login Schema
export const loginSchema = z.object({
  email: z.string().email('Valid enterprise email is required'),
  password: z.string().min(1, 'Password is required'),
});

// 3. Workspace Creation Schema
export const workspaceCreateSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters').max(140),
  department: z.string().min(2, 'Department is required').max(100),
  description: z.string().max(500).optional().default(''),
  default_governance_mode: z
    .enum(['AUTONOMOUS', 'HITL_GOVERNED', 'DRY_RUN_SIMULATION'])
    .default('HITL_GOVERNED'),
});

// 4. Connected System Schema
export const systemCreateSchema = z.object({
  system_name: z.string().min(2, 'System name is required').max(120),
  system_type: z.enum([
    'ERP',
    'CRM',
    'ITSM',
    'FINOPS',
    'HRIS',
    'LOGISTICS',
    'MESSAGING',
    'CLOUD_INFRA',
  ]),
  endpoint_reference: z.string().min(3, 'Endpoint reference or URL is required').max(255),
  status: z.enum(['HEALTHY', 'DEGRADED', 'MAINTENANCE']).default('HEALTHY'),
  sla_target_minutes: z.coerce.number().int().min(1).max(10080).default(30),
});

// 5. Mission Intake Schema
export const missionIntakeSchema = z.object({
  workspace_id: z.string().uuid('Valid workspace UUID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(160),
  domain: z.enum([
    'SUPPLY_CHAIN_OPS',
    'ITSM_INCIDENT_RESPONSE',
    'CUSTOMER_SLA_TRIAGE',
    'FINOPS_RECONCILIATION',
    'HR_ONBOARDING_ACCESS',
    'REVENUE_OPS_PIPELINE',
  ]),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
  execution_mode: z
    .enum(['AUTONOMOUS', 'HITL_GOVERNED', 'DRY_RUN_SIMULATION'])
    .default('HITL_GOVERNED'),
  trigger_context: z
    .string()
    .min(20, 'Please provide sufficient operational context (minimum 20 characters)')
    .max(2500),
  involved_systems: z
    .array(z.string().min(1))
    .min(1, 'Select at least one enterprise system')
    .max(8),
  constraints_config: z.object({
    maxBudgetUsd: z.coerce.number().min(0).default(1000),
    targetSlaMinutes: z.coerce.number().int().min(1).default(60),
    complianceStrictness: z.enum(['STANDARD', 'STRICT', 'REGULATED']).default('STANDARD'),
  }),
});

// 6. Gemini AI Mission Response Zod Schema
export const aiMissionResponseZodSchema = z.object({
  executive_summary: z.string().min(10),
  root_cause_diagnosis: z.object({
    primary_bottleneck: z.string(),
    fragmentation_impact: z.string(),
    affected_kpi: z.string(),
  }),
  confidence_score: z.number().int().min(0).max(100),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  estimated_manual_minutes: z.number().int().min(0),
  autonomous_execution_seconds: z.number().int().min(0),
  estimated_cost_savings_usd: z.number().min(0),
  decision_matrix: z.array(
    z.object({
      option_name: z.string(),
      pros: z.string(),
      cons: z.string(),
      estimated_cost_usd: z.number(),
      sla_impact_minutes: z.number().int(),
      is_selected: z.boolean(),
      selection_rationale: z.string(),
    })
  ).min(2),
  decomposed_tasks: z.array(
    z.object({
      step_order: z.number().int(),
      agent_role: z.enum([
        'PlannerAgent',
        'PolicyReasonerAgent',
        'SystemExecutorAgent',
        'CommunicationAgent',
        'ComplianceAuditorAgent',
      ]),
      task_title: z.string(),
      target_system: z.string(),
      action_type: z.enum([
        'API_MUTATION',
        'DATA_RECONCILIATION',
        'WORKFLOW_DISPATCH',
        'STAKEHOLDER_ALERT',
        'POLICY_CHECK',
        'ROLLBACK_EXECUTION',
      ]),
      reasoning_rationale: z.string(),
      execution_payload_json: z.string(),
      requires_human_approval: z.boolean(),
      verification_criteria: z.string(),
    })
  ).min(3),
  cross_system_synergy_notes: z.array(z.string()).default([]),
  continuous_improvement_advisory: z.array(z.string()).default([]),
  governance_disclaimer: z.string(),
});

// 7. Dynamic Re-Planning Schema
export const replanSchema = z.object({
  failure_reason: z
    .string()
    .min(10, 'Please state the failure symptom or new constraint (minimum 10 characters)')
    .max(1000),
  updated_max_budget_usd: z.coerce.number().min(0).default(2500),
});
