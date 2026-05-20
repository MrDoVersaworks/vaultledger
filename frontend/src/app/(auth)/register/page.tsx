'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail, KeyRound, User, Briefcase, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
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
    setIsSubmitting(true);

    try {
      await register(email, password, name, businessName || undefined);
      toast.success('Your VaultLedger has been initialized successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#080a10] px-4 relative overflow-hidden py-12">
      {/* Background Glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand logo & header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/10">
            <Lock className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Initialize Ledger
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Configure your secure corporate accounting chamber
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative">
          <form className="space-y-5" onSubmit={handleSubmit} id="register-form">
            {error && (
              <div className="p-3 text-xs font-semibold rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 outline-none text-slate-200"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 outline-none text-slate-200"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-business" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Business Name <span className="text-slate-600">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="register-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Oyewole Holdings Inc."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 outline-none text-slate-200"
                />
                <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 outline-none text-slate-200"
                />
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="register-submit"
              className="w-full py-3 px-4 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-lg shadow-emerald-500/10 hover:scale-[1.01]"
            >
              {isSubmitting ? 'Creating vault chamber...' : 'Create Vault'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-900 text-center text-xs text-slate-400">
            Already have a vault?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
              Enter here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
