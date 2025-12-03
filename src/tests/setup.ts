/**
 * Jest setup file
 * Run before each test suite
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
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

