import express from 'express';
import db from '../db/store.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { workspaceCreateSchema, systemCreateSchema } from '../validators/schemas.js';

const router = express.Router();

// All workspace routes require valid JWT
router.use(requireAuth);

// GET /api/workspaces
router.get('/', async (req, res, next) => {
  try {
    const workspaces = await db.getWorkspacesByUserId(req.user.id);
    return res.json({
      success: true,
      workspaces,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/workspaces
router.post('/', async (req, res, next) => {
  try {
    const validatedData = workspaceCreateSchema.parse(req.body);
    const workspace = await db.createWorkspace({
      user_id: req.user.id,
      name: validatedData.name,
      department: validatedData.department,
      description: validatedData.description,
      default_governance_mode: validatedData.default_governance_mode,
    });

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace: {
        ...workspace,
        systems: [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/workspaces/:workspaceId/systems
router.post('/:workspaceId/systems', async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await db.findWorkspaceById(workspaceId, req.user.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Target workspace not found or you do not have permission to register systems to it.',
      });
    }

    const validatedData = systemCreateSchema.parse(req.body);
    const system = await db.createConnectedSystem({
      workspace_id: workspaceId,
      user_id: req.user.id,
      system_name: validatedData.system_name,
      system_type: validatedData.system_type,
      endpoint_reference: validatedData.endpoint_reference,
      status: validatedData.status,
      sla_target_minutes: validatedData.sla_target_minutes,
    });

    return res.status(201).json({
      success: true,
      message: 'Connected system registered successfully',
      system,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/systems/:systemId
router.delete('/systems/:systemId', async (req, res, next) => {
  try {
    const { systemId } = req.params;
    const deleted = await db.deleteConnectedSystem(systemId, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'System not found or unauthorized to delete',
      });
    }

    return res.json({
      success: true,
      message: 'Connected system removed successfully',
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workspaces/:workspaceId
router.delete('/:workspaceId', async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const deleted = await db.deleteWorkspace(workspaceId, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found or unauthorized to delete',
      });
    }

    return res.json({
      success: true,
      message: 'Workspace and connected systems deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
