import { injectable, inject } from 'tsyringe';
import { AppError } from '@core/errors/AppError';
import { Result } from '@core/utils/result';
import { DI_TOKENS } from '@core/di/container';
import { Session } from '../entities/Session';
import type { ISessionRepository } from '../repositories/SessionRepository';

export interface GetSessionsInput {
  limit?: number;
  offset?: number;
}

@injectable()
export class GetSessions {
  constructor(
    @inject(DI_TOKENS.SessionRepository) private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(input: GetSessionsInput = {}): Promise<Result<Session[], AppError>> {
    return this.sessionRepository.getAll(input);
  }
}
