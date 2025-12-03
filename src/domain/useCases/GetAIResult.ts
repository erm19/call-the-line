import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { AIResult } from '../entities/AIResult';
import { AIReviewRepository } from '../repositories/AIReviewRepository';

/**
 * GetAIResult Use Case
 * Retrieves AI processing result for a clip
 */
export class GetAIResult {
  constructor(private readonly aiReviewRepository: AIReviewRepository) {}

  async execute(clipId: string): Promise<Result<AIResult | null, AppError>> {
    return this.aiReviewRepository.getAIResultByClipId(clipId);
  }
}

