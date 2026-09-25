import { UnifiedFooter } from '@/components/UnifiedFooter';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 py-20">
      <main className="mx-auto max-w-4xl space-y-8">
        <header className="border-b border-[var(--border-default)] pb-6">
          <p className="text-sm text-[var(--text-secondary)]">VaultLedger legal</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Version 1.0.0 · Last updated July 2026</p>
        </header>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>VaultLedger stores account, client, invoice, expense, and other information that you choose to provide.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Data Security</h2>
          <p>Sensitive credentials are protected using the application's configured encryption and authentication controls.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Contact</h2>
          <p>For privacy questions, use the public contact form provided by VaultLedger.</p>
        </section>
      </main>
      <UnifiedFooter />
    </div>
  );
}
