import type { PermissionError } from '@core/errors/AppError';
import type { Result } from '@core/utils/result';

/**
 * Permission types
 */
export enum Permission {
  Camera = 'camera',
  Microphone = 'microphone',
  Storage = 'storage',
}

/**
 * Permission status
 */
export enum PermissionStatus {
  Granted = 'granted',
  Denied = 'denied',
  NotDetermined = 'not_determined',
  Restricted = 'restricted',
}

/**
 * Permission Service Interface
 * Handles permission requests and status checks
 */
export interface IPermissionService {
  checkPermission(permission: Permission): Promise<Result<PermissionStatus, PermissionError>>;
  requestPermission(permission: Permission): Promise<Result<PermissionStatus, PermissionError>>;
  requestPermissions(
    permissions: Permission[],
  ): Promise<Result<Record<Permission, PermissionStatus>, PermissionError>>;
  openSettings(): Promise<Result<void, PermissionError>>;
}
