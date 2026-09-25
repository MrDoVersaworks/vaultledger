import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { invoices, expenses } from '../db/schema.js';
import type { DashboardSummaryResponse, MonthlyDashboardData } from '../types/index.js';
import { parseDecimal, formatDecimal } from '../utils/decimal.js';

export async function getDashboardSummary(userId: string): Promise<DashboardSummaryResponse> {
  // 1. Total Paid Revenue (status = 'Paid')
  const revenueResult = await db
    .select({ sum: sql<string>`coalesce(sum(${invoices.total}), '0.00')` })
    .from(invoices)
    .where(and(eq(invoices.user_id, userId), eq(invoices.status, 'Paid')));

  // 2. Total Outstanding (status = 'Sent')
  const outstandingResult = await db
    .select({ sum: sql<string>`coalesce(sum(${invoices.total}), '0.00')` })
    .from(invoices)
    .where(and(eq(invoices.user_id, userId), sql`${invoices.status} in ('Sent', 'Overdue')`));

  // 3. Total Expenses
  const expensesResult = await db
    .select({ sum: sql<string>`coalesce(sum(${expenses.amount}), '0.00')` })
    .from(expenses)
    .where(eq(expenses.user_id, userId));

  // 4. Counts
  const paidCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.user_id, userId), eq(invoices.status, 'Paid')));

  const draftCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.user_id, userId), eq(invoices.status, 'Draft')));

  return {
    totalRevenue: revenueResult[0]?.sum || '0.00',
    totalExpenses: expensesResult[0]?.sum || '0.00',
    outstanding: outstandingResult[0]?.sum || '0.00',
    paidInvoicesCount: paidCountResult[0]?.count || 0,
    draftInvoicesCount: draftCountResult[0]?.count || 0,
  };
}

export async function getMonthlyTrend(userId: string): Promise<MonthlyDashboardData[]> {
  const months: Array<{ month: string; revenueCents: bigint; expensesCents: bigint }> = [];
  
  // Generate the last 6 months dynamically (e.g. "Jan", "Feb" format)
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    months.push({
      month: label,
      revenueCents: 0n,
      expensesCents: 0n,
    });
  }

  // Aggregate in PostgreSQL so financial sums remain exact decimal values.
  const paidInvoices = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${invoices.paid_date}), 'Mon YY')`,
      total: sql<string>`coalesce(sum(${invoices.total}), '0.00')`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.user_id, userId),
        eq(invoices.status, 'Paid'),
        sql`${invoices.paid_date} >= ${startDate}`
      )
    )
    .groupBy(sql`date_trunc('month', ${invoices.paid_date})`);

  const recentExpenses = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${expenses.date}), 'Mon YY')`,
      amount: sql<string>`coalesce(sum(${expenses.amount}), '0.00')`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.user_id, userId),
        sql`${expenses.date} >= ${startDate}`
      )
    )
    .groupBy(sql`date_trunc('month', ${expenses.date})`);

  for (const inv of paidInvoices) {
    const bucket = months.find((m) => m.month === inv.month);
    if (bucket) bucket.revenue = Number(inv.total);
  }

  for (const exp of recentExpenses) {
    const bucket = months.find((m) => m.month === exp.month);
    if (bucket) bucket.expenses = Number(exp.amount);
  }

  // Format numeric values cleanly to 2 decimal points in numbers
  return months.map((m) => ({
    month: m.month,
    revenue: Number(formatDecimal(m.revenueCents, 2)),
    expenses: Number(formatDecimal(m.expensesCents, 2)),
  }));
}
