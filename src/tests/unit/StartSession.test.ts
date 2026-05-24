import { StartSession } from '@domain/useCases/StartSession';
import { ISessionRepository } from '@domain/repositories/SessionRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { Session, SessionStatus } from '@domain/entities/Session';
import { success, failure } from '@core/utils/result';
import { StorageError } from '@core/errors/AppError';

const makeActiveSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session-1',
  name: 'Tennis Session',
  startedAt: '2025-01-01T00:00:00.000Z',
  endedAt: null,
  status: SessionStatus.Active,
  clipIds: [],
  calibrationId: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const makeMockRepository = (): jest.Mocked<ISessionRepository> => ({
  create: jest.fn(),
  getById: jest.fn(),
  getAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getActiveSession: jest.fn(),
});

const makeMockAnalytics = (): jest.Mocked<IAnalyticsService> => ({
  trackEvent: jest.fn(),
  trackScreen: jest.fn(),
  setUserProperties: jest.fn(),
  logError: jest.fn(),
});

describe('StartSession', () => {
  let startSession: StartSession;
  let mockRepository: jest.Mocked<ISessionRepository>;
  let mockAnalytics: jest.Mocked<IAnalyticsService>;

  beforeEach(() => {
    mockRepository = makeMockRepository();
    mockAnalytics = makeMockAnalytics();
    startSession = new StartSession(mockRepository, mockAnalytics);
  });

  describe('happy path', () => {
    it('should create a session with Active status and null endedAt', async () => {
      const session = makeActiveSession({ id: 'new-session' });
      mockRepository.create.mockResolvedValue(success(session));

      const result = await startSession.execute({});

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.status).toBe(SessionStatus.Active);
        expect(result.value.endedAt).toBeNull();
      }
    });

    it('should pass name and location to the repository', async () => {
      const session = makeActiveSession({ name: 'My Match', location: 'Court 1' });
      mockRepository.create.mockResolvedValue(success(session));

      await startSession.execute({ name: 'My Match', location: 'Court 1' });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Match', location: 'Court 1' }),
      );
    });

    it('should pass notes to the repository when provided', async () => {
      const session = makeActiveSession({ notes: 'Practice match' });
      mockRepository.create.mockResolvedValue(success(session));

      await startSession.execute({ notes: 'Practice match' });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Practice match' }),
      );
    });

    it('should use default name when no name provided', async () => {
      const session = makeActiveSession({ name: 'Tennis Session' });
      mockRepository.create.mockResolvedValue(success(session));

      await startSession.execute({});

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Tennis Session' }),
      );
    });

    it('should track SESSION_STARTED analytics event on success', async () => {
      const session = makeActiveSession();
      mockRepository.create.mockResolvedValue(success(session));

      await startSession.execute({});

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ name: ANALYTICS_CONSTANTS.EVENTS.SESSION_STARTED }),
      );
    });
  });

  describe('error path', () => {
    it('should return failure when repository create fails', async () => {
      const storageError = new StorageError('DB write failed');
      mockRepository.create.mockResolvedValue(failure(storageError));

      const result = await startSession.execute({});

      expect(result.isFailure).toBe(true);
    });

    it('should not track analytics when repository create fails', async () => {
      const storageError = new StorageError('DB write failed');
      mockRepository.create.mockResolvedValue(failure(storageError));

      await startSession.execute({});

      expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
    });
  });
});
