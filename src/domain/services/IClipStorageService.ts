import type { StorageError } from '@core/errors/AppError';
import type { Result } from '@core/utils/result';

/**
 * Clip Storage Service Interface
 * Domain-specific operations for managing video clip files.
 * Separated from IFileStorageService to follow ISP.
 */
export interface IClipStorageService {
  /** Copies a clip from sourceUri into app-private clips/ dir, returns stored path */
  saveClip(sourceUri: string, clipId: string): Promise<Result<string, StorageError>>;
  /** Deletes a clip by its stored file path */
  deleteClip(filePath: string): Promise<Result<void, StorageError>>;
  /** Lists all stored clip file paths */
  listClips(): Promise<Result<string[], StorageError>>;
}
