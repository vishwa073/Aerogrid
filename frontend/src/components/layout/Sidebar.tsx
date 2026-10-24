import React from 'react';
import { Wind, BarChart3, Clock, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView = 'dashboard' }) => {
  const navItems = [
    { id: 'dashboard', label: 'Forecast Overview', icon: BarChart3, active: true },
    { id: 'accuracy', label: 'Error Analytics', icon: Wind, active: false },
    { id: 'timeline', label: 'Cutoff Audit Trail', icon: Clock, active: false },
    { id: 'procurement', label: 'Wind Shortfall', icon: AlertTriangle, active: false },
    { id: 'intervals', label: 'Half-Hourly Data', icon: Layers, active: false },
  ];

  return (
    <aside className="w-64 bg-aerogrid-navy-900 border-r border-aerogrid-navy-800 flex flex-col justify-between select-none min-h-screen text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-aerogrid-navy-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-aerogrid-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Wind className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              AeroGrid
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-aerogrid-emerald-500/10 text-aerogrid-emerald-500 border border-aerogrid-emerald-500/20">
                UK
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Wind Intelligence Desk</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Analysis Suite
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === currentView;
            return (
              <button
                key={item.id}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-aerogrid-navy-800 text-white border-l-2 border-aerogrid-emerald-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-aerogrid-navy-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-aerogrid-emerald-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-aerogrid-navy-800/80 bg-aerogrid-navy-950/40">
        <div className="flex items-center gap-2.5 text-xs text-slate-300 mb-2">
          <ShieldCheck className="w-4 h-4 text-aerogrid-emerald-500" />
          <span className="font-semibold text-slate-200">System Ready</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Elexon BMRS Live Connection Verified.
        </p>
      </div>
    </aside>
  );
};
