'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { PlatformReviews } from '@/components/PlatformReviews';
import { UnifiedFooter } from '@/components/UnifiedFooter';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4" aria-label="Loading VaultLedger">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent-primary)] animate-spin" />
          <span className="text-sm text-[var(--text-secondary)]">Loading VaultLedger…</span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-primary)]/85">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Primary navigation">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--accent-primary)]">
              <span className="text-sm font-bold">V</span>
            </span>
            <span className="text-lg">VaultLedger</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
              Sign In
            </Link>
            <Link href="/register" className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-primary-hover)]">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pt-28">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
              Business finance, without the noise
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              A calmer way to manage invoices and expenses.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              Create professional invoices, manage clients, track expenses, and use your configured AI tools for categorization — with your existing VaultLedger workflows intact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-xl bg-[var(--accent-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-primary-hover)]">
                Launch Ledger
              </Link>
              <Link href="/login" className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]">
                Sign in
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lg)]">
            <img
              src="/dashboard-preview.png"
              alt="VaultLedger dashboard interface"
              className="block h-auto w-full"
            />
          </div>
        </section>

        <section className="border-y border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-10 sm:grid-cols-3 sm:px-8">
            {[
              ['Invoices', 'Line-item billing with precise tax and total calculations.'],
              ['Expenses', 'Manual or AI-assisted categorization with your configured model.'],
              ['Your data', 'Clients, invoices, and expenses remain scoped to your account.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <PlatformReviews />
        </section>
      </main>

      <UnifiedFooter
        platformName="VaultLedger"
        techStack="Next.js & Express"
        contactLink="https://devpulse-zeta-six.vercel.app/"
      />
    </div>
  );
}
