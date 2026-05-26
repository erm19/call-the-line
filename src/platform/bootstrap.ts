import { diContainer, DI_TOKENS } from '@core/di/container';
import { PermissionService } from './permissions/PermissionService';
import { FileStorageService } from './storage/FileStorageService';
import { ClipStorageService } from './storage/ClipStorageService';

/**
 * Registers all platform services with the DI container.
 * Call once from App.tsx before rendering the navigator.
 */
export const registerPlatformServices = (): void => {
  diContainer.registerSingleton(DI_TOKENS.PermissionService, PermissionService as never);
  diContainer.registerSingleton(DI_TOKENS.FileStorageService, FileStorageService as never);
  diContainer.registerSingleton(DI_TOKENS.ClipStorageService, ClipStorageService as never);
};
