import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { NRTConfig } from '../entities/NRTConfig';
import { LatencyMetrics } from '../entities/LatencyMetrics';

/**
 * NRT Config Repository Interface
 * Defines contract for NRT configuration and metrics data access
 */
export interface INRTConfigRepository {
  /**
   * Gets NRT configuration for the given session
   */
  getConfig(sessionId: string): Promise<Result<NRTConfig, AppError>>;

  /**
   * Updates NRT configuration
   */
  updateConfig(updates: Partial<NRTConfig>): Promise<Result<NRTConfig, AppError>>;

  /**
   * Saves latency metrics
   */
  saveMetrics(
    metrics: Omit<LatencyMetrics, 'id' | 'createdAt'>,
  ): Promise<Result<LatencyMetrics, AppError>>;

  /**
   * Gets metrics for an entity
   */
  getMetrics(
    entityId: string,
    entityType: 'session' | 'clip' | 'decision',
  ): Promise<Result<LatencyMetrics[], AppError>>;

  /**
   * Gets average metrics for a time period
   */
  getAverageMetrics(
    startDate: string,
    endDate: string,
  ): Promise<
    Result<
      {
        averageLatencyMs: number;
        averageFps: number;
        successRate: number;
      },
      AppError
    >
  >;
}
