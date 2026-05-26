import { NRTConfig, NRTMode, DeviceTier } from '@domain/entities/NRTConfig';
import { NRTConfigDTO } from '../models/NRTConfigDTO';

/**
 * Maps NRT Config DTO to Domain Entity
 */
export const nrtConfigFromDTO = (dto: NRTConfigDTO): NRTConfig => {
  return {
    id: dto.id,
    sessionId: dto.session_id,
    enabled: dto.enabled,
    mode: dto.mode as NRTMode,
    targetFps: dto.target_fps,
    actualFps: dto.actual_fps,
    resolution: dto.resolution,
    bufferWindowSeconds: dto.buffer_window_seconds,
    maxLatencyMs: dto.max_latency_ms,
    deviceTier: dto.device_tier as DeviceTier,
    autoAdjustQuality: dto.auto_adjust_quality,
    minConfidenceThreshold: dto.min_confidence_threshold,
    cameraDevice: dto.camera_device as 'ultra-wide-angle-camera' | 'wide-angle-camera' | 'back',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Maps NRT Config Domain Entity to DTO
 */
export const nrtConfigToDTO = (config: NRTConfig): NRTConfigDTO => {
  return {
    id: config.id,
    session_id: config.sessionId,
    enabled: config.enabled,
    mode: config.mode,
    target_fps: config.targetFps,
    actual_fps: config.actualFps,
    resolution: config.resolution,
    buffer_window_seconds: config.bufferWindowSeconds,
    max_latency_ms: config.maxLatencyMs,
    device_tier: config.deviceTier,
    auto_adjust_quality: config.autoAdjustQuality,
    min_confidence_threshold: config.minConfidenceThreshold,
    camera_device: config.cameraDevice,
    created_at: config.createdAt,
    updated_at: config.updatedAt,
  };
};
