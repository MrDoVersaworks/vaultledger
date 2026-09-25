'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Admin Layout Guard for VaultLedger
 * Redirects unauthenticated users to the login page.
 * The backend admin routes are already protected by authMiddleware (JWT Bearer).
 * This guard prevents the admin UI shell from being exposed to unauthenticated visitors.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.replace('/');
      } else {
        setChecked(true);
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || !checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--border-default)] border-t-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
