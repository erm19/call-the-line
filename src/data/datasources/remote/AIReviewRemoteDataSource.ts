import { ApiClient } from './ApiClient';
import { AIResultDTO } from '../../models/AIResultDTO';

/**
 * Remote data source for AI review
 */
export class AIReviewRemoteDataSource {
  constructor(private readonly apiClient: ApiClient) {}

  /**
   * Submits a clip for AI processing
   */
  async submitForProcessing(clipId: string): Promise<AIResultDTO> {
    return this.apiClient.post<AIResultDTO>('/ai/process', { clip_id: clipId });
  }

  /**
   * Gets AI result by ID
   */
  async getResult(id: string): Promise<AIResultDTO> {
    return this.apiClient.get<AIResultDTO>(`/ai/results/${id}`);
  }

  /**
   * Gets AI result for a clip
   */
  async getResultByClipId(clipId: string): Promise<AIResultDTO | null> {
    try {
      return await this.apiClient.get<AIResultDTO>(`/ai/results/clip/${clipId}`);
    } catch (error) {
      // Return null if not found
      return null;
    }
  }
}
