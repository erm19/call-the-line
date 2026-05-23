import { AIResult, AIProcessingStatus } from '@domain/entities/AIResult';
import { PointOutcome } from '@domain/entities/PointDecision';
import { AIResultDTO } from '../models/AIResultDTO';

/**
 * Maps AI Result DTO to Domain Entity
 */
export const aiResultFromDTO = (dto: AIResultDTO): AIResult => {
  return {
    id: dto.id,
    clipId: dto.clip_id,
    status: dto.status as AIProcessingStatus,
    outcome: dto.outcome as PointOutcome,
    confidence: dto.confidence,
    trajectory: dto.trajectory,
    bounces: dto.bounces.map(bounce => ({
      frameNumber: bounce.frame_number,
      point: bounce.point,
      confidence: bounce.confidence,
    })),
    primaryBounceIndex: dto.primary_bounce_index,
    modelVersion: dto.model_version,
    processingTimeMs: dto.processing_time_ms,
    rawOutput: dto.raw_output,
    error: dto.error,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Maps AI Result Domain Entity to DTO
 */
export const aiResultToDTO = (aiResult: AIResult): AIResultDTO => {
  return {
    id: aiResult.id,
    clip_id: aiResult.clipId,
    status: aiResult.status,
    outcome: aiResult.outcome,
    confidence: aiResult.confidence,
    trajectory: aiResult.trajectory,
    bounces: aiResult.bounces.map(bounce => ({
      frame_number: bounce.frameNumber,
      point: bounce.point,
      confidence: bounce.confidence,
    })),
    primary_bounce_index: aiResult.primaryBounceIndex,
    model_version: aiResult.modelVersion,
    processing_time_ms: aiResult.processingTimeMs,
    raw_output: aiResult.rawOutput,
    error: aiResult.error,
    created_at: aiResult.createdAt,
    updated_at: aiResult.updatedAt,
  };
};
