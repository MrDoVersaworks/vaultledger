'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RootPage() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleDemoSandbox = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDemoLoading) return;
    setIsDemoLoading(true);

    const demoEmail = 'recruiter@sandbox.test';
    const demoPassword = 'Password123!';

    try {
      // 1. Attempt standard login
      await login(demoEmail, demoPassword);
      toast.success('Successfully entered sandbox cockpit!');
      router.push('/dashboard');
    } catch (err: unknown) {
      // 2. If user doesn't exist, automatically provision sandbox account in the background
      try {
        await register(demoEmail, demoPassword, 'Recruiter Guest', 'Sandbox Enterprises');
        toast.success('Successfully provisioned guest sandbox account!');
        router.push('/dashboard');
      } catch (regErr: unknown) {
        toast.error('Failed to initialize sandbox environment.');
      }
    } finally {
      setIsDemoLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#080a10',
      }}>
        <div style={{
          width: '45px',
          height: '45px',
          border: '3px solid rgba(16, 185, 129, 0.1)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080a10',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Dynamic Digital Ledger Grid Backdrop */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(16, 185, 129, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(16, 185, 129, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Dynamic Background Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(8, 10, 16, 0.8)',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg style={{ width: '2rem', height: '2rem', color: '#10b981' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
          </svg>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Vault<span style={{ color: '#10b981' }}>Ledger</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            transition: 'all 0.2s',
          }} className="hover-nav">
            Sign In
          </Link>
          <Link href="/register" style={{
            backgroundColor: '#10b981',
            color: '#080a10',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 700,
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)',
            transition: 'all 0.2s',
          }} className="hover-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Split Asymmetric Showcase */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '5rem 2rem',
        position: 'relative',
        zIndex: 10,
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1.1fr',
        gap: '4rem',
        alignItems: 'center',
      }} className="split-layout">
        
        {/* Left Side: Product pitch & console drivers */}
        <div className="hero-text-animate">
          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(to bottom, #ffffff 60%, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Smart Business Invoicing <br />
            <span style={{
              background: 'linear-gradient(to right, #10b981, #0ea5e9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Powered by Sovereign AI
            </span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '3rem',
            maxWidth: '560px',
          }}>
            Calculate professional invoices with granular line-items, compute dynamic tax metrics, and automatically classify cash outflow streams. All powered securely by your own private Gemini API keys.
          </p>

          <div style={{
            display: 'flex',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}>
            <Link href="/register" style={{
              backgroundColor: '#10b981',
              color: '#080a10',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 800,
              padding: '1rem 1.75rem',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 20px rgba(16, 185, 129, 0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }} className="action-btn-primary">
              Launch Ledger Console
            </Link>

            <button
              onClick={handleDemoSandbox}
              disabled={isDemoLoading}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
                padding: '1rem 1.75rem',
                borderRadius: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
              }}
              className="action-btn-secondary"
            >
              {isDemoLoading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderTopColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Provisioning Sandbox...
                </>
              ) : (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demo Sandbox (One-Click)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Realistic Dashboard Preview */}
        <div className="hero-image-animate" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Ambient glow behind image */}
          <div className="hero-glow" />
          <div className="live-ledger-card" style={{
            width: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '1rem',
            padding: '0',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(16, 185, 129, 0.12)',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            overflow: 'hidden',
          }}>
            <img 
              src="/dashboard-preview.png" 
              alt="VaultLedger Platform Interface" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

      </main>

      {/* Recruiter Footer attribution for portfolio integrity */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(8, 10, 16, 0.5)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.875rem',
        position: 'relative',
        zIndex: 10,
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          VaultLedger Ledger Console — Engineered with Next.js & Express.
        </p>
        <p style={{ margin: 0, fontWeight: 600, color: '#f8fafc' }}>
          Architected by <span style={{ color: '#10b981' }}>Oyewole Favour</span>
        </p>
      </footer>

      {styleDefinitions}
    </div>
  );
}

const styleDefinitions = (
  <style>{`
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
    @keyframes floatY {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    .hero-text-animate {
      animation: fadeInUp 0.8s ease-out both;
    }
    .hero-image-animate {
      animation: fadeInRight 1s ease-out 0.3s both;
    }
    .hero-glow {
      position: absolute;
      width: 80%;
      height: 60%;
      top: 20%;
      left: 10%;
      background: radial-gradient(ellipse, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
      filter: blur(40px);
      z-index: 1;
      animation: pulseGlow 4s ease-in-out infinite;
      pointer-events: none;
    }
    .live-ledger-card {
      animation: floatY 6s ease-in-out infinite;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hover-nav:hover {
      color: #ffffff !important;
      background-color: rgba(255, 255, 255, 0.03);
    }
    .hover-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3) !important;
    }
    .action-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(16, 185, 129, 0.25) !important;
    }
    .action-btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.06) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }
    .live-ledger-card:hover {
      border-color: rgba(16, 185, 129, 0.3) !important;
      transform: scale(1.02) translateY(-4px) !important;
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 80px rgba(16, 185, 129, 0.15) !important;
    }
    @media (max-width: 768px) {
      .split-layout {
        grid-template-columns: 1fr !important;
        gap: 3rem !important;
        text-align: center !important;
      }
      .split-layout div {
        align-items: center !important;
        margin: 0 auto !important;
      }
    }
  `}</style>
);
