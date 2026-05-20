import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import {
  AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  API_RATE_LIMIT_WINDOW_MS,
  API_RATE_LIMIT_MAX_REQUESTS,
  ErrorCode
} from '../constants/index.js';
import type { ApiErrorResponse } from '../types/index.js';

export const authRateLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.NODE_ENV === 'development' || config.NODE_ENV === 'test',
  handler: (_req, res) => {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.RATE_LIMITED,
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
      },
    };
    res.status(429).json(response);
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: API_RATE_LIMIT_WINDOW_MS,
  max: API_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.NODE_ENV === 'development' || config.NODE_ENV === 'test',
  handler: (_req, res) => {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.RATE_LIMITED,
        message: 'API rate limit exceeded. Please try again in a minute.',
      },
    };
    res.status(429).json(response);
  },
});

