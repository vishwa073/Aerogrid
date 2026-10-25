
import { Clock3, Database, ShieldCheck } from 'lucide-react';
import type { EvaluationResponse } from '../../types/api';

interface CutoffAuditTrailProps {
  evaluation: EvaluationResponse;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value);
}

function formatUtcDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
}

export function CutoffAuditTrail({
  evaluation,
}: CutoffAuditTrailProps) {
  const {
    cutoff_hour_utc,
    actual_half_hourly_interval_count,
    hourly_actual_interval_count,
    selected_forecast_interval_count,
    matched_interval_count,
    intervals,
  } = evaluation;

  const auditRows = intervals.slice(0, 10);

  return (
    <section
      aria-labelledby="cutoff-audit-title"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <ShieldCheck size={21} aria-hidden="true" />
          </div>

          <div>
            <h2
              id="cutoff-audit-title"
              className="text-lg font-semibold text-slate-900"
            >
              Cutoff Audit Trail
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              January 2026 forecast selection summary
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:p-6">
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock3 size={16} aria-hidden="true" />
            Forecast cutoff
          </div>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {String(cutoff_hour_utc).padStart(2, '0')}:00 UTC
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Previous-day publication deadline
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Database size={16} aria-hidden="true" />
            Half-hourly actuals
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">
            {formatNumber(actual_half_hourly_interval_count)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Source actual intervals
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Hourly actuals</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">
            {formatNumber(hourly_actual_interval_count)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Aggregated actual intervals
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Matched intervals</p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">
            {formatNumber(matched_interval_count)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatNumber(selected_forecast_interval_count)} forecasts selected
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="font-semibold text-slate-900">
          Matched forecast intervals
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Showing up to 10 intervals from the evaluation response. Publication
          timestamps are not currently provided by this API response.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-3 py-3 font-medium">
                  Delivery time (UTC)
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Actual (MW)
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Forecast (MW)
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Error (MW)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {auditRows.map((interval) => (
                <tr
                  key={interval.start_time}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                    {formatUtcDateTime(interval.start_time)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(Math.round(interval.actual_mw))}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(Math.round(interval.forecast_mw))}
                  </td>
                  <td
                    className={`px-3 py-3 text-right tabular-nums font-medium ${
                      interval.actual_mw - interval.forecast_mw < 0
                        ? 'text-red-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {formatNumber(
                      Math.round(interval.actual_mw - interval.forecast_mw),
                    )}
                  </td>
                </tr>
              ))}

              {auditRows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    No matched intervals are available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
