import { Result } from '@core/utils/result';
import { AppError, NotFoundError } from '@core/errors/AppError';
import { Session, SessionStatus } from '../entities/Session';
import { ISessionRepository } from '../repositories/SessionRepository';
import { getCurrentISOString } from '@core/utils/date';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { failure } from '@core/utils/result';

/**
 * EndSession Use Case
 * Ends an active session
 */
export class EndSession {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly analyticsService: IAnalyticsService,
  ) {}

  async execute(sessionId: string): Promise<Result<Session, AppError>> {
    const sessionResult = await this.sessionRepository.getById(sessionId);

    if (sessionResult.isFailure) {
      return sessionResult;
    }

    const session = sessionResult.value;

    if (session.status === SessionStatus.Completed) {
      return failure(new NotFoundError('Session is already completed'));
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
          duration: Date.now() - new Date(session.startedAt).getTime(),
        },
      });
    }

    return result;
  }
}
