import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { Session, SessionStatus } from '../entities/Session';
import { SessionRepository } from '../repositories/SessionRepository';
import { getCurrentISOString } from '@core/utils/date';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS, SESSION_CONSTANTS } from '@core/config/constants';

/**
 * Input for StartSession use case
 */
export interface StartSessionInput {
  name?: string;
  location?: string;
  notes?: string;
}

/**
 * StartSession Use Case
 * Creates and starts a new tennis session
 */
export class StartSession {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly analyticsService: IAnalyticsService,
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

