import { DI_TOKENS, diContainer } from '../../core/di/container';
import { db } from './client';

export function registerDbClient(): void {
  diContainer.registerInstance(DI_TOKENS.DB_CLIENT, db);
}
