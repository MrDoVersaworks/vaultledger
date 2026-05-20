'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { ApiResponse, AISettings } from '@/types/index';

export default function ApiKeyBanner() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function checkKey() {
      try {
        const data = await apiRequest<ApiResponse<AISettings>>({
          method: 'GET',
          path: '/api/settings',
        });
        if (data.success) {
          setHasKey(data.data.hasApiKey);
        }
      } catch {
        // Silently fail if settings cannot be fetched (e.g. guest/logged out)
      }
    }
    checkKey();
  }, [pathname]);

  if (hasKey === null || hasKey === true) {
    return null;
  }

  if (pathname === '/settings') {
    return null;
  }

  return (
    <div style={{
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md) var(--space-lg)',
      marginBottom: 'var(--space-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-md)',
      flexWrap: 'wrap'
    }}>
      <div>
        <h4 style={{ margin: 0, color: 'var(--warning)', fontSize: 'var(--font-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> Action Required: Missing API Key
        </h4>
        <p style={{ margin: 'var(--space-xs) 0 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.5 }}>
          Please configure your Gemini API Key in Settings to unlock automated AI-powered expense tax categorization!
        </p>
      </div>
      <Link 
        href="/settings" 
        className="px-4 py-2 text-xs font-bold transition-all duration-200 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-600 hover:scale-[1.01]"
        style={{ whiteSpace: 'nowrap' }}
      >
        Configure Settings →
      </Link>
    </div>
  );
}
