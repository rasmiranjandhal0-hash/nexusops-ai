import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool, testConnection } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Database] Checking connection and running schema migrations...');
  
  const connCheck = await testConnection();
  if (!connCheck.connected) {
    console.warn(`[Database] Warning: PostgreSQL not connected (${connCheck.error}). Running with resilient fallback.`);
    return { success: false, error: connCheck.error };
  }

  try {
    const migrationFilePath = path.resolve(__dirname, '../../../supabase/migrations/001_initial_schema.sql');
    
    if (!fs.existsSync(migrationFilePath)) {
      throw new Error(`Migration file not found at ${migrationFilePath}`);
    }

    const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');
    await pool.query(migrationSql);
    console.log('[Database] Initial schema (001_initial_schema.sql) applied successfully.');

    // Seed default demo user if not existing
    const existingDemo = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@nexusops.ai']);
    if (existingDemo.rows.length === 0) {
      const passwordHash = await bcrypt.hash('NexusOps#2026!', 12);
      const userRes = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, organization_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['Demo Lead Architect', 'demo@nexusops.ai', passwordHash, 'Nexus Global Enterprise', 'Principal Systems Architect']
      );
      const demoUserId = userRes.rows[0].id;

      // Seed default workspace
      const wsRes = await pool.query(
        `INSERT INTO workspaces (user_id, name, department, description, default_governance_mode)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          demoUserId,
          'Global Enterprise Operations',
          'Operations & IT Infrastructure',
          'Primary production orchestration hub for cross-departmental operations and incident triage.',
          'HITL_GOVERNED',
        ]
      );
      const demoWorkspaceId = wsRes.rows[0].id;

      // Seed 4 connected systems
      const systems = [
        {
          name: 'SAP S/4HANA Inventory ERP',
          type: 'ERP',
          endpoint: 'https://erp.internal.nexusops.enterprise/api/v2/materials',
          status: 'HEALTHY',
          sla: 30,
        },
        {
          name: 'Zendesk Enterprise CRM',
          type: 'CRM',
          endpoint: 'https://nexusops.zendesk.com/api/v2/tickets',
          status: 'HEALTHY',
          sla: 15,
        },
        {
          name: 'AWS CloudWatch & APM',
          type: 'ITSM',
          endpoint: 'https://monitoring.us-east-1.amazonaws.com/nexusops-prod',
          status: 'HEALTHY',
          sla: 10,
        },
        {
          name: 'Stripe FinOps Ledger',
          type: 'FINOPS',
          endpoint: 'https://api.stripe.com/v1/invoices/reconcile',
          status: 'HEALTHY',
          sla: 45,
        },
      ];

      for (const sys of systems) {
        await pool.query(
          `INSERT INTO connected_systems (workspace_id, user_id, system_name, system_type, endpoint_reference, status, sla_target_minutes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [demoWorkspaceId, demoUserId, sys.name, sys.type, sys.endpoint, sys.status, sys.sla]
        );
      }

      console.log('[Database] Default demo account and enterprise systems seeded successfully.');
    }

    return { success: true };
  } catch (err) {
    console.error('[Database] Migration failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Allow direct CLI execution: node src/db/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then((result) => {
      if (!result.success) {
        console.error('Migration failed:', result.error);
        process.exit(1);
      }
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Unhandled migration error:', err);
      process.exit(1);
    });
}
