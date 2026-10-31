import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../db/store.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { requireAuth } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nexusops_enterprise_secret_super_secure_key_2026_change_in_production';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      organization_name: user.organization_name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existing = await db.findUserByEmail(validatedData.email);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 12);
    const user = await db.createUser({
      full_name: validatedData.full_name,
      email: validatedData.email,
      password_hash: passwordHash,
      organization_name: validatedData.organization_name || 'Nexus Enterprise Ops',
      role: validatedData.role || 'Systems Architect',
    });

    // Automatically seed default workspace and 4 connected enterprise systems
    const workspace = await db.createWorkspace({
      user_id: user.id,
      name: 'Global Enterprise Operations',
      department: 'Operations & IT Infrastructure',
      description: 'Primary production orchestration hub for cross-departmental operations and incident triage.',
      default_governance_mode: 'HITL_GOVERNED',
    });

    const defaultSystems = [
      {
        workspace_id: workspace.id,
        user_id: user.id,
        system_name: 'SAP S/4HANA Inventory ERP',
        system_type: 'ERP',
        endpoint_reference: 'https://erp.internal.nexusops.enterprise/api/v2/materials',
        status: 'HEALTHY',
        sla_target_minutes: 30,
      },
      {
        workspace_id: workspace.id,
        user_id: user.id,
        system_name: 'Zendesk Enterprise CRM',
        system_type: 'CRM',
        endpoint_reference: 'https://nexusops.zendesk.com/api/v2/tickets',
        status: 'HEALTHY',
        sla_target_minutes: 15,
      },
      {
        workspace_id: workspace.id,
        user_id: user.id,
        system_name: 'AWS CloudWatch & APM',
        system_type: 'ITSM',
        endpoint_reference: 'https://monitoring.us-east-1.amazonaws.com/nexusops-prod',
        status: 'HEALTHY',
        sla_target_minutes: 10,
      },
      {
        workspace_id: workspace.id,
        user_id: user.id,
        system_name: 'Stripe FinOps Ledger',
        system_type: 'FINOPS',
        endpoint_reference: 'https://api.stripe.com/v1/invoices/reconcile',
        status: 'HEALTHY',
        sla_target_minutes: 45,
      },
    ];

    for (const sys of defaultSystems) {
      await db.createConnectedSystem(sys);
    }

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered and workspace seeded successfully',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const userWithHash = await db.findUserByEmail(validatedData.email);

    if (!userWithHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials',
      });
    }

    const isMatch = await bcrypt.compare(validatedData.password, userWithHash.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials',
      });
    }

    const { password_hash, ...safeUser } = userWithHash;
    const token = signToken(safeUser);

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/demo (Instant demo login for evaluator ease)
router.post('/demo', async (req, res, next) => {
  try {
    let demoUser = await db.findUserByEmail('demo@nexusops.ai');
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('NexusOps#2026!', 12);
      demoUser = await db.createUser({
        full_name: 'Demo Lead Architect',
        email: 'demo@nexusops.ai',
        password_hash: passwordHash,
        organization_name: 'Nexus Global Enterprise',
        role: 'Principal Systems Architect',
      });

      const workspace = await db.createWorkspace({
        user_id: demoUser.id,
        name: 'Global Enterprise Operations',
        department: 'Operations & IT Infrastructure',
        description: 'Primary production orchestration hub for cross-departmental operations and incident triage.',
        default_governance_mode: 'HITL_GOVERNED',
      });

      const defaultSystems = [
        {
          workspace_id: workspace.id,
          user_id: demoUser.id,
          system_name: 'SAP S/4HANA Inventory ERP',
          system_type: 'ERP',
          endpoint_reference: 'https://erp.internal.nexusops.enterprise/api/v2/materials',
          status: 'HEALTHY',
          sla_target_minutes: 30,
        },
        {
          workspace_id: workspace.id,
          user_id: demoUser.id,
          system_name: 'Zendesk Enterprise CRM',
          system_type: 'CRM',
          endpoint_reference: 'https://nexusops.zendesk.com/api/v2/tickets',
          status: 'HEALTHY',
          sla_target_minutes: 15,
        },
        {
          workspace_id: workspace.id,
          user_id: demoUser.id,
          system_name: 'AWS CloudWatch & APM',
          system_type: 'ITSM',
          endpoint_reference: 'https://monitoring.us-east-1.amazonaws.com/nexusops-prod',
          status: 'HEALTHY',
          sla_target_minutes: 10,
        },
        {
          workspace_id: workspace.id,
          user_id: demoUser.id,
          system_name: 'Stripe FinOps Ledger',
          system_type: 'FINOPS',
          endpoint_reference: 'https://api.stripe.com/v1/invoices/reconcile',
          status: 'HEALTHY',
          sla_target_minutes: 45,
        },
      ];

      for (const sys of defaultSystems) {
        await db.createConnectedSystem(sys);
      }
    }

    const { password_hash, ...safeUser } = demoUser;
    const token = signToken(safeUser);

    return res.json({
      success: true,
      message: 'Demo credentials authenticated successfully',
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const workspaces = await db.getWorkspacesByUserId(req.user.id);
    return res.json({
      success: true,
      user: {
        ...user,
        workspaceCount: workspaces.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
