import type { DbClient } from './client';
import { DI_TOKENS, diContainer } from '../../core/di/container';

/**
 * Registers the db client in the DI container.
 * Call after `createDbClient()` in App.tsx bootstrap.
 */
export const registerDbClient = (db: DbClient): void => {
  diContainer.registerInstance(DI_TOKENS.DbClient, db);
};
