import { injectable, inject } from 'tsyringe';
import type { Result } from '@core/utils/result';
import type { AppError } from '@core/errors/AppError';
import type { CourtCalibration } from '../entities/CourtCalibration';
import type { CalibrationRepository } from '../repositories/CalibrationRepository';
import type { ISessionRepository } from '../repositories/SessionRepository';
import type { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { DI_TOKENS } from '@core/di/container';
import { failure } from '@core/utils/result';

export type SaveCalibrationInput = Omit<CourtCalibration, 'id' | 'createdAt' | 'updatedAt'>;

@injectable()
export class SaveCalibration {
  constructor(
    @inject(DI_TOKENS.CalibrationRepository)
    private readonly calibrationRepository: CalibrationRepository,
    @inject(DI_TOKENS.SessionRepository)
    private readonly sessionRepository: ISessionRepository,
    @inject(DI_TOKENS.AnalyticsService)
    private readonly analyticsService: IAnalyticsService,
  ) {}

  async execute(input: SaveCalibrationInput): Promise<Result<CourtCalibration, AppError>> {
    // Verify session exists
    const sessionResult = await this.sessionRepository.getById(input.sessionId);
    if (sessionResult.isFailure) {
      return failure(sessionResult.error);
    }

    const result = await this.calibrationRepository.create(input);

    if (result.isSuccess) {
      // Update session with calibration ID
      await this.sessionRepository.update(input.sessionId, {
        calibrationId: result.value.id,
      });

      this.analyticsService.trackEvent({
        name: ANALYTICS_CONSTANTS.EVENTS.CALIBRATION_COMPLETED,
        properties: {
          sessionId: input.sessionId,
          calibrationId: result.value.id,
          confidence: input.confidence,
          isValid: input.isValid,
        },
      });
    }

    return result;
  }
}
