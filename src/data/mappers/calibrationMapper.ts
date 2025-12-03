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

