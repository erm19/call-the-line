import { SessionLocalDataSource } from '@data/datasources/local/SessionLocalDataSource';
import { SessionDTO } from '@data/models/SessionDTO';

// Mock the Drizzle db client at the JSI boundary — each test configures
// its own fluent builder chain via db.insert/select/update/delete mocks.
const makeDbMock = () => ({
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const NOW_ISO = '2025-01-01T00:00:00.000Z';
const NOW_DATE = new Date(NOW_ISO);

const makeDTO = (overrides: Partial<SessionDTO> = {}): SessionDTO => ({
  id: 'session-1',
  name: 'Test Session',
  started_at: NOW_ISO,
  ended_at: null,
  status: 'active',
  clip_ids: ['clip-1'],
  calibration_id: null,
  notes: 'Test notes',
  location: 'Court 1',
  created_at: NOW_ISO,
  updated_at: NOW_ISO,
  ...overrides,
});

/** Drizzle row shape returned from DB (timestamps as Dates) */
const makeDbRow = (overrides: Partial<SessionDTO> = {}) => {
  const dto = makeDTO(overrides);
  return {
    id: dto.id,
    name: dto.name,
    startedAt: NOW_DATE,
    endedAt: dto.ended_at ? new Date(dto.ended_at) : null,
    status: dto.status,
    clipIds: JSON.stringify(dto.clip_ids),
    calibrationId: dto.calibration_id,
    notes: dto.notes,
    location: dto.location,
    createdAt: NOW_DATE,
    updatedAt: NOW_DATE,
  };
};

describe('SessionLocalDataSource', () => {
  let db: ReturnType<typeof makeDbMock>;
  let dataSource: SessionLocalDataSource;

  beforeEach(() => {
    db = makeDbMock();
    dataSource = new SessionLocalDataSource(db as never);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('inserts the row and returns a DTO', async () => {
      const dto = makeDTO();
      const dbRow = makeDbRow();

      db.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue([dbRow]),
      });

      const result = await dataSource.create(dto);

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(dto.id);
      expect(result.name).toBe(dto.name);
      expect(result.started_at).toBe(NOW_ISO);
      expect(result.created_at).toBe(NOW_ISO);
      expect(result.clip_ids).toEqual(['clip-1']);
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

      const result = await dataSource.getById('session-1');

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('session-1');
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

  describe('update', () => {
    it('calls db.update and returns updated DTO on success', async () => {
      const updatedRow = makeDbRow({ name: 'Updated Name' });

      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedRow]),
          }),
        }),
      });

      const result = await dataSource.update('session-1', { name: 'Updated Name' });

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Name');
    });

    it('returns null when no row matches the id', async () => {
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await dataSource.update('missing-id', { name: 'X' });

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

      const result = await dataSource.delete('session-1');

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
});
