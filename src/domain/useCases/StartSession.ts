import { injectable, inject } from 'tsyringe';
import type { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS, SESSION_CONSTANTS } from '@core/config/constants';
import { AppError } from '@core/errors/AppError';
import { getCurrentISOString } from '@core/utils/date';
import { Result } from '@core/utils/result';
import { DI_TOKENS } from '@core/di/container';
import { Session, SessionStatus } from '../entities/Session';
import type { ISessionRepository } from '../repositories/SessionRepository';

export interface StartSessionInput {
  name?: string;
  location?: string;
  notes?: string;
}

@injectable()
export class StartSession {
  constructor(
    @inject(DI_TOKENS.SessionRepository) private readonly sessionRepository: ISessionRepository,
    @inject(DI_TOKENS.AnalyticsService) private readonly analyticsService: IAnalyticsService,
  ) {}

  async execute(input: StartSessionInput): Promise<Result<Session, AppError>> {
    const now = getCurrentISOString();

    const sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
      name: input.name || SESSION_CONSTANTS.DEFAULT_NAME,
      startedAt: now,
      endedAt: null,
      status: SessionStatus.Active,
      clipIds: [],
      calibrationId: null,
      location: input.location,
      notes: input.notes,
    };

    const result = await this.sessionRepository.create(sessionData);

    if (result.isSuccess) {
      this.analyticsService.trackEvent({
        name: ANALYTICS_CONSTANTS.EVENTS.SESSION_STARTED,
        properties: {
          sessionId: result.value.id,
          location: input.location,
        },
      });
    }

    return result;
  }
}
