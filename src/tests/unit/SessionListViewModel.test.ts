import { SessionListViewModel } from '@presentation/screens/Session/SessionListViewModel';
import { useSessionStore } from '@presentation/state/sessionStore';
import { GetSessions } from '@domain/useCases/GetSessions';
import { EndSession } from '@domain/useCases/EndSession';
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

describe('SessionListViewModel', () => {
  let viewModel: SessionListViewModel;
  let mockGetSessions: jest.Mocked<Pick<GetSessions, 'execute'>>;
  let mockEndSession: jest.Mocked<Pick<EndSession, 'execute'>>;

  beforeEach(() => {
    useSessionStore.getState().reset();
    mockGetSessions = { execute: jest.fn() };
    mockEndSession = { execute: jest.fn() };
    viewModel = new SessionListViewModel(
      mockGetSessions as unknown as GetSessions,
      mockEndSession as unknown as EndSession,
    );
  });

  describe('loadSessions', () => {
    it('should populate the store with sessions on success', async () => {
      const sessions = [makeSession({ id: 's-1' }), makeSession({ id: 's-2' })];
      mockGetSessions.execute.mockResolvedValue(success(sessions));

      await viewModel.loadSessions();

      expect(useSessionStore.getState().items).toEqual(sessions);
      expect(useSessionStore.getState().isLoading).toBe(false);
      expect(useSessionStore.getState().error).toBeNull();
    });

    it('should set error on failure', async () => {
      const err = new StorageError('DB read failed');
      mockGetSessions.execute.mockResolvedValue(failure(err));

      await viewModel.loadSessions();

      expect(useSessionStore.getState().error).toBe('DB read failed');
      expect(useSessionStore.getState().items).toEqual([]);
      expect(useSessionStore.getState().isLoading).toBe(false);
    });

    it('should set isLoading true during the call', async () => {
      let loadingDuringCall = false;
      mockGetSessions.execute.mockImplementation(async () => {
        loadingDuringCall = useSessionStore.getState().isLoading;
        return success([]);
      });

      await viewModel.loadSessions();

      expect(loadingDuringCall).toBe(true);
      expect(useSessionStore.getState().isLoading).toBe(false);
    });
  });

  describe('endSessionById', () => {
    it('should update the ended session in the store on success', async () => {
      const sessionToEnd = makeSession({ id: 's-1' });
      const other = makeSession({ id: 's-2' });
      useSessionStore.getState().setItems([sessionToEnd, other]);

      const completed = { ...sessionToEnd, status: SessionStatus.Completed };
      mockEndSession.execute.mockResolvedValue(success(completed));

      await viewModel.endSessionById('s-1');

      const items = useSessionStore.getState().items;
      expect(items).toHaveLength(2);
      const updated = items.find(s => s.id === 's-1');
      expect(updated?.status).toBe(SessionStatus.Completed);
    });

    it('should set error on failure', async () => {
      const err = new StorageError('Write failed');
      mockEndSession.execute.mockResolvedValue(failure(err));

      await viewModel.endSessionById('s-1');

      expect(useSessionStore.getState().error).toBe('Write failed');
    });
  });
});
