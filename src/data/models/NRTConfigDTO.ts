/**
 * NRT Config Data Transfer Object
 */
export interface NRTConfigDTO {
  id: string;
  enabled: boolean;
  mode: string;
  target_fps: number;
  actual_fps?: number;
  resolution: {
    width: number;
    height: number;
  };
  buffer_window_seconds: number;
  max_latency_ms: number;
  device_tier: string;
  auto_adjust_quality: boolean;
  min_confidence_threshold: number;
  camera_device: string;
  created_at: string;
  updated_at: string;
}

