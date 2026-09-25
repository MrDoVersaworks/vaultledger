import { db } from '../db/connection.js';
import { sql } from 'drizzle-orm';
import { config } from '../config/index.js';
import {
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  API_RATE_LIMIT_WINDOW_MS,
  API_RATE_LIMIT_MAX_REQUESTS,
  ErrorCode,
} from '../constants/index.js';
import type { NextFunction, Request, Response } from 'express';
import type { ApiErrorResponse } from '../types/index.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  scope: string;
  message: string;
}

async function enforceRateLimit(req: Request, res: Response, next: NextFunction, options: RateLimitOptions): Promise<void> {
  if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
    next();
    return;
  }

  const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
  const key = options.scope + ':' + clientKey;
  const resetAt = new Date(Date.now() + options.windowMs);

  try {
    const result = await db.execute(sql`
      INSERT INTO rate_limit_buckets ("key", "hits", "reset_at")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE
      SET
        "hits" = CASE
          WHEN rate_limit_buckets."reset_at" <= NOW() THEN 1
          ELSE rate_limit_buckets."hits" + 1
        END,
        "reset_at" = CASE
          WHEN rate_limit_buckets."reset_at" <= NOW() THEN ${resetAt}
          ELSE rate_limit_buckets."reset_at"
        END
      RETURNING "hits", "reset_at"
    `);

    const row = result.rows[0] as { hits: number; reset_at: Date } | undefined;
    if (!row) {
      next();
      return;
    }

    const remaining = Math.max(options.max - Number(row.hits), 0);
    res.setHeader('RateLimit-Limit', options.max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', Math.ceil(new Date(row.reset_at).getTime() / 1000));

    if (Number(row.hits) > options.max) {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: ErrorCode.RATE_LIMITED,
          message: options.message,
        },
      };
      res.status(429).json(response);
      return;
    }

    next();
  } catch (error) {
    // Rate limiting must fail closed in production: if persistent state cannot be read,
    // do not silently fall back to a process-local limiter.
    next(error);
  }
}

export const authRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  void enforceRateLimit(req, res, next, {
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    max: AUTH_RATE_LIMIT_MAX_REQUESTS,
    scope: 'auth',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  });
};

export const apiRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  void enforceRateLimit(req, res, next, {
    windowMs: API_RATE_LIMIT_WINDOW_MS,
    max: API_RATE_LIMIT_MAX_REQUESTS,
    scope: 'api',
    message: 'API rate limit exceeded. Please try again in a minute.',
  });
};
