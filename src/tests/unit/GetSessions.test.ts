import { GetSessions } from '@domain/useCases/GetSessions';
import { ISessionRepository } from '@domain/repositories/SessionRepository';
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

describe('GetSessions', () => {
  let getSessions: GetSessions;
  let mockRepository: jest.Mocked<ISessionRepository>;

  beforeEach(() => {
    mockRepository = makeMockRepository();
    getSessions = new GetSessions(mockRepository);
  });

  describe('happy path', () => {
    it('should return all sessions from the repository', async () => {
      const sessions = [
        makeActiveSession({ id: 'session-1' }),
        makeActiveSession({ id: 'session-2' }),
      ];
      mockRepository.getAll.mockResolvedValue(success(sessions));

      const result = await getSessions.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual(sessions);
      }
    });

    it('should return an empty array when no sessions exist', async () => {
      mockRepository.getAll.mockResolvedValue(success([]));

      const result = await getSessions.execute();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual([]);
      }
    });

    it('should pass pagination params to the repository', async () => {
      mockRepository.getAll.mockResolvedValue(success([]));

      await getSessions.execute({ limit: 10, offset: 20 });

      expect(mockRepository.getAll).toHaveBeenCalledWith({ limit: 10, offset: 20 });
    });

    it('should call repository with empty object when execute called with no args', async () => {
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
