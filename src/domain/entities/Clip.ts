/**
 * Clip Entity
 * Represents a recorded video clip from a session
 */
export interface Clip {
  /**
   * Unique identifier for the clip
   */
  id: string;

  /**
   * Session ID this clip belongs to
   */
  sessionId: string;

  /**
   * Local file path to the video
   */
  videoPath: string;

  /**
   * Duration of the clip in seconds
   */
  duration: number;

  /**
   * Timestamp when the clip was recorded (ISO 8601)
   */
  recordedAt: string;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * Video resolution
   */
  resolution: {
    width: number;
    height: number;
  };

  /**
   * Frame rate (FPS)
   */
  fps: number;

  /**
   * Optional thumbnail path
   */
  thumbnailPath?: string;

  /**
   * AI result ID if processed
   */
  aiResultId?: string;

  /**
   * Point decision ID if a decision was made
   */
  pointDecisionId?: string;

  /**
   * Created at timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last updated timestamp (ISO 8601)
   */
  updatedAt: string;
}

