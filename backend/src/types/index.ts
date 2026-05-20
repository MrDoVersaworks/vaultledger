import { z } from 'zod';

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

// ============================================================
// AUTH TYPES
// ============================================================
export interface JwtAccessPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  businessName: string | null;
}

// ============================================================
// SETTINGS TYPES
// ============================================================
export interface AISettingsResponse {
  hasApiKey: boolean;
  geminiModel: string | null;
}

export interface EncryptedData {
  encryptedText: string;
  iv: string;
  tag: string;
}

// ============================================================
// CLIENT TYPES
// ============================================================
export interface ClientResponse {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

// ============================================================
// INVOICE TYPES
// ============================================================
export interface InvoiceItemResponse {
  id: string;
  invoiceId: string;
  description: string;
  quantity: string; // Big decimals usually transferred as strings to prevent float precision issues
  unitPrice: string;
  total: string;
}

export interface InvoiceResponse {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  dueDate: string | null;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client?: ClientResponse;
  items?: InvoiceItemResponse[];
}

// ============================================================
// EXPENSE TYPES
// ============================================================
export interface ExpenseResponse {
  id: string;
  userId: string;
  description: string;
  amount: string;
  category: string | null;
  date: string;
  aiCategorized: boolean;
  createdAt: string;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================
export interface DashboardSummaryResponse {
  totalRevenue: string;
  totalExpenses: string;
  outstanding: string;
  paidInvoicesCount: number;
  draftInvoicesCount: number;
}

export interface MonthlyDashboardData {
  month: string;
  revenue: number;
  expenses: number;
}

// ============================================================
// ZOD VALIDATION SCHEMAS
// ============================================================
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  businessName: z
    .string()
    .max(255, 'Business name must not exceed 255 characters')
    .trim()
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
});

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .max(255, 'Client name must not exceed 255 characters')
    .trim(),
  email: z.string().email('Invalid email address').trim().optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone must not exceed 50 characters').trim().optional(),
  address: z.string().max(1000, 'Address must not exceed 1000 characters').trim().optional(),
});

export const invoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description must not exceed 255 characters')
    .trim(),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().nonnegative('Unit price must be 0 or greater'),
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  invoiceNumber: z
    .string()
    .min(1, 'Invoice number is required')
    .max(50, 'Invoice number must not exceed 50 characters')
    .trim(),
  items: z.array(invoiceItemSchema).min(1, 'Invoice must contain at least 1 item'),
  taxRate: z.coerce.number().nonnegative('Tax rate must be 0 or greater').default(0),
  dueDate: z.string().datetime({ message: 'Invalid ISO date string for due date' }).optional().nullable(),
  notes: z.string().max(2000, 'Notes must not exceed 2000 characters').trim().optional().nullable(),
});

export const invoiceStatusSchema = z.object({
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue'], {
    errorMap: () => ({ message: 'Status must be Draft, Sent, Paid, or Overdue' }),
  }),
});

export const expenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description must not exceed 255 characters')
    .trim(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z.string().max(100, 'Category must not exceed 100 characters').trim().optional().nullable(),
  date: z.string().datetime({ message: 'Invalid ISO date string for expense date' }),
});

export const aiSettingsSchema = z.object({
  geminiApiKey: z.string().optional(),
  geminiModel: z
    .string()
    .min(1, 'Generation model name is required')
    .max(100, 'Model name must not exceed 100 characters'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']).optional(),
});

// ============================================================
// EXPRESS REQUEST EXTENSION
// ============================================================
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}
