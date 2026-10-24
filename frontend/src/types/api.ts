/**
 * AeroGrid TypeScript API definitions.
 * Synchronized with backend Pydantic schemas.
 */

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ApiError {
  detail: string;
  code?: string;
}
