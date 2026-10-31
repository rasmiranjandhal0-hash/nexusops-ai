import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool, getDbConnectionStatus } from './pool.js';

// In-memory fallback state for when database connection is unavailable
const memoryStore = {
  users: [],
  workspaces: [],
  connected_systems: [],
  agent_missions: [],
  mission_tasks: [],
  mission_audit_logs: [],
};

// Initialize seed data in memory store
async function initMemorySeed() {
  if (memoryStore.users.length === 0) {
    const passwordHash = await bcrypt.hash('NexusOps#2026!', 12);
    const demoUser = {
      id: crypto.randomUUID(),
      full_name: 'Demo Lead Architect',
      email: 'demo@nexusops.ai',
      password_hash: passwordHash,
      organization_name: 'Nexus Global Enterprise',
      role: 'Principal Systems Architect',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(demoUser);

    const demoWorkspace = {
      id: crypto.randomUUID(),
      user_id: demoUser.id,
      name: 'Global Enterprise Operations',
      department: 'Operations & IT Infrastructure',
      description: 'Primary production orchestration hub for cross-departmental operations and incident triage.',
      default_governance_mode: 'HITL_GOVERNED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.workspaces.push(demoWorkspace);

    const systems = [
      {
        id: crypto.randomUUID(),
        workspace_id: demoWorkspace.id,
        user_id: demoUser.id,
        system_name: 'SAP S/4HANA Inventory ERP',
        system_type: 'ERP',
        endpoint_reference: 'https://erp.internal.nexusops.enterprise/api/v2/materials',
        status: 'HEALTHY',
        sla_target_minutes: 30,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        workspace_id: demoWorkspace.id,
        user_id: demoUser.id,
        system_name: 'Zendesk Enterprise CRM',
        system_type: 'CRM',
        endpoint_reference: 'https://nexusops.zendesk.com/api/v2/tickets',
        status: 'HEALTHY',
        sla_target_minutes: 15,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        workspace_id: demoWorkspace.id,
        user_id: demoUser.id,
        system_name: 'AWS CloudWatch & APM',
        system_type: 'ITSM',
        endpoint_reference: 'https://monitoring.us-east-1.amazonaws.com/nexusops-prod',
        status: 'HEALTHY',
        sla_target_minutes: 10,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        workspace_id: demoWorkspace.id,
        user_id: demoUser.id,
        system_name: 'Stripe FinOps Ledger',
        system_type: 'FINOPS',
        endpoint_reference: 'https://api.stripe.com/v1/invoices/reconcile',
        status: 'HEALTHY',
        sla_target_minutes: 45,
        created_at: new Date().toISOString(),
      },
    ];

    memoryStore.connected_systems.push(...systems);
  }
}

initMemorySeed();

export const db = {
  // Query with PostgreSQL pool if online, otherwise fallback to memory
  async query(text, params = []) {
    if (getDbConnectionStatus()) {
      return pool.query(text, params);
    }
    // Return empty rows structure if fallback handles it via service functions
    return { rows: [] };
  },

  // USERS
  async findUserByEmail(email) {
    if (getDbConnectionStatus()) {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      return res.rows[0] || null;
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async findUserById(id) {
    if (getDbConnectionStatus()) {
      const res = await pool.query('SELECT id, full_name, email, organization_name, role, created_at FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    const u = memoryStore.users.find((user) => user.id === id);
    if (!u) return null;
    const { password_hash, ...safeUser } = u;
    return safeUser;
  },

  async createUser({ full_name, email, password_hash, organization_name, role }) {
    if (getDbConnectionStatus()) {
      const res = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, organization_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, full_name, email, organization_name, role, created_at`,
        [full_name, email.toLowerCase().trim(), password_hash, organization_name, role]
      );
      return res.rows[0];
    }
    const newUser = {
      id: crypto.randomUUID(),
      full_name,
      email: email.toLowerCase().trim(),
      password_hash,
      organization_name,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(newUser);
    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  // WORKSPACES
  async getWorkspacesByUserId(userId) {
    if (getDbConnectionStatus()) {
      const res = await pool.query(
        `SELECT w.*, 
          COALESCE(
            json_agg(cs.*) FILTER (WHERE cs.id IS NOT NULL), 
            '[]'
          ) as systems
         FROM workspaces w
         LEFT JOIN connected_systems cs ON cs.workspace_id = w.id
         WHERE w.user_id = $1
         GROUP BY w.id
         ORDER BY w.created_at ASC`,
        [userId]
      );
      return res.rows;
    }
    const userWorkspaces = memoryStore.workspaces.filter((w) => w.user_id === userId);
    return userWorkspaces.map((w) => {
      const systems = memoryStore.connected_systems.filter((cs) => cs.workspace_id === w.id);
      return { ...w, systems };
    });
  },

  async findWorkspaceById(id, userId) {
    if (getDbConnectionStatus()) {
      const res = await pool.query('SELECT * FROM workspaces WHERE id = $1 AND user_id = $2', [id, userId]);
      return res.rows[0] || null;
    }
    return memoryStore.workspaces.find((w) => w.id === id && w.user_id === userId) || null;
  },

  async createWorkspace({ user_id, name, department, description, default_governance_mode }) {
    if (getDbConnectionStatus()) {
      const res = await pool.query(
        `INSERT INTO workspaces (user_id, name, department, description, default_governance_mode)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, name, department, description || '', default_governance_mode || 'HITL_GOVERNED']
      );
      return res.rows[0];
    }
    const newWs = {
      id: crypto.randomUUID(),
      user_id,
      name,
      department,
      description: description || '',
      default_governance_mode: default_governance_mode || 'HITL_GOVERNED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.workspaces.push(newWs);
    return newWs;
  },

  async deleteWorkspace(id, userId) {
    if (getDbConnectionStatus()) {
      const res = await pool.query('DELETE FROM workspaces WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
      return res.rowCount > 0;
    }
    const initialLen = memoryStore.workspaces.length;
    memoryStore.workspaces = memoryStore.workspaces.filter((w) => !(w.id === id && w.user_id === userId));
    memoryStore.connected_systems = memoryStore.connected_systems.filter((cs) => !(cs.workspace_id === id && cs.user_id === userId));
    return memoryStore.workspaces.length < initialLen;
  },

  // CONNECTED SYSTEMS
  async getSystemsByWorkspaceId(workspaceId, userId) {
    if (getDbConnectionStatus()) {
      const res = await pool.query(
        'SELECT * FROM connected_systems WHERE workspace_id = $1 AND user_id = $2 ORDER BY created_at ASC',
        [workspaceId, userId]
      );
      return res.rows;
    }
    return memoryStore.connected_systems.filter((s) => s.workspace_id === workspaceId && s.user_id === userId);
  },

  async createConnectedSystem({ workspace_id, user_id, system_name, system_type, endpoint_reference, status, sla_target_minutes }) {
    if (getDbConnectionStatus()) {
      const res = await pool.query(
        `INSERT INTO connected_systems (workspace_id, user_id, system_name, system_type, endpoint_reference, status, sla_target_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [workspace_id, user_id, system_name, system_type, endpoint_reference, status || 'HEALTHY', sla_target_minutes || 30]
      );
      return res.rows[0];
    }
    const newSys = {
      id: crypto.randomUUID(),
      workspace_id,
      user_id,
      system_name,
      system_type,
      endpoint_reference,
      status: status || 'HEALTHY',
      sla_target_minutes: sla_target_minutes || 30,
      created_at: new Date().toISOString(),
    };
    memoryStore.connected_systems.push(newSys);
    return newSys;
  },

  async deleteConnectedSystem(systemId, userId) {
    if (getDbConnectionStatus()) {
      const res = await pool.query('DELETE FROM connected_systems WHERE id = $1 AND user_id = $2 RETURNING id', [systemId, userId]);
      return res.rowCount > 0;
    }
    const initialLen = memoryStore.connected_systems.length;
    memoryStore.connected_systems = memoryStore.connected_systems.filter((s) => !(s.id === systemId && s.user_id === userId));
    return memoryStore.connected_systems.length < initialLen;
  },

  // AGENT MISSIONS
  async createMission(missionData, tasksData, initialAuditLogs = []) {
    const {
      user_id,
      workspace_id,
      title,
      domain,
      urgency,
      execution_mode,
      trigger_context,
      involved_systems,
      constraints_config,
      status,
      confidence_score,
      risk_level,
      estimated_manual_minutes,
      autonomous_execution_seconds,
      estimated_cost_savings_usd,
      ai_analysis_payload,
    } = missionData;

    if (getDbConnectionStatus()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const missionRes = await client.query(
          `INSERT INTO agent_missions (
            user_id, workspace_id, title, domain, urgency, execution_mode,
            trigger_context, involved_systems, constraints_config, status,
            confidence_score, risk_level, estimated_manual_minutes,
            autonomous_execution_seconds, estimated_cost_savings_usd, ai_analysis_payload
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *`,
          [
            user_id,
            workspace_id,
            title,
            domain,
            urgency,
            execution_mode,
            trigger_context,
            JSON.stringify(involved_systems),
            JSON.stringify(constraints_config),
            status,
            confidence_score,
            risk_level,
            estimated_manual_minutes,
            autonomous_execution_seconds,
            estimated_cost_savings_usd,
            JSON.stringify(ai_analysis_payload),
          ]
        );
        const mission = missionRes.rows[0];

        const savedTasks = [];
        for (const t of tasksData) {
          const taskRes = await client.query(
            `INSERT INTO mission_tasks (
              mission_id, user_id, step_order, agent_role, task_title,
              target_system, action_type, reasoning_rationale, execution_payload,
              requires_human_approval, task_status, verification_criteria
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
              mission.id,
              user_id,
              t.step_order,
              t.agent_role,
              t.task_title,
              t.target_system,
              t.action_type,
              t.reasoning_rationale,
              JSON.stringify(t.execution_payload || {}),
              t.requires_human_approval || false,
              t.task_status || 'EXECUTED',
              t.verification_criteria,
            ]
          );
          savedTasks.push(taskRes.rows[0]);
        }

        const savedLogs = [];
        for (const l of initialAuditLogs) {
          const logRes = await client.query(
            `INSERT INTO mission_audit_logs (
              mission_id, user_id, actor_type, actor_name, event_action, event_details
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [mission.id, user_id, l.actor_type, l.actor_name, l.event_action, l.event_details]
          );
          savedLogs.push(logRes.rows[0]);
        }

        await client.query('COMMIT');
        return { ...mission, tasks: savedTasks, audit_logs: savedLogs };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // Memory store fallback
    const missionId = crypto.randomUUID();
    const newMission = {
      id: missionId,
      user_id,
      workspace_id,
      title,
      domain,
      urgency,
      execution_mode,
      trigger_context,
      involved_systems,
      constraints_config,
      status,
      confidence_score,
      risk_level,
      estimated_manual_minutes,
      autonomous_execution_seconds,
      estimated_cost_savings_usd,
      ai_analysis_payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.agent_missions.push(newMission);

    const savedTasks = tasksData.map((t) => {
      const task = {
        id: crypto.randomUUID(),
        mission_id: missionId,
        user_id,
        step_order: t.step_order,
        agent_role: t.agent_role,
        task_title: t.task_title,
        target_system: t.target_system,
        action_type: t.action_type,
        reasoning_rationale: t.reasoning_rationale,
        execution_payload: t.execution_payload || {},
        requires_human_approval: t.requires_human_approval || false,
        task_status: t.task_status || 'EXECUTED',
        verification_criteria: t.verification_criteria,
        executed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      memoryStore.mission_tasks.push(task);
      return task;
    });

    const savedLogs = initialAuditLogs.map((l) => {
      const log = {
        id: crypto.randomUUID(),
        mission_id: missionId,
        user_id,
        actor_type: l.actor_type,
        actor_name: l.actor_name,
        event_action: l.event_action,
        event_details: l.event_details,
        created_at: new Date().toISOString(),
      };
      memoryStore.mission_audit_logs.push(log);
      return log;
    });

    return { ...newMission, tasks: savedTasks, audit_logs: savedLogs };
  },

  async getMissionsByUserId(userId, { domain, status, search } = {}) {
    if (getDbConnectionStatus()) {
      let query = `
        SELECT m.*, w.name as workspace_name, w.department as workspace_department,
               (SELECT COUNT(*) FROM mission_tasks t WHERE t.mission_id = m.id) as total_tasks,
               (SELECT COUNT(*) FROM mission_tasks t WHERE t.mission_id = m.id AND t.requires_human_approval = true) as hitl_tasks
        FROM agent_missions m
        JOIN workspaces w ON w.id = m.workspace_id
        WHERE m.user_id = $1
      `;
      const params = [userId];
      let pIdx = 2;

      if (domain) {
        query += ` AND m.domain = $${pIdx++}`;
        params.push(domain);
      }
      if (status) {
        query += ` AND m.status = $${pIdx++}`;
        params.push(status);
      }
      if (search) {
        query += ` AND (m.title ILIKE $${pIdx} OR m.trigger_context ILIKE $${pIdx})`;
        params.push(`%${search}%`);
        pIdx++;
      }

      query += ` ORDER BY m.created_at DESC`;
      const res = await pool.query(query, params);
      return res.rows;
    }

    let missions = memoryStore.agent_missions.filter((m) => m.user_id === userId);
    if (domain) missions = missions.filter((m) => m.domain === domain);
    if (status) missions = missions.filter((m) => m.status === status);
    if (search) {
      const s = search.toLowerCase();
      missions = missions.filter((m) => m.title.toLowerCase().includes(s) || m.trigger_context.toLowerCase().includes(s));
    }
    return missions.map((m) => {
      const ws = memoryStore.workspaces.find((w) => w.id === m.workspace_id);
      const tasks = memoryStore.mission_tasks.filter((t) => t.mission_id === m.id);
      return {
        ...m,
        workspace_name: ws ? ws.name : 'Unknown Workspace',
        workspace_department: ws ? ws.department : 'General',
        total_tasks: tasks.length,
        hitl_tasks: tasks.filter((t) => t.requires_human_approval).length,
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getMissionById(missionId, userId) {
    if (getDbConnectionStatus()) {
      const mRes = await pool.query(
        `SELECT m.*, w.name as workspace_name, w.department as workspace_department
         FROM agent_missions m
         JOIN workspaces w ON w.id = m.workspace_id
         WHERE m.id = $1 AND m.user_id = $2`,
        [missionId, userId]
      );
      if (mRes.rows.length === 0) return null;
      const mission = mRes.rows[0];

      const tRes = await pool.query(
        'SELECT * FROM mission_tasks WHERE mission_id = $1 AND user_id = $2 ORDER BY step_order ASC',
        [missionId, userId]
      );
      const lRes = await pool.query(
        'SELECT * FROM mission_audit_logs WHERE mission_id = $1 AND user_id = $2 ORDER BY created_at ASC',
        [missionId, userId]
      );

      return {
        ...mission,
        tasks: tRes.rows,
        audit_logs: lRes.rows,
      };
    }

    const mission = memoryStore.agent_missions.find((m) => m.id === missionId && m.user_id === userId);
    if (!mission) return null;
    const ws = memoryStore.workspaces.find((w) => w.id === mission.workspace_id);
    const tasks = memoryStore.mission_tasks
      .filter((t) => t.mission_id === missionId && t.user_id === userId)
      .sort((a, b) => a.step_order - b.step_order);
    const audit_logs = memoryStore.mission_audit_logs
      .filter((l) => l.mission_id === missionId && l.user_id === userId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return {
      ...mission,
      workspace_name: ws ? ws.name : 'Unknown Workspace',
      workspace_department: ws ? ws.department : 'General',
      tasks,
      audit_logs,
    };
  },

  async updateTaskDecision(missionId, taskId, userId, decision, notes = '') {
    const newStatus = decision === 'APPROVE' ? 'APPROVED_EXECUTED' : 'SKIPPED';
    const actionLabel = decision === 'APPROVE' ? 'APPROVED_BY_HUMAN' : 'SKIPPED_BY_HUMAN';

    if (getDbConnectionStatus()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const taskRes = await client.query(
          `UPDATE mission_tasks 
           SET task_status = $1, executed_at = NOW() 
           WHERE id = $2 AND mission_id = $3 AND user_id = $4 
           RETURNING *`,
          [newStatus, taskId, missionId, userId]
        );
        if (taskRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return null;
        }
        const updatedTask = taskRes.rows[0];

        // Check if all tasks needing approval are resolved
        const remainingRes = await client.query(
          `SELECT COUNT(*) as count FROM mission_tasks 
           WHERE mission_id = $1 AND task_status = 'AWAITING_APPROVAL'`,
          [missionId]
        );
        const remainingAwaiting = parseInt(remainingRes.rows[0].count, 10);

        if (remainingAwaiting === 0) {
          await client.query(
            `UPDATE agent_missions SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`,
            [missionId]
          );
        }

        // Add audit log
        await client.query(
          `INSERT INTO mission_audit_logs (
            mission_id, user_id, actor_type, actor_name, event_action, event_details
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            missionId,
            userId,
            'HUMAN_OPERATOR',
            'Operator HITL Gate',
            actionLabel,
            `Task '${updatedTask.task_title}' ${decision === 'APPROVE' ? 'approved and executed' : 'skipped'}. ${notes ? `Operator note: ${notes}` : ''}`,
          ]
        );

        await client.query('COMMIT');
        return updatedTask;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // Memory store
    const task = memoryStore.mission_tasks.find((t) => t.id === taskId && t.mission_id === missionId && t.user_id === userId);
    if (!task) return null;
    task.task_status = newStatus;
    task.executed_at = new Date().toISOString();

    const pending = memoryStore.mission_tasks.filter(
      (t) => t.mission_id === missionId && t.task_status === 'AWAITING_APPROVAL'
    );
    if (pending.length === 0) {
      const m = memoryStore.agent_missions.find((mission) => mission.id === missionId);
      if (m) {
        m.status = 'COMPLETED';
        m.updated_at = new Date().toISOString();
      }
    }

    memoryStore.mission_audit_logs.push({
      id: crypto.randomUUID(),
      mission_id: missionId,
      user_id: userId,
      actor_type: 'HUMAN_OPERATOR',
      actor_name: 'Operator HITL Gate',
      event_action: actionLabel,
      event_details: `Task '${task.task_title}' ${decision === 'APPROVE' ? 'approved and executed' : 'skipped'}. ${notes ? `Operator note: ${notes}` : ''}`,
      created_at: new Date().toISOString(),
    });

    return task;
  },

  async replanMissionTasks(missionId, userId, replanData) {
    const { updated_tasks, new_summary, failure_reason, updated_max_budget_usd } = replanData;

    if (getDbConnectionStatus()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Delete existing tasks that were not approved/executed
        await client.query(
          `DELETE FROM mission_tasks 
           WHERE mission_id = $1 AND user_id = $2 AND task_status NOT IN ('APPROVED_EXECUTED', 'EXECUTED')`,
          [missionId, userId]
        );

        // Fetch remaining count to calculate step_order offset
        const existingRes = await client.query(
          'SELECT COUNT(*) as count FROM mission_tasks WHERE mission_id = $1',
          [missionId]
        );
        let offset = parseInt(existingRes.rows[0].count, 10);

        const insertedTasks = [];
        for (const t of updated_tasks) {
          offset++;
          const tRes = await client.query(
            `INSERT INTO mission_tasks (
              mission_id, user_id, step_order, agent_role, task_title,
              target_system, action_type, reasoning_rationale, execution_payload,
              requires_human_approval, task_status, verification_criteria
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
              missionId,
              userId,
              offset,
              t.agent_role,
              t.task_title,
              t.target_system,
              t.action_type,
              t.reasoning_rationale,
              JSON.stringify(t.execution_payload || {}),
              t.requires_human_approval || false,
              t.requires_human_approval ? 'AWAITING_APPROVAL' : 'EXECUTED',
              t.verification_criteria,
            ]
          );
          insertedTasks.push(tRes.rows[0]);
        }

        // Update mission
        const hasAwaiting = insertedTasks.some((t) => t.task_status === 'AWAITING_APPROVAL');
        const newMissionStatus = hasAwaiting ? 'AWAITING_HITL' : 'COMPLETED';

        await client.query(
          `UPDATE agent_missions 
           SET status = $1, 
               ai_analysis_payload = jsonb_set(ai_analysis_payload, '{executive_summary}', to_jsonb($2::text)),
               updated_at = NOW() 
           WHERE id = $3 AND user_id = $4`,
          [newMissionStatus, new_summary, missionId, userId]
        );

        // Add audit log
        await client.query(
          `INSERT INTO mission_audit_logs (
            mission_id, user_id, actor_type, actor_name, event_action, event_details
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            missionId,
            userId,
            'AI_AGENT',
            'PolicyReasonerAgent & SelfHealer',
            'AUTONOMOUS_REPLANNING_EXECUTED',
            `Dynamic re-planning triggered due to downstream failure: "${failure_reason}". ${insertedTasks.length} adapted tasks generated. Budget constraint updated to $${updated_max_budget_usd}.`,
          ]
        );

        await client.query('COMMIT');
        return true;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // Memory store
    memoryStore.mission_tasks = memoryStore.mission_tasks.filter(
      (t) => !(t.mission_id === missionId && t.user_id === userId && !['APPROVED_EXECUTED', 'EXECUTED'].includes(t.task_status))
    );

    const existingCount = memoryStore.mission_tasks.filter((t) => t.mission_id === missionId).length;
    let offset = existingCount;

    const insertedTasks = updated_tasks.map((t) => {
      offset++;
      const newTask = {
        id: crypto.randomUUID(),
        mission_id: missionId,
        user_id: userId,
        step_order: offset,
        agent_role: t.agent_role,
        task_title: t.task_title,
        target_system: t.target_system,
        action_type: t.action_type,
        reasoning_rationale: t.reasoning_rationale,
        execution_payload: t.execution_payload || {},
        requires_human_approval: t.requires_human_approval || false,
        task_status: t.requires_human_approval ? 'AWAITING_APPROVAL' : 'EXECUTED',
        verification_criteria: t.verification_criteria,
        executed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      memoryStore.mission_tasks.push(newTask);
      return newTask;
    });

    const m = memoryStore.agent_missions.find((mission) => mission.id === missionId && mission.user_id === userId);
    if (m) {
      m.status = insertedTasks.some((t) => t.task_status === 'AWAITING_APPROVAL') ? 'AWAITING_HITL' : 'COMPLETED';
      if (m.ai_analysis_payload) {
        m.ai_analysis_payload.executive_summary = new_summary;
      }
      m.updated_at = new Date().toISOString();
    }

    memoryStore.mission_audit_logs.push({
      id: crypto.randomUUID(),
      mission_id: missionId,
      user_id: userId,
      actor_type: 'AI_AGENT',
      actor_name: 'PolicyReasonerAgent & SelfHealer',
      event_action: 'AUTONOMOUS_REPLANNING_EXECUTED',
      event_details: `Dynamic re-planning triggered due to downstream failure: "${failure_reason}". ${insertedTasks.length} adapted tasks generated. Budget constraint updated to $${updated_max_budget_usd}.`,
      created_at: new Date().toISOString(),
    });

    return true;
  },

  async deleteMission(missionId, userId) {
    if (getDbConnectionStatus()) {
      const res = await pool.query('DELETE FROM agent_missions WHERE id = $1 AND user_id = $2 RETURNING id', [missionId, userId]);
      return res.rowCount > 0;
    }
    const initialLen = memoryStore.agent_missions.length;
    memoryStore.agent_missions = memoryStore.agent_missions.filter((m) => !(m.id === missionId && m.user_id === userId));
    memoryStore.mission_tasks = memoryStore.mission_tasks.filter((t) => !(t.mission_id === missionId && t.user_id === userId));
    memoryStore.mission_audit_logs = memoryStore.mission_audit_logs.filter((l) => !(l.mission_id === missionId && l.user_id === userId));
    return memoryStore.agent_missions.length < initialLen;
  },

  // DASHBOARD METRICS
  async getDashboardSummary(userId) {
    const missions = await this.getMissionsByUserId(userId);
    const workspaces = await this.getWorkspacesByUserId(userId);

    const totalMissions = missions.length;
    const completedMissions = missions.filter((m) => m.status === 'COMPLETED').length;
    const awaitingHitlMissions = missions.filter((m) => m.status === 'AWAITING_HITL').length;
    const autonomousResolutionRate = totalMissions > 0 
      ? Math.round((completedMissions / totalMissions) * 100) 
      : 100;

    const totalManualHoursSaved = missions.reduce((acc, m) => acc + (m.estimated_manual_minutes || 0), 0) / 60;
    const totalCostSavingsUsd = missions.reduce((acc, m) => acc + parseFloat(m.estimated_cost_savings_usd || 0), 0);
    const avgConfidenceScore = totalMissions > 0
      ? Math.round(missions.reduce((acc, m) => acc + (m.confidence_score || 0), 0) / totalMissions)
      : 92;

    const domainDistribution = {
      SUPPLY_CHAIN_OPS: missions.filter((m) => m.domain === 'SUPPLY_CHAIN_OPS').length,
      ITSM_INCIDENT_RESPONSE: missions.filter((m) => m.domain === 'ITSM_INCIDENT_RESPONSE').length,
      CUSTOMER_SLA_TRIAGE: missions.filter((m) => m.domain === 'CUSTOMER_SLA_TRIAGE').length,
      FINOPS_RECONCILIATION: missions.filter((m) => m.domain === 'FINOPS_RECONCILIATION').length,
      HR_ONBOARDING_ACCESS: missions.filter((m) => m.domain === 'HR_ONBOARDING_ACCESS').length,
      REVENUE_OPS_PIPELINE: missions.filter((m) => m.domain === 'REVENUE_OPS_PIPELINE').length,
    };

    let totalSystems = 0;
    let healthySystems = 0;
    workspaces.forEach((w) => {
      if (w.systems) {
        totalSystems += w.systems.length;
        healthySystems += w.systems.filter((s) => s.status === 'HEALTHY').length;
      }
    });

    return {
      kpis: {
        totalMissions,
        autonomousResolutionRate,
        totalManualHoursSaved: Math.round(totalManualHoursSaved * 10) / 10,
        totalCostSavingsUsd: Math.round(totalCostSavingsUsd),
        avgConfidenceScore,
        awaitingHitlMissions,
        totalWorkspaces: workspaces.length,
        totalSystems,
        healthySystems,
      },
      domainDistribution,
      recentMissions: missions.slice(0, 5),
    };
  },
};

export default db;
