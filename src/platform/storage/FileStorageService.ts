import { injectable } from 'tsyringe';
import { success, failure } from '@core/utils/result';
import { StorageError } from '@core/errors/AppError';
import type { Result } from '@core/utils/result';
import {
  StorageDirectory,
  type FileInfo,
  type IFileStorageService,
} from '@domain/services/IFileStorageService';
import { resolveDirectoryPath } from './storagePaths';

/**
 * File Storage Service Implementation
 *
 * NOTE: Actual file I/O requires react-native-fs or expo-file-system to be installed.
 * Directory paths are resolved via storagePaths.ts placeholders.
 * Add `react-native-fs` to package.json and replace the I/O stubs below.
 */
@injectable()
export class FileStorageService implements IFileStorageService {
  async writeFile(
    path: string,
    _data: string | ArrayBuffer,
    directory: StorageDirectory = StorageDirectory.Documents,
  ): Promise<Result<string, StorageError>> {
    try {
      const fullPath = `${this.getDirectoryPath(directory)}/${path}`;
      // TODO: await RNFS.writeFile(fullPath, _data, 'utf8');
      return success(fullPath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to write file: ${msg}`));
    }
  }

  async readFile(_path: string): Promise<Result<string, StorageError>> {
    try {
      // TODO: return success(await RNFS.readFile(_path, 'utf8'));
      return success('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to read file: ${msg}`));
    }
  }

  async deleteFile(_path: string): Promise<Result<void, StorageError>> {
    try {
      // TODO: await RNFS.unlink(_path);
      return success(undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to delete file: ${msg}`));
    }
  }

  async exists(_path: string): Promise<Result<boolean, StorageError>> {
    try {
      // TODO: return success(await RNFS.exists(_path));
      return success(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to check file existence: ${msg}`));
    }
  }

  async getFileInfo(path: string): Promise<Result<FileInfo, StorageError>> {
    try {
      // TODO: const stat = await RNFS.stat(path); return success({ path, size: stat.size, ... });
      return success({
        path,
        size: 0,
        createdAt: new Date(),
        modifiedAt: new Date(),
        exists: false,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to get file info: ${msg}`));
    }
  }

  async listFiles(_directory: string): Promise<Result<string[], StorageError>> {
    try {
      // TODO: const items = await RNFS.readDir(_directory); return success(items.map(i => i.path));
      return success([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to list files: ${msg}`));
    }
  }

  async getAvailableSpace(): Promise<Result<number, StorageError>> {
    try {
      // TODO: const { freeSpace } = await RNFS.getFSInfo(); return success(freeSpace);
      return success(1024 * 1024 * 1024);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to get available space: ${msg}`));
    }
  }

  async moveFile(_fromPath: string, _toPath: string): Promise<Result<void, StorageError>> {
    try {
      // TODO: await RNFS.moveFile(_fromPath, _toPath);
      return success(undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to move file: ${msg}`));
    }
  }

  async copyFile(_fromPath: string, _toPath: string): Promise<Result<void, StorageError>> {
    try {
      // TODO: await RNFS.copyFile(_fromPath, _toPath);
      return success(undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failure(new StorageError(`Failed to copy file: ${msg}`));
    }
  }

  getDirectoryPath(directory: StorageDirectory): string {
    return resolveDirectoryPath(directory);
  }
}
