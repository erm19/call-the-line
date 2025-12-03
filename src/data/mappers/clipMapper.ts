import { Clip } from '@domain/entities/Clip';
import { ClipDTO } from '../models/ClipDTO';

/**
 * Maps Clip DTO to Domain Entity
 */
export const clipFromDTO = (dto: ClipDTO): Clip => {
  return {
    id: dto.id,
    sessionId: dto.session_id,
    videoPath: dto.video_path,
    duration: dto.duration,
    recordedAt: dto.recorded_at,
    fileSize: dto.file_size,
    resolution: dto.resolution,
    fps: dto.fps,
    thumbnailPath: dto.thumbnail_path,
    aiResultId: dto.ai_result_id,
    pointDecisionId: dto.point_decision_id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Maps Clip Domain Entity to DTO
 */
export const clipToDTO = (clip: Clip): ClipDTO => {
  return {
    id: clip.id,
    session_id: clip.sessionId,
    video_path: clip.videoPath,
    duration: clip.duration,
    recorded_at: clip.recordedAt,
    file_size: clip.fileSize,
    resolution: clip.resolution,
    fps: clip.fps,
    thumbnail_path: clip.thumbnailPath,
    ai_result_id: clip.aiResultId,
    point_decision_id: clip.pointDecisionId,
    created_at: clip.createdAt,
    updated_at: clip.updatedAt,
  };
};

