/**
 * Camera device types
 */
export type CameraDevice = 'ultra-wide-angle-camera' | 'wide-angle-camera' | 'back' | 'front';

/**
 * Video quality presets
 */
export type VideoQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Video codec options
 */
export type VideoCodec = 'h264' | 'h265';

/**
 * Camera configuration for video recording
 */
export interface CameraConfig {
  /**
   * Preferred camera device
   */
  device: CameraDevice;

  /**
   * Video resolution
   */
  resolution: {
    width: number;
    height: number;
  };

  /**
   * Target frames per second
   */
  fps: number;

  /**
   * Video quality preset
   */
  quality: VideoQuality;

  /**
   * Video codec
   */
  codec: VideoCodec;

  /**
   * Enable audio recording
   */
  enableAudio: boolean;

  /**
   * Maximum recording duration in seconds (0 = unlimited)
   */
  maxDuration: number;
}

/**
 * Frame data for NRT processing
 */
export interface FrameData {
  /**
   * Frame pixel data buffer
   */
  buffer: ArrayBuffer;

  /**
   * Frame width in pixels
   */
  width: number;

  /**
   * Frame height in pixels
   */
  height: number;

  /**
   * Frame timestamp in milliseconds
   */
  timestamp: number;

  /**
   * Frame number in sequence
   */
  frameNumber: number;

  /**
   * Pixel format
   */
  format: 'rgba' | 'rgb' | 'yuv';
}

/**
 * Camera status
 */
export enum CameraStatus {
  Idle = 'idle',
  Initializing = 'initializing',
  Ready = 'ready',
  Recording = 'recording',
  Error = 'error',
}

/**
 * Recording result
 */
export interface RecordingResult {
  /**
   * Path to recorded video file
   */
  videoPath: string;

  /**
   * Path to thumbnail image
   */
  thumbnailPath?: string;

  /**
   * Recording duration in seconds
   */
  duration: number;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * Actual recorded resolution
   */
  resolution: {
    width: number;
    height: number;
  };

  /**
   * Actual recorded FPS
   */
  fps: number;
}

