import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { AIResult } from '../entities/AIResult';
import { PointDecision } from '../entities/PointDecision';

/**
 * AI Review Repository Interface
 * Defines contract for AI processing and decision data access
 */
export interface AIReviewRepository {
  /**
   * Submits a clip for AI processing
   */
  submitForProcessing(clipId: string): Promise<Result<AIResult, AppError>>;

  /**
   * Gets AI result by ID
   */
  getAIResult(id: string): Promise<Result<AIResult, AppError>>;

  /**
   * Gets AI result for a clip
   */
  getAIResultByClipId(clipId: string): Promise<Result<AIResult | null, AppError>>;

  /**
   * Creates a point decision
   */
  createDecision(
    decision: Omit<PointDecision, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Result<PointDecision, AppError>>;

  /**
   * Gets a decision by ID
   */
  getDecision(id: string): Promise<Result<PointDecision, AppError>>;

  /**
   * Gets decision for a clip
   */
  getDecisionByClipId(clipId: string): Promise<Result<PointDecision | null, AppError>>;

  /**
   * Updates a decision
   */
  updateDecision(
    id: string,
    updates: Partial<PointDecision>,
  ): Promise<Result<PointDecision, AppError>>;
}

