
import React from 'react';
import { KpiGrid } from './KpiGrid';
import { GenerationChart } from './GenerationChart';
import { CutoffAuditTrail } from './CutoffAuditTrail';
import type { EvaluationResponse } from '../../types/api';

interface DashboardPageProps {
  evaluation: EvaluationResponse;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  evaluation,
}) => {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              UK wind generation
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Forecast Overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Understand how day-ahead wind forecasts compared with actual UK
              generation throughout January 2026.
            </p>
          </div>

          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
            Cutoff: 11:00 UTC
          </span>
        </div>
      </section>

      <section
        aria-label="Evaluation summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Comparison resolution
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Hourly</p>
          <p className="mt-1 text-xs text-slate-500">
            Actuals aggregated from half-hourly readings
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Matched intervals
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {evaluation.matched_interval_count.toLocaleString('en-GB')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Matched forecast and actual pairs
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Evaluation period
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {evaluation.period.start} – {evaluation.period.end}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            UK national wind generation
          </p>
        </div>
      </section>

      <KpiGrid metrics={evaluation.metrics} />

      <GenerationChart intervals={evaluation.intervals} />

      <CutoffAuditTrail evaluation={evaluation} />

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">
          Evaluation methodology
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Actual generation is aggregated to hourly values by taking the mean
          of the two half-hourly readings. Forecasts are selected using the
          11:00 UTC day-ahead cutoff, and metrics are calculated over matched
          hourly intervals.
        </p>
      </section>
    </div>
  );
};

export default DashboardPage;
