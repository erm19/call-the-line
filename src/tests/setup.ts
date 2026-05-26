/**
 * Jest setup file
 * Run before each test suite
 */

// Required by tsyringe for dependency injection decorators
import 'reflect-metadata';

// Mock expo-sqlite (native module — JSI boundary)
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    closeSync: jest.fn(),
    withTransactionSync: jest.fn((fn: () => void) => fn()),
  })),
  SQLiteDatabase: jest.fn(),
}));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: {
    getAvailableCameraDevices: jest.fn(() => Promise.resolve([])),
    getCameraPermissionStatus: jest.fn(() => Promise.resolve('authorized')),
    requestCameraPermission: jest.fn(() => Promise.resolve('authorized')),
  },
  useCameraDevices: jest.fn(() => ({})),
  useFrameProcessor: jest.fn(),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
