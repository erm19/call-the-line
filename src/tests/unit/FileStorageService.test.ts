import { FileStorageService, StorageDirectory } from '@platform/storage/FileStorageService';

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

  describe('saveClip', () => {
    it('should return a path containing the clipId', async () => {
      const result = await service.saveClip('file:///tmp/input.mp4', 'clip-abc123');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toContain('clip-abc123');
      }
    });

    it('should return a path under the clips subdirectory', async () => {
      const result = await service.saveClip('file:///tmp/input.mp4', 'clip-xyz');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toContain('clips');
      }
    });
  });

  describe('deleteClip', () => {
    it('should return success when deleting a clip path', async () => {
      const result = await service.deleteClip('/documents/clips/clip-1.mp4');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('listClips', () => {
    it('should return a list result (empty stub until RNFS installed)', async () => {
      const result = await service.listClips();

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(Array.isArray(result.value)).toBe(true);
      }
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
});
