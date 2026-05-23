/**
 * Application-wide constants
 */

/**
 * NRT (Near Real Time) Configuration Constants
 */
export const NRT_CONSTANTS = {
  /**
   * Target FPS for camera capture (ideally 60fps for fast ball tracking)
   */
  TARGET_FPS: 60,

  /**
   * Fallback FPS if device cannot support target
   */
  FALLBACK_FPS: 30,

  /**
   * Preferred camera resolution (720p for balance of detail and performance)
   */
  TARGET_RESOLUTION: {
    width: 1280,
    height: 720,
  },

  /**
   * Maximum acceptable end-to-end latency for NRT decision (milliseconds)
   */
  MAX_NRT_LATENCY_MS: 500,

  /**
   * Size of rolling buffer for NRT processing (seconds)
   */
  BUFFER_WINDOW_SECONDS: 3,

  /**
   * Latency budget breakdown (milliseconds)
   */
  LATENCY_BUDGET: {
    capture: 50,
    preprocessing: 100,
    inference: 250,
    render: 100,
  },
} as const;

/**
 * Camera Configuration Constants
 */
export const CAMERA_CONSTANTS = {
  /**
   * Preferred camera device type for full court capture
   */
  PREFERRED_DEVICE: 'ultra-wide-angle-camera' as const,

  /**
   * Fallback device types in order of preference
   */
  FALLBACK_DEVICES: ['wide-angle-camera', 'back'] as const,

  /**
   * Video codec preferences
   */
  CODEC: 'h264' as const,

  /**
   * Video quality setting
   */
  QUALITY: 'high' as const,
} as const;

/**
 * Storage Constants
 */
export const STORAGE_CONSTANTS = {
  /**
   * Maximum number of sessions to keep locally
   */
  MAX_LOCAL_SESSIONS: 50,

  /**
   * Maximum age of clips before cleanup (days)
   */
  MAX_CLIP_AGE_DAYS: 30,

  /**
   * Maximum storage size for clips (bytes) - 2GB
   */
  MAX_STORAGE_SIZE_BYTES: 2 * 1024 * 1024 * 1024,
} as const;

/**
 * API Constants
 */
export const API_CONSTANTS = {
  /**
   * Request timeout (milliseconds)
   */
  TIMEOUT_MS: 30000,

  /**
   * Maximum retry attempts
   */
  MAX_RETRIES: 3,

  /**
   * Base delay for exponential backoff (milliseconds)
   */
  RETRY_BASE_DELAY_MS: 1000,
} as const;

/**
 * Session Constants
 */
export const SESSION_CONSTANTS = {
  /**
   * Default session name
   */
  DEFAULT_NAME: 'Tennis Session',

  /**
   * Auto-save interval (milliseconds)
   */
  AUTO_SAVE_INTERVAL_MS: 30000,
} as const;

/**
 * Analytics Constants
 */
export const ANALYTICS_CONSTANTS = {
  /**
   * Events to track
   */
  EVENTS: {
    SESSION_STARTED: 'session_started',
    SESSION_ENDED: 'session_ended',
    CLIP_RECORDED: 'clip_recorded',
    NRT_DECISION_MADE: 'nrt_decision_made',
    CALIBRATION_COMPLETED: 'calibration_completed',
    PERMISSION_REQUESTED: 'permission_requested',
    PERMISSION_DENIED: 'permission_denied',
    ERROR_OCCURRED: 'error_occurred',
  },
} as const;
