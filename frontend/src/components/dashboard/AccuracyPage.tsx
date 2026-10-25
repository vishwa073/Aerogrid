
import React from 'react';
import { ErrorAnalytics } from './ErrorAnalytics';
import type { EvaluationResponse } from '../../types/api';

interface AccuracyPageProps {
  evaluation: EvaluationResponse;
}

export const AccuracyPage: React.FC<AccuracyPageProps> = ({
  evaluation,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Forecast Error Analytics
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Analyse the differences between forecast and actual UK wind
          generation throughout January 2026.
        </p>
      </div>

      <ErrorAnalytics evaluation={evaluation} />
    </section>
  );
};

export default AccuracyPage;
