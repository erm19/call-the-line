/**
 * Clip Data Transfer Object
 */
export interface ClipDTO {
  id: string;
  session_id: string;
  video_path: string;
  duration: number;
  recorded_at: string;
  file_size: number;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  thumbnail_path?: string;
  ai_result_id?: string;
  point_decision_id?: string;
  created_at: string;
  updated_at: string;
}
