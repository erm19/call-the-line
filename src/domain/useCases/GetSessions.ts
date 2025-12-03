import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { Session } from '../entities/Session';
import { SessionRepository } from '../repositories/SessionRepository';

/**
 * Input for GetSessions use case
 */
export interface GetSessionsInput {
  limit?: number;
  offset?: number;
}

/**
 * GetSessions Use Case
 * Retrieves all sessions with optional pagination
 */
export class GetSessions {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(input: GetSessionsInput = {}): Promise<Result<Session[], AppError>> {
    return this.sessionRepository.getAll(input);
  }
}

