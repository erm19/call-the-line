import { StartSession } from '@domain/useCases/StartSession';
import { EndSession } from '@domain/useCases/EndSession';
import { GetSessions } from '@domain/useCases/GetSessions';
import { ISessionRepository } from '@domain/repositories/SessionRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { Session, SessionStatus } from '@domain/entities/Session';
import { success, failure } from '@core/utils/result';
import { NotFoundError, StorageError } from '@core/errors/AppError';

const makeActiveSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session-1',
  name: 'Tennis Session',
  startedAt: '2025-01-01T00:00:00.000Z',
  endedAt: null,
  status: SessionStatus.Active,
  clipIds: ['clip-1', 'clip-2'],
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

    it('should use default name when no name provided', async () => {
      const session = makeActiveSession({ name: 'Tennis Session' });
      mockRepository.create.mockResolvedValue(success(session));

      await startSession.execute({});

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Tennis Session' }),
      );
    });

    it('should track session_started analytics event on success', async () => {
      const session = makeActiveSession();
      mockRepository.create.mockResolvedValue(success(session));

      await startSession.execute({});

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'session_started' }),
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

    it('should track session_ended analytics event on success', async () => {
      const activeSession = makeActiveSession();
      const completedSession = makeCompletedSession({ id: 'session-1' });

      mockRepository.getById.mockResolvedValue(success(activeSession));
      mockRepository.update.mockResolvedValue(success(completedSession));

      await endSession.execute('session-1');

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'session_ended' }),
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
  });

  describe('error path', () => {
    it('should return failure when session is not found', async () => {
      const notFound = new NotFoundError('Session not found');
      mockRepository.getById.mockResolvedValue(failure(notFound));

      const result = await endSession.execute('missing-id');

      expect(result.isFailure).toBe(true);
    });

    it('should return failure when session is already completed', async () => {
      const completedSession = makeCompletedSession({ id: 'session-1' });
      mockRepository.getById.mockResolvedValue(success(completedSession));

      const result = await endSession.execute('session-1');

      expect(result.isFailure).toBe(true);
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

describe('GetSessions', () => {
  let getSessions: GetSessions;
  let mockRepository: jest.Mocked<ISessionRepository>;

  beforeEach(() => {
    mockRepository = makeMockRepository();
    getSessions = new GetSessions(mockRepository);
  });

  describe('happy path', () => {
    it('should return all sessions', async () => {
      const sessions = [
        makeActiveSession({ id: 'session-1' }),
        makeActiveSession({ id: 'session-2' }),
      ];
      mockRepository.getAll.mockResolvedValue(success(sessions));

      const result = await getSessions.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toHaveLength(2);
      }
    });

    it('should return an empty array when no sessions exist', async () => {
      mockRepository.getAll.mockResolvedValue(success([]));

      const result = await getSessions.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toHaveLength(0);
      }
    });

    it('should pass pagination params to the repository', async () => {
      mockRepository.getAll.mockResolvedValue(success([]));

      await getSessions.execute({ limit: 10, offset: 20 });

      expect(mockRepository.getAll).toHaveBeenCalledWith({ limit: 10, offset: 20 });
    });

    it('should call repository with no params when execute called with no args', async () => {
      mockRepository.getAll.mockResolvedValue(success([]));

      await getSessions.execute();

      expect(mockRepository.getAll).toHaveBeenCalledWith({});
    });
  });

  describe('error path', () => {
    it('should return failure when repository getAll fails', async () => {
      const storageError = new StorageError('DB read failed');
      mockRepository.getAll.mockResolvedValue(failure(storageError));

      const result = await getSessions.execute();

      expect(result.isFailure).toBe(true);
    });
  });
});
