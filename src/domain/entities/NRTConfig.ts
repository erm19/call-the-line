/**
 * Device tier for performance tuning
 */
export enum DeviceTier {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

/**
 * NRT processing mode
 */
export enum NRTMode {
  OnDevice = 'on_device', // Local inference
  Edge = 'edge', // Edge server
  Cloud = 'cloud', // Cloud inference
  Disabled = 'disabled', // NRT disabled
}

/**
 * NRT Config Entity
 * Configuration for Near Real Time processing
 */
export interface NRTConfig {
  /**
   * Unique identifier for the config
   */
  id: string;

  /**
   * Whether NRT is enabled
   */
  enabled: boolean;

  /**
   * NRT processing mode
   */
  mode: NRTMode;

  /**
   * Target frame rate for capture
   */
  targetFps: number;

  /**
   * Actual achieved FPS (may differ from target)
   */
  actualFps?: number;

  /**
   * Video resolution
   */
  resolution: {
    width: number;
    height: number;
  };

  /**
   * Buffer window size in seconds
   */
  bufferWindowSeconds: number;

  /**
   * Maximum acceptable latency in milliseconds
   */
  maxLatencyMs: number;

  /**
   * Device performance tier
   */
  deviceTier: DeviceTier;

  /**
   * Auto-adjust quality based on performance
   */
  autoAdjustQuality: boolean;

  /**
   * Minimum confidence threshold for NRT decisions (0-1)
   */
  minConfidenceThreshold: number;

  /**
   * Camera device to use
   */
  cameraDevice: 'ultra-wide-angle-camera' | 'wide-angle-camera' | 'back';

  /**
   * Created at timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last updated timestamp (ISO 8601)
   */
  updatedAt: string;
}

