import { Result, success, failure } from '@core/utils/result';
import { NotFoundError, StorageError } from '@core/errors/AppError';
import { Clip } from '@domain/entities/Clip';
import { IClipRepository } from '@domain/repositories/ClipRepository';
import type { IClipStorageService } from '@domain/services/IClipStorageService';
import { ClipLocalDataSource } from '../datasources/local/ClipLocalDataSource';
import { clipFromDTO, clipToDTO } from '../mappers/clipMapper';
import { getCurrentISOString } from '@core/utils/date';

/**
 * Clip Repository Implementation
 */
export class ClipRepository implements IClipRepository {
  constructor(
    private readonly localDataSource: ClipLocalDataSource,
    private readonly clipStorageService: IClipStorageService,
  ) {}

  async create(
    clip: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Result<Clip, StorageError>> {
    try {
      const now = getCurrentISOString();
      const id = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const dto = clipToDTO({
        ...clip,
        id,
        createdAt: now,
        updatedAt: now,
      });

      const created = await this.localDataSource.create(dto);
      return success(clipFromDTO(created));
    } catch (error) {
      return failure(new StorageError('Failed to create clip'));
    }
  }

  async getById(id: string): Promise<Result<Clip, StorageError>> {
    try {
      const dto = await this.localDataSource.getById(id);
      if (!dto) {
        return failure(new NotFoundError('Clip not found', 'clip'));
      }
      return success(clipFromDTO(dto));
    } catch (error) {
      return failure(new StorageError('Failed to get clip'));
    }
  }

  async getBySessionId(sessionId: string): Promise<Result<Clip[], StorageError>> {
    try {
      const dtos = await this.localDataSource.getBySessionId(sessionId);
      return success(dtos.map(clipFromDTO));
    } catch (error) {
      return failure(new StorageError('Failed to get clips'));
    }
  }

  async update(id: string, updates: Partial<Clip>): Promise<Result<Clip, StorageError>> {
    try {
      const updated = await this.localDataSource.update(id, clipToDTO(updates as Clip));
      if (!updated) {
        return failure(new NotFoundError('Clip not found', 'clip'));
      }
      return success(clipFromDTO(updated));
    } catch (error) {
      return failure(new StorageError('Failed to update clip'));
    }
  }

  async delete(id: string): Promise<Result<void, StorageError>> {
    try {
      const dto = await this.localDataSource.getById(id);
      if (!dto) {
        return failure(new NotFoundError('Clip not found', 'clip'));
      }

      const deleted = await this.localDataSource.delete(id);
      if (!deleted) {
        return failure(new NotFoundError('Clip not found', 'clip'));
      }

      // Best-effort file deletion after DB delete — swallow errors so the DB result is authoritative
      await this.clipStorageService.deleteClip(dto.video_path).catch(() => undefined);

      return success(undefined);
    } catch (error) {
      return failure(new StorageError('Failed to delete clip'));
    }
  }

  async deleteBySessionId(sessionId: string): Promise<Result<void, StorageError>> {
    try {
      const dtos = await this.localDataSource.getBySessionId(sessionId);

      await this.localDataSource.deleteBySessionId(sessionId);

      // Best-effort file deletion after DB delete
      await Promise.all(
        dtos.map(dto => this.clipStorageService.deleteClip(dto.video_path).catch(() => undefined)),
      );

      return success(undefined);
    } catch (error) {
      return failure(new StorageError('Failed to delete clips'));
    }
  }
}
