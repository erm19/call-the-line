import { diContainer, DI_TOKENS } from '@core/di/container';
import { StartSession } from '../useCases/StartSession';
import { EndSession } from '../useCases/EndSession';
import { GetSessions } from '../useCases/GetSessions';
import { SaveCalibration } from '../useCases/SaveCalibration';

/**
 * Registers all domain use cases with the DI container.
 *
 * Call this once from App.tsx before rendering the navigator.
 * Keeping registrations here (not in container.ts) prevents
 * core → domain circular imports and ensures tests that import
 * DI_TOKENS do not accidentally trigger use-case class loading.
 */
export const registerUseCases = (): void => {
  // Casts needed because DIContainer.registerSingleton uses (...args: unknown[])
  // to stay generic; the actual parameter types are enforced by @inject() at runtime.
  diContainer.registerSingleton(DI_TOKENS.StartSession, StartSession as never);
  diContainer.registerSingleton(DI_TOKENS.EndSession, EndSession as never);
  diContainer.registerSingleton(DI_TOKENS.GetSessions, GetSessions as never);
  diContainer.registerSingleton(DI_TOKENS.SaveCalibration, SaveCalibration as never);
};
