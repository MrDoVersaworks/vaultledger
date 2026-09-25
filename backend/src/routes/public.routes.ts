import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/connection.js';
import { systemSettings, platformReviews } from '../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/settings', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [settings] = await db.select().from(systemSettings).limit(1);
    res.status(200).json({
      success: true,
      data: {
        googleAnalyticsId: settings?.google_analytics_id ?? '',
        termlyUuid: settings?.termly_uuid ?? '',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reviews', async (_req: Request, res: Response): Promise<void> => {
  const reviews = await db
    .select()
    .from(platformReviews)
    .where(eq(platformReviews.status, 'approved'))
    .orderBy(desc(platformReviews.created_at));
  const data = reviews.map((review) => ({
    id: review.id,
    name: review.name,
    profession: review.profession,
    rating: review.rating,
    feedback: review.feedback,
    createdAt: review.created_at,
  }));
  res.status(200).json({ success: true, data });
});

router.post('/reviews', apiRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, profession, rating, feedback } = req.body;
    const normalizedName = String(name ?? '').trim();
    const normalizedFeedback = String(feedback ?? '').trim();
    const normalizedRating = Number(rating);
    if (!normalizedName || !normalizedFeedback || !Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5 || normalizedName.length > 100 || normalizedFeedback.length > 2000) {
      res.status(400).json({ success: false, message: '[ERR_VALIDATION] Invalid review fields.' });
      return;
    }

    const [inserted] = await db.insert(platformReviews).values({
      name: normalizedName,
      profession: profession ? String(profession).trim().slice(0, 100) : 'User',
      rating: normalizedRating,
      feedback: normalizedFeedback,
      status: 'pending',
    }).returning();

    res.status(201).json({
      success: true,
      data: { id: inserted.id, status: inserted.status },
      message: 'Review submitted for moderation.',
    });
  } catch (_err) {
    res.status(500).json({ success: false, message: '[ERR_REVIEW_POST_FAILED] Failed to submit review.' });
  }
});

export default router;
