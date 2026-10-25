
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { HealthResponse } from '../../types/api';

interface AppLayoutProps {
  children: ReactNode;
  health: HealthResponse | null;
  healthError: string | null;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AppLayout({
  children,
  health,
  healthError,
  currentView,
  onNavigate,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  function handleNavigate(view: string) {
    onNavigate(view);
    setMobileMenuOpen(false);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden h-full shrink-0 md:flex">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
        />
      </aside>

      {/* Main application area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Mobile navigation bar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <span className="text-sm font-semibold text-slate-900">
            AeroGrid
          </span>

          <span className="ml-auto text-xs text-slate-500">
            January 2026
          </span>
        </div>

        {/* Persistent header */}
        <div className="sticky top-0 z-30 shrink-0">
          <Header health={health} healthError={healthError} />
        </div>

        {/* Independently scrolling content */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            className="absolute inset-0 h-full w-full cursor-default bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-aerogrid-navy-900 shadow-2xl"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-aerogrid-navy-800 px-4">
              <span className="text-sm font-semibold text-white">
                Navigation
              </span>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-aerogrid-navy-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
