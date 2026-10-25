
import React from 'react';
import { AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import type { EvaluationResponse } from '../../types/api';

interface WindShortfallProps {
  evaluation: EvaluationResponse;
}

export const WindShortfall: React.FC<WindShortfallProps> = ({
  evaluation,
}) => {
  const shortfallIntervals = evaluation.intervals
    .filter((interval) => interval.forecast_mw > interval.actual_mw)
    .map((interval) => ({
      ...interval,
      shortfallMw: interval.forecast_mw - interval.actual_mw,
      shortfallMwh:
        (interval.forecast_mw - interval.actual_mw) * 1,
    }))
    .sort((a, b) => b.shortfallMw - a.shortfallMw);

  const largestShortfalls = shortfallIntervals.slice(0, 10);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      maximumFractionDigits: 2,
    }).format(value);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }) + ' UTC';

  return (
    <section aria-labelledby="shortfall-heading" className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          PROCUREMENT INSIGHTS
        </p>
        <h1
          id="shortfall-heading"
          className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
        >
          Wind Shortfall
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Identify periods when forecast wind generation exceeded actual
          generation. These gaps help highlight potential wind generation
          shortfalls during January 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-slate-600">
              Total wind shortfall energy
            </p>
          </div>
          <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">
            {formatNumber(evaluation.metrics.shortfall_energy_mwh)}
            <span className="ml-2 text-sm font-medium text-slate-500">
              MWh
            </span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Calculated across matched hourly intervals.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-slate-600">
              Shortfall intervals
            </p>
          </div>
          <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">
            {shortfallIntervals.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Matched hours where forecast generation exceeded actual generation.
          </p>
        </article>
      </div>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <TrendingDown
              className="h-5 w-5 text-amber-600"
              aria-hidden="true"
            />
            <h2 className="font-semibold text-slate-900">
              Largest forecast shortfalls
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            The ten matched hours with the largest forecast-minus-actual gaps.
          </p>
        </div>

        {largestShortfalls.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            No forecast shortfalls were found in the matched intervals.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Delivery time
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Forecast (MW)
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Actual (MW)
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Gap (MW)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {largestShortfalls.map((interval) => (
                  <tr key={interval.start_time} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                      {formatDateTime(interval.start_time)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(interval.forecast_mw)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(interval.actual_mw)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-amber-700">
                      {formatNumber(interval.shortfallMw)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <aside className="rounded-xl border border-slate-200 bg-slate-100/70 p-5">
        <h2 className="font-semibold text-slate-900">
          How shortfall energy is calculated
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          For each matched interval, the forecast-minus-actual gap is floored
          at zero. Because this evaluation uses hourly intervals, each gap in
          MW is multiplied by one hour to calculate MWh.
        </p>
        <p className="mt-3 font-mono text-sm text-slate-800">
          Shortfall (MWh) = max(Forecast (MW) − Actual (MW), 0) × 1 hour
        </p>
      </aside>
    </section>
  );
};
