import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { NRTConfig } from '../entities/NRTConfig';
import { INRTConfigRepository } from '../repositories/NRTConfigRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';

/**
 * StartLiveTracking Use Case
 * Enables NRT (Near Real Time) live ball tracking
 */
export class StartLiveTracking {
  constructor(
    private readonly nrtConfigRepository: INRTConfigRepository,
    private readonly analyticsService: IAnalyticsService,
  ) {}

  async execute(): Promise<Result<NRTConfig, AppError>> {
    const configResult = await this.nrtConfigRepository.getConfig();

    if (configResult.isFailure) {
      return configResult;
    }

    const result = await this.nrtConfigRepository.updateConfig({
      enabled: true,
    });

    if (result.isSuccess) {
      this.analyticsService.trackEvent({
        name: 'nrt_tracking_started',
        properties: {
          mode: result.value.mode,
          targetFps: result.value.targetFps,
        },
      });
    }

    return result;
  }
}
