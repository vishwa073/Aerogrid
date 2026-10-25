
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { EvaluationResponse } from '../types/api';

interface UseEvaluationResult {
  evaluation: EvaluationResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useEvaluation(cutoffHourUtc = 11): UseEvaluationResult {
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setError(null);

    api.getJanuaryEvaluation(cutoffHourUtc)
      .then((data) => {
        if (isActive) setEvaluation(data);
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load the January evaluation',
          );
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [cutoffHourUtc, refreshKey]);

  return {
    evaluation,
    loading,
    error,
    retry: () => setRefreshKey((current) => current + 1),
  };
}
