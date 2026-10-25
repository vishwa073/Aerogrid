
import {
  Gauge,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { KpiCard } from './KpiCard';
import type { ForecastMetrics } from '../../types/api';

interface KpiGridProps {
  metrics: ForecastMetrics;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 1,
  }).format(value);

export function KpiGrid({ metrics }: KpiGridProps) {
  const biasDescription =
    metrics.bias_mw < 0
      ? 'Forecasts exceed actual generation on average.'
      : metrics.bias_mw > 0
        ? 'Actual generation exceeds forecasts on average.'
        : 'No average signed bias.';

  const biasIcon =
    metrics.bias_mw < 0
      ? TrendingDown
      : metrics.bias_mw > 0
        ? TrendingUp
        : Gauge;

  const cards = [
    {
      title: 'Mean absolute error',
      value: formatNumber(metrics.mae_mw),
      unit: 'MW',
      description: 'Average absolute difference between forecast and actual.',
      icon: Gauge,
    },
    {
      title: 'Root mean squared error',
      value: formatNumber(metrics.rmse_mw),
      unit: 'MW',
      description: 'Penalises larger forecast errors more heavily.',
      icon: BarChart3,
    },
    {
      title: 'Forecast bias',
      value: formatNumber(metrics.bias_mw),
      unit: 'MW',
      description: biasDescription,
      icon: biasIcon,
    },
    {
      title: 'Shortfall energy',
      value: formatNumber(metrics.shortfall_energy_mwh),
      unit: 'MWh',
      description: 'Accumulated positive forecast-minus-actual exposure.',
      icon: Zap,
    },
  ];

  return (
    <section aria-labelledby="evaluation-metrics-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="evaluation-metrics-heading"
          className="text-sm font-semibold text-slate-800"
        >
          Evaluation metrics
        </h2>

        <span className="text-xs text-slate-500">
          {formatNumber(metrics.interval_count)} matched intervals
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
