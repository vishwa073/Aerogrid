
import {
  Activity,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EvaluationResponse } from '../../types/api';
import { GenerationChart } from './GenerationChart';

interface ErrorAnalyticsProps {
  evaluation: EvaluationResponse;
}

export function ErrorAnalytics({ evaluation }: ErrorAnalyticsProps) {
  const { intervals, metrics } = evaluation;

  const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-GB', {
      maximumFractionDigits: 1,
    }).format(value);

  const formatMw = (value: number): string => `${formatNumber(value)} MW`;

  const formatTimestamp = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid timestamp';
    }

    return date.toISOString().replace('T', ' ').slice(0, 16);
  };

  const errors = intervals.map((interval) => ({
    ...interval,
    error: interval.forecast_mw - interval.actual_mw,
  }));

  const overForecastCount = errors.filter((item) => item.error > 0).length;
  const underForecastCount = errors.filter((item) => item.error < 0).length;

  const largestError = errors.reduce<(typeof errors)[number] | null>(
    (largest, item) =>
      largest === null || Math.abs(item.error) > Math.abs(largest.error)
        ? item
        : largest,
    null,
  );

  const largestErrors = [...errors]
    .sort((a, b) => Math.abs(b.error) - Math.abs(a.error))
    .slice(0, 10);

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
          Error is calculated as forecast minus actual: positive values mean
          overforecasting, while negative values mean underforecasting.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity size={18} aria-hidden="true" />
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
            <TrendingDown size={18} aria-hidden="true" />
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
            <TrendingUp size={18} aria-hidden="true" />
            Under-forecast intervals
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {underForecastCount.toLocaleString('en-GB')}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Forecast generation was below actual generation
          </p>
        </article>
      </div>

      <GenerationChart intervals={intervals} />

      <section
        aria-labelledby="error-over-time-heading"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="error-over-time-heading"
              className="text-base font-semibold text-slate-900"
            >
              Forecast error over time
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Signed error (forecast minus actual) for each matched hourly
              interval.
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            MW · UTC
          </span>
        </div>

        {errors.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            No interval data is available to plot.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={errors}
                margin={{ top: 8, right: 16, left: 12, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="start_time"
                  tickFormatter={formatTimestamp}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  minTickGap={35}
                />
                <YAxis
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat('en-GB', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                  domain={['auto', 'auto']}
                />
                <ReferenceLine
                  y={0}
                  stroke="#334155"
                  strokeWidth={2}
                  label={{
                    value: 'Zero error',
                    fill: '#334155',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <Tooltip
                  labelFormatter={(label) =>
                    `Time: ${formatTimestamp(String(label))} UTC`
                  }
                  formatter={(value) => [
                    `${formatNumber(Number(value))} MW`,
                    'Forecast error',
                  ]}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="error"
                  name="error"
                  stroke="#0f766e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Values above zero indicate overforecasting; values below zero
          indicate underforecasting. Hover for the signed error at each UTC
          interval.
        </p>
      </section>

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

        {largestError === null ? (
          <p className="p-5 text-sm text-slate-500">
            No interval data is available for this evaluation.
          </p>
        ) : (
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
                {formatTimestamp(largestError.start_time)}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">
            Largest forecast misses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The 10 evaluation intervals with the largest absolute errors.
          </p>
        </div>

        {largestErrors.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">
            No interval data is available for this evaluation.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Interval (UTC)
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Forecast (MW)
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Actual (MW)
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Error (MW)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {largestErrors.map((interval) => (
                  <tr key={interval.start_time} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {formatTimestamp(interval.start_time)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(interval.forecast_mw)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatNumber(interval.actual_mw)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-medium tabular-nums ${
                        interval.error < 0
                          ? 'text-rose-600'
                          : interval.error > 0
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                      }`}
                    >
                      {interval.error > 0 ? '+' : ''}
                      {formatNumber(interval.error)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
