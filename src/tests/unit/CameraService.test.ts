import { CameraService } from '@platform/camera/CameraService';
import { CameraStatus } from '@platform/camera/CameraConfig';
import type { CameraConfig } from '@platform/camera/CameraConfig';
import { CameraError } from '@core/errors/AppError';
import { failure } from '@core/utils/result';

const makeConfig = (overrides: Partial<CameraConfig> = {}): CameraConfig => ({
  device: 'back',
  resolution: { width: 1280, height: 720 },
  fps: 60,
  quality: 'high',
  codec: 'h264',
  enableAudio: false,
  maxDuration: 0,
  ...overrides,
});

describe('CameraService', () => {
  let service: CameraService;

  beforeEach(() => {
    service = new CameraService();
  });

  describe('initial state', () => {
    it('should start with Idle status', () => {
      expect(service.getStatus()).toBe(CameraStatus.Idle);
    });
  });

  describe('initialize', () => {
    it('should return success and set status to Ready', async () => {
      const result = await service.initialize(makeConfig());

      expect(result.isSuccess).toBe(true);
      expect(service.getStatus()).toBe(CameraStatus.Ready);
    });

    it('should accept different camera devices', async () => {
      const result = await service.initialize(makeConfig({ device: 'front' }));

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('getAvailableDevices', () => {
    it('should return a non-empty list of devices', async () => {
      const result = await service.getAvailableDevices();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('isDeviceAvailable', () => {
    it('should return true for a known device', async () => {
      const result = await service.isDeviceAvailable('back');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(true);
      }
    });

    it('should return true for a known front device', async () => {
      const result = await service.isDeviceAvailable('front');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(true);
      }
    });

    it('should return false for an unknown device type', async () => {
      const result = await service.isDeviceAvailable('unknown-device' as never);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBe(false);
      }
    });
  });

  describe('startRecording', () => {
    it('should return failure when camera is not initialized', async () => {
      const result = await service.startRecording();

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.message).toMatch(/not.*ready|not.*initialized|must.*initialize/i);
      }
    });

    it('should return success and set status to Recording when Ready', async () => {
      await service.initialize(makeConfig());
      const result = await service.startRecording();

      expect(result.isSuccess).toBe(true);
      expect(service.getStatus()).toBe(CameraStatus.Recording);
    });

    it('should return failure when already recording', async () => {
      await service.initialize(makeConfig());
      await service.startRecording();

      const result = await service.startRecording();

      expect(result.isFailure).toBe(true);
    });
  });

  describe('stopRecording', () => {
    it('should return failure when not recording', async () => {
      const result = await service.stopRecording();

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.message).toMatch(/not.*recording/i);
      }
    });

    it('should return failure when initialized but not recording', async () => {
      await service.initialize(makeConfig());

      const result = await service.stopRecording();

      expect(result.isFailure).toBe(true);
    });

    it('should return success with RecordingResult and set status back to Ready', async () => {
      await service.initialize(makeConfig());
      await service.startRecording();

      const result = await service.stopRecording();

      expect(result.isSuccess).toBe(true);
      expect(service.getStatus()).toBe(CameraStatus.Ready);
      if (result.isSuccess) {
        expect(result.value).toHaveProperty('videoPath');
        expect(result.value).toHaveProperty('duration');
        expect(result.value).toHaveProperty('fileSize');
        expect(result.value).toHaveProperty('resolution');
        expect(result.value).toHaveProperty('fps');
      }
    });

    it('should reflect configured resolution in the recording result', async () => {
      const config = makeConfig({ resolution: { width: 1920, height: 1080 }, fps: 30 });
      await service.initialize(config);
      await service.startRecording();

      const result = await service.stopRecording();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.resolution).toEqual({ width: 1920, height: 1080 });
        expect(result.value.fps).toBe(30);
      }
    });
  });

  describe('release', () => {
    it('should return success and set status to Idle from Ready state', async () => {
      await service.initialize(makeConfig());

      const result = await service.release();

      expect(result.isSuccess).toBe(true);
      expect(service.getStatus()).toBe(CameraStatus.Idle);
    });

    it('should return success from Idle state without error', async () => {
      const result = await service.release();

      expect(result.isSuccess).toBe(true);
      expect(service.getStatus()).toBe(CameraStatus.Idle);
    });

    it('should stop recording and set status to Idle when called while recording', async () => {
      await service.initialize(makeConfig());
      await service.startRecording();

      const result = await service.release();

      expect(result.isSuccess).toBe(true);
      expect(service.getStatus()).toBe(CameraStatus.Idle);
    });

    it('should propagate stopRecording failure during release', async () => {
      await service.initialize(makeConfig());
      await service.startRecording();

      jest
        .spyOn(service, 'stopRecording')
        .mockResolvedValueOnce(failure(new CameraError('Stop failed')));

      const result = await service.release();

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.message).toBe('Stop failed');
      }
    });
  });
});
