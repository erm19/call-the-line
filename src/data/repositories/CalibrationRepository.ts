import { Result, success, failure } from '@core/utils/result';
import { NotFoundError, StorageError } from '@core/errors/AppError';
import { CourtCalibration } from '@domain/entities/CourtCalibration';
import type { CalibrationRepository as ICalibrationRepository } from '@domain/repositories/CalibrationRepository';
import { CalibrationLocalDataSource } from '../datasources/local/CalibrationLocalDataSource';
import {
  calibrationFromDTO,
  calibrationToDTO,
  calibrationPartialToDTO,
} from '../mappers/calibrationMapper';
import { getCurrentISOString } from '@core/utils/date';

export class CalibrationRepository implements ICalibrationRepository {
  constructor(private readonly localDataSource: CalibrationLocalDataSource) {}

  async create(
    calibration: Omit<CourtCalibration, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Result<CourtCalibration, StorageError>> {
    try {
      const now = getCurrentISOString();
      const id = `calibration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const dto = calibrationToDTO({
        ...calibration,
        id,
        createdAt: now,
        updatedAt: now,
      });

      const created = await this.localDataSource.create(dto);
      return success(calibrationFromDTO(created));
    } catch {
      return failure(new StorageError('Failed to create calibration'));
    }
  }

  async getById(id: string): Promise<Result<CourtCalibration, StorageError>> {
    try {
      const dto = await this.localDataSource.getById(id);
      if (!dto) {
        return failure(new NotFoundError('Calibration not found', 'calibration'));
      }
      return success(calibrationFromDTO(dto));
    } catch {
      return failure(new StorageError('Failed to get calibration'));
    }
  }

  async getBySessionId(sessionId: string): Promise<Result<CourtCalibration | null, StorageError>> {
    try {
      const dto = await this.localDataSource.getBySessionId(sessionId);
      if (!dto) return success(null);
      return success(calibrationFromDTO(dto));
    } catch {
      return failure(new StorageError('Failed to get calibration for session'));
    }
  }

  async update(
    id: string,
    updates: Partial<CourtCalibration>,
  ): Promise<Result<CourtCalibration, StorageError>> {
    try {
      const partialDto = calibrationPartialToDTO(updates);
      const updated = await this.localDataSource.update(id, partialDto);
      if (!updated) {
        return failure(new NotFoundError('Calibration not found', 'calibration'));
      }
      return success(calibrationFromDTO(updated));
    } catch {
      return failure(new StorageError('Failed to update calibration'));
    }
  }

  async delete(id: string): Promise<Result<void, StorageError>> {
    try {
      const deleted = await this.localDataSource.delete(id);
      if (!deleted) {
        return failure(new NotFoundError('Calibration not found', 'calibration'));
      }
      return success(undefined);
    } catch {
      return failure(new StorageError('Failed to delete calibration'));
    }
  }
}
