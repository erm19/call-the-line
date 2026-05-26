import type { StorageError } from '@core/errors/AppError';
import type { Result } from '@core/utils/result';

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
 * Handles generic file system operations
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
}
