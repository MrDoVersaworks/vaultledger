// ============================================================
// PAGINATION DEFAULTS
// ============================================================
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// ============================================================
// AUTH
// ============================================================
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const BCRYPT_SALT_ROUNDS = 12;
export const REFRESH_COOKIE_NAME = 'vaultledger_refresh_token';

// ============================================================
// RATE LIMITING
// ============================================================
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 20;

export const API_RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute
export const API_RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

// ============================================================
// ERROR CODES
// ============================================================
export enum ErrorCode {
  // Auth
  AUTH_EMAIL_EXISTS = 'ERR_AUTH_EMAIL_EXISTS',
  AUTH_INVALID_CREDENTIALS = 'ERR_AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'ERR_AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'ERR_AUTH_TOKEN_INVALID',
  AUTH_NO_TOKEN = 'ERR_AUTH_NO_TOKEN',
  AUTH_REFRESH_FAILED = 'ERR_AUTH_REFRESH_FAILED',
  AUTH_PASSWORD_MISMATCH = 'ERR_AUTH_PASSWORD_MISMATCH',

  // Clients
  CLIENT_NOT_FOUND = 'ERR_CLIENT_NOT_FOUND',

  // Invoices
  INVOICE_NOT_FOUND = 'ERR_INVOICE_NOT_FOUND',
  INVOICE_CREATE_FAILED = 'ERR_INVOICE_CREATE_FAILED',
  INVOICE_UPDATE_FAILED = 'ERR_INVOICE_UPDATE_FAILED',

  // Expenses
  EXPENSE_NOT_FOUND = 'ERR_EXPENSE_NOT_FOUND',

  // AI
  AI_NO_API_KEY = 'ERR_AI_NO_API_KEY',
  AI_NO_MODEL = 'ERR_AI_NO_MODEL',
  AI_CATEGORIZATION_FAILED = 'ERR_AI_CATEGORIZATION_FAILED',

  // Settings
  SETTINGS_UPDATE_FAILED = 'ERR_SETTINGS_UPDATE_FAILED',

  // General
  VALIDATION_FAILED = 'ERR_VALIDATION_FAILED',
  INTERNAL_ERROR = 'ERR_INTERNAL_ERROR',
  NOT_FOUND = 'ERR_NOT_FOUND',
  RATE_LIMITED = 'ERR_RATE_LIMITED',
}
