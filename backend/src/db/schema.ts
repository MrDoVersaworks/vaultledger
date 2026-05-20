import { pgTable, uuid, varchar, text, timestamp, boolean, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// TABLE: users
// ============================================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  business_name: varchar('business_name', { length: 255 }),
  encrypted_gemini_key: text('encrypted_gemini_key'),
  gemini_key_iv: varchar('gemini_key_iv', { length: 24 }),
  gemini_key_tag: varchar('gemini_key_tag', { length: 32 }),
  gemini_model: varchar('gemini_model', { length: 100 }).default('gemini-2.5-flash'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: refresh_tokens
// ============================================================
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: varchar('token_hash', { length: 255 }).notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: clients
// ============================================================
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: invoices
// ============================================================
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  client_id: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'restrict' }),
  invoice_number: varchar('invoice_number', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('Draft'), // 'Draft' | 'Sent' | 'Paid' | 'Overdue'
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  tax_rate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('0.00'),
  tax_amount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  due_date: timestamp('due_date', { withTimezone: true }),
  paid_date: timestamp('paid_date', { withTimezone: true }),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: invoice_items
// ============================================================
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoice_id: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 255 }).notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  unit_price: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
});

// ============================================================
// TABLE: expenses
// ============================================================
export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  ai_categorized: boolean('ai_categorized').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// RELATIONS
// ============================================================
export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  clients: many(clients),
  invoices: many(invoices),
  expenses: many(expenses),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.user_id], references: [users.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.user_id], references: [users.id] }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.user_id], references: [users.id] }),
  client: one(clients, { fields: [invoices.client_id], references: [clients.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoice_id], references: [invoices.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.user_id], references: [users.id] }),
}));
