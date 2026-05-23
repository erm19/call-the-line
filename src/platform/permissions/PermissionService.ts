import { Linking } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { success, failure, Result } from '@core/utils/result';
import { PermissionError } from '@core/errors/AppError';

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

const toCameraPermissionStatus = (raw: string): PermissionStatus => {
  switch (raw) {
    case 'granted':
      return PermissionStatus.Granted;
    case 'denied':
      return PermissionStatus.Denied;
    case 'restricted':
      return PermissionStatus.Restricted;
    default:
      return PermissionStatus.NotDetermined;
  }
};

const checkCameraOrMic = (permission: Permission): PermissionStatus => {
  const raw =
    permission === Permission.Camera
      ? Camera.getCameraPermissionStatus()
      : Camera.getMicrophonePermissionStatus();
  return toCameraPermissionStatus(raw);
};

const requestCameraOrMic = async (permission: Permission): Promise<PermissionStatus> => {
  const raw =
    permission === Permission.Camera
      ? await Camera.requestCameraPermission()
      : await Camera.requestMicrophonePermission();
  return toCameraPermissionStatus(raw);
};

/**
 * Permission Service Implementation
 * Uses react-native-vision-camera for camera/microphone permissions
 * and React Native Linking for opening system settings.
 */
export class PermissionService implements IPermissionService {
  async checkPermission(
    permission: Permission,
  ): Promise<Result<PermissionStatus, PermissionError>> {
    try {
      if (permission === Permission.Storage) {
        return success(PermissionStatus.Granted);
      }
      return success(checkCameraOrMic(permission));
    } catch (e) {
      return failure(new PermissionError('Failed to check permission', permission));
    }
  }

  async requestPermission(
    permission: Permission,
  ): Promise<Result<PermissionStatus, PermissionError>> {
    try {
      if (permission === Permission.Storage) {
        return success(PermissionStatus.Granted);
      }
      const status = await requestCameraOrMic(permission);
      return success(status);
    } catch (e) {
      return failure(new PermissionError('Failed to request permission', permission));
    }
  }

  async requestPermissions(
    permissions: Permission[],
  ): Promise<Result<Record<Permission, PermissionStatus>, PermissionError>> {
    const results = {} as Record<Permission, PermissionStatus>;

    for (const permission of permissions) {
      const result = await this.requestPermission(permission);
      if (result.isFailure) {
        return failure(result.error);
      }
      results[permission] = result.value;
    }

    return success(results);
  }

  async openSettings(): Promise<Result<void, PermissionError>> {
    try {
      await Linking.openSettings();
      return success(undefined);
    } catch (e) {
      return failure(new PermissionError('Failed to open settings', 'settings'));
    }
  }
}
