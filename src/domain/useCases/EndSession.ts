import { injectable, inject } from 'tsyringe';
import type { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { AppError, ValidationError } from '@core/errors/AppError';
import { getCurrentISOString } from '@core/utils/date';
import { Result, failure } from '@core/utils/result';
import { DI_TOKENS } from '@core/di/container';
import { Session, SessionStatus } from '../entities/Session';
import type { ISessionRepository } from '../repositories/SessionRepository';

@injectable()
export class EndSession {
  constructor(
    @inject(DI_TOKENS.SessionRepository) private readonly sessionRepository: ISessionRepository,
    @inject(DI_TOKENS.AnalyticsService) private readonly analyticsService: IAnalyticsService,
  ) {}

  async execute(sessionId: string): Promise<Result<Session, AppError>> {
    const sessionResult = await this.sessionRepository.getById(sessionId);

    if (sessionResult.isFailure) {
      return sessionResult;
    }

    const session = sessionResult.value;

    if (session.status === SessionStatus.Completed) {
      return failure(new ValidationError('Session is already completed'));
    }

    const result = await this.sessionRepository.update(sessionId, {
      status: SessionStatus.Completed,
      endedAt: getCurrentISOString(),
    });

    if (result.isSuccess) {
      this.analyticsService.trackEvent({
        name: ANALYTICS_CONSTANTS.EVENTS.SESSION_ENDED,
        properties: {
          sessionId,
          clipCount: session.clipIds.length,
          duration:
            new Date(getCurrentISOString()).getTime() - new Date(session.startedAt).getTime(),
        },
      });
    }

    return result;
  }
}
