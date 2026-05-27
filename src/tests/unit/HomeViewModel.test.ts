import { HomeViewModel } from '@presentation/screens/Home/HomeViewModel';
import { useSessionStore } from '@presentation/state/sessionStore';
import { StartSession } from '@domain/useCases/StartSession';
import { GetSessions } from '@domain/useCases/GetSessions';
import { Session, SessionStatus } from '@domain/entities/Session';
import { success, failure } from '@core/utils/result';
import { StorageError } from '@core/errors/AppError';

const makeSession = (overrides: Partial<Session> = {}): Session => ({
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

describe('HomeViewModel', () => {
  let viewModel: HomeViewModel;
  let mockStartSession: jest.Mocked<Pick<StartSession, 'execute'>>;
  let mockGetSessions: jest.Mocked<Pick<GetSessions, 'execute'>>;

  beforeEach(() => {
    useSessionStore.getState().reset();
    mockStartSession = { execute: jest.fn() };
    mockGetSessions = { execute: jest.fn() };
    viewModel = new HomeViewModel(
      mockStartSession as unknown as StartSession,
      mockGetSessions as unknown as GetSessions,
    );
  });

  describe('loadSessions', () => {
    it('populates store with sessions on success', async () => {
      const sessions = [makeSession({ id: 's-1' }), makeSession({ id: 's-2' })];
      mockGetSessions.execute.mockResolvedValue(success(sessions));

      await viewModel.loadSessions();

      expect(useSessionStore.getState().items).toEqual(sessions);
      expect(useSessionStore.getState().isLoading).toBe(false);
      expect(useSessionStore.getState().error).toBeNull();
    });

    it('sets error on failure', async () => {
      mockGetSessions.execute.mockResolvedValue(failure(new StorageError('DB error')));

      await viewModel.loadSessions();

      expect(useSessionStore.getState().error).toBe('DB error');
      expect(useSessionStore.getState().isLoading).toBe(false);
    });

    it('sets isLoading true during the call', async () => {
      let loadingDuringCall = false;
      mockGetSessions.execute.mockImplementation(async () => {
        loadingDuringCall = useSessionStore.getState().isLoading;
        return success([]);
      });

      await viewModel.loadSessions();

      expect(loadingDuringCall).toBe(true);
    });
  });

  describe('startSession', () => {
    it('adds the new session to the store on success', async () => {
      const session = makeSession({ id: 'new-session' });
      mockStartSession.execute.mockResolvedValue(success(session));

      await viewModel.startSession('My Session');

      expect(useSessionStore.getState().items).toHaveLength(1);
      expect(useSessionStore.getState().items[0].id).toBe('new-session');
      expect(useSessionStore.getState().activeItem).toEqual(session);
    });

    it('passes the session name to the use case', async () => {
      mockStartSession.execute.mockResolvedValue(success(makeSession()));

      await viewModel.startSession('Custom Name');

      expect(mockStartSession.execute).toHaveBeenCalledWith({ name: 'Custom Name' });
    });

    it('sets error on failure', async () => {
      mockStartSession.execute.mockResolvedValue(failure(new StorageError('Write failed')));

      await viewModel.startSession('Session');

      expect(useSessionStore.getState().error).toBe('Write failed');
      expect(useSessionStore.getState().items).toHaveLength(0);
    });

    it('sets isLoading to false after failure', async () => {
      mockStartSession.execute.mockResolvedValue(failure(new StorageError('Error')));

      await viewModel.startSession('Session');

      expect(useSessionStore.getState().isLoading).toBe(false);
    });
  });
});
