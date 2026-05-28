import { ClipRepository } from '@data/repositories/ClipRepository';
import { ClipLocalDataSource } from '@data/datasources/local/ClipLocalDataSource';
import type { IClipStorageService } from '@domain/services/IClipStorageService';
import { success } from '@core/utils/result';

const makeMockDb = () => {
  const store: Map<string, Record<string, unknown>> = new Map();

  return {
    _store: store,
    insert: jest.fn((_table: unknown) => ({
      values: jest.fn((row: Record<string, unknown>) => ({
        returning: jest.fn(async () => {
          store.set(row.id as string, { ...row });
          return [row];
        }),
      })),
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(async () => [...store.values()]),
        orderBy: jest.fn(async () => [...store.values()]),
      })),
    })),
    update: jest.fn((_table: unknown) => ({
      set: jest.fn((updates: Record<string, unknown>) => ({
        where: jest.fn(() => ({
          returning: jest.fn(async () => {
            const first = [...store.values()][0];
            if (!first) return [];
            const updated = { ...first, ...updates };
            store.set(first.id as string, updated);
            return [updated];
          }),
        })),
      })),
    })),
    delete: jest.fn((_table: unknown) => ({
      where: jest.fn(() => ({
        returning: jest.fn(async () => {
          const first = [...store.values()][0];
          if (!first) return [];
          store.delete(first.id as string);
          return [first];
        }),
      })),
    })),
  };
};

const makeMockClipStorage = (): jest.Mocked<IClipStorageService> => ({
  saveClip: jest.fn(),
  deleteClip: jest.fn().mockResolvedValue(success(undefined)),
  listClips: jest.fn(),
});

const NOW = '2025-01-01T00:00:00.000Z';

const makeClipInput = () => ({
  sessionId: 'session-1',
  videoPath: '/recordings/clip-1.mp4',
  duration: 10,
  recordedAt: NOW,
  fileSize: 1024 * 1024 * 5,
  resolution: { width: 1280, height: 720 },
  fps: 60,
});

describe('ClipRepository (integration)', () => {
  let db: ReturnType<typeof makeMockDb>;
  let dataSource: ClipLocalDataSource;
  let clipStorage: jest.Mocked<IClipStorageService>;
  let repository: ClipRepository;

  beforeEach(() => {
    db = makeMockDb();
    dataSource = new ClipLocalDataSource(db as never);
    clipStorage = makeMockClipStorage();
    repository = new ClipRepository(dataSource, clipStorage);
  });

  describe('create', () => {
    it('persists a clip and returns it as a domain entity', async () => {
      const input = makeClipInput();
      const result = await repository.create(input);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.sessionId).toBe('session-1');
        expect(result.value.videoPath).toBe('/recordings/clip-1.mp4');
        expect(result.value.id).toBeTruthy();
        expect(result.value.createdAt).toBeTruthy();
      }
    });

    it('returns failure when the data source throws', async () => {
      db.insert.mockImplementation(() => ({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      }));

      const result = await repository.create(makeClipInput());
      expect(result.isFailure).toBe(true);
    });
  });

  describe('getById', () => {
    it('returns the clip entity when found', async () => {
      const createResult = await repository.create(makeClipInput());
      expect(createResult.isSuccess).toBe(true);

      const storedRow = [...db._store.values()][0];
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([storedRow]),
          orderBy: jest.fn().mockResolvedValue([storedRow]),
        })),
      });

      if (createResult.isSuccess) {
        const getResult = await repository.getById(createResult.value.id);
        expect(getResult.isSuccess).toBe(true);
        if (getResult.isSuccess) {
          expect(getResult.value.id).toBe(createResult.value.id);
          expect(getResult.value.sessionId).toBe('session-1');
        }
      }
    });

    it('returns NotFoundError when clip does not exist', async () => {
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([]),
        })),
      });

      const result = await repository.getById('nonexistent');
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.message).toMatch(/not found/i);
      }
    });
  });

  describe('getBySessionId', () => {
    it('returns all clips for a session', async () => {
      await repository.create(makeClipInput());
      const storedRows = [...db._store.values()];

      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue(storedRows),
        })),
      });

      const result = await repository.getBySessionId('session-1');
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThanOrEqual(1);
        expect(result.value[0].sessionId).toBe('session-1');
      }
    });

    it('returns empty array when no clips exist for session', async () => {
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([]),
        })),
      });

      const result = await repository.getBySessionId('no-session');
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('delete', () => {
    it('calls clipStorageService.deleteClip with the video path', async () => {
      const createResult = await repository.create(makeClipInput());
      expect(createResult.isSuccess).toBe(true);

      const storedRow = [...db._store.values()][0];
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([storedRow]),
        })),
      });
      db.delete.mockReturnValue({
        where: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([storedRow]),
        })),
      });

      if (createResult.isSuccess) {
        await repository.delete(createResult.value.id);
        expect(clipStorage.deleteClip).toHaveBeenCalledWith(createResult.value.videoPath);
      }
    });
  });

  describe('mapper round-trip', () => {
    it('entity fields survive a create → getById round-trip', async () => {
      const input = makeClipInput();
      const createResult = await repository.create(input);
      expect(createResult.isSuccess).toBe(true);

      const storedRow = [...db._store.values()][0];
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([storedRow]),
        })),
      });

      if (createResult.isSuccess) {
        const getResult = await repository.getById(createResult.value.id);
        expect(getResult.isSuccess).toBe(true);
        if (getResult.isSuccess) {
          expect(getResult.value.id).toBe(createResult.value.id);
          expect(getResult.value.videoPath).toBe(input.videoPath);
          expect(getResult.value.fps).toBe(input.fps);
          expect(getResult.value.resolution).toEqual(input.resolution);
        }
      }
    });
  });
});
