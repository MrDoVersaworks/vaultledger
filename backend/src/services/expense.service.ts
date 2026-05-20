import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { expenses } from '../db/schema.js';
import { ErrorCode } from '../constants/index.js';
import { logger } from '../utils/logger.js';
import { getDecryptedApiKey, getUserModel } from './settings.service.js';
import { categorizeExpense } from './ai.service.js';
import type { ExpenseResponse } from '../types/index.js';

interface CreateExpenseInput {
  description: string;
  amount: number;
  date: string;
  category?: string | null;
}

interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  date?: string;
  category?: string | null;
}

function mapToExpenseResponse(row: typeof expenses.$inferSelect): ExpenseResponse {
  return {
    id: row.id,
    userId: row.user_id,
    description: row.description,
    amount: row.amount,
    category: row.category,
    date: row.date.toISOString(),
    aiCategorized: row.ai_categorized,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getExpenses(userId: string): Promise<ExpenseResponse[]> {
  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.user_id, userId));

  return rows.map(mapToExpenseResponse);
}

export async function getExpenseById(userId: string, expenseId: string): Promise<ExpenseResponse> {
  const rows = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.user_id, userId)))
    .limit(1);

  if (rows.length === 0) {
    throw new Error(`[${ErrorCode.EXPENSE_NOT_FOUND}] Expense record not found.`);
  }

  return mapToExpenseResponse(rows[0]);
}

export async function createExpense(userId: string, input: CreateExpenseInput): Promise<ExpenseResponse> {
  const inserted = await db
    .insert(expenses)
    .values({
      user_id: userId,
      description: input.description,
      amount: input.amount.toFixed(2),
      date: new Date(input.date),
      category: input.category || 'Other',
      ai_categorized: false,
    })
    .returning();

  if (inserted.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to record expense.`);
  }

  logger.info('EXPENSE', `Expense created: ${inserted[0].id} for user ${userId}`);
  return mapToExpenseResponse(inserted[0]);
}

export async function createExpenseAI(userId: string, input: CreateExpenseInput): Promise<ExpenseResponse> {
  let category = input.category || 'Other';
  let aiCategorized = false;

  try {
    const apiKey = await getDecryptedApiKey(userId);
    const model = await getUserModel(userId);

    logger.info('EXPENSE', `Running AI auto-categorization for expense: "${input.description}"`);
    const aiCategory = await categorizeExpense(apiKey, model, input.description, input.amount.toFixed(2));
    
    category = aiCategory;
    aiCategorized = true;
    logger.info('EXPENSE', `AI categorized expense as: "${aiCategory}"`);
  } catch (error: unknown) {
    // If decryption fails, model isn't configured, or AI fails, we log it and fallback to manual creation gracefully.
    logger.warn('EXPENSE', `AI categorization failed or not configured. Falling back to default: ${error instanceof Error ? error.message : String(error)}`);
  }

  const inserted = await db
    .insert(expenses)
    .values({
      user_id: userId,
      description: input.description,
      amount: input.amount.toFixed(2),
      date: new Date(input.date),
      category,
      ai_categorized: aiCategorized,
    })
    .returning();

  if (inserted.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to record expense.`);
  }

  logger.info('EXPENSE', `AI expense recorded: ${inserted[0].id} for user ${userId}`);
  return mapToExpenseResponse(inserted[0]);
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<ExpenseResponse> {
  // Verify ownership
  await getExpenseById(userId, expenseId);

  const updated = await db
    .update(expenses)
    .set({
      description: input.description,
      amount: input.amount !== undefined ? input.amount.toFixed(2) : undefined,
      date: input.date ? new Date(input.date) : undefined,
      category: input.category !== undefined ? (input.category || 'Other') : undefined,
      ai_categorized: input.category !== undefined ? false : undefined, // If user manually overrides, clear AI flag
    })
    .where(and(eq(expenses.id, expenseId), eq(expenses.user_id, userId)))
    .returning();

  if (updated.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to update expense.`);
  }

  logger.info('EXPENSE', `Expense updated: ${expenseId}`);
  return mapToExpenseResponse(updated[0]);
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  // Verify ownership
  await getExpenseById(userId, expenseId);

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.user_id, userId)));

  logger.info('EXPENSE', `Expense deleted: ${expenseId}`);
}
