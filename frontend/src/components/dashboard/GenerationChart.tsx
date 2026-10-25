
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { EvaluationInterval } from '../../types/api';

interface GenerationChartProps {
  intervals: EvaluationInterval[];
}

interface ChartPoint {
  timestamp: string;
  actual: number;
  forecast: number;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  });
}

function formatMw(value: number): string {
  return `${new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 0,
  }).format(value)} MW`;
}

export function GenerationChart({ intervals }: GenerationChartProps) {
  const chartData: ChartPoint[] = intervals.map((interval) => ({
    timestamp: interval.start_time,
    actual: interval.actual_mw,
    forecast: interval.forecast_mw,
  }));

  return (
    <section
      aria-labelledby="generation-chart-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="generation-chart-heading"
            className="text-base font-semibold text-slate-900"
          >
            Forecast vs. actual generation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Hourly UK wind generation throughout January 2026
          </p>
        </div>

        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          MW · UTC
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-500">
          No interval data is available to plot.
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 12, bottom: 8 }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="timestamp"
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

              <Tooltip
                labelFormatter={(label) =>
                  `Time: ${formatTimestamp(String(label))} UTC`
                }
                formatter={(value, name) => [
                  formatMw(Number(value)),
                  name === 'actual' ? 'Actual generation' : 'Forecast generation',
                ]}
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  fontSize: 12,
                }}
              />

              <Legend
                formatter={(value) =>
                  value === 'actual' ? 'Actual generation' : 'Forecast generation'
                }
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />

              <Line
                type="monotone"
                dataKey="actual"
                name="actual"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="forecast"
                name="forecast"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 4"
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
        Each point represents one matched hourly interval. Hover over the chart
        to compare actual and forecast generation. Timestamps are shown in UTC.
      </p>
    </section>
  );
}
