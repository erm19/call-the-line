import { PointOutcome } from './PointDecision';

/**
 * AI processing status
 */
export enum AIProcessingStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

/**
 * Ball trajectory point
 */
export interface TrajectoryPoint {
  x: number;
  y: number;
  z?: number; // Optional 3D coordinate
  timestamp: number; // Frame timestamp
  confidence: number;
}

/**
 * AI Result Entity
 * Represents the complete AI analysis result for a clip
 */
export interface AIResult {
  /**
   * Unique identifier for the AI result
   */
  id: string;

  /**
   * Clip ID this result is for
   */
  clipId: string;

  /**
   * Processing status
   */
  status: AIProcessingStatus;

  /**
   * Primary decision outcome
   */
  outcome: PointOutcome;

  /**
   * Overall confidence score (0-1)
   */
  confidence: number;

  /**
   * Ball trajectory points throughout the clip
   */
  trajectory: TrajectoryPoint[];

  /**
   * Detected bounce points
   */
  bounces: {
    frameNumber: number;
    point: { x: number; y: number };
    confidence: number;
  }[];

  /**
   * Primary bounce (the one used for decision)
   */
  primaryBounceIndex: number;

  /**
   * AI model version used
   */
  modelVersion: string;

  /**
   * Processing time in milliseconds
   */
  processingTimeMs: number;

  /**
   * Raw inference output (for debugging/analysis)
   */
  rawOutput?: Record<string, unknown>;

  /**
   * Error message if processing failed
   */
  error?: string;

  /**
   * Created at timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last updated timestamp (ISO 8601)
   */
  updatedAt: string;
}

