import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { Session } from '../entities/Session';

/**
 * Session Repository Interface
 * Defines contract for session data access
 */
export interface SessionRepository {
  /**
   * Creates a new session
   */
  create(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Session, AppError>>;

  /**
   * Gets a session by ID
   */
  getById(id: string): Promise<Result<Session, AppError>>;

  /**
   * Gets all sessions, optionally filtered
   */
  getAll(filters?: { limit?: number; offset?: number }): Promise<Result<Session[], AppError>>;

  /**
   * Updates a session
   */
  update(id: string, updates: Partial<Session>): Promise<Result<Session, AppError>>;

  /**
   * Deletes a session
   */
  delete(id: string): Promise<Result<void, AppError>>;

  /**
   * Gets active session if one exists
   */
  getActiveSession(): Promise<Result<Session | null, AppError>>;
}

