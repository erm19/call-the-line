import { Result, success, failure } from '@core/utils/result';
import { NotFoundError, StorageError } from '@core/errors/AppError';
import { Session, SessionStatus } from '@domain/entities/Session';
import { ISessionRepository } from '@domain/repositories/SessionRepository';
import { SessionLocalDataSource } from '../datasources/local/SessionLocalDataSource';
import { sessionFromDTO, sessionToDTO } from '../mappers/sessionMapper';
import { getCurrentISOString } from '@core/utils/date';

/**
 * Session Repository Implementation
 */
export class SessionRepository implements ISessionRepository {
  constructor(private readonly localDataSource: SessionLocalDataSource) {}

  async create(
    session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Result<Session, StorageError>> {
    try {
      const now = getCurrentISOString();
      const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const dto = sessionToDTO({
        ...session,
        id,
        createdAt: now,
        updatedAt: now,
      });

      const created = await this.localDataSource.create(dto);
      return success(sessionFromDTO(created));
    } catch (error) {
      return failure(new StorageError('Failed to create session'));
    }
  }

  async getById(id: string): Promise<Result<Session, StorageError>> {
    try {
      const dto = await this.localDataSource.getById(id);
      if (!dto) {
        return failure(new NotFoundError('Session not found', 'session'));
      }
      return success(sessionFromDTO(dto));
    } catch (error) {
      return failure(new StorageError('Failed to get session'));
    }
  }

  async getAll(
    filters?: { limit?: number; offset?: number },
  ): Promise<Result<Session[], StorageError>> {
    try {
      let dtos = await this.localDataSource.getAll();
      
      // Sort by created_at descending
      dtos = dtos.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Apply pagination
      if (filters?.offset) {
        dtos = dtos.slice(filters.offset);
      }
      if (filters?.limit) {
        dtos = dtos.slice(0, filters.limit);
      }

      return success(dtos.map(sessionFromDTO));
    } catch (error) {
      return failure(new StorageError('Failed to get sessions'));
    }
  }

  async update(id: string, updates: Partial<Session>): Promise<Result<Session, StorageError>> {
    try {
      const updated = await this.localDataSource.update(id, sessionToDTO(updates as Session));
      if (!updated) {
        return failure(new NotFoundError('Session not found', 'session'));
      }
      return success(sessionFromDTO(updated));
    } catch (error) {
      return failure(new StorageError('Failed to update session'));
    }
  }

  async delete(id: string): Promise<Result<void, StorageError>> {
    try {
      const deleted = await this.localDataSource.delete(id);
      if (!deleted) {
        return failure(new NotFoundError('Session not found', 'session'));
      }
      return success(undefined);
    } catch (error) {
      return failure(new StorageError('Failed to delete session'));
    }
  }

  async getActiveSession(): Promise<Result<Session | null, StorageError>> {
    try {
      const all = await this.localDataSource.getAll();
      const active = all.find(s => s.status === SessionStatus.Active);
      return success(active ? sessionFromDTO(active) : null);
    } catch (error) {
      return failure(new StorageError('Failed to get active session'));
    }
  }
}

