import { HealthResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  }
}

export const api = new ApiService(API_BASE_URL);
