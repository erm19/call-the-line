/**
 * Latency stage measurements
 */
export interface LatencyStage {
  name: string;
  durationMs: number;
  startTimestamp: number;
  endTimestamp: number;
}

/**
 * Latency Metrics Entity
 * Tracks performance metrics for NRT pipeline
 */
export interface LatencyMetrics {
  /**
   * Unique identifier for the metrics
   */
  id: string;

  /**
   * Session or clip ID these metrics belong to
   */
  entityId: string;

  /**
   * Type of entity (session, clip, decision)
   */
  entityType: 'session' | 'clip' | 'decision';

  /**
   * Total end-to-end latency in milliseconds
   */
  totalLatencyMs: number;

  /**
   * Individual stage measurements
   */
  stages: LatencyStage[];

  /**
   * Frame capture latency
   */
  captureLatencyMs: number;

  /**
   * Preprocessing latency
   */
  preprocessingLatencyMs: number;

  /**
   * AI inference latency
   */
  inferenceLatencyMs: number;

  /**
   * Render/display latency
   */
  renderLatencyMs: number;

  /**
   * Number of dropped frames
   */
  droppedFrames: number;

  /**
   * Average FPS during this measurement
   */
  averageFps: number;

  /**
   * Whether this measurement met the latency budget
   */
  metLatencyBudget: boolean;

  /**
   * Device information
   */
  deviceInfo: {
    model: string;
    os: string;
    osVersion: string;
  };

  /**
   * Created at timestamp (ISO 8601)
   */
  createdAt: string;
}

