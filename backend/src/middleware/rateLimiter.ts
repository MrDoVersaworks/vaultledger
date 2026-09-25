import { sql } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection.js';
import { config } from '../config/index.js';
import {
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  API_RATE_LIMIT_WINDOW_MS,
  API_RATE_LIMIT_MAX_REQUESTS,
  ErrorCode,
} from '../constants/index.js';
import type { ApiErrorResponse } from '../types/index.js';

let lastCleanupAt = 0;

function createRateLimiter(name: string, windowMs: number, maxRequests: number) {
  return async function persistentRateLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
      next();
      return;
    }

    const key = `${name}:${req.ip || 'unknown'}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    try {
      const result = await db.execute(sql`
        INSERT INTO rate_limit_buckets ("key", hits, reset_at)
        VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
        ON CONFLICT ("key") DO UPDATE
        SET
          hits = CASE
            WHEN rate_limit_buckets.reset_at <= now() THEN 1
            ELSE rate_limit_buckets.hits + 1
          END,
          reset_at = CASE
            WHEN rate_limit_buckets.reset_at <= now() THEN now() + make_interval(secs => ${windowSeconds})
            ELSE rate_limit_buckets.reset_at
          END
        RETURNING hits, reset_at
      `);

      const row = result.rows[0] as { hits: number; reset_at: Date };
      const hits = Number(row.hits);
      const resetTime = new Date(row.reset_at);

      if (Date.now() - lastCleanupAt > 60_000) {
        lastCleanupAt = Date.now();
        await db.execute(sql`DELETE FROM rate_limit_buckets WHERE reset_at <= now()`);
        await db.execute(sql`DELETE FROM revoked_access_tokens WHERE expires_at <= now()`);
      }

      res.setHeader('RateLimit-Limit', maxRequests);
      res.setHeader('RateLimit-Remaining', Math.max(0, maxRequests - hits));
      res.setHeader('RateLimit-Reset', Math.ceil(resetTime.getTime() / 1000));

      if (hits > maxRequests) {
        const response: ApiErrorResponse = {
          success: false,
          error: {
            code: ErrorCode.RATE_LIMITED,
            message: name === 'auth'
              ? 'Too many authentication attempts. Please try again in 15 minutes.'
              : 'API rate limit exceeded. Please try again in a minute.',
          },
        };
        res.status(429).json(response);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const authRateLimiter = createRateLimiter(
  'auth',
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
);

export const apiRateLimiter = createRateLimiter(
  'api',
  API_RATE_LIMIT_WINDOW_MS,
  API_RATE_LIMIT_MAX_REQUESTS,
);
