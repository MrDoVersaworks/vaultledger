import type { NextFunction, Request, Response } from 'express';
import { config } from '../config/index.js';

function configuredOrigins(): string[] {
  return config.CORS_ORIGIN.split(',').map((value) => value.trim().replace(/\/+$/, '')).filter(Boolean);
}

export function trustedOriginGuard(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get('origin');
  const referer = req.get('referer');

  if (origin && configuredOrigins().includes(origin.replace(/\/+$/, ''))) {
    next();
    return;
  }

  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (configuredOrigins().includes(refererOrigin.replace(/\/+$/, ''))) {
        next();
        return;
      }
    } catch {}
  }

  res.status(403).json({
    success: false,
    error: { code: 'ERR_CSRF_ORIGIN', message: 'Request origin is not trusted.' },
  });
}
