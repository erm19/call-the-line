import { CourtCalibration, CourtLineType, Point2D } from '@domain/entities/CourtCalibration';
import { CalibrationDTO } from '../models/CalibrationDTO';

/**
 * Maps Calibration DTO to Domain Entity
 */
export const calibrationFromDTO = (dto: CalibrationDTO): CourtCalibration => {
  return {
    id: dto.id,
    sessionId: dto.session_id,
    cornerPoints: dto.corner_points as [Point2D, Point2D, Point2D, Point2D],
    lines: dto.lines.map(line => ({
      type: line.type as CourtLineType,
      points: line.points,
    })),
    transformationMatrix: dto.transformation_matrix,
    cameraParams: dto.camera_params,
    confidence: dto.confidence,
    isValid: dto.is_valid,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Maps Calibration Domain Entity to DTO
 */
export const calibrationToDTO = (calibration: CourtCalibration): CalibrationDTO => {
  return {
    id: calibration.id,
    session_id: calibration.sessionId,
    corner_points: Array.from(calibration.cornerPoints),
    lines: calibration.lines.map(line => ({
      type: line.type,
      points: line.points,
    })),
    transformation_matrix: calibration.transformationMatrix,
    camera_params: calibration.cameraParams,
    confidence: calibration.confidence,
    is_valid: calibration.isValid,
    created_at: calibration.createdAt,
    updated_at: calibration.updatedAt,
  };
};

/**
 * Maps a partial Calibration Domain Entity to a partial DTO for updates.
 */
export const calibrationPartialToDTO = (
  partial: Partial<CourtCalibration>,
): Partial<CalibrationDTO> => {
  const dto: Partial<CalibrationDTO> = {};
  if (partial.id !== undefined) dto.id = partial.id;
  if (partial.sessionId !== undefined) dto.session_id = partial.sessionId;
  if (partial.cornerPoints !== undefined) dto.corner_points = Array.from(partial.cornerPoints);
  if (partial.lines !== undefined)
    dto.lines = partial.lines.map(l => ({ type: l.type, points: l.points }));
  if (partial.transformationMatrix !== undefined)
    dto.transformation_matrix = partial.transformationMatrix;
  if (partial.cameraParams !== undefined) dto.camera_params = partial.cameraParams;
  if (partial.confidence !== undefined) dto.confidence = partial.confidence;
  if (partial.isValid !== undefined) dto.is_valid = partial.isValid;
  if (partial.createdAt !== undefined) dto.created_at = partial.createdAt;
  if (partial.updatedAt !== undefined) dto.updated_at = partial.updatedAt;
  return dto;
};
