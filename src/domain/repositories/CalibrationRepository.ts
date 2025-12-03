import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { CourtCalibration } from '../entities/CourtCalibration';

/**
 * Calibration Repository Interface
 * Defines contract for calibration data access
 */
export interface CalibrationRepository {
  /**
   * Creates a new calibration
   */
  create(
    calibration: Omit<CourtCalibration, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Result<CourtCalibration, AppError>>;

  /**
   * Gets a calibration by ID
   */
  getById(id: string): Promise<Result<CourtCalibration, AppError>>;

  /**
   * Gets calibration for a session
   */
  getBySessionId(sessionId: string): Promise<Result<CourtCalibration | null, AppError>>;

  /**
   * Updates a calibration
   */
  update(
    id: string,
    updates: Partial<CourtCalibration>,
  ): Promise<Result<CourtCalibration, AppError>>;

  /**
   * Deletes a calibration
   */
  delete(id: string): Promise<Result<void, AppError>>;
}

