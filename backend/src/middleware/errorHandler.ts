import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../constants/index.js';
import { logger } from '../utils/logger.js';
import type { ApiErrorResponse } from '../types/index.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('GLOBAL_ERROR_HANDLER', err.message, err);

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
    },
  };

  res.status(500).json(response);
}
