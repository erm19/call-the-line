import { Result, failure } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { Clip } from '../entities/Clip';
import { IClipRepository } from '../repositories/ClipRepository';
import { ISessionRepository } from '../repositories/SessionRepository';
import { getCurrentISOString } from '@core/utils/date';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';

/**
 * Input for RecordClip use case
 */
export interface RecordClipInput {
  sessionId: string;
  videoPath: string;
  duration: number;
  fileSize: number;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  thumbnailPath?: string;
}

/**
 * RecordClip Use Case
 * Records a new video clip for a session
 */
export class RecordClip {
  constructor(
    private readonly clipRepository: IClipRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly analyticsService: IAnalyticsService,
  ) {}

  async execute(input: RecordClipInput): Promise<Result<Clip, AppError>> {
    // Verify session exists
    const sessionResult = await this.sessionRepository.getById(input.sessionId);
    if (sessionResult.isFailure) {
      return failure(sessionResult.error);
    }

    const clipData: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'> = {
      sessionId: input.sessionId,
      videoPath: input.videoPath,
      duration: input.duration,
      fileSize: input.fileSize,
      resolution: input.resolution,
      fps: input.fps,
      thumbnailPath: input.thumbnailPath,
      recordedAt: getCurrentISOString(),
    };

    const result = await this.clipRepository.create(clipData);

    if (result.isSuccess) {
      const session = sessionResult.value;
      const updateResult = await this.sessionRepository.update(input.sessionId, {
        clipIds: [...session.clipIds, result.value.id],
      });

      if (updateResult.isFailure) {
        return failure(updateResult.error);
      }

      this.analyticsService.trackEvent({
        name: ANALYTICS_CONSTANTS.EVENTS.CLIP_RECORDED,
        properties: {
          sessionId: input.sessionId,
          clipId: result.value.id,
          duration: input.duration,
          fps: input.fps,
          resolution: `${input.resolution.width}x${input.resolution.height}`,
        },
      });
    }

    return result;
  }
}
