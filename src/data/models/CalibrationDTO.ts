/**
 * Calibration Data Transfer Object
 */
export interface CalibrationDTO {
  id: string;
  session_id: string;
  corner_points: Array<{ x: number; y: number }>;
  lines: Array<{
    type: string;
    points: Array<{ x: number; y: number }>;
  }>;
  transformation_matrix: number[];
  camera_params: {
    focal_length?: number;
    principal_point?: { x: number; y: number };
    distortion?: number[];
  };
  confidence: number;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

