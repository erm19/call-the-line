/**
 * Session status enum
 */
export enum SessionStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
}

/**
 * Session Entity
 * Represents a tennis session/match recording
 */
export interface Session {
  /**
   * Unique identifier for the session
   */
  id: string;

  /**
   * Session name/title
   */
  name: string;

  /**
   * Session start timestamp (ISO 8601)
   */
  startedAt: string;

  /**
   * Session end timestamp (ISO 8601), null if active
   */
  endedAt: string | null;

  /**
   * Current session status
   */
  status: SessionStatus;

  /**
   * Array of clip IDs associated with this session
   */
  clipIds: string[];

  /**
   * Calibration ID for this session, if calibrated
   */
  calibrationId: string | null;

  /**
   * Optional notes about the session
   */
  notes?: string;

  /**
   * Court name or location
   */
  location?: string;

  /**
   * Created at timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last updated timestamp (ISO 8601)
   */
  updatedAt: string;
}
