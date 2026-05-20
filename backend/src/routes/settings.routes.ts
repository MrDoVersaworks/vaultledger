import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiSettingsSchema } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getAISettings,
  updateAISettings,
  deleteApiKey,
} from '../services/settings.service.js';

const router = Router();

router.use(authMiddleware);

// GET /api/settings
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const settings = await getAISettings(userId);

  res.status(200).json({
    success: true,
    data: settings,
  });
}));

// PUT /api/settings
router.put(
  '/',
  validate(aiSettingsSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const { geminiApiKey, geminiModel } = req.body;

    const settings = await updateAISettings({
      userId,
      geminiApiKey,
      geminiModel,
    });

    res.status(200).json({
      success: true,
      data: settings,
    });
  })
);

// DELETE /api/settings/api-key
router.delete('/api-key', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  await deleteApiKey(userId);

  res.status(200).json({
    success: true,
    data: null,
  });
}));

export default router;
