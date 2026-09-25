import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isAccessTokenRevoked } from '../utils/blocklist.js';
import { config } from '../config/index.js';
import { ErrorCode } from '../constants/index.js';
import type { JwtAccessPayload, ApiErrorResponse } from '../types/index.js';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.AUTH_NO_TOKEN,
        message: 'Authentication required. No token provided.',
      },
    };
    res.status(401).json(response);
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.AUTH_TOKEN_INVALID,
        message: 'Invalid authorization header format. Expected: Bearer <token>',
      },
    };
    res.status(401).json(response);
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtAccessPayload;
    const signature = token.split('.')[2];

    if (signature && await isAccessTokenRevoked(signature)) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.AUTH_TOKEN_INVALID,
          message: 'Session invalidated. Please log in again.',
        },
      } satisfies ApiErrorResponse);
      return;
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.AUTH_TOKEN_EXPIRED,
          message: 'Access token has expired. Please refresh your token.',
        },
      } satisfies ApiErrorResponse);
      return;
    }

    if (error instanceof Error && error.message.includes('ECONN')) {
      next(error);
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: ErrorCode.AUTH_TOKEN_INVALID,
        message: 'Invalid access token.',
      },
    } satisfies ApiErrorResponse);
  }
}
