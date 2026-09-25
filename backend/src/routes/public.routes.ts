import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/connection.js';
import { systemSettings, platformReviews } from '../db/schema.js';
import { desc, eq } from 'drizzle-orm';

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

router.post('/reviews', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, profession, rating, feedback } = req.body;
    if (!name || !feedback) {
      res.status(400).json({ success: false, message: '[ERR_VALIDATION] Name and feedback are required.' });
      return;
    }

    const [inserted] = await db.insert(platformReviews).values({
      name: String(name).trim(),
      profession: profession ? String(profession).trim() : 'User',
      rating: Number(rating) || 5,
      feedback: String(feedback).trim(),
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
