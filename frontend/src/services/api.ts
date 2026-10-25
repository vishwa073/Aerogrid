
import type {
  EvaluationResponse,
  HealthResponse,
} from '../types/api';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(
        `Health check failed with status: ${response.status}`
      );
    }

    return response.json() as Promise<HealthResponse>;
  }

  async getJanuaryEvaluation(
    cutoffHourUtc = 11
  ): Promise<EvaluationResponse> {
    const params = new URLSearchParams({
      cutoff_hour_utc: String(cutoffHourUtc),
    });

    const response = await fetch(
      `${this.baseUrl}/api/v1/evaluation/january-2026?${params}`
    );

    if (!response.ok) {
      let message = `Evaluation request failed with status: ${response.status}`;

      try {
        const errorBody = await response.json();
        if (typeof errorBody.detail === 'string') {
          message = errorBody.detail;
        }
      } catch {
        // Keep the original status-based error message.
      }

      throw new Error(message);
    }

    return response.json() as Promise<EvaluationResponse>;
  }
}

export const api = new ApiService(API_BASE_URL);
