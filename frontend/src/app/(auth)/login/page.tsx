'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
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
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('Welcome back to VaultLedger!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 relative overflow-hidden">
      <div className="w-full max-w-md">
        {/* Brand logo & header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent-primary)] border border-white/10 mb-4 shadow-sm">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            VaultLedger
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            Sign in to your VaultLedger account
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-md)] relative">
          <form className="space-y-5" onSubmit={handleSubmit} id="login-form">
            {error && (
              <div className="p-3 text-xs font-semibold rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--border-focus)] rounded-xl text-sm placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all duration-200 outline-none text-[var(--text-primary)]"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] focus:border-[var(--border-focus)] rounded-xl text-sm placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--border-focus)]/20 transition-all duration-200 outline-none text-[var(--text-primary)]"
                />
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="login-submit"
              className="w-full py-3 px-4 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-sm"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-default)] text-center text-xs text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-semibold hover:underline">
              Create your account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
