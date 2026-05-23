import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { AIResult } from '../entities/AIResult';
import { AIReviewRepository } from '../repositories/AIReviewRepository';
import { IClipRepository } from '../repositories/ClipRepository';
import { failure } from '@core/utils/result';

/**
 * SubmitClipForAI Use Case
 * Submits a clip for offline AI processing
 */
export class SubmitClipForAI {
  constructor(
    private readonly aiReviewRepository: AIReviewRepository,
    private readonly clipRepository: IClipRepository,
  ) {}

  async execute(clipId: string): Promise<Result<AIResult, AppError>> {
    // Verify clip exists
    const clipResult = await this.clipRepository.getById(clipId);
    if (clipResult.isFailure) {
      return failure(clipResult.error);
    }

    return this.aiReviewRepository.submitForProcessing(clipId);
  }
}
