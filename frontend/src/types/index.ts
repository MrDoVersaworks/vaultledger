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
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  businessName: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  user: AuthUser;
}

// ============================================================
// CLIENT TYPES
// ============================================================
export interface Client {
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
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
}

export interface Invoice {
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
  client?: Client;
  items?: InvoiceItem[];
}

// ============================================================
// EXPENSE TYPES
// ============================================================
export interface Expense {
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
export interface DashboardSummary {
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
// SETTINGS TYPES
// ============================================================
export interface AISettings {
  hasApiKey: boolean;
  geminiModel: string | null;
}
