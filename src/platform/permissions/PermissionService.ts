import { injectable } from 'tsyringe';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import { Linking } from 'react-native';
import { success, failure } from '@core/utils/result';
import { PermissionError } from '@core/errors/AppError';
import type { Result } from '@core/utils/result';
import {
  Permission,
  PermissionStatus,
  type IPermissionService,
} from '@domain/services/IPermissionService';

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
      ? VisionCamera.getCameraPermissionStatus()
      : VisionCamera.getMicrophonePermissionStatus();
  return toCameraPermissionStatus(raw);
};

const requestCameraOrMic = async (permission: Permission): Promise<PermissionStatus> => {
  const raw =
    permission === Permission.Camera
      ? await VisionCamera.requestCameraPermission()
      : await VisionCamera.requestMicrophonePermission();
  return toCameraPermissionStatus(raw);
};

/**
 * Permission Service Implementation
 * Uses react-native-vision-camera for camera/microphone permissions
 * and React Native Linking for opening system settings.
 */
@injectable()
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
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new PermissionError(`Failed to check permission: ${msg}`, permission));
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
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new PermissionError(`Failed to request permission: ${msg}`, permission));
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
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new PermissionError(`Failed to open settings: ${msg}`, 'settings'));
    }
  }
}
