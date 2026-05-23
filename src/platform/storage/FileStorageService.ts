import { Platform } from 'react-native';
import { success, failure, Result } from '@core/utils/result';
import { StorageError } from '@core/errors/AppError';

/**
 * Storage directory types
 */
export enum StorageDirectory {
  Documents = 'documents',
  Cache = 'cache',
  Temporary = 'temporary',
}

/**
 * File info
 */
export interface FileInfo {
  path: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  exists: boolean;
}

/**
 * File Storage Service Interface
 * Handles file system operations
 */
export interface IFileStorageService {
  writeFile(
    path: string,
    data: string | ArrayBuffer,
    directory?: StorageDirectory,
  ): Promise<Result<string, StorageError>>;
  readFile(path: string): Promise<Result<string, StorageError>>;
  deleteFile(path: string): Promise<Result<void, StorageError>>;
  exists(path: string): Promise<Result<boolean, StorageError>>;
  getFileInfo(path: string): Promise<Result<FileInfo, StorageError>>;
  listFiles(directory: string): Promise<Result<string[], StorageError>>;
  getAvailableSpace(): Promise<Result<number, StorageError>>;
  moveFile(fromPath: string, toPath: string): Promise<Result<void, StorageError>>;
  copyFile(fromPath: string, toPath: string): Promise<Result<void, StorageError>>;
  getDirectoryPath(directory: StorageDirectory): string;

  /** Copies a clip from sourceUri into app-private clips/ dir, returns stored path */
  saveClip(sourceUri: string, clipId: string): Promise<Result<string, StorageError>>;
  /** Deletes a clip by its stored file path */
  deleteClip(filePath: string): Promise<Result<void, StorageError>>;
  /** Lists all stored clip file paths */
  listClips(): Promise<Result<string[], StorageError>>;
}

const CLIPS_SUBDIR = 'clips';

const resolveDocumentsRoot = (): string => {
  // Platform-specific document directories for bare React Native.
  // These paths are standard but actual I/O requires react-native-fs or expo-file-system.
  if (Platform.OS === 'ios') {
    return `${process.env.HOME ?? ''}/Documents`;
  }
  return '/data/user/0/com.callthelline/files';
};

/**
 * File Storage Service Implementation
 *
 * NOTE: Actual file I/O requires react-native-fs or expo-file-system to be installed.
 * Directory paths are correct for iOS/Android bare React Native.
 * Add `react-native-fs` to package.json and replace the I/O stubs below.
 */
export class FileStorageService implements IFileStorageService {
  async writeFile(
    path: string,
    _data: string | ArrayBuffer,
    directory: StorageDirectory = StorageDirectory.Documents,
  ): Promise<Result<string, StorageError>> {
    try {
      const fullPath = `${this.getDirectoryPath(directory)}/${path}`;
      // TODO: await RNFS.writeFile(fullPath, data, 'utf8');
      return success(fullPath);
    } catch (e) {
      return failure(new StorageError('Failed to write file'));
    }
  }

  async readFile(_path: string): Promise<Result<string, StorageError>> {
    try {
      // TODO: return success(await RNFS.readFile(_path, 'utf8'));
      return success('');
    } catch (e) {
      return failure(new StorageError('Failed to read file'));
    }
  }

  async deleteFile(path: string): Promise<Result<void, StorageError>> {
    try {
      // TODO: await RNFS.unlink(path);
      void path;
      return success(undefined);
    } catch (e) {
      return failure(new StorageError('Failed to delete file'));
    }
  }

  async exists(path: string): Promise<Result<boolean, StorageError>> {
    try {
      // TODO: return success(await RNFS.exists(path));
      void path;
      return success(false);
    } catch (e) {
      return failure(new StorageError('Failed to check file existence'));
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
      return failure(new StorageError('Failed to get file info'));
    }
  }

  async listFiles(directory: string): Promise<Result<string[], StorageError>> {
    try {
      // TODO: const items = await RNFS.readDir(directory); return success(items.map(i => i.path));
      void directory;
      return success([]);
    } catch (e) {
      return failure(new StorageError('Failed to list files'));
    }
  }

  async getAvailableSpace(): Promise<Result<number, StorageError>> {
    try {
      // TODO: const { freeSpace } = await RNFS.getFSInfo(); return success(freeSpace);
      return success(1024 * 1024 * 1024);
    } catch (e) {
      return failure(new StorageError('Failed to get available space'));
    }
  }

  async moveFile(fromPath: string, toPath: string): Promise<Result<void, StorageError>> {
    try {
      // TODO: await RNFS.moveFile(fromPath, toPath);
      void fromPath;
      void toPath;
      return success(undefined);
    } catch (e) {
      return failure(new StorageError('Failed to move file'));
    }
  }

  async copyFile(fromPath: string, toPath: string): Promise<Result<void, StorageError>> {
    try {
      // TODO: await RNFS.copyFile(fromPath, toPath);
      void fromPath;
      void toPath;
      return success(undefined);
    } catch (e) {
      return failure(new StorageError('Failed to copy file'));
    }
  }

  getDirectoryPath(directory: StorageDirectory): string {
    const root = resolveDocumentsRoot();
    switch (directory) {
      case StorageDirectory.Documents:
        return root;
      case StorageDirectory.Cache:
        return root.replace('files', 'cache').replace('Documents', 'Library/Caches');
      case StorageDirectory.Temporary:
        return root.replace('files', 'tmp').replace('Documents', 'tmp');
      default:
        return root;
    }
  }

  async saveClip(sourceUri: string, clipId: string): Promise<Result<string, StorageError>> {
    try {
      const destPath = `${this.getDirectoryPath(StorageDirectory.Documents)}/${CLIPS_SUBDIR}/${clipId}.mp4`;
      // TODO: await RNFS.mkdir(`${this.getDirectoryPath(StorageDirectory.Documents)}/${CLIPS_SUBDIR}`);
      // TODO: await RNFS.copyFile(sourceUri, destPath);
      void sourceUri;
      return success(destPath);
    } catch (e) {
      return failure(new StorageError('Failed to save clip'));
    }
  }

  async deleteClip(filePath: string): Promise<Result<void, StorageError>> {
    return this.deleteFile(filePath);
  }

  async listClips(): Promise<Result<string[], StorageError>> {
    const clipsDir = `${this.getDirectoryPath(StorageDirectory.Documents)}/${CLIPS_SUBDIR}`;
    return this.listFiles(clipsDir);
  }
}
