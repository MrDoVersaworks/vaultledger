'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail, KeyRound, User, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!termsAgreed) {
      setError('You must agree to the Terms of Service and Privacy Policy to proceed.');
      toast.error('Terms & Privacy agreement required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, name, businessName || undefined);
      toast.success('Your account has been created successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 relative overflow-hidden py-12">
      <div className="w-full max-w-md">
        {/* Brand logo & header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent-primary)] border border-white/10 mb-4 shadow-sm">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Create your account
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            Set up your VaultLedger account
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-md)] relative">
          <form className="space-y-5" onSubmit={handleSubmit} id="register-form">
            {error && (
              <div className="p-3 text-xs font-semibold rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Oyewole Favour"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--border-focus)] rounded-xl text-sm placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all duration-200 outline-none text-[var(--text-primary)]"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="favour@company.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--border-focus)] rounded-xl text-sm placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all duration-200 outline-none text-[var(--text-primary)]"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-business" className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Business Name <span className="text-[var(--text-muted)]">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="register-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Oyewole Holdings Inc."
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--border-focus)] rounded-xl text-sm placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all duration-200 outline-none text-[var(--text-primary)]"
                />
                <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--border-focus)] rounded-xl text-sm placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all duration-200 outline-none text-[var(--text-primary)]"
                />
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Terms & Conditions Agreement Section */}
            <div className="p-4 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <input
                  id="terms-checkbox-vl"
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-[var(--bg-primary)] cursor-pointer"
                />
                <label htmlFor="terms-checkbox-vl" className="text-xs text-[var(--text-secondary)] leading-relaxed cursor-pointer select-none">
                  I have read and agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-emerald-400 underline hover:text-emerald-300 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="text-emerald-400 underline hover:text-emerald-300 font-medium">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              <div className="flex gap-2 pt-1 border-t border-[var(--border-default)] text-[11px]">
                <button
                  type="button"
                  onClick={() => setTermsAgreed(true)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                    termsAgreed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-[var(--text-secondary)] hover:bg-slate-700'
                  }`}
                >
                  {termsAgreed ? '✓ Terms Agreed' : 'I Agree'}
                </button>
                <button
                  type="button"
                  onClick={() => setTermsAgreed(false)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                    !termsAgreed
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-[var(--text-secondary)] hover:bg-slate-700'
                  }`}
                >
                  Decline
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !termsAgreed}
              id="register-submit"
              className={`w-full py-3 px-4 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 shadow-lg shadow-emerald-500/10 ${
                !termsAgreed ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? 'Creating vault chamber...' : 'Create Vault'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-default)] text-center text-xs text-[var(--text-secondary)]">
            Already have a vault?{' '}
            <Link href="/login" className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-semibold hover:underline">
              Enter here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
