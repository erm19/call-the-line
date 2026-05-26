import { FileStorageService } from '@platform/storage/FileStorageService';
import { StorageDirectory } from '@domain/services/IFileStorageService';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(() => {
    service = new FileStorageService();
  });

  describe('getDirectoryPath', () => {
    it('should return a non-empty path for Documents directory', () => {
      const path = service.getDirectoryPath(StorageDirectory.Documents);
      expect(path.length).toBeGreaterThan(0);
    });

    it('should return different paths for Cache and Documents', () => {
      const docs = service.getDirectoryPath(StorageDirectory.Documents);
      const cache = service.getDirectoryPath(StorageDirectory.Cache);
      expect(docs).not.toBe(cache);
    });
  });

  describe('writeFile', () => {
    it('should return a path containing the provided filename', async () => {
      const result = await service.writeFile('test.json', 'data');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toContain('test.json');
      }
    });
  });

  describe('exists', () => {
    it('should return a boolean result', async () => {
      const result = await service.exists('/any/path.mp4');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(typeof result.value).toBe('boolean');
      }
    });
  });

  describe('getAvailableSpace', () => {
    it('should return a positive number', async () => {
      const result = await service.getAvailableSpace();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toBeGreaterThan(0);
      }
    });
  });

  describe('deleteFile', () => {
    it('should return success when deleting a file path', async () => {
      const result = await service.deleteFile('/documents/some/file.json');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('listFiles', () => {
    it('should return a list result (empty stub until RNFS installed)', async () => {
      const result = await service.listFiles('/some/directory');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });
  });
});
