/**
 * Point outcome
 */
export enum PointOutcome {
  In = 'in',
  Out = 'out',
  Uncertain = 'uncertain',
}

/**
 * Decision source
 */
export enum DecisionSource {
  NRT = 'nrt', // Near Real Time
  Offline = 'offline', // Post-processing
  Manual = 'manual', // User override
}

/**
 * Point Decision Entity
 * Represents a line call decision for a ball bounce
 */
export interface PointDecision {
  /**
   * Unique identifier for the decision
   */
  id: string;

  /**
   * Clip ID this decision is for
   */
  clipId: string;

  /**
   * The decision outcome
   */
  outcome: PointOutcome;

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Ball impact point in image coordinates
   */
  impactPoint: {
    x: number;
    y: number;
  };

  /**
   * Distance from nearest line (positive = outside, negative = inside)
   * in real-world units (e.g., centimeters)
   */
  distanceFromLine?: number;

  /**
   * Frame number where the bounce occurred
   */
  frameNumber: number;

  /**
   * Timestamp within the clip (seconds)
   */
  timestampInClip: number;

  /**
   * Source of the decision
   */
  source: DecisionSource;

  /**
   * Processing time in milliseconds
   */
  processingTimeMs: number;

  /**
   * Created at timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last updated timestamp (ISO 8601)
   */
  updatedAt: string;
}
