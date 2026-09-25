export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-5 pb-16 pt-24 text-[var(--text-secondary)] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-sm)] sm:p-10">
        <p className="text-sm font-medium text-[var(--accent-primary)]">VaultLedger</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)]">Version 1.0.0 · Last updated July 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7">
          <section><h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Acceptance of Terms</h2><p className="mt-2">By accessing or using VaultLedger, you agree to be bound by these Terms of Service.</p></section>
          <section><h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Financial Records</h2><p className="mt-2">You are responsible for reviewing the accuracy of invoices, expenses, tax values, and other records entered into the service.</p></section>
          <section><h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Account Responsibility</h2><p className="mt-2">Keep your account credentials and configured third-party API credentials secure. Do not share access to your account with unauthorized users.</p></section>
        </div>
      </article>
    </main>
  );
}
