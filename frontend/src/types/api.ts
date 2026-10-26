
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

export interface EvaluationPeriod {
  start: string;
  end: string;
}

export interface ForecastMetrics {
  interval_count: number;
  mae_mw: number;
  rmse_mw: number;
  bias_mw: number;
  shortfall_energy_mwh: number;
}

export interface EvaluationInterval {
  start_time: string;
  actual_mw: number;
  forecast_mw: number;
  forecast_publish_time: string | null;
  cutoff_time: string | null;
}

export interface EvaluationResponse {
  period: EvaluationPeriod;
  cutoff_hour_utc: number;
  actual_half_hourly_interval_count: number;
  hourly_actual_interval_count: number;
  selected_forecast_interval_count: number;
  matched_interval_count: number;
  comparison_resolution: string;
  actual_aggregation: string;
  metrics: ForecastMetrics;
  intervals: EvaluationInterval[];
}
