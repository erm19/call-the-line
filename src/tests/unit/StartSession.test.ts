import { StartSession } from '@domain/useCases/StartSession';
import { SessionRepository } from '@domain/repositories/SessionRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { Session, SessionStatus } from '@domain/entities/Session';
import { success } from '@core/utils/result';

describe('StartSession', () => {
  let startSession: StartSession;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockAnalyticsService: jest.Mocked<IAnalyticsService>;

  beforeEach(() => {
    mockSessionRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getActiveSession: jest.fn(),
    };

    mockAnalyticsService = {
      trackEvent: jest.fn(),
      trackScreen: jest.fn(),
      setUserProperties: jest.fn(),
      logError: jest.fn(),
    };

    startSession = new StartSession(mockSessionRepository, mockAnalyticsService);
  });

  it('should create a new session with default name', async () => {
    const mockSession: Session = {
      id: 'session-1',
      name: 'Tennis Session',
      startedAt: '2025-01-01T00:00:00.000Z',
      endedAt: null,
      status: SessionStatus.Active,
      clipIds: [],
      calibrationId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    mockSessionRepository.create.mockResolvedValue(success(mockSession));

    const result = await startSession.execute({});

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.status).toBe(SessionStatus.Active);
      expect(result.value.endedAt).toBeNull();
    }

    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'session_started',
      }),
    );
  });

  it('should create a session with custom name and location', async () => {
    const mockSession: Session = {
      id: 'session-1',
      name: 'My Match',
      startedAt: '2025-01-01T00:00:00.000Z',
      endedAt: null,
      status: SessionStatus.Active,
      clipIds: [],
      calibrationId: null,
      location: 'Central Park',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    mockSessionRepository.create.mockResolvedValue(success(mockSession));

    const result = await startSession.execute({
      name: 'My Match',
      location: 'Central Park',
    });

    expect(result.isSuccess).toBe(true);
    expect(mockSessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Match',
        location: 'Central Park',
      }),
    );
  });
});

