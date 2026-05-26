import { injectable, inject } from 'tsyringe';
import { success, failure } from '@core/utils/result';
import type { Result } from '@core/utils/result';
import { StorageError } from '@core/errors/AppError';
import { StorageDirectory } from '@domain/services/IFileStorageService';
import type { IClipStorageService } from '@domain/services/IClipStorageService';
import type { IFileStorageService } from '@domain/services/IFileStorageService';
import { DI_TOKENS } from '@core/di/container';

const CLIPS_SUBDIR = 'clips';

@injectable()
export class ClipStorageService implements IClipStorageService {
  constructor(
    @inject(DI_TOKENS.FileStorageService)
    private readonly fileStorage: IFileStorageService,
  ) {}

  async saveClip(_sourceUri: string, clipId: string): Promise<Result<string, StorageError>> {
    try {
      const clipsDir = this.fileStorage.getDirectoryPath(StorageDirectory.Documents);
      const destPath = `${clipsDir}/${CLIPS_SUBDIR}/${clipId}.mp4`;
      // TODO: await RNFS.mkdir(`${clipsDir}/${CLIPS_SUBDIR}`);
      // TODO: await RNFS.copyFile(_sourceUri, destPath);
      return success(destPath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to save clip: ${msg}`));
    }
  }

  async deleteClip(filePath: string): Promise<Result<void, StorageError>> {
    return this.fileStorage.deleteFile(filePath);
  }

  async listClips(): Promise<Result<string[], StorageError>> {
    const clipsDir = `${this.fileStorage.getDirectoryPath(StorageDirectory.Documents)}/${CLIPS_SUBDIR}`;
    return this.fileStorage.listFiles(clipsDir);
  }
}
