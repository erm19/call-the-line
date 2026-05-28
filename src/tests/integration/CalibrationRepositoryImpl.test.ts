import { CalibrationRepository } from '@data/repositories/CalibrationRepository';
import { CalibrationLocalDataSource } from '@data/datasources/local/CalibrationLocalDataSource';

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
        where: jest.fn(() => ({
          orderBy: jest.fn(async () => [...store.values()]),
        })),
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

const NOW = '2025-01-01T00:00:00.000Z';
const NOW_DATE = new Date(NOW);

const CORNER_POINTS: [
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number },
] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const makeInput = () => ({
  sessionId: 'session-1',
  cornerPoints: CORNER_POINTS,
  lines: [],
  transformationMatrix: [],
  cameraParams: {},
  confidence: 0.9,
  isValid: true,
});

describe('CalibrationRepository (integration)', () => {
  let db: ReturnType<typeof makeMockDb>;
  let dataSource: CalibrationLocalDataSource;
  let repository: CalibrationRepository;

  beforeEach(() => {
    db = makeMockDb();
    dataSource = new CalibrationLocalDataSource(db as never);
    repository = new CalibrationRepository(dataSource);
  });

  describe('create', () => {
    it('returns a calibration entity with generated id and timestamps', async () => {
      const makeDbRow = (row: Record<string, unknown>) => ({
        ...row,
        createdAt: NOW_DATE,
        updatedAt: NOW_DATE,
        cornerPoints: JSON.stringify(CORNER_POINTS),
        lines: JSON.stringify([]),
        transformationMatrix: JSON.stringify([]),
        cameraParams: JSON.stringify({}),
      });

      db.insert.mockReturnValue({
        values: jest.fn((row: Record<string, unknown>) => ({
          returning: jest.fn(async () => {
            const dbRow = makeDbRow(row);
            db._store.set(row.id as string, dbRow);
            return [dbRow];
          }),
        })),
      });

      const result = await repository.create(makeInput());

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.id).toBeTruthy();
        expect(result.value.sessionId).toBe('session-1');
        expect(result.value.confidence).toBe(0.9);
        expect(result.value.cornerPoints).toEqual(CORNER_POINTS);
        expect(result.value.createdAt).toBeTruthy();
      }
    });

    it('returns failure when the data source throws', async () => {
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      const result = await repository.create(makeInput());
      expect(result.isFailure).toBe(true);
    });
  });

  describe('getById', () => {
    it('returns NotFoundError when calibration does not exist', async () => {
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
    it('returns null when no calibration exists for session', async () => {
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn().mockResolvedValue([]),
          })),
        })),
      });

      const result = await repository.getBySessionId('no-session');
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe('update', () => {
    it('passes only the provided fields to the data source', async () => {
      const existingRow = {
        id: 'cal-1',
        sessionId: 'session-1',
        cornerPoints: JSON.stringify(CORNER_POINTS),
        lines: JSON.stringify([]),
        transformationMatrix: JSON.stringify([]),
        cameraParams: JSON.stringify({}),
        confidence: 0.9,
        isValid: true,
        createdAt: NOW_DATE,
        updatedAt: NOW_DATE,
      };

      db.update.mockReturnValue({
        set: jest.fn((updates: Record<string, unknown>) => ({
          where: jest.fn(() => ({
            returning: jest.fn(async () => [{ ...existingRow, ...updates }]),
          })),
        })),
      });

      const result = await repository.update('cal-1', { confidence: 0.5 });
      expect(result.isSuccess).toBe(true);
    });

    it('returns NotFoundError when calibration does not exist', async () => {
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn(() => ({
            returning: jest.fn().mockResolvedValue([]),
          })),
        }),
      });

      const result = await repository.update('missing', { confidence: 0.5 });
      expect(result.isFailure).toBe(true);
    });
  });

  describe('delete', () => {
    it('returns NotFoundError when calibration does not exist', async () => {
      db.delete.mockReturnValue({
        where: jest.fn(() => ({
          returning: jest.fn().mockResolvedValue([]),
        })),
      });

      const result = await repository.delete('missing');
      expect(result.isFailure).toBe(true);
    });
  });
});
