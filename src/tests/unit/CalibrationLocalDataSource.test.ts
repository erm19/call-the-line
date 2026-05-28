import { CalibrationLocalDataSource } from '@data/datasources/local/CalibrationLocalDataSource';
import { CalibrationDTO } from '@data/models/CalibrationDTO';

const makeDbMock = () => ({
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const NOW_ISO = '2025-01-01T00:00:00.000Z';
const NOW_DATE = new Date(NOW_ISO);

const CORNER_POINTS = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const makeDTO = (overrides: Partial<CalibrationDTO> = {}): CalibrationDTO => ({
  id: 'cal-1',
  session_id: 'session-1',
  corner_points: CORNER_POINTS,
  lines: [],
  transformation_matrix: [],
  camera_params: {},
  confidence: 0.95,
  is_valid: true,
  created_at: NOW_ISO,
  updated_at: NOW_ISO,
  ...overrides,
});

const makeDbRow = (overrides: Partial<CalibrationDTO> = {}) => {
  const dto = makeDTO(overrides);
  return {
    id: dto.id,
    sessionId: dto.session_id,
    cornerPoints: JSON.stringify(dto.corner_points),
    lines: JSON.stringify(dto.lines),
    transformationMatrix: JSON.stringify(dto.transformation_matrix),
    cameraParams: JSON.stringify(dto.camera_params),
    confidence: dto.confidence,
    isValid: dto.is_valid,
    createdAt: NOW_DATE,
    updatedAt: NOW_DATE,
  };
};

describe('CalibrationLocalDataSource', () => {
  let db: ReturnType<typeof makeDbMock>;
  let dataSource: CalibrationLocalDataSource;

  beforeEach(() => {
    db = makeDbMock();
    dataSource = new CalibrationLocalDataSource(db as never);
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
      expect(result.corner_points).toEqual(CORNER_POINTS);
      expect(result.confidence).toBe(0.95);
      expect(result.is_valid).toBe(true);
    });

    it('returns original DTO when returning is empty', async () => {
      const dto = makeDTO();

      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await dataSource.create(dto);
      expect(result).toBe(dto);
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

      const result = await dataSource.getById('cal-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('cal-1');
      expect(result?.corner_points).toEqual(CORNER_POINTS);
    });

    it('returns null when no row is found', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await dataSource.getById('missing');
      expect(result).toBeNull();
    });
  });

  describe('getBySessionId', () => {
    it('returns DTO when calibration exists for session', async () => {
      const dbRow = makeDbRow();

      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([dbRow]),
          }),
        }),
      });

      const result = await dataSource.getBySessionId('session-1');

      expect(result).not.toBeNull();
      expect(result?.session_id).toBe('session-1');
    });

    it('returns null when no calibration exists for session', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await dataSource.getBySessionId('no-session');
      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('returns all rows as DTOs', async () => {
      const dbRow = makeDbRow();

      db.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([dbRow, dbRow]),
      });

      const result = await dataSource.getAll();
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no rows exist', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      const result = await dataSource.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('returns updated DTO on success', async () => {
      const updatedRow = makeDbRow({ confidence: 0.5 });

      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedRow]),
          }),
        }),
      });

      const result = await dataSource.update('cal-1', { confidence: 0.5 });

      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(0.5);
    });

    it('returns null when no row matches', async () => {
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await dataSource.update('missing', { confidence: 0.5 });
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

      const result = await dataSource.delete('cal-1');
      expect(result).toBe(true);
    });

    it('returns false when no row matches', async () => {
      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await dataSource.delete('missing');
      expect(result).toBe(false);
    });
  });
});
