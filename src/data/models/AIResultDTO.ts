/**
 * AI Result Data Transfer Object
 */
export interface AIResultDTO {
  id: string;
  clip_id: string;
  status: string;
  outcome: string;
  confidence: number;
  trajectory: Array<{
    x: number;
    y: number;
    z?: number;
    timestamp: number;
    confidence: number;
  }>;
  bounces: Array<{
    frame_number: number;
    point: { x: number; y: number };
    confidence: number;
  }>;
  primary_bounce_index: number;
  model_version: string;
  processing_time_ms: number;
  raw_output?: Record<string, unknown>;
  error?: string;
  created_at: string;
  updated_at: string;
}

