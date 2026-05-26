import { PermissionService } from '@platform/permissions/PermissionService';
import { Permission, PermissionStatus } from '@domain/services/IPermissionService';

// Mock react-native-vision-camera at the module boundary
jest.mock('react-native-vision-camera', () => ({
  Camera: {
    getCameraPermissionStatus: jest.fn(),
    getMicrophonePermissionStatus: jest.fn(),
    requestCameraPermission: jest.fn(),
    requestMicrophonePermission: jest.fn(),
  },
}));

// Mock React Native Linking at the module boundary
jest.mock('react-native', () => ({
  Linking: {
    openSettings: jest.fn(),
  },
}));

import { Camera } from 'react-native-vision-camera';
import { Linking } from 'react-native';

const mockCamera = Camera as jest.Mocked<typeof Camera>;
const mockLinking = Linking as jest.Mocked<typeof Linking>;

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    service = new PermissionService();
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('should return Granted when camera permission is granted', async () => {
      mockCamera.getCameraPermissionStatus.mockReturnValue('granted');

      const result = await service.checkPermission(Permission.Camera);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(PermissionStatus.Granted);
      }
    });

    it('should return Denied when microphone permission is denied', async () => {
      mockCamera.getMicrophonePermissionStatus.mockReturnValue('denied');

      const result = await service.checkPermission(Permission.Microphone);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(PermissionStatus.Denied);
      }
    });

    it('should return Granted for Storage without calling Camera API', async () => {
      const result = await service.checkPermission(Permission.Storage);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(PermissionStatus.Granted);
      }
      expect(mockCamera.getCameraPermissionStatus).not.toHaveBeenCalled();
    });

    it('should return failure when Camera API throws', async () => {
      mockCamera.getCameraPermissionStatus.mockImplementation(() => {
        throw new Error('Camera unavailable');
      });

      const result = await service.checkPermission(Permission.Camera);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('requestPermission', () => {
    it('should return Granted after requesting camera permission', async () => {
      mockCamera.requestCameraPermission.mockResolvedValue('granted');

      const result = await service.requestPermission(Permission.Camera);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(PermissionStatus.Granted);
      }
    });

    it('should return Denied after requesting microphone when user declines', async () => {
      mockCamera.requestMicrophonePermission.mockResolvedValue('denied');

      const result = await service.requestPermission(Permission.Microphone);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(PermissionStatus.Denied);
      }
    });

    it('should return Restricted for restricted camera', async () => {
      mockCamera.requestCameraPermission.mockResolvedValue('restricted');

      const result = await service.requestPermission(Permission.Camera);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(PermissionStatus.Restricted);
      }
    });
  });

  describe('requestPermissions', () => {
    it('should return statuses for all requested permissions', async () => {
      mockCamera.requestCameraPermission.mockResolvedValue('granted');
      mockCamera.requestMicrophonePermission.mockResolvedValue('granted');

      const result = await service.requestPermissions([Permission.Camera, Permission.Microphone]);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value[Permission.Camera]).toBe(PermissionStatus.Granted);
        expect(result.value[Permission.Microphone]).toBe(PermissionStatus.Granted);
      }
    });

    it('should return failure if any permission request fails', async () => {
      mockCamera.requestCameraPermission.mockRejectedValue(new Error('fail'));

      const result = await service.requestPermissions([Permission.Camera]);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('openSettings', () => {
    it('should open system settings successfully', async () => {
      mockLinking.openSettings.mockResolvedValue(undefined);

      const result = await service.openSettings();

      expect(result.isSuccess).toBe(true);
      expect(mockLinking.openSettings).toHaveBeenCalledTimes(1);
    });

    it('should return failure if openSettings throws', async () => {
      mockLinking.openSettings.mockRejectedValue(new Error('not supported'));

      const result = await service.openSettings();

      expect(result.isFailure).toBe(true);
    });
  });
});
