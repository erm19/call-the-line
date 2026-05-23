import { Session, SessionStatus } from '@domain/entities/Session';
import { Clip } from '@domain/entities/Clip';
import { NRTConfig, NRTMode, DeviceTier } from '@domain/entities/NRTConfig';

/**
 * Mock data for testing
 */

export const mockSession: Session = {
  id: 'session-1',
  name: 'Test Session',
  startedAt: '2025-01-01T00:00:00.000Z',
  endedAt: null,
  status: SessionStatus.Active,
  clipIds: ['clip-1', 'clip-2'],
  calibrationId: 'cal-1',
  notes: 'Test notes',
  location: 'Test Court',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const mockClip: Clip = {
  id: 'clip-1',
  sessionId: 'session-1',
  videoPath: '/path/to/video.mp4',
  duration: 10,
  recordedAt: '2025-01-01T00:05:00.000Z',
  fileSize: 1024 * 1024 * 10,
  resolution: {
    width: 1280,
    height: 720,
  },
  fps: 60,
  thumbnailPath: '/path/to/thumbnail.jpg',
  createdAt: '2025-01-01T00:05:00.000Z',
  updatedAt: '2025-01-01T00:05:00.000Z',
};

export const mockNRTConfig: NRTConfig = {
  id: 'config-1',
  enabled: true,
  mode: NRTMode.OnDevice,
  targetFps: 60,
  actualFps: 58,
  resolution: {
    width: 1280,
    height: 720,
  },
  bufferWindowSeconds: 3,
  maxLatencyMs: 500,
  deviceTier: DeviceTier.High,
  autoAdjustQuality: true,
  minConfidenceThreshold: 0.7,
  cameraDevice: 'ultra-wide-angle-camera',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};
