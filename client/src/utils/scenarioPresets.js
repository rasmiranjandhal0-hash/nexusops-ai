export const SCENARIO_PRESETS = [
  {
    id: 'supply-chain-stockout',
    title: 'Port Congestion Semiconductor Stockout Recovery',
    tag: 'Supply Chain Ops',
    domain: 'SUPPLY_CHAIN_OPS',
    urgency: 'CRITICAL',
    execution_mode: 'HITL_GOVERNED',
    involved_systems: ['SAP S/4HANA Inventory ERP', 'Pacific Freight TMS', 'Supplier Portal Gateway'],
    constraints_config: {
      maxBudgetUsd: 15000,
      targetSlaMinutes: 45,
      complianceStrictness: 'STRICT',
    },
    trigger_context:
      'Severe port congestion at Long Beach has stalled shipment BATCH-9918 containing 5,000 units of SKU-402-SEMICONDUCTOR. Current factory inventory will deplete in 36 hours, risking a complete manufacturing line shutdown with SLA penalties of $48,000/day. The multi-agent council must evaluate backup tier-2 suppliers in the Pacific Northwest, query availability, synthesize an emergency PO with expedited air-freight, verify pricing within variance limits, and update ERP delivery schedules.',
  },
  {
    id: 'itsm-incident-rollback',
    title: 'Production Payment 502 Spike & Automated Rollback',
    tag: 'ITSM Incident Response',
    domain: 'ITSM_INCIDENT_RESPONSE',
    urgency: 'CRITICAL',
    execution_mode: 'HITL_GOVERNED',
    involved_systems: ['AWS CloudWatch & APM', 'Kubernetes Production Cluster', 'Zendesk Enterprise CRM'],
    constraints_config: {
      maxBudgetUsd: 2500,
      targetSlaMinutes: 15,
      complianceStrictness: 'REGULATED',
    },
    trigger_context:
      'Following deployment of checkout-api v2.4.11 at 10:14 UTC, CloudWatch alarms triggered for P99 latency exceeding 3,400ms and HTTP 502 error rates jumping from 0.02% to 18.7%. Approximately 4,200 checkout sessions are failing. The agent council must correlate container logs, isolate the offending deployment, verify database migration backward compatibility for v2.4.10, prepare an automated canary traffic reroute, and dispatch an incident advisory to Statuspage and engineering leads.',
  },
  {
    id: 'customer-sla-triage',
    title: 'Enterprise Tier-1 Client Duplicate Invoice Dispute',
    tag: 'Customer SLA Triage',
    domain: 'CUSTOMER_SLA_TRIAGE',
    urgency: 'HIGH',
    execution_mode: 'HITL_GOVERNED',
    involved_systems: ['Stripe FinOps Ledger', 'Zendesk Enterprise CRM', 'Salesforce Account DB'],
    constraints_config: {
      maxBudgetUsd: 3000,
      targetSlaMinutes: 30,
      complianceStrictness: 'STANDARD',
    },
    trigger_context:
      'Global enterprise customer Apex Financial (ARR $180,000) escalated Zendesk ticket #ZD-88192 stating their Q3 data egress invoice was billed twice due to a webhook synchronization loop in Stripe, threatening contract termination if not reconciled within 2 hours. The multi-agent council must audit Stripe ledger records, verify usage metrics, calculate SLA courtesy credit compensation, issue a formal credit note, and update the Zendesk ticket with executive apologies.',
  },
  {
    id: 'finops-po-variance',
    title: 'Three-Way Invoice & PO Variance Audit',
    tag: 'FinOps Reconciliation',
    domain: 'FINOPS_RECONCILIATION',
    urgency: 'HIGH',
    execution_mode: 'HITL_GOVERNED',
    involved_systems: ['SAP S/4HANA Inventory ERP', 'Stripe FinOps Ledger', 'AWS CloudWatch & APM'],
    constraints_config: {
      maxBudgetUsd: 5000,
      targetSlaMinutes: 60,
      complianceStrictness: 'REGULATED',
    },
    trigger_context:
      'Accounts Payable flagged cloud vendor invoice INV-2026-CLOUD-99 for $27,940, representing a 15.9% variance against the approved purchase order PO-5521 ($24,100). The agent council must perform three-way matching against actual CloudWatch compute consumption telemetry, identify unreserved burst instances, place an automated freeze on the $3,840 disputed variance while releasing the compliant $24,100 balance, and generate a vendor dispute notice.',
  },
];

export const DOMAIN_OPTIONS = [
  {
    code: 'SUPPLY_CHAIN_OPS',
    label: 'Supply Chain & Inventory Replenishment',
    desc: 'Coordinating ERP stock, backup suppliers, logistics freight, and delivery ETAs.',
  },
  {
    code: 'ITSM_INCIDENT_RESPONSE',
    label: 'IT Operations & Incident Remediation',
    desc: 'Correlating APM telemetry, automated rollbacks, statuspage updates, and triage.',
  },
  {
    code: 'CUSTOMER_SLA_TRIAGE',
    label: 'Customer Escalation & SLA Orchestration',
    desc: 'Diagnosing billing sync errors, issuing credit notes, and de-escalating P1 tickets.',
  },
  {
    code: 'FINOPS_RECONCILIATION',
    label: 'FinOps, Procurement & Invoice Audit',
    desc: 'Three-way PO matching, detecting invoice variances, and escrow hold controls.',
  },
  {
    code: 'HR_ONBOARDING_ACCESS',
    label: 'Cross-System Onboarding & Compliance',
    desc: 'Automating Okta IAM, Workday HRIS profiles, least-privilege roles, and logistics.',
  },
  {
    code: 'REVENUE_OPS_PIPELINE',
    label: 'Revenue Operations & Deal Desk Automation',
    desc: 'Non-standard contract terms, margin sensitivity modeling, and CPQ routing.',
  },
];
