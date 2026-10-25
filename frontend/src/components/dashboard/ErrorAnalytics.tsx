
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import type { EvaluationResponse } from '../../types/api';

interface ErrorAnalyticsProps {
  evaluation: EvaluationResponse;
}

export function ErrorAnalytics({ evaluation }: ErrorAnalyticsProps) {
  const { intervals, metrics } = evaluation;

  const errors = intervals.map((interval) => ({
    time: interval.start_time,
    error: interval.actual_mw - interval.forecast_mw,
  }));

  const overForecastCount = errors.filter((item) => item.error < 0).length;
  const underForecastCount = errors.filter((item) => item.error > 0).length;
  const largestError = errors.reduce(
    (largest, item) =>
      Math.abs(item.error) > Math.abs(largest.error) ? item : largest,
    { time: '', error: 0 },
  );

  const formatMw = (value: number) =>
    `${new Intl.NumberFormat('en-GB', {
      maximumFractionDigits: 1,
    }).format(value)} MW`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">
          January 2026 / Forecast performance
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Error Analytics
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Analyse the difference between actual and forecast wind generation.
          Positive error means actual generation exceeded the forecast;
          negative error means the forecast exceeded actual generation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity size={18} />
            Mean absolute error
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatMw(metrics.mae_mw)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Average magnitude of forecast error
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingDown size={18} />
            Over-forecast intervals
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {overForecastCount.toLocaleString('en-GB')}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Forecast generation was above actual generation
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp size={18} />
            Under-forecast intervals
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {underForecastCount.toLocaleString('en-GB')}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Actual generation was above forecast generation
          </p>
        </article>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Largest absolute forecast error
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The interval with the greatest difference between actual and
            forecast generation in the returned evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Absolute error</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatMw(Math.abs(largestError.error))}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Signed error</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatMw(largestError.error)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Interval start (UTC)</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {largestError.time
                ? new Date(largestError.time).toISOString().replace('T', ' ').slice(0, 16)
                : 'No interval data'}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Largest errors</h2>
          <p className="mt-1 text-sm text-slate-500">
            The 10 evaluation intervals with the largest absolute errors.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Interval (UTC)</th>
                <th className="px-5 py-3 text-right font-medium">Actual (MW)</th>
                <th className="px-5 py-3 text-right font-medium">Forecast (MW)</th>
                <th className="px-5 py-3 text-right font-medium">Error (MW)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...intervals]
                .sort(
                  (a, b) =>
                    Math.abs(b.actual_mw - b.forecast_mw) -
                    Math.abs(a.actual_mw - a.forecast_mw),
                )
                .slice(0, 10)
                .map((interval) => {
                  const error = interval.actual_mw - interval.forecast_mw;

                  return (
                    <tr key={interval.start_time} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                        {new Date(interval.start_time)
                          .toISOString()
                          .replace('T', ' ')
                          .slice(0, 16)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {interval.actual_mw.toLocaleString('en-GB', {
                          maximumFractionDigits: 1,
                        })}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {interval.forecast_mw.toLocaleString('en-GB', {
                          maximumFractionDigits: 1,
                        })}
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-medium tabular-nums ${
                          error < 0 ? 'text-rose-600' : error > 0 ? 'text-emerald-600' : 'text-slate-600'
                        }`}
                      >
                        {error > 0 ? '+' : ''}
                        {error.toLocaleString('en-GB', {
                          maximumFractionDigits: 1,
                        })}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
