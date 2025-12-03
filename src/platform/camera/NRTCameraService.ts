import { Result } from '@core/utils/result';
import { CameraError } from '@core/errors/AppError';
import { CameraConfig, FrameData, CameraDevice } from './CameraConfig';

/**
 * Frame processor callback
 */
export type FrameProcessor = (frame: FrameData) => void | Promise<void>;

/**
 * NRT Camera Service Interface
 * Specialized camera service for high-FPS frame streaming and NRT processing
 */
export interface INRTCameraService {
  /**
   * Initializes NRT camera with configuration
   * Prefers ultra-wide angle camera for full court capture
   */
  initialize(config: CameraConfig): Promise<Result<void, CameraError>>;

  /**
   * Starts frame streaming for NRT processing
   */
  startFrameStream(processor: FrameProcessor): Promise<Result<void, CameraError>>;

  /**
   * Stops frame streaming
   */
  stopFrameStream(): Promise<Result<void, CameraError>>;

  /**
   * Gets the current frame buffer (last N frames)
   */
  getFrameBuffer(windowSeconds: number): Promise<Result<FrameData[], CameraError>>;

  /**
   * Gets current FPS performance
   */
  getCurrentFPS(): number;

  /**
   * Adjusts quality dynamically based on performance
   */
  adjustQuality(targetFps: number): Promise<Result<void, CameraError>>;

  /**
   * Releases resources
   */
  release(): Promise<Result<void, CameraError>>;
}

/**
 * NRT Camera Service Implementation Stub
 * TODO: Implement with react-native-vision-camera frame processor
 */
export class NRTCameraService implements INRTCameraService {
  private config: CameraConfig | null = null;
  private _frameProcessor: FrameProcessor | null = null;
  private frameBuffer: FrameData[] = [];
  private currentFps: number = 0;
  private _isStreaming: boolean = false;

  async initialize(config: CameraConfig): Promise<Result<void, CameraError>> {
    // Prefer ultra-wide camera for full court capture
    const preferredDevice: CameraDevice = config.device || 'ultra-wide-angle-camera';
    
    this.config = {
      ...config,
      device: preferredDevice,
    };

    // TODO: Initialize actual camera with VisionCamera
    // const device = await Camera.getDevice({
    //   position: 'back',
    //   physicalDevices: ['ultra-wide-angle-camera', 'wide-angle-camera']
    // });
    
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, CameraError>;
  }

  async startFrameStream(processor: FrameProcessor): Promise<Result<void, CameraError>> {
    this._frameProcessor = processor;
    this._isStreaming = true;

    // TODO: Set up actual frame processor with VisionCamera
    // const frameProcessor = useFrameProcessor((frame) => {
    //   'worklet'
    //   const frameData = extractFrameData(frame);
    //   runOnJS(this.frameProcessor)(frameData);
    // }, []);

    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, CameraError>;
  }

  async stopFrameStream(): Promise<Result<void, CameraError>> {
    this._isStreaming = false;
    this._frameProcessor = null;
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, CameraError>;
  }

  async getFrameBuffer(windowSeconds: number): Promise<Result<FrameData[], CameraError>> {
    const fps = this.config?.fps || 60;
    const bufferSize = Math.floor(windowSeconds * fps);
    const buffer = this.frameBuffer.slice(-bufferSize);
    return { isSuccess: true, isFailure: false, value: buffer } as Result<FrameData[], CameraError>;
  }

  getCurrentFPS(): number {
    return this.currentFps;
  }

  async adjustQuality(targetFps: number): Promise<Result<void, CameraError>> {
    if (!this.config) {
      return {
        isSuccess: false,
        isFailure: true,
        error: new CameraError('Camera not initialized'),
      } as Result<void, CameraError>;
    }

    // Adjust resolution if FPS drops below target
    if (this.currentFps < targetFps * 0.8) {
      // Reduce resolution
      const newWidth = Math.floor(this.config.resolution.width * 0.8);
      const newHeight = Math.floor(this.config.resolution.height * 0.8);
      
      this.config.resolution = {
        width: newWidth,
        height: newHeight,
      };

      // TODO: Apply new configuration to camera
    }

    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, CameraError>;
  }

  async release(): Promise<Result<void, CameraError>> {
    await this.stopFrameStream();
    this.frameBuffer = [];
    this.config = null;
    this.currentFps = 0;
    return { isSuccess: true, isFailure: false, value: undefined } as Result<void, CameraError>;
  }
}

