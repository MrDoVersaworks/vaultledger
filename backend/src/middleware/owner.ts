import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';

export function ownerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ success: false, error: { code: 'ERR_AUTH_NO_IDENTITY', message: 'Authenticated identity is required.' } });
    return;
  }

  void (async () => {
    try {
      const rows = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
      if (rows.length === 0 || rows[0].role !== 'admin') {
        res.status(403).json({ success: false, error: { code: 'ERR_AUTH_FORBIDDEN', message: 'Administrator authorization is required.' } });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  })();
}
