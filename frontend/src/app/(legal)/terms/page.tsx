import { UnifiedFooter } from '@/components/UnifiedFooter';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 py-20">
      <main className="mx-auto max-w-4xl space-y-8">
        <header className="border-b border-[var(--border-default)] pb-6">
          <p className="text-sm text-[var(--text-secondary)]">VaultLedger legal</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Version 1.0.0 · Last updated July 2026</p>
        </header>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>By accessing or using VaultLedger, you agree to these Terms of Service.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Financial Records</h2>
          <p>You are responsible for reviewing the accuracy of invoices, expenses, and other records entered into the service.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Service Use</h2>
          <p>Use VaultLedger only for lawful purposes and protect the credentials associated with your account.</p>
        </section>
      </main>
      <UnifiedFooter />
    </div>
  );
}
