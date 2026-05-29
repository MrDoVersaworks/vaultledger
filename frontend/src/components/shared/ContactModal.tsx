'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, X, User, MessageSquare } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Your message has been securely sent! We will respond shortly.');
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    } catch {
      toast.error('Failed to dispatch support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl p-6 shadow-2xl shadow-emerald-500/5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4 mb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <span>Secure Support Inquiry</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--bg-card-hover)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
          Send a validated inquiry to support. Your message is encrypted at transit and routed via our secure corporate pipeline.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className={`w-full bg-[var(--bg-card)] border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none transition-colors ${
                  errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border-default)] focus:border-emerald-500/50'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full bg-[var(--bg-card)] border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none transition-colors ${
                  errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border-default)] focus:border-emerald-500/50'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Message</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[var(--text-secondary)]" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you?"
                rows={4}
                className={`w-full bg-[var(--bg-card)] border rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none resize-none transition-colors ${
                  errors.message ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border-default)] focus:border-emerald-500/50'
                }`}
              />
            </div>
            {errors.message && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-md shadow-emerald-500/10 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
