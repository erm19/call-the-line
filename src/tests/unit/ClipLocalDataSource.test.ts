import { ClipLocalDataSource } from '@data/datasources/local/ClipLocalDataSource';
import { ClipDTO } from '@data/models/ClipDTO';

// Mock the Drizzle db client at the JSI boundary
const makeDbMock = () => ({
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const NOW_ISO = '2025-01-01T00:00:00.000Z';
const NOW_DATE = new Date(NOW_ISO);

const makeDTO = (overrides: Partial<ClipDTO> = {}): ClipDTO => ({
  id: 'clip-1',
  session_id: 'session-1',
  video_path: '/clips/clip-1.mp4',
  duration: 5.0,
  recorded_at: NOW_ISO,
  file_size: 1024000,
  resolution: { width: 1920, height: 1080 },
  fps: 60,
  thumbnail_path: '/thumbnails/clip-1.jpg',
  ai_result_id: undefined,
  point_decision_id: undefined,
  created_at: NOW_ISO,
  updated_at: NOW_ISO,
  ...overrides,
});

/** Drizzle row shape returned from DB (timestamps as Dates, resolution as JSON string) */
const makeDbRow = (overrides: Partial<ClipDTO> = {}) => {
  const dto = makeDTO(overrides);
  return {
    id: dto.id,
    sessionId: dto.session_id,
    videoPath: dto.video_path,
    duration: dto.duration,
    recordedAt: NOW_DATE,
    fileSize: dto.file_size,
    resolution: JSON.stringify(dto.resolution),
    fps: dto.fps,
    thumbnailPath: dto.thumbnail_path ?? null,
    aiResultId: dto.ai_result_id ?? null,
    pointDecisionId: dto.point_decision_id ?? null,
    createdAt: NOW_DATE,
    updatedAt: NOW_DATE,
  };
};

describe('ClipLocalDataSource', () => {
  let db: ReturnType<typeof makeDbMock>;
  let dataSource: ClipLocalDataSource;

  beforeEach(() => {
    db = makeDbMock();
    dataSource = new ClipLocalDataSource(db as never);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('inserts the row and returns a DTO', async () => {
      const dto = makeDTO();
      const dbRow = makeDbRow();

      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([dbRow]),
        }),
      });

      const result = await dataSource.create(dto);

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(dto.id);
      expect(result.video_path).toBe(dto.video_path);
      expect(result.recorded_at).toBe(NOW_ISO);
      expect(result.resolution).toEqual({ width: 1920, height: 1080 });
    });

    it('throws when returning is empty (signals a DB error)', async () => {
      const dto = makeDTO();

      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(dataSource.create(dto)).rejects.toThrow('Clip insert returned no rows');
    });
  });

  describe('getById', () => {
    it('returns the DTO when a matching row is found', async () => {
      const dbRow = makeDbRow();

      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([dbRow]),
        }),
      });

      const result = await dataSource.getById('clip-1');

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('clip-1');
      expect(result?.resolution).toEqual({ width: 1920, height: 1080 });
    });

    it('returns null when no row is found', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await dataSource.getById('missing-id');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('returns all rows as DTOs', async () => {
      const dbRow = makeDbRow();

      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([dbRow, dbRow]),
        }),
      });

      const result = await dataSource.getAll();

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no rows exist', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await dataSource.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getBySessionId', () => {
    it('returns clips for the given session', async () => {
      const dbRow = makeDbRow();

      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([dbRow]),
        }),
      });

      const result = await dataSource.getBySessionId('session-1');

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].session_id).toBe('session-1');
    });

    it('returns empty array when no clips exist for session', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await dataSource.getBySessionId('session-x');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('calls db.update and returns updated DTO on success', async () => {
      const updatedRow = makeDbRow({ video_path: '/clips/updated.mp4' });

      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedRow]),
          }),
        }),
      });

      const result = await dataSource.update('clip-1', { video_path: '/clips/updated.mp4' });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result?.video_path).toBe('/clips/updated.mp4');
    });

    it('returns null when no row matches the id', async () => {
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await dataSource.update('missing-id', { duration: 10 });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('returns true when a row is deleted', async () => {
      const dbRow = makeDbRow();

      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([dbRow]),
        }),
      });

      const result = await dataSource.delete('clip-1');

      expect(db.delete).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('returns false when no row matches', async () => {
      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await dataSource.delete('missing-id');

      expect(result).toBe(false);
    });
  });

  describe('deleteBySessionId', () => {
    it('calls db.delete with the session id filter', async () => {
      db.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      await dataSource.deleteBySessionId('session-1');

      expect(db.delete).toHaveBeenCalledTimes(1);
    });
  });
});
