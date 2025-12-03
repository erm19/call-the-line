import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { Clip } from '../entities/Clip';

/**
 * Clip Repository Interface
 * Defines contract for clip data access
 */
export interface ClipRepository {
  /**
   * Creates a new clip
   */
  create(clip: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Clip, AppError>>;

  /**
   * Gets a clip by ID
   */
  getById(id: string): Promise<Result<Clip, AppError>>;

  /**
   * Gets all clips for a session
   */
  getBySessionId(sessionId: string): Promise<Result<Clip[], AppError>>;

  /**
   * Updates a clip
   */
  update(id: string, updates: Partial<Clip>): Promise<Result<Clip, AppError>>;

  /**
   * Deletes a clip
   */
  delete(id: string): Promise<Result<void, AppError>>;

  /**
   * Deletes all clips for a session
   */
  deleteBySessionId(sessionId: string): Promise<Result<void, AppError>>;
}

