import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

export type DbClient = ReturnType<typeof createDbClient>;

/**
 * Creates the database client.
 *
 * Call once from bootstrap (e.g. App.tsx) and register the result
 * in the DI container via `registerDbClient(db)`.
 * Using a factory instead of a module-level singleton keeps the
 * native JSI call out of Jest's module-load phase.
 */
export const createDbClient = (dbName = 'call-the-line.db'): ReturnType<typeof drizzle> => {
  const sqlite = openDatabaseSync(dbName);
  return drizzle(sqlite, { schema });
};
