
import React from 'react';
import { CutoffAuditTrail } from './CutoffAuditTrail';
import type { EvaluationResponse } from '../../types/api';

interface TimelinePageProps {
  evaluation: EvaluationResponse;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  evaluation,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cutoff Audit Trail
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Review the evaluation cutoff and matched hourly forecast and actual
          intervals for January 2026.
        </p>
      </div>

      <CutoffAuditTrail evaluation={evaluation} />
    </section>
  );
};

export default TimelinePage;
