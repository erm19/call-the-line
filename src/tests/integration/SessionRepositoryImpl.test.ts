/**
 * Integration test for SessionRepository
 *
 * Tests the full stack: SessionRepository → SessionLocalDataSource → mapper
 * with a mock Drizzle db client (mocked at the JSI boundary).
 * No mocks for repo or data source logic.
 */
import { SessionRepository } from '@data/repositories/SessionRepository';
import { SessionLocalDataSource } from '@data/datasources/local/SessionLocalDataSource';
import { SessionStatus } from '@domain/entities/Session';

// ─── Mock Drizzle db — cooperates with Drizzle's eq/desc helpers ────────────
const makeMockDb = () => {
  const store: Map<string, Record<string, unknown>> = new Map();

  return {
    _store: store,
    insert: jest.fn((_table: unknown) => ({
      values: jest.fn(async (row: Record<string, unknown>) => {
        store.set(row.id as string, row);
        return [row];
      }),
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
            const key = updates.id as string | undefined;
            if (!key || !store.has(key)) {
              // update by matching any row — find first
              const first = [...store.values()][0];
              if (!first) return [];
              const updated = { ...first, ...updates };
              store.set(first.id as string, updated);
              return [updated];
            }
            const updated = { ...store.get(key)!, ...updates };
            store.set(key, updated);
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const NOW = '2025-01-01T00:00:00.000Z';
const makeSessionInput = () => ({
  name: 'Test Session',
  startedAt: NOW,
  endedAt: null as string | null,
  status: SessionStatus.Active,
  clipIds: [] as string[],
  calibrationId: null as string | null,
  notes: undefined as string | undefined,
  location: undefined as string | undefined,
});

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('SessionRepository (integration)', () => {
  let db: ReturnType<typeof makeMockDb>;
  let dataSource: SessionLocalDataSource;
  let repository: SessionRepository;

  beforeEach(() => {
    db = makeMockDb();
    dataSource = new SessionLocalDataSource(db as never);
    repository = new SessionRepository(dataSource);
  });

  describe('create', () => {
    it('should persist a session and return it as a domain entity', async () => {
      const input = makeSessionInput();

      const result = await repository.create(input);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.name).toBe(input.name);
        expect(result.value.status).toBe(SessionStatus.Active);
        expect(result.value.id).toBeTruthy();
        expect(result.value.createdAt).toBeTruthy();
      }
    });

    it('should return failure when the data source throws', async () => {
      db.insert.mockImplementation(() => ({
        values: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      const result = await repository.create(makeSessionInput());

      expect(result.isFailure).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return the session entity when found', async () => {
      const createResult = await repository.create(makeSessionInput());
      expect(createResult.isSuccess).toBe(true);

      // Configure select to return the stored row
      const storedRow = [...db._store.values()][0];
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([storedRow]),
        })),
      });

      const getResult = await repository.getById(storedRow.id as string);

      expect(getResult.isSuccess).toBe(true);
      if (getResult.isSuccess) {
        expect(getResult.value.id).toBe(storedRow.id);
        expect(getResult.value.name).toBe('Test Session');
      }
    });

    it('should return NotFoundError when no session exists', async () => {
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

  describe('getAll', () => {
    it('should return all sessions as domain entities', async () => {
      await repository.create(makeSessionInput());
      await repository.create({ ...makeSessionInput(), name: 'Session 2' });

      const storedRows = [...db._store.values()];
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          orderBy: jest.fn().mockResolvedValue(storedRows),
        })),
      });

      const result = await repository.getAll();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThanOrEqual(2);
        expect(result.value[0]).toHaveProperty('id');
        expect(result.value[0]).toHaveProperty('name');
        expect(result.value[0]).toHaveProperty('status');
      }
    });

    it('should return empty array when no sessions exist', async () => {
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          orderBy: jest.fn().mockResolvedValue([]),
        })),
      });

      const result = await repository.getAll();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('mapper round-trip', () => {
    it('entity fields survive a create → getById round-trip', async () => {
      const input = makeSessionInput();
      const createResult = await repository.create(input);
      expect(createResult.isSuccess).toBe(true);

      const storedRow = [...db._store.values()][0];
      db.select.mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([storedRow]),
        })),
      });

      const getResult = await repository.getById(storedRow.id as string);

      expect(getResult.isSuccess).toBe(true);
      if (createResult.isSuccess && getResult.isSuccess) {
        expect(getResult.value.id).toBe(createResult.value.id);
        expect(getResult.value.name).toBe(createResult.value.name);
        expect(getResult.value.status).toBe(createResult.value.status);
        expect(getResult.value.clipIds).toEqual([]);
      }
    });
  });
});
