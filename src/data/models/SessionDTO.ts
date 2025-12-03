/**
 * Session Data Transfer Object
 * Represents session data as stored/transmitted
 */
export interface SessionDTO {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  clip_ids: string[];
  calibration_id: string | null;
  notes?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

