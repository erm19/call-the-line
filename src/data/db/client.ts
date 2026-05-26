import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const sqlite = openDatabaseSync('call-the-line.db');

export const db = drizzle(sqlite, { schema });

export type DbClient = typeof db;
