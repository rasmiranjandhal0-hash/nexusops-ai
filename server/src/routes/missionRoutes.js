import express from 'express';
import db from '../db/store.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { missionIntakeSchema, replanSchema } from '../validators/schemas.js';
import { orchestrateMission, replanMission } from '../services/geminiAgentService.js';

const router = express.Router();

router.use(requireAuth);

// POST /api/missions/orchestrate
router.post('/orchestrate', async (req, res, next) => {
  try {
    const input = missionIntakeSchema.parse(req.body);

    const workspace = await db.findWorkspaceById(input.workspace_id, req.user.id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Target workspace not found or unauthorized for this user.',
      });
    }

    // Call Gemini 4-agent orchestration engine
    const aiBlueprint = await orchestrateMission({ input, workspace });

    // Determine initial task statuses and overall mission status
    let hasHitlApprovalGate = false;
    const tasksToInsert = aiBlueprint.decomposed_tasks.map((task) => {
      let taskStatus = 'EXECUTED';
      let parsedPayload = {};

      try {
        parsedPayload = JSON.parse(task.execution_payload_json);
      } catch (e) {
        parsedPayload = { raw: task.execution_payload_json };
      }

      if (input.execution_mode === 'HITL_GOVERNED' && task.requires_human_approval) {
        taskStatus = 'AWAITING_APPROVAL';
        hasHitlApprovalGate = true;
      } else if (input.execution_mode === 'DRY_RUN_SIMULATION') {
        taskStatus = 'EXECUTED';
      }

      return {
        step_order: task.step_order,
        agent_role: task.agent_role,
        task_title: task.task_title,
        target_system: task.target_system,
        action_type: task.action_type,
        reasoning_rationale: task.reasoning_rationale,
        execution_payload: parsedPayload,
        requires_human_approval: task.requires_human_approval,
        task_status: taskStatus,
        verification_criteria: task.verification_criteria,
      };
    });

    const missionStatus = hasHitlApprovalGate ? 'AWAITING_HITL' : 'COMPLETED';

    const missionData = {
      user_id: req.user.id,
      workspace_id: workspace.id,
      title: input.title,
      domain: input.domain,
      urgency: input.urgency,
      execution_mode: input.execution_mode,
      trigger_context: input.trigger_context,
      involved_systems: input.involved_systems,
      constraints_config: input.constraints_config,
      status: missionStatus,
      confidence_score: aiBlueprint.confidence_score,
      risk_level: aiBlueprint.risk_level,
      estimated_manual_minutes: aiBlueprint.estimated_manual_minutes,
      autonomous_execution_seconds: aiBlueprint.autonomous_execution_seconds,
      estimated_cost_savings_usd: aiBlueprint.estimated_cost_savings_usd,
      ai_analysis_payload: aiBlueprint,
    };

    const initialAuditLogs = [
      {
        actor_type: 'SYSTEM',
        actor_name: 'NexusOps Ingestion Bus',
        event_action: 'MISSION_TRIGGER_RECEIVED',
        event_details: `Operational trigger submitted for domain ${input.domain} in workspace "${workspace.name}" with urgency ${input.urgency}.`,
      },
      {
        actor_type: 'AI_AGENT',
        actor_name: 'PlannerAgent',
        event_action: 'DAG_DECOMPOSITION_COMPLETE',
        event_details: `Decomposed business goal into ${tasksToInsert.length} dependency-aware execution steps across systems: ${input.involved_systems.join(', ')}.`,
      },
      {
        actor_type: 'AI_AGENT',
        actor_name: 'PolicyReasonerAgent',
        event_action: 'POLICY_EVALUATION_CONCLUDED',
        event_details: `Evaluated 3 strategic options. Selected optimal strategy with confidence score ${aiBlueprint.confidence_score}%. Risk level: ${aiBlueprint.risk_level}.`,
      },
      {
        actor_type: 'AI_AGENT',
        actor_name: 'SystemExecutorAgent',
        event_action: hasHitlApprovalGate ? 'PAUSED_AT_HITL_GATE' : 'AUTONOMOUS_PAYLOADS_DISPATCHED',
        event_details: hasHitlApprovalGate
          ? 'High-impact financial or production mutation flagged for operator sign-off before downstream execution.'
          : 'All concrete cross-system API payloads and webhooks successfully synthesized and committed.',
      },
      {
        actor_type: 'AI_AGENT',
        actor_name: 'ComplianceAuditorAgent',
        event_action: 'GOVERNANCE_AUDIT_SEALED',
        event_details: `Estimated manual time saved: ${aiBlueprint.estimated_manual_minutes} minutes. Projected cost savings: $${aiBlueprint.estimated_cost_savings_usd} USD.`,
      },
    ];

    const createdMission = await db.createMission(missionData, tasksToInsert, initialAuditLogs);

    return res.status(201).json({
      success: true,
      message: 'Autonomous multi-agent mission orchestrated successfully',
      mission: createdMission,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/missions
router.get('/', async (req, res, next) => {
  try {
    const { domain, status, search } = req.query;
    const missions = await db.getMissionsByUserId(req.user.id, { domain, status, search });
    return res.json({
      success: true,
      missions,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/missions/:id
router.get('/:id', async (req, res, next) => {
  try {
    const mission = await db.getMissionById(req.params.id, req.user.id);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found or unauthorized to view',
      });
    }
    return res.json({
      success: true,
      mission,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/missions/:id/tasks/:taskId/decision (HITL human approval endpoint)
router.patch('/:id/tasks/:taskId/decision', async (req, res, next) => {
  try {
    const { id: missionId, taskId } = req.params;
    const { decision, notes } = req.body;

    if (!['APPROVE', 'SKIP'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid decision: Must be either APPROVE or SKIP',
      });
    }

    const updatedTask = await db.updateTaskDecision(missionId, taskId, req.user.id, decision, notes);

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or unauthorized to approve',
      });
    }

    const refreshedMission = await db.getMissionById(missionId, req.user.id);

    return res.json({
      success: true,
      message: `Task successfully ${decision === 'APPROVE' ? 'approved and executed' : 'skipped'}`,
      task: updatedTask,
      mission: refreshedMission,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/missions/:id/replan (AI Self-Healing Re-Planner)
router.post('/:id/replan', async (req, res, next) => {
  try {
    const { id: missionId } = req.params;
    const replanInput = replanSchema.parse(req.body);

    const mission = await db.getMissionById(missionId, req.user.id);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found or unauthorized to re-plan',
      });
    }

    // Invoke Gemini self-healing engine
    const replanResult = await replanMission({ mission, replanInput });

    await db.replanMissionTasks(missionId, req.user.id, {
      updated_tasks: replanResult.updated_tasks,
      new_summary: replanResult.new_summary,
      failure_reason: replanInput.failure_reason,
      updated_max_budget_usd: replanInput.updated_max_budget_usd,
    });

    const refreshedMission = await db.getMissionById(missionId, req.user.id);

    return res.json({
      success: true,
      message: 'Autonomous self-healing re-planning completed successfully',
      mission: refreshedMission,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/missions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id: missionId } = req.params;
    const deleted = await db.deleteMission(missionId, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found or unauthorized to delete',
      });
    }

    return res.json({
      success: true,
      message: 'Mission and related task records deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
