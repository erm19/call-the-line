import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { NRTConfig } from '../entities/NRTConfig';
import { INRTConfigRepository } from '../repositories/NRTConfigRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';

/**
 * StopLiveTracking Use Case
 * Disables NRT (Near Real Time) live ball tracking
 */
export class StopLiveTracking {
  constructor(
    private readonly nrtConfigRepository: INRTConfigRepository,
    private readonly analyticsService: IAnalyticsService,
  ) {}

  async execute(): Promise<Result<NRTConfig, AppError>> {
    const result = await this.nrtConfigRepository.updateConfig({
      enabled: false,
    });

    if (result.isSuccess) {
      this.analyticsService.trackEvent({
        name: 'nrt_tracking_stopped',
      });
    }

    return result;
  }
}
