
import React from 'react';
import { IntervalTable } from './IntervalsTable';
import type { EvaluationResponse } from '../../types/api';

interface IntervalsPageProps {
  evaluation: EvaluationResponse;
}

export const IntervalsPage: React.FC<IntervalsPageProps> = ({
  evaluation,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Hourly Comparison Data
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Search, filter, and export matched hourly wind generation actuals
          and forecasts for January 2026.
        </p>
      </div>

      <IntervalTable intervals={evaluation.intervals} />
    </section>
  );
};

export default IntervalsPage;
