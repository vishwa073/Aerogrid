
import React from 'react';
import { WindShortfall } from './WindShortfall';
import type { EvaluationResponse } from '../../types/api';

interface ProcurementPageProps {
  evaluation: EvaluationResponse;
}

export const ProcurementPage: React.FC<ProcurementPageProps> = ({
  evaluation,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Wind Shortfall Analysis
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Identify periods when forecast wind generation exceeded actual
          generation, highlighting potential exposure to wind shortfalls in
          the UK electricity market.
        </p>
      </div>

      <WindShortfall evaluation={evaluation} />
    </section>
  );
};

export default ProcurementPage;
