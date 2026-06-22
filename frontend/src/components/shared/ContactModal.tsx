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
  const [geminiKey, setGeminiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string; geminiKey?: string }>({});

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
    if (!geminiKey.trim()) newErrors.geminiKey = 'Gemini API Key is required for spam screening';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Step 1: Client-Side AI Gatekeeper (BYOK)
      const aiModel = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';
      const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are a strict security gatekeeper for a software engineer's portfolio. Analyze this incoming contact message. Is it a valid, professional inquiry (e.g., job offer, project inquiry, tech question) or is it spam/marketing/malware? Return ONLY the word 'TRUE' if valid, or 'FALSE' if spam. Message: ${message}` }]
          }]
        })
      });

      if (!aiRes.ok) {
        throw new Error('Invalid Gemini API Key or rate limit exceeded. Please check your key.');
      }

      const aiData = await aiRes.json();
      const aiDecision = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toUpperCase();

      if (aiDecision === 'FALSE') {
        throw new Error('AI Gatekeeper rejected this message as spam or irrelevant.');
      }

      // Step 2: Dispatch to secure backend
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003').replace(/\/$/, '');
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, aiScreeningPassed: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Failed to send message');
      }

      toast.success('Your message passed AI screening and was securely sent!');
      setName('');
      setEmail('');
      setMessage('');
      setGeminiKey('');
      setShowGuide(false);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch support ticket. Please try again.');
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

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[12px] font-bold text-emerald-500 uppercase tracking-wide">🤖 AI Gatekeeper (BYOK)</h4>
              <button 
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-[var(--text-secondary)] underline hover:text-[var(--text-primary)] transition-colors"
              >
                {showGuide ? 'Hide Guide' : 'How to get a free key?'}
              </button>
            </div>

            {showGuide && (
              <div className="bg-black/20 rounded-lg p-3 mb-3 text-[11px] text-[var(--text-secondary)] space-y-1.5">
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-medium">Google AI Studio</a>.</li>
                  <li>Sign in and click <strong>"Create API key"</strong>.</li>
                  <li>Copy the key and paste it below. (It runs locally, never stored).</li>
                </ol>
              </div>
            )}

            <div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Paste your Gemini API Key..."
                className={`w-full bg-[var(--bg-card)] border rounded-lg py-2 px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none transition-colors ${
                  errors.geminiKey ? 'border-rose-500/50 focus:border-rose-500' : 'border-[var(--border-default)] focus:border-emerald-500/50'
                }`}
              />
              {errors.geminiKey && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.geminiKey}</p>}
            </div>
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
