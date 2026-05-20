'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import type { ApiResponse, Client } from '@/types/index';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setIsLoading(true);
    try {
      const data = await apiRequest<ApiResponse<Client[]>>({
        method: 'GET',
        path: '/api/clients',
      });
      if (data.success) {
        setClients(data.data);
      }
    } catch {
      toast.error('Failed to load corporate clients.');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setEditingClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setIsModalOpen(true);
  }

  function openEditModal(client: Client) {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingClient) {
        // Update client
        const data = await apiRequest<ApiResponse<Client>>({
          method: 'PUT',
          path: `/api/clients/${editingClient.id}`,
          body: {
            name,
            email: email || null,
            phone: phone || null,
            address: address || null,
          },
        });
        if (data.success) {
          toast.success('Client updated successfully.');
          loadClients();
          setIsModalOpen(false);
        }
      } else {
        // Create client
        const data = await apiRequest<ApiResponse<Client>>({
          method: 'POST',
          path: '/api/clients',
          body: {
            name,
            email: email || null,
            phone: phone || null,
            address: address || null,
          },
        });
        if (data.success) {
          toast.success('New client registered successfully.');
          loadClients();
          setIsModalOpen(false);
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return;

    try {
      const data = await apiRequest<ApiResponse<null>>({
        method: 'DELETE',
        path: `/api/clients/${client.id}`,
      });
      if (data.success) {
        toast.success('Client profile deleted successfully.');
        loadClients();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cannot delete client with active invoices.');
    }
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Corporate Clients
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Maintain accounts and directory cards for business customers
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-emerald px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 self-start sm:self-auto"
          id="btn-add-client"
        >
          <Plus size={14} className="stroke-[3]" />
          Add Business Client
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-[var(--border-default)] border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-12 rounded-3xl text-center backdrop-blur-md shadow-sm">
          <div className="w-12 h-12 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl flex items-center justify-center mx-auto text-[var(--text-secondary)] mb-4">
            <Users size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No Clients Registered</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            You must register a client profile first before generating custom itemized invoices.
          </p>
          <button
            onClick={openCreateModal}
            className="btn-emerald px-4 py-2 mt-4 rounded-xl text-xs font-bold"
            id="btn-register-entity"
          >
            Create Client Profile
          </button>
        </div>
      ) : (
        /* Responsive Card-Reflow Grid (Rule AUI) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-200 backdrop-blur-md relative group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-emerald-500 transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      Added {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditModal(client)}
                      className="p-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]"
                      aria-label="Edit Client"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/10"
                      aria-label="Delete Client"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-default)] space-y-2 text-xs">
                  {client.email && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Mail size={12} className="text-[var(--text-secondary)] shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Phone size={12} className="text-[var(--text-secondary)] shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                      <MapPin size={12} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
                      <span className="truncate line-clamp-1">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Form Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-overlay)] backdrop-blur-sm fade-in">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {editingClient ? 'Modify Business Client' : 'Register New Client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Client Business Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Global Corporation"
                  required
                  className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@acme.com"
                  className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-emerald-500 rounded-xl text-sm outline-none text-[var(--text-primary)] shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Business Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Corporate Blvd, Suite 400&#10;San Francisco, CA 94107"
                  rows={3}
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
                  {isSubmitting ? 'Saving chamber...' : editingClient ? 'Update Client' : 'Record Client Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
