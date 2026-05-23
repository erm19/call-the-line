/**
 * 2D Point in pixel coordinates
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Court line type
 */
export enum CourtLineType {
  Baseline = 'baseline',
  ServiceLine = 'service_line',
  Sideline = 'sideline',
  CenterServiceLine = 'center_service_line',
  CenterMark = 'center_mark',
}

/**
 * Court Calibration Entity
 * Stores camera calibration and court boundary information
 */
export interface CourtCalibration {
  /**
   * Unique identifier for the calibration
   */
  id: string;

  /**
   * Session ID this calibration belongs to
   */
  sessionId: string;

  /**
   * Four corner points of the tennis court in image coordinates
   * Order: [top-left, top-right, bottom-right, bottom-left]
   */
  cornerPoints: [Point2D, Point2D, Point2D, Point2D];

  /**
   * Court lines detected/marked
   */
  lines: {
    type: CourtLineType;
    points: Point2D[];
  }[];

  /**
   * Homography transformation matrix (3x3) for perspective correction
   * Flattened array of 9 values (row-major order)
   */
  transformationMatrix: number[];

  /**
   * Camera parameters
   */
  cameraParams: {
    focalLength?: number;
    principalPoint?: Point2D;
    distortion?: number[];
  };

  /**
   * Confidence score for calibration (0-1)
   */
  confidence: number;

  /**
   * Whether this calibration is valid and ready to use
   */
  isValid: boolean;

  /**
   * Created at timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last updated timestamp (ISO 8601)
   */
  updatedAt: string;
}
