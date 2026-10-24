import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { api } from './services/api';
import { HealthResponse } from './types/api';
import { CheckCircle2, Server, Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.checkHealth()
      .then((data) => {
        if (isMounted) {
          setHealth(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setHealthError(err.message || 'Failed to connect to backend');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header health={health} healthError={healthError} />

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Phase 1 Scaffold Status Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    Phase 1 Foundation Ready
                  </span>
                  <span className="text-xs text-slate-500 font-mono">v0.1.0</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight pt-1">
                  AeroGrid Architecture & Scaffolding
                </h2>
                <p className="text-sm text-slate-600 max-w-3xl">
                  A production-minded wind forecast intelligence platform for UK electricity utilities,
                  comparing national day-ahead wind generation forecasts with outturn generation from Elexon BMRS.
                </p>
              </div>
            </div>

            {/* Architecture Verification Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              {/* Frontend Card */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Frontend Stack</span>
                </div>
                <p className="text-xs text-slate-500">
                  React 18, TypeScript, Vite, Tailwind CSS, Lucide React, and Recharts initialized and building cleanly.
                </p>
              </div>

              {/* Backend Card */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>Backend Stack</span>
                </div>
                <p className="text-xs text-slate-500">
                  FastAPI service with Pydantic validation, CORS middleware, and <code className="text-slate-800 font-mono">/health</code> endpoint active.
                </p>
              </div>

              {/* Data & Cutoff Governance Card */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Decision Cutoff Policy</span>
                </div>
                <p className="text-xs text-slate-500">
                  Isolated in configuration. Cutoff selection rule prevents future forecast leakage. Elexon endpoints verified.
                </p>
              </div>
            </div>
          </div>

          {/* Implementation Road Map */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Phase Implementation Roadmap</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-950">Phase 1: Project Scaffolding & Docker Foundation</div>
                    <div className="text-[11px] text-emerald-700">Project structure, configs, health checks, Dockerfiles, and tests verified.</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Completed</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Phase 2: Elexon Ingestion & Domain Calculation Engine</div>
                    <div className="text-[11px] text-slate-500">FUELHH/WINDFOR client with caching, decision cutoff rule, and unit tests (MAE, RMSE, bias).</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Pending Approval</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60 opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Phase 3: Backend REST Endpoints</div>
                    <div className="text-[11px] text-slate-500">Summary, Timeseries, Accuracy, Audit, and Interval endpoints.</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Scheduled</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60 opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Phase 4: Dashboard React UI Components</div>
                    <div className="text-[11px] text-slate-500">Stitch-inspired layout, 4 KPI cards, Recharts chart, and Half-Hourly table.</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Scheduled</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
