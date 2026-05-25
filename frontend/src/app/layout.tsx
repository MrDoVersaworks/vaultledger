import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'VaultLedger — Secure Invoice & AI Expense Tracker',
  description: 'Smart self-hosted accounting ledger, invoice builder, client manager, and intelligent AI-powered expense categorizer powered by Gemini. Take back control of your business finance.',
  openGraph: {
    title: 'VaultLedger — Secure Invoice & AI Expense Tracker',
    description: 'Smart self-hosted accounting ledger, invoice builder, client manager, and intelligent AI-powered expense categorizer.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem('vaultledger-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', storedTheme);
                if (storedTheme === 'dark') {
                  document.documentElement.style.backgroundColor = '#09090f';
                } else {
                  document.documentElement.style.backgroundColor = '#f8fafc';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                },
              }}
              richColors
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
