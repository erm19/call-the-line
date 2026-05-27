import { Result, success, failure } from '@core/utils/result';
import { CameraError } from '@core/errors/AppError';
import { CameraConfig, CameraStatus, RecordingResult, CameraDevice } from './CameraConfig';

export interface ICameraService {
  initialize(config: CameraConfig): Promise<Result<void, CameraError>>;
  getAvailableDevices(): Promise<Result<CameraDevice[], CameraError>>;
  isDeviceAvailable(device: CameraDevice): Promise<Result<boolean, CameraError>>;
  startRecording(): Promise<Result<void, CameraError>>;
  stopRecording(): Promise<Result<RecordingResult, CameraError>>;
  getStatus(): CameraStatus;
  release(): Promise<Result<void, CameraError>>;
}

export class CameraService implements ICameraService {
  private status: CameraStatus = CameraStatus.Idle;
  private config: CameraConfig | null = null;

  async initialize(config: CameraConfig): Promise<Result<void, CameraError>> {
    this.config = config;
    this.status = CameraStatus.Initializing;
    // TODO: Initialize actual camera with react-native-vision-camera
    this.status = CameraStatus.Ready;
    return success(undefined);
  }

  async getAvailableDevices(): Promise<Result<CameraDevice[], CameraError>> {
    // TODO: Query actual devices via react-native-vision-camera
    const devices: CameraDevice[] = [
      'back',
      'front',
      'wide-angle-camera',
      'ultra-wide-angle-camera',
    ];
    return success(devices);
  }

  async isDeviceAvailable(device: CameraDevice): Promise<Result<boolean, CameraError>> {
    const devicesResult = await this.getAvailableDevices();
    if (devicesResult.isFailure) {
      return failure(devicesResult.error);
    }
    return success(devicesResult.value.includes(device));
  }

  async startRecording(): Promise<Result<void, CameraError>> {
    if (this.status !== CameraStatus.Ready) {
      return failure(new CameraError('Camera must be initialized and ready before recording'));
    }
    this.status = CameraStatus.Recording;
    // TODO: Start actual recording via react-native-vision-camera
    return success(undefined);
  }

  async stopRecording(): Promise<Result<RecordingResult, CameraError>> {
    if (this.status !== CameraStatus.Recording) {
      return failure(new CameraError('Camera is not recording'));
    }
    this.status = CameraStatus.Ready;
    // TODO: Stop actual recording and return real file metadata
    const recordingResult: RecordingResult = {
      videoPath: '/path/to/video.mp4',
      duration: 0,
      fileSize: 0,
      resolution: this.config?.resolution ?? { width: 1280, height: 720 },
      fps: this.config?.fps ?? 60,
    };
    return success(recordingResult);
  }

  getStatus(): CameraStatus {
    return this.status;
  }

  async release(): Promise<Result<void, CameraError>> {
    if (this.status === CameraStatus.Recording) {
      await this.stopRecording();
    }
    this.status = CameraStatus.Idle;
    this.config = null;
    // TODO: Release actual camera resources
    return success(undefined);
  }
}
