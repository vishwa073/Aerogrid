
import React from 'react';
import {
  Wind,
  BarChart3,
  Clock,
  AlertTriangle,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView = 'dashboard',
  onNavigate,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Forecast Overview', icon: BarChart3 },
    { id: 'accuracy', label: 'Error Analytics', icon: Wind },
    { id: 'timeline', label: 'Cutoff Audit Trail', icon: Clock },
    { id: 'procurement', label: 'Wind Shortfall', icon: AlertTriangle },
    { id: 'intervals', label: 'Hourly Data', icon: Layers },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col justify-between select-none border-r border-aerogrid-navy-800 bg-aerogrid-navy-900 text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-aerogrid-navy-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-aerogrid-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-950/40">
            <Wind className="h-5 w-5 animate-pulse" />
          </div>

          <div>
            <h1 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
              AeroGrid
              <span className="rounded border border-aerogrid-emerald-500/20 bg-aerogrid-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-aerogrid-emerald-500">
                UK
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Wind Intelligence Desk
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Analysis navigation" className="space-y-1 p-3">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Analysis Suite
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === currentView;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                aria-current={isSelected ? 'page' : undefined}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-l-2 border-aerogrid-emerald-500 bg-aerogrid-navy-800 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-aerogrid-navy-800/50 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isSelected
                      ? 'text-aerogrid-emerald-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="border-t border-aerogrid-navy-800/80 bg-aerogrid-navy-950/40 p-4">
        <div className="mb-2 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-aerogrid-emerald-500" />
          <span className="font-semibold text-slate-200">System Ready</span>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Elexon BMRS data evaluation dashboard.
        </p>
      </div>
    </aside>
  );
};
