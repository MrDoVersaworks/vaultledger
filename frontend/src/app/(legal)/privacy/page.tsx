export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-5 pb-16 pt-24 text-[var(--text-secondary)] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-sm)] sm:p-10">
        <p className="text-sm font-medium text-[var(--accent-primary)]">VaultLedger</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)]">Version 1.0.0 · Last updated July 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7">
          <section><h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Information We Collect</h2><p className="mt-2">VaultLedger stores information you provide to operate your account, including profile details, clients, invoices, expenses, and settings.</p></section>
          <section><h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Data Security</h2><p className="mt-2">Sensitive credentials configured for supported AI integrations are encrypted before storage. Access to account data is scoped to the authenticated account.</p></section>
          <section><h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Contact Messages</h2><p className="mt-2">Messages submitted through the public contact form are stored for support and administrative follow-up.</p></section>
        </div>
      </article>
    </main>
  );
}
