'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import type { ApiResponse, Expense, AISettings } from '@/types/index';
import { 
  CircleDollarSign, 
  Plus, 
  Trash2, 
  X, 
  Sparkles, 
  Calendar,
  Layers,
  Filter,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { STANDARD_CATEGORIES } from '@/constants/index';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [aiOnlyFilter, setAiOnlyFilter] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Meals & Entertainment');
  const [useAI, setUseAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExpensesAndSettings();
  }, []);

  async function loadExpensesAndSettings() {
    setIsLoading(true);
    try {
      const [expRes, setRes] = await Promise.all([
        apiRequest<ApiResponse<Expense[]>>({ method: 'GET', path: '/api/expenses' }),
        apiRequest<ApiResponse<AISettings>>({ method: 'GET', path: '/api/settings' }),
      ]);
      if (expRes.success) setExpenses(expRes.data);
      if (setRes.success) {
        setHasApiKey(setRes.data.hasApiKey);
        // Default toggle useAI to true if they have configured a key!
        if (setRes.data.hasApiKey) {
          setUseAI(true);
        }
      }
    } catch {
      toast.error('Failed to load expense registry.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please input a valid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = useAI ? '/api/expenses/ai' : '/api/expenses';
      const body = {
        description,
        amount: amountNum,
        date: new Date(date).toISOString(),
        ...(useAI ? {} : { category }),
      };

      const data = await apiRequest<ApiResponse<Expense>>({
        method: 'POST',
        path: endpoint,
        body,
      });

      if (data.success) {
        if (useAI && data.data.aiCategorized) {
          toast.success(`Gemini intelligently categorized expense as: "${data.data.category}"!`, {
            icon: '✨',
            duration: 5000,
          });
        } else if (useAI && !data.data.aiCategorized) {
          toast.warning(`Gemini categorized under default: "${data.data.category}" (Check Settings API Key).`);
        } else {
          toast.success('Expense recorded successfully.');
        }

        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        // Keep useAI toggle state
        loadExpensesAndSettings();
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(expenseId: string) {
    if (!confirm('Are you sure you want to delete this expense record?')) return;

    try {
      const data = await apiRequest<ApiResponse<null>>({
        method: 'DELETE',
        path: `/api/expenses/${expenseId}`,
      });
      if (data.success) {
        toast.success('Expense entry deleted successfully.');
        loadExpensesAndSettings();
      }
    } catch {
      toast.error('Failed to delete expense record.');
    }
  }

  // Filter Logic
  const filteredExpenses = expenses.filter((exp) => {
    const categoryMatches = selectedCategoryFilter === 'All' || exp.category === selectedCategoryFilter;
    const aiMatches = !aiOnlyFilter || exp.aiCategorized;
    return categoryMatches && aiMatches;
  });

  return (
    <div className="space-y-8 fade-in">
      {/* Title Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Expense Registry
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Record operating expenditures and leverage Gemini AI to auto-classify categories
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-emerald px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 self-start sm:self-auto"
          id="btn-add-expense"
        >
          <Plus size={14} className="stroke-[3]" />
          Record Operating Cost
        </button>
      </div>

      {/* Filters Board */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl backdrop-blur-md text-xs shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-[var(--text-secondary)]" />
            <span className="text-[var(--text-secondary)] font-bold uppercase tracking-wider">Filter Category:</span>
          </div>
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              id="select-filter-category"
              className="appearance-none px-4 py-1.5 pr-8 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-lg text-xs font-semibold outline-none text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <option value="All">All Categories</option>
              {STANDARD_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-secondary)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <button
          onClick={() => setAiOnlyFilter(!aiOnlyFilter)}
          className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all duration-200 ${
            aiOnlyFilter
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm'
              : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Sparkles size={12} className={aiOnlyFilter ? 'animate-pulse' : ''} />
          AI Categorized Only
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-[var(--border-default)] border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-12 rounded-3xl text-center backdrop-blur-md shadow-sm">
          <div className="w-12 h-12 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl flex items-center justify-center mx-auto text-[var(--text-secondary)] mb-4 shadow-sm">
            <CircleDollarSign size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No Expenses Recorded</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            Log corporate outflows to maintain balanced ledger books.
          </p>
        </div>
      ) : (
        /* Responsive Card-Reflow List (Rule AUI) */
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl overflow-hidden backdrop-blur-md shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Expense description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date logged</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50 text-slate-300">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{exp.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-bold text-slate-400">
                          {exp.category}
                        </span>
                        {exp.aiCategorized && (
                          <span className="px-1.5 py-0.2 bg-emerald-950/20 border border-emerald-900/20 rounded text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 shadow-glow animate-pulse">
                            <Sparkles size={8} /> AI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-400">
                      -${Number(exp.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg bg-rose-950/10 hover:bg-rose-900/20 text-rose-400 hover:text-rose-300 border border-rose-900/10"
                        title="Delete expense entry"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Reflowed Card View (Rule AUI) */}
          <div className="block md:hidden divide-y divide-slate-900/60 p-4 space-y-4">
            {filteredExpenses.map((exp) => (
              <div key={exp.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-200 text-xs truncate">{exp.description}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs font-bold text-rose-400">-${Number(exp.amount).toFixed(2)}</div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-bold text-slate-400">
                      {exp.category}
                    </span>
                    {exp.aiCategorized && (
                      <span className="px-1.5 py-0.2 bg-emerald-950/20 border border-emerald-900/20 rounded text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 shadow-glow animate-pulse">
                        <Sparkles size={8} /> AI
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 rounded-lg bg-rose-950/10 hover:bg-rose-900/20 text-rose-400 border border-rose-900/10 text-[10px] font-bold"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Creator Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-slate-950 border border-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Log Operating Expenditure
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Expense Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  id="input-expense-description"
                  placeholder="AWS Cloud hosting monthly invoice"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs outline-none text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Amount ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      id="input-expense-amount"
                      placeholder="149.99"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs outline-none text-slate-200"
                    />
                    <DollarSign className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs outline-none text-slate-200"
                  />
                </div>
              </div>

              {/* AI Auto-Categorize Toggle Switch */}
              <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-900/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Gemini Tax Auto-Categorization</h4>
                      <p className="text-[10px] text-slate-500">Auto-resolves appropriate category mapping using AI</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-toggle-ai"
                    onClick={() => {
                      if (!hasApiKey) {
                        toast.warning('Configure Gemini API Key in Settings first to enable AI classification!');
                        return;
                      }
                      setUseAI(!useAI);
                    }}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      useAI ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                        useAI ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Manual Category Select (Visible if AI is disabled) */}
              {!useAI && (
                <div className="space-y-1.5 fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tax Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    id="select-expense-category"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs outline-none text-slate-200"
                  >
                    {STANDARD_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'Recording cost...' : 'Record Operating Cost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
