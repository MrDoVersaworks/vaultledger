// ============================================================
// API BASE URL
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Dynamically resolve API URL for local network access (e.g. from mobile)
export const API_BASE_URL = typeof window !== 'undefined' 
  ? API_URL?.replace('localhost', window.location.hostname) || `http://${window.location.hostname}:5002`
  : API_URL || 'http://localhost:5002';

// ============================================================
// AUTHKEYS
// ============================================================
export const ACCESS_TOKEN_KEY = 'vaultledger_access_token';

// ============================================================
// PAGINATION
// ============================================================
export const DEFAULT_PAGE_SIZE = 10;

// ============================================================
// TAX CATEGORIES
// ============================================================
export const STANDARD_CATEGORIES = [
  'Meals & Entertainment',
  'Office Supplies',
  'Travel',
  'Software & Subscriptions',
  'Rent & Utilities',
  'Marketing & Advertising',
  'Professional Services',
  'Insurance',
  'Taxes & Licenses',
  'Other'
] as const;
