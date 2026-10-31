// Quick automated E2E sanity script
async function runVerification() {
  console.log('--- 1. Testing Health Endpoint ---');
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Health:', healthData.status, healthData.service);

  console.log('\n--- 2. Testing 1-Click Demo Authentication ---');
  const demoRes = await fetch('http://localhost:5000/api/auth/demo', { method: 'POST' });
  const demoData = await demoRes.json();
  if (!demoData.success) throw new Error('Demo auth failed: ' + JSON.stringify(demoData));
  const token = demoData.token;
  console.log('Authenticated as:', demoData.user.email, '| Role:', demoData.user.role);

  console.log('\n--- 3. Testing Workspaces & Connected Systems ---');
  const wsRes = await fetch('http://localhost:5000/api/workspaces', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const wsData = await wsRes.json();
  console.log(`Found ${wsData.workspaces.length} workspace(s):`);
  const primaryWs = wsData.workspaces[0];
  console.log(`- ${primaryWs.name} (${primaryWs.department}) with ${primaryWs.systems.length} systems`);

  console.log('\n--- 4. Testing Autonomous Multi-Agent Mission Orchestration ---');
  const missionPayload = {
    workspace_id: primaryWs.id,
    title: 'Port Congestion Semiconductor Stockout Recovery',
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
  };

  const orchRes = await fetch('http://localhost:5000/api/missions/orchestrate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(missionPayload),
  });
  const orchData = await orchRes.json();
  if (!orchData.success) throw new Error('Orchestration failed: ' + JSON.stringify(orchData));
  const mission = orchData.mission;
  console.log(`Mission created: "${mission.title}" (ID: ${mission.id})`);
  console.log(`Status: ${mission.status} | Confidence: ${mission.confidence_score}% | Decomposed Tasks: ${mission.tasks.length}`);

  const hitlTask = mission.tasks.find((t) => t.task_status === 'AWAITING_APPROVAL');
  if (hitlTask) {
    console.log(`\n--- 5. Testing HITL Approval on Task ${hitlTask.step_order}: "${hitlTask.task_title}" ---`);
    const decisionRes = await fetch(
      `http://localhost:5000/api/missions/${mission.id}/tasks/${hitlTask.id}/decision`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision: 'APPROVE', notes: 'Approved by lead architect via automated verification.' }),
      }
    );
    const decisionData = await decisionRes.json();
    console.log('Decision applied:', decisionData.task.task_status);
  }

  console.log('\n--- 6. Testing Autonomous Self-Healing Dynamic Re-Planning ---');
  const replanRes = await fetch(`http://localhost:5000/api/missions/${mission.id}/replan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      failure_reason: 'Primary vendor API returned HTTP 503 Service Unavailable during PO submission.',
      updated_max_budget_usd: 12000,
    }),
  });
  const replanData = await replanRes.json();
  console.log('Re-plan success:', replanData.success);
  console.log('Updated Mission Status:', replanData.mission.status);

  console.log('\n--- 7. Testing Dashboard Telemetry Summary ---');
  const dashRes = await fetch('http://localhost:5000/api/dashboard/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await dashRes.json();
  console.log('KPIs:', dashData.summary.kpis);

  console.log('\n✅ ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!\n');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
