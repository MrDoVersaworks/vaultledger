import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';
import Script from 'next/script';
import { API_BASE_URL } from '@/constants';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  let settings: any = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      settings = json.data;
    }
  } catch (e) {
    console.warn('Failed to fetch global settings for scripts');
  }

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning={true}>
      <head>
        {settings?.termly_uuid && (
          <script
            type="text/javascript"
            src="https://app.termly.io/embed.min.js"
            data-auto-block="on"
            data-website-uuid={settings.termly_uuid}
          ></script>
        )}
        {settings?.google_analytics_id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.google_analytics_id}');
              `}
            </Script>
          </>
        )}
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
              } catch (e) { console.error('Theme hydration failed:', e); }
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
