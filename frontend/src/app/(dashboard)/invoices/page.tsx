'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import type { ApiResponse, Invoice, Client } from '@/types/index';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  X, 
  Calculator, 
  ChevronDown, 
  Send, 
  CheckCircle,
  PlusCircle,
  Trash
} from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceItemFormLine {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Invoice Builder State
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItemFormLine[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInvoicesAndClients();
  }, []);

  async function loadInvoicesAndClients() {
    setIsLoading(true);
    try {
      const [invRes, cliRes] = await Promise.all([
        apiRequest<ApiResponse<Invoice[]>>({ method: 'GET', path: '/api/invoices' }),
        apiRequest<ApiResponse<Client[]>>({ method: 'GET', path: '/api/clients' }),
      ]);
      if (invRes.success) setInvoices(invRes.data);
      if (cliRes.success) setClients(cliRes.data);
    } catch {
      toast.error('Failed to load corporate invoices.');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setClientId('');
    // Auto-generate invoice number format (e.g. INV-2026-X)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNumber(`INV-2026-${randomSuffix}`);
    setDueDate('');
    setTaxRate(0);
    setNotes('');
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    setIsModalOpen(true);
  }

  function addFormLine() {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeFormLine(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  }

  function updateLineItem(index: number, field: keyof InvoiceItemFormLine, value: string | number) {
    const updated = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updated);
  }

  // Calculate Running Totals dynamically
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clientId) {
      toast.error('You must select a business client.');
      return;
    }
    
    // Check if descriptions are filled
    const invalidLine = items.some((it) => !it.description.trim());
    if (invalidLine) {
      toast.error('Please describe all line items.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest<ApiResponse<Invoice>>({
        method: 'POST',
        path: '/api/invoices',
        body: {
          clientId,
          invoiceNumber,
          taxRate,
          dueDate: dueDate || null,
          notes: notes || null,
          items,
        },
      });

      if (data.success) {
        toast.success(`Invoice ${invoiceNumber} created successfully.`);
        loadInvoicesAndClients();
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(invoiceId: string, newStatus: 'Sent' | 'Paid') {
    try {
      const data = await apiRequest<ApiResponse<Invoice>>({
        method: 'PATCH',
        path: `/api/invoices/${invoiceId}/status`,
        body: { status: newStatus },
      });
      if (data.success) {
        toast.success(`Invoice marked as ${newStatus}.`);
        loadInvoicesAndClients();
      }
    } catch {
      toast.error('Failed to update status.');
    }
  }

  async function handleDelete(invoiceId: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const data = await apiRequest<ApiResponse<null>>({
        method: 'DELETE',
        path: `/api/invoices/${invoiceId}`,
      });
      if (data.success) {
        toast.success('Invoice deleted successfully.');
        loadInvoicesAndClients();
        setSelectedInvoice(null);
      }
    } catch {
      toast.error('Failed to delete invoice.');
    }
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Title Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Invoice Registry
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Generate transactional line items and billings for registered clients
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={clients.length === 0}
          className="btn-emerald px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
          id="btn-add-invoice"
        >
          <Plus size={14} className="stroke-[3]" />
          Create Invoice Builder
        </button>
      </div>

      {clients.length === 0 && (
        <div className="p-4 text-xs font-semibold rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-2">
          <span>⚠️</span> Register a business client profile under the Clients tab first before you can construct invoices.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-[var(--border-default)] border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-12 rounded-3xl text-center backdrop-blur-md shadow-sm">
          <div className="w-12 h-12 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl flex items-center justify-center mx-auto text-[var(--text-secondary)] mb-4">
            <FileText size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No Invoices Registered</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            Build itemized billing sheets and track payments cleanly.
          </p>
        </div>
      ) : (
        /* Responsive Table & Card-Reflow Grid (Rule AUI) */
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl overflow-hidden backdrop-blur-md shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Inv #</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] text-[var(--text-primary)]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 font-semibold text-[var(--text-secondary)]">{inv.client?.name}</td>
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)]">${Number(inv.total).toFixed(2)}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                        inv.status === 'Sent' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/10' :
                        'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]"
                        title="View Details"
                      >
                        <Eye size={12} />
                      </button>
                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'Sent')}
                          className="p-1.5 rounded-lg bg-cyan-950/15 border border-cyan-900/20 text-cyan-400 hover:bg-cyan-900/20 hover:text-cyan-300"
                          title="Mark Sent"
                        >
                          <Send size={12} />
                        </button>
                      )}
                      {inv.status === 'Sent' && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'Paid')}
                          className="p-1.5 rounded-lg bg-emerald-950/15 border border-emerald-900/20 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300"
                          title="Mark Paid"
                        >
                          <CheckCircle size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded-lg bg-rose-950/10 hover:bg-rose-900/20 text-rose-400 hover:text-rose-300 border border-rose-900/10"
                        title="Delete Invoice"
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
          <div className="block md:hidden divide-y divide-[var(--border-default)] p-4 space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="pt-4 first:pt-0 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-sm">{inv.invoiceNumber}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{inv.client?.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                    inv.status === 'Sent' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10' :
                    'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-[var(--text-secondary)]">DUE DATE</p>
                    <p className="text-[var(--text-primary)] font-medium">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--text-secondary)]">TOTAL</p>
                    <p className="text-[var(--text-primary)] font-bold">${Number(inv.total).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-end pt-2 border-t border-[var(--border-default)]">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="flex-1 py-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-[10px] font-bold border border-[var(--border-default)] flex items-center justify-center gap-1"
                  >
                    <Eye size={10} /> View details
                  </button>
                  {inv.status === 'Draft' && (
                    <button
                      onClick={() => handleStatusChange(inv.id, 'Sent')}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-950/20 text-cyan-400 text-[10px] font-bold border border-cyan-900/20 flex items-center justify-center gap-1"
                    >
                      <Send size={10} /> Send
                    </button>
                  )}
                  {inv.status === 'Sent' && (
                    <button
                      onClick={() => handleStatusChange(inv.id, 'Paid')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-950/20 text-emerald-400 text-[10px] font-bold border border-emerald-900/20 flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={10} /> Paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Creator Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm overflow-y-auto fade-in">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Invoice Builder
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Close Builder"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Business Client
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] shadow-sm"
                  >
                    <option value="" disabled>-- Select Corporate Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Invoice number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Tax Rate (%)
                  </label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] shadow-sm"
                  >
                    <option value="0">0% (No Tax)</option>
                    <option value="5">5% (Standard GST)</option>
                    <option value="10">10% (Sales Tax)</option>
                    <option value="15">15% (VAT)</option>
                    <option value="20">20% (Luxury Goods)</option>
                  </select>
                </div>
              </div>

              {/* Line Items Builder Section */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Billable Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={addFormLine}
                    className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={10} /> Add Line Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((line, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-default)]">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                          placeholder="Description of deliverables"
                          required
                          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] focus:border-emerald-500 rounded-lg text-sm outline-none text-[var(--text-primary)] shadow-sm"
                        />
                      </div>
                      <div className="w-full sm:w-20 space-y-1">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          min="1"
                          required
                          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] focus:border-emerald-500 rounded-lg text-sm outline-none text-[var(--text-primary)] shadow-sm"
                        />
                      </div>
                      <div className="w-full sm:w-28 space-y-1">
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                          placeholder="Price"
                          min="0"
                          required
                          className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] focus:border-emerald-500 rounded-lg text-sm outline-none text-[var(--text-primary)] shadow-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFormLine(idx)}
                        disabled={items.length === 1}
                        className="text-rose-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-950/15 disabled:opacity-30 shrink-0 self-end sm:self-auto"
                        title="Delete line"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Computations Drawer */}
              <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-default)] mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[var(--text-primary)]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tax Amount ({taxRate}%):</span>
                  <span className="font-semibold text-[var(--text-primary)]">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-default)] font-bold text-sm text-[var(--text-primary)]">
                  <span>Total Due Balance:</span>
                  <span className="text-emerald-500">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Client Notes / Terms
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thank you for your business. Payment terms: Net 30 days."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] resize-none shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] rounded-xl text-xs font-bold border border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'Recording invoice...' : 'Record Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm overflow-y-auto fade-in">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-input)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Invoice Details: {selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Close View"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Billed To</p>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">{selectedInvoice.client?.name}</h4>
                  <p className="text-[var(--text-secondary)] mt-0.5">{selectedInvoice.client?.email}</p>
                  <p className="text-[var(--text-secondary)] mt-0.5">{selectedInvoice.client?.address}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                    selectedInvoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                    selectedInvoice.status === 'Sent' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/10' :
                    'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mt-4">Due Date</p>
                  <p className="text-[var(--text-primary)] font-semibold mt-0.5">
                    {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-3 pt-6 border-t border-[var(--border-default)]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Itemized Dues
                </h4>
                <div className="divide-y divide-[var(--border-default)] bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl p-3">
                  {selectedInvoice.items?.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center gap-4 text-xs">
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">{item.description}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                          {Number(item.quantity).toFixed(0)} x ${Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">${Number(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary drawer */}
              <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal:</span>
                  <span>${Number(selectedInvoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tax Amount ({Number(selectedInvoice.taxRate).toFixed(0)}%):</span>
                  <span>${Number(selectedInvoice.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-default)] font-bold text-sm text-emerald-500">
                  <span>Total Dues:</span>
                  <span>${Number(selectedInvoice.total).toFixed(2)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="pt-4 border-t border-[var(--border-default)]">
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Notes</p>
                  <p className="text-[var(--text-secondary)] mt-1 italic font-medium">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-default)]">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] rounded-xl font-bold border border-[var(--border-default)]"
                >
                  Close View
                </button>
                <button
                  onClick={() => handleDelete(selectedInvoice.id)}
                  className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Trash2 size={12} /> Delete Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
