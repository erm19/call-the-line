import { Platform } from 'react-native';
import { StorageDirectory } from '@domain/services/IFileStorageService';

// TODO: Replace placeholder paths with RNFS.DocumentDirectoryPath / RNFS.CachesDirectoryPath
// when react-native-fs is installed. These are structural placeholders only.
const DOCUMENTS_ROOT_PLACEHOLDER = '__DOCUMENTS_DIR__';
const CACHE_ROOT_PLACEHOLDER = '__CACHE_DIR__';
const TEMP_ROOT_PLACEHOLDER = '__TEMP_DIR__';

export const resolveDirectoryPath = (directory: StorageDirectory): string => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    switch (directory) {
      case StorageDirectory.Cache:
        return CACHE_ROOT_PLACEHOLDER;
      case StorageDirectory.Temporary:
        return TEMP_ROOT_PLACEHOLDER;
      default:
        return DOCUMENTS_ROOT_PLACEHOLDER;
    }
  }
  return DOCUMENTS_ROOT_PLACEHOLDER;
};
