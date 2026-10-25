
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { HealthResponse } from '../types/api';

interface UseHealthResult {
  health: HealthResponse | null;
  healthError: string | null;
}

export const useHealth = (): UseHealthResult => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    api
      .checkHealth()
      .then((data) => {
        if (isActive) {
          setHealth(data);
          setHealthError(null);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setHealthError(
            err instanceof Error
              ? err.message
              : 'Failed to connect to backend',
          );
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { health, healthError };
};

export default useHealth;
