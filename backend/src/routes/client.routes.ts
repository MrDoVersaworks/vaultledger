import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { clientSchema } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from '../services/client.service.js';

const router = Router();

router.use(authMiddleware);

// GET /api/clients
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const clients = await getClients(userId);

  res.status(200).json({
    success: true,
    data: clients,
  });
}));

// GET /api/clients/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const clientId = req.params.id;

  try {
    const client = await getClientById(userId, clientId);
    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('ERR_CLIENT_NOT_FOUND')) {
      res.status(404).json({
        success: false,
        error: { code: 'ERR_CLIENT_NOT_FOUND', message: 'Client not found.' },
      });
      return;
    }
    throw error;
  }
}));

// POST /api/clients
router.post(
  '/',
  validate(clientSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const client = await createClient(userId, req.body);

    res.status(201).json({
      success: true,
      data: client,
    });
  })
);

// PUT /api/clients/:id
router.put(
  '/:id',
  validate(clientSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const clientId = req.params.id;

    try {
      const client = await updateClient(userId, clientId, req.body);
      res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('ERR_CLIENT_NOT_FOUND')) {
        res.status(404).json({
          success: false,
          error: { code: 'ERR_CLIENT_NOT_FOUND', message: 'Client not found.' },
        });
        return;
      }
      throw error;
    }
  })
);

// DELETE /api/clients/:id
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const clientId = req.params.id;

  try {
    await deleteClient(userId, clientId);
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('ERR_CLIENT_NOT_FOUND')) {
        res.status(404).json({
          success: false,
          error: { code: 'ERR_CLIENT_NOT_FOUND', message: 'Client not found.' },
        });
        return;
      }
      if (error.message.includes('Cannot delete client')) {
        res.status(400).json({
          success: false,
          error: { code: 'ERR_VALIDATION_FAILED', message: error.message },
        });
        return;
      }
    }
    throw error;
  }
}));

export default router;
