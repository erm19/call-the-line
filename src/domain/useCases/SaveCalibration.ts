import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { CourtCalibration } from '../entities/CourtCalibration';
import { CalibrationRepository } from '../repositories/CalibrationRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { failure } from '@core/utils/result';

/**
 * Input for SaveCalibration use case
 */
export type SaveCalibrationInput = Omit<CourtCalibration, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * SaveCalibration Use Case
 * Saves court calibration for a session
 */
export class SaveCalibration {
  constructor(
    private readonly calibrationRepository: CalibrationRepository,
    private readonly sessionRepository: SessionRepository,
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

