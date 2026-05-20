'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import ApiKeyBanner from './ApiKeyBanner';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CircleDollarSign, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Lock
} from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Expenses', href: '/expenses', icon: CircleDollarSign },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out successfully.');
    } catch {
      toast.error('Logout failed.');
    }
  }

  const userInitial = (() => {
    if (user && user.name) return user.name.charAt(0).toUpperCase();
    if (user && user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  })();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      {/* Mobile Toggle Burger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed z-50 flex items-center justify-center w-10 h-10 rounded-lg md:hidden top-4 right-4 bg-[var(--bg-card)] border border-[var(--border-default)] text-emerald-400 shadow-md"
        aria-label="Toggle Navigation"
        id="sidebar-toggle"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[var(--sidebar-width)] bg-[var(--bg-secondary)] border-r border-[var(--border-default)] transition-all duration-300 md:translate-x-0 md:static md:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-[var(--header-height)] border-b border-[var(--border-default)]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500">
            <Lock size={16} className="text-white font-bold" />
          </div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            VaultLedger
          </h2>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                id={`nav-${link.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 text-emerald-500 border border-emerald-500/15 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-emerald-500' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-[var(--border-default)] space-y-4">
          {/* User profile brief card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]">
            <div className="flex items-center justify-center w-10 h-10 font-bold rounded-lg bg-gradient-to-tr from-emerald-500/20 to-cyan-500/25 text-emerald-500 border border-emerald-500/10">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-[var(--text-primary)]">{user?.name}</div>
              <div className="text-xs truncate text-[var(--text-secondary)]">{user?.email}</div>
            </div>
          </div>

          {/* Support Brief */}
          <div className="px-2 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-center shadow-sm">
            <p className="text-[10px] font-bold tracking-wider uppercase text-emerald-500">Sovereign Support</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Architected by Oyewole Favour</p>
            <a 
              href="mailto:mrdoofficial1@gmail.com" 
              className="text-[10px] text-cyan-500 font-medium block hover:underline mt-1"
            >
              mrdoofficial1@gmail.com
            </a>
          </div>

          {/* Settings Buttons */}
          <div className="space-y-1">
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-transparent transition-all duration-200"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={handleLogout}
              id="logout-btn"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 border border-transparent transition-all duration-200"
            >
              <LogOut className="w-5 h-5 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Placeholder spacing / responsive spacing */}
        <div className="h-[var(--header-height)] flex items-center justify-between px-6 pr-14 md:pr-6 border-b border-[var(--border-default)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest hidden md:block">
            Sovereign Ledger Panel
          </div>
          <div className="text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 ml-auto md:ml-0 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Vault Database Connected</span>
          </div>
        </div>

        {/* Dynamic page contents wrapper */}
        <div className="flex-1 p-6 md:p-8 max-w-[var(--max-content-width)] mx-auto w-full">
          <ApiKeyBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
