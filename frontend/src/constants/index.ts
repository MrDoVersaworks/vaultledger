export const APPLICATION_CURRENCY_CODE = 'USD';

// ============================================================
// API BASE URL
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

// Development may use the documented VaultLedger backend port; production must be configured explicitly.
export const API_BASE_URL = API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5002' : '');

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
