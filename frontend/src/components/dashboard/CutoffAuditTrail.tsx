
import { Clock3, Database, ShieldCheck } from 'lucide-react';
import type { EvaluationResponse } from '../../types/api';

interface CutoffAuditTrailProps {
  evaluation: EvaluationResponse;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatUtcDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unavailable';
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
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Matched forecast intervals
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
              A sample of up to 10 matched hourly intervals. Each selected
              forecast is the latest eligible publication at or before its
              applicable previous-day cutoff. Forecasts published after the
              cutoff are not eligible. All timestamps are shown in UTC.
            </p>
          </div>

          <span className="mt-2 inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:mt-0">
            {formatNumber(auditRows.length)} of{' '}
            {formatNumber(intervals.length)} intervals
          </span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-3 font-medium">
                  Delivery time (UTC)
                </th>

                <th scope="col" className="px-4 py-3 font-medium">
                  Selected publication (UTC)
                </th>

                <th scope="col" className="px-4 py-3 font-medium">
                  Applicable cutoff (UTC)
                </th>

                <th scope="col" className="px-4 py-3 font-medium">
                  Eligibility
                </th>

                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Actual (MW)
                </th>

                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Forecast (MW)
                </th>

                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Error (MW)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {auditRows.map((interval) => {
                const error = interval.actual_mw - interval.forecast_mw;
                const publicationTime = interval.forecast_publish_time
                  ? new Date(interval.forecast_publish_time)
                  : null;
                const cutoffTime = interval.cutoff_time
                  ? new Date(interval.cutoff_time)
                  : null;
                const isEligible =
                  publicationTime !== null &&
                  cutoffTime !== null &&
                  !Number.isNaN(publicationTime.getTime()) &&
                  !Number.isNaN(cutoffTime.getTime()) &&
                  publicationTime.getTime() <= cutoffTime.getTime();

                return (
                  <tr
                    key={interval.start_time}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatUtcDateTime(interval.start_time)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatUtcDateTime(interval.forecast_publish_time)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatUtcDateTime(interval.cutoff_time)}
                    </td>

                    <td className="px-4 py-3">
                      {isEligible ? (
                        <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Eligible at cutoff
                        </span>
                      ) : (
                        <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          Eligibility unavailable
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(interval.actual_mw)}
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(interval.forecast_mw)}
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-medium tabular-nums ${
                        error < 0
                          ? 'text-rose-600'
                          : error > 0
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                      }`}
                    >
                      {error > 0 ? '+' : ''}
                      {formatNumber(error)}
                    </td>
                  </tr>
                );
              })}

              {auditRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-full bg-slate-100 p-3">
                        <Database
                          size={20}
                          className="text-slate-500"
                          aria-hidden="true"
                        />
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        No matched intervals available
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Matched interval data will appear here when the
                        evaluation returns results.
                      </p>
                    </div>
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
