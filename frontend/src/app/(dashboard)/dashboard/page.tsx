'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import type { ApiResponse, DashboardSummary, MonthlyDashboardData, Invoice, Expense } from '@/types/index';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Plus, 
  Users, 
  FileText, 
  CircleDollarSign,
  Activity,
  PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<MonthlyDashboardData[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sumRes, trendRes, invRes, expRes] = await Promise.all([
          apiRequest<ApiResponse<DashboardSummary>>({ method: 'GET', path: '/api/dashboard/summary' }),
          apiRequest<ApiResponse<MonthlyDashboardData[]>>({ method: 'GET', path: '/api/dashboard/trend' }),
          apiRequest<ApiResponse<Invoice[]>>({ method: 'GET', path: '/api/invoices' }),
          apiRequest<ApiResponse<Expense[]>>({ method: 'GET', path: '/api/expenses' }),
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (trendRes.success) setTrend(trendRes.data);
        if (invRes.success) setRecentInvoices(invRes.data.slice(0, 5));
        if (expRes.success) setRecentExpenses(expRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalRevenueNum = Number(summary?.totalRevenue || 0);
  const totalExpensesNum = Number(summary?.totalExpenses || 0);
  const profit = totalRevenueNum - totalExpensesNum;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-[var(--border-default)] border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-secondary)] font-semibold">Opening corporate accounting ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Financial Cockpit
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Overview of your active business accounting flows and cash balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/invoices?create=true"
            className="btn-emerald px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            <Plus size={14} className="stroke-[3]" />
            New Invoice
          </Link>
          <Link
            href="/expenses?create=true"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] flex items-center gap-1.5 transition-all duration-200 shadow-sm"
          >
            <PlusCircle size={14} />
            Log Expense
          </Link>
        </div>
      </div>

      {/* Aggregated Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-md shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black mt-4 text-[var(--text-primary)]">
            ${totalRevenueNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-0.5">
            <span>{summary?.paidInvoicesCount || 0} paid invoices logged</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-md shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/10 flex items-center justify-center text-rose-500">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black mt-4 text-[var(--text-primary)]">
            ${totalExpensesNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] font-semibold mt-1 flex items-center gap-0.5">
            <span>Operating outgoing costs</span>
          </div>
        </div>

        {/* Outstanding Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-md shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Outstanding Receivables</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-500">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl font-black mt-4 text-[var(--text-primary)]">
            ${Number(summary?.outstanding || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-500 font-semibold mt-1">
            {summary?.draftInvoicesCount || 0} drafts awaiting completion
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-md shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Net Balances</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center text-cyan-500">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black mt-4 ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] font-semibold mt-1">
            Realized cash flow margin
          </div>
        </div>
      </div>

      {/* Main Grid: Trend Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend CSS + Framer Bar Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl backdrop-blur-md flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Historical Cash Trend</h3>
              <p className="text-xs text-[var(--text-secondary)]">Revenue vs operating costs for the last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[var(--text-secondary)] font-semibold">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-[var(--text-secondary)] font-semibold">Expenses</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] flex items-end justify-between gap-4 pt-4 border-b border-[var(--border-default)]">
            {trend.map((t, idx) => {
              const maxVal = Math.max(...trend.map((item) => Math.max(item.revenue, item.expenses)), 100);
              const revPercent = Math.min(100, Math.max(4, (t.revenue / maxVal) * 100));
              const expPercent = Math.min(100, Math.max(4, (t.expenses / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-[calc(100%+8px)] hidden group-hover:flex flex-col items-center bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[10px] p-2 rounded-lg z-25 min-w-[90px] shadow-2xl">
                    <p className="font-bold text-[var(--text-primary)]">{t.month}</p>
                    <p className="text-emerald-500 mt-0.5">Rev: ${t.revenue.toLocaleString()}</p>
                    <p className="text-cyan-500">Exp: ${t.expenses.toLocaleString()}</p>
                  </div>

                  <div className="w-full flex justify-center items-end gap-1 h-36">
                    {/* Revenue Bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${revPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="w-4 rounded-t-sm bg-gradient-to-t from-emerald-500/40 to-emerald-500 hover:brightness-110 cursor-pointer"
                    />
                    {/* Expense Bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${expPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="w-4 rounded-t-sm bg-gradient-to-t from-cyan-500/40 to-cyan-500 hover:brightness-110 cursor-pointer"
                    />
                  </div>

                  <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider mt-1">{t.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Utilities / Resource Counts */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Accounting Vault</h3>
            <p className="text-xs text-[var(--text-secondary)]">Quick links to organize your corporate entries</p>
          </div>

          <div className="space-y-3 my-6">
            <Link
              href="/clients"
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:border-emerald-500/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Users size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Client Ledger</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Register clients & outstanding dues</div>
                </div>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-bold">Manage →</span>
            </Link>

            <Link
              href="/invoices"
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:border-emerald-500/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Invoice Registry</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Build invoices & line item totals</div>
                </div>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-bold">Manage →</span>
            </Link>

            <Link
              href="/expenses"
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:border-emerald-500/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <CircleDollarSign size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Expense Registry</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Record costs with AI categorization</div>
                </div>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-bold">Manage →</span>
            </Link>
          </div>

          <div className="text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-default)] pt-3 text-center">
            Sovereign Ledger version 1.0.0
          </div>
        </div>
      </div>

      {/* Sub-grid: Recent Invoices and Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices list */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Invoices</h3>
            <Link href="/invoices" className="text-xs font-bold text-emerald-500 hover:underline">
              View all
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-6 text-center">No invoices logged yet. Click New Invoice above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-bold">
                    <th className="py-2.5">Inv #</th>
                    <th className="py-2.5">Client</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)] text-[var(--text-primary)]">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="py-3 font-semibold text-[var(--text-secondary)]">{inv.invoiceNumber}</td>
                      <td className="py-3 truncate max-w-[120px]">{inv.client?.name}</td>
                      <td className="py-3 font-bold">${Number(inv.total).toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                          inv.status === 'Sent' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10' :
                          'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Expenses list */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Operating Expenses</h3>
            <Link href="/expenses" className="text-xs font-bold text-emerald-500 hover:underline">
              View all
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-6 text-center">No expenses logged yet. Log your first cost above!</p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors border border-transparent hover:border-[var(--border-default)]">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{exp.description}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                      <span>{new Date(exp.date).toLocaleDateString()}</span>
                      {exp.category && (
                        <span className="px-1.5 py-0.2 bg-[var(--bg-input)] rounded border border-[var(--border-default)] text-[8px] font-bold text-[var(--text-secondary)]">
                          {exp.category}
                        </span>
                      )}
                      {exp.aiCategorized && (
                        <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                          AI
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    -${Number(exp.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
