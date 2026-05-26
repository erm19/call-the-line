import { EndSession } from '@domain/useCases/EndSession';
import { ISessionRepository } from '@domain/repositories/SessionRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { Session, SessionStatus } from '@domain/entities/Session';
import { ValidationError, NotFoundError, StorageError } from '@core/errors/AppError';
import { success, failure } from '@core/utils/result';

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

const makeCompletedSession = (overrides: Partial<Session> = {}): Session =>
  makeActiveSession({
    status: SessionStatus.Completed,
    endedAt: '2025-01-01T01:00:00.000Z',
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

describe('EndSession', () => {
  let endSession: EndSession;
  let mockRepository: jest.Mocked<ISessionRepository>;
  let mockAnalytics: jest.Mocked<IAnalyticsService>;

  beforeEach(() => {
    mockRepository = makeMockRepository();
    mockAnalytics = makeMockAnalytics();
    endSession = new EndSession(mockRepository, mockAnalytics);
  });

  describe('happy path', () => {
    it('should end an active session and return the updated session', async () => {
      const activeSession = makeActiveSession();
      const completedSession = makeCompletedSession({ id: 'session-1' });

      mockRepository.getById.mockResolvedValue(success(activeSession));
      mockRepository.update.mockResolvedValue(success(completedSession));

      const result = await endSession.execute('session-1');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.status).toBe(SessionStatus.Completed);
        expect(result.value.endedAt).not.toBeNull();
      }
    });

    it('should call repository update with Completed status and endedAt timestamp', async () => {
      const activeSession = makeActiveSession();
      const completedSession = makeCompletedSession({ id: 'session-1' });

      mockRepository.getById.mockResolvedValue(success(activeSession));
      mockRepository.update.mockResolvedValue(success(completedSession));

      await endSession.execute('session-1');

      expect(mockRepository.update).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({
          status: SessionStatus.Completed,
          endedAt: expect.any(String),
        }),
      );
    });

    it('should track SESSION_ENDED analytics event on success', async () => {
      const activeSession = makeActiveSession();
      const completedSession = makeCompletedSession({ id: 'session-1' });

      mockRepository.getById.mockResolvedValue(success(activeSession));
      mockRepository.update.mockResolvedValue(success(completedSession));

      await endSession.execute('session-1');

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ name: ANALYTICS_CONSTANTS.EVENTS.SESSION_ENDED }),
      );
    });

    it('should include clipCount and duration in analytics event', async () => {
      const activeSession = makeActiveSession({ clipIds: ['clip-1', 'clip-2'] });
      const completedSession = makeCompletedSession({ id: 'session-1' });

      mockRepository.getById.mockResolvedValue(success(activeSession));
      mockRepository.update.mockResolvedValue(success(completedSession));

      await endSession.execute('session-1');

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            clipCount: 2,
            duration: expect.any(Number),
          }),
        }),
      );
    });

    it('should successfully end a Paused session', async () => {
      const pausedSession = makeActiveSession({ status: SessionStatus.Paused });
      const completedSession = makeCompletedSession({ id: 'session-1' });

      mockRepository.getById.mockResolvedValue(success(pausedSession));
      mockRepository.update.mockResolvedValue(success(completedSession));

      const result = await endSession.execute('session-1');

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({ status: SessionStatus.Completed }),
      );
    });
  });

  describe('error path', () => {
    it('should return failure when session is not found', async () => {
      const notFound = new NotFoundError('Session not found');
      mockRepository.getById.mockResolvedValue(failure(notFound));

      const result = await endSession.execute('missing-id');

      expect(result.isFailure).toBe(true);
    });

    it('should return ValidationError when session is already completed', async () => {
      const completedSession = makeCompletedSession({ id: 'session-1' });
      mockRepository.getById.mockResolvedValue(success(completedSession));

      const result = await endSession.execute('session-1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when repository update fails', async () => {
      const activeSession = makeActiveSession();
      const storageError = new StorageError('DB write failed');

      mockRepository.getById.mockResolvedValue(success(activeSession));
      mockRepository.update.mockResolvedValue(failure(storageError));

      const result = await endSession.execute('session-1');

      expect(result.isFailure).toBe(true);
    });

    it('should not track analytics when update fails', async () => {
      const activeSession = makeActiveSession();
      const storageError = new StorageError('DB write failed');

      mockRepository.getById.mockResolvedValue(success(activeSession));
      mockRepository.update.mockResolvedValue(failure(storageError));

      await endSession.execute('session-1');

      expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
    });
  });
});
