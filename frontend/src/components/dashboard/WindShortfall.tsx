
import React from 'react';
import { TrendingDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
      shortfallMwh: interval.forecast_mw - interval.actual_mw,
    }))
    .sort((a, b) => b.shortfallMw - a.shortfallMw);

  const largestShortfalls = shortfallIntervals.slice(0, 10);

  // Aggregate hourly shortfall energy by UTC delivery date.
  const dailyShortfalls = Object.values(
    shortfallIntervals.reduce<
      Record<string, { date: string; shortfallMwh: number }>
    >((daily, interval) => {
      const timestamp = new Date(interval.start_time);

      if (Number.isNaN(timestamp.getTime())) {
        return daily;
      }

      const date = timestamp.toISOString().slice(0, 10);

      if (!daily[date]) {
        daily[date] = {
          date,
          shortfallMwh: 0,
        };
      }

      daily[date].shortfallMwh += interval.shortfallMwh;

      return daily;
    }, {}),
  ).sort((a, b) => a.date.localeCompare(b.date));

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      maximumFractionDigits: 2,
    }).format(value);

  const formatDateTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid timestamp';
    }

    return (
      date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }) + ' UTC'
    );
  };

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

      {/* Daily shortfall chart */}
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">
            Daily wind shortfall
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Potential shortfall energy by UTC delivery date, calculated from
            matched hourly intervals.
          </p>
        </div>

        {dailyShortfalls.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No shortfall data is available for the matched intervals.
          </p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyShortfalls}
                margin={{ top: 8, right: 12, left: 8, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={(date: string) =>
                    new Date(`${date}T00:00:00Z`).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: 'short',
                        timeZone: 'UTC',
                      },
                    )
                  }
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={12}
                />

                <YAxis
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat('en-GB', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                  label={{
                    value: 'MWh',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748B',
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  labelFormatter={(date) => `Date: ${date} (UTC)`}
                  formatter={(value) => [
                    `${formatNumber(Number(value))} MWh`,
                    'Potential shortfall',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                  }}
                />

                <Bar
                  dataKey="shortfallMwh"
                  name="Potential shortfall"
                  fill="#D97706"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>

      {/* Largest hourly shortfalls */}
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
                  <th
                    scope="col"
                    className="px-5 py-3 text-right font-medium"
                  >
                    Forecast (MW)
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-right font-medium"
                  >
                    Actual (MW)
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-right font-medium"
                  >
                    Gap (MW)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {largestShortfalls.map((interval) => (
                  <tr
                    key={interval.start_time}
                    className="hover:bg-slate-50"
                  >
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

      {/* Calculation explanation */}
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
