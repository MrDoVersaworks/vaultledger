import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDashboardSummary, getMonthlyTrend } from '../services/dashboard.service.js';
import { cacheMiddleware } from '../utils/cache.js';

const router = Router();

router.use(authMiddleware);

// GET /api/dashboard/summary
router.get('/summary', cacheMiddleware(60), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const summary = await getDashboardSummary(userId);

  res.status(200).json({
    success: true,
    data: summary,
  });
}));

// GET /api/dashboard/trend
router.get('/trend', cacheMiddleware(60), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const trend = await getMonthlyTrend(userId);

  res.status(200).json({
    success: true,
    data: trend,
  });
}));

export default router;
