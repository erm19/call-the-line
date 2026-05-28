import { CameraViewModel } from '@presentation/screens/Camera/CameraViewModel';
import { RecordingState } from '@presentation/state/cameraStore';
import { useCameraStore } from '@presentation/state/cameraStore';
import { ICameraService } from '@platform/camera/CameraService';
import { RecordClip } from '@domain/useCases/RecordClip';
import { Clip } from '@domain/entities/Clip';
import { CameraConfig, CameraStatus } from '@platform/camera/CameraConfig';
import { success, failure } from '@core/utils/result';
import { CameraError, StorageError } from '@core/errors/AppError';

const NOW = '2025-01-01T00:00:00.000Z';

const makeConfig = (): CameraConfig => ({
  device: 'back',
  resolution: { width: 1280, height: 720 },
  fps: 60,
  quality: 'high',
  codec: 'h264',
  enableAudio: false,
  maxDuration: 0,
});

const makeClip = (): Clip => ({
  id: 'clip-1',
  sessionId: 'session-1',
  videoPath: '/recordings/clip-1.mp4',
  duration: 10,
  recordedAt: NOW,
  fileSize: 1024 * 1024,
  resolution: { width: 1280, height: 720 },
  fps: 60,
  createdAt: NOW,
  updatedAt: NOW,
});

describe('CameraViewModel', () => {
  let viewModel: CameraViewModel;
  let mockCameraService: jest.Mocked<ICameraService>;
  let mockRecordClip: jest.Mocked<Pick<RecordClip, 'execute'>>;

  beforeEach(() => {
    useCameraStore.getState().reset();

    mockCameraService = {
      initialize: jest.fn(),
      getAvailableDevices: jest.fn(),
      isDeviceAvailable: jest.fn(),
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      getStatus: jest.fn(),
      release: jest.fn(),
    };
    mockRecordClip = { execute: jest.fn() };

    viewModel = new CameraViewModel(
      mockCameraService as unknown as ICameraService,
      mockRecordClip as unknown as RecordClip,
    );
  });

  describe('initialize', () => {
    it('sets Idle state on successful initialization', async () => {
      mockCameraService.initialize.mockResolvedValue(success(undefined));

      await viewModel.initialize(makeConfig());

      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Idle);
    });

    it('sets Error state when camera initialization fails', async () => {
      mockCameraService.initialize.mockResolvedValue(
        failure(new CameraError('Init failed')),
      );

      await viewModel.initialize(makeConfig());

      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Error);
      expect(useCameraStore.getState().error).toBe('Init failed');
    });
  });

  describe('startRecording', () => {
    it('transitions state from Idle to Recording on success', async () => {
      mockCameraService.startRecording.mockResolvedValue(success(undefined));

      await viewModel.startRecording();

      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Recording);
    });

    it('sets Error state when startRecording fails', async () => {
      mockCameraService.startRecording.mockResolvedValue(
        failure(new CameraError('Start failed')),
      );

      await viewModel.startRecording();

      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Error);
      expect(useCameraStore.getState().error).toBe('Start failed');
    });
  });

  describe('stopRecording', () => {
    it('transitions to Done state on success', async () => {
      mockCameraService.stopRecording.mockResolvedValue(
        success({
          videoPath: '/path/video.mp4',
          duration: 10,
          fileSize: 1024,
          resolution: { width: 1280, height: 720 },
          fps: 60,
        }),
      );
      mockRecordClip.execute.mockResolvedValue(success(makeClip()));

      await viewModel.stopRecording('session-1');

      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Done);
    });

    it('calls RecordClip.execute with correct sessionId', async () => {
      mockCameraService.stopRecording.mockResolvedValue(
        success({
          videoPath: '/path/video.mp4',
          duration: 5,
          fileSize: 512,
          resolution: { width: 1280, height: 720 },
          fps: 60,
        }),
      );
      mockRecordClip.execute.mockResolvedValue(success(makeClip()));

      await viewModel.stopRecording('session-42');

      expect(mockRecordClip.execute).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 'session-42' }),
      );
    });

    it('sets Error state when stopRecording fails', async () => {
      mockCameraService.stopRecording.mockResolvedValue(
        failure(new CameraError('Stop failed')),
      );

      await viewModel.stopRecording('session-1');

      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Error);
    });

    it('sets Error state when RecordClip.execute fails', async () => {
      mockCameraService.stopRecording.mockResolvedValue(
        success({
          videoPath: '/path/video.mp4',
          duration: 10,
          fileSize: 1024,
          resolution: { width: 1280, height: 720 },
          fps: 60,
        }),
      );
      mockRecordClip.execute.mockResolvedValue(failure(new StorageError('Save failed')));

      await viewModel.stopRecording('session-1');

      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Error);
      expect(useCameraStore.getState().error).toBe('Save failed');
    });
  });

  describe('release', () => {
    it('calls cameraService.release and resets state to Idle', async () => {
      // Put store in a non-idle state first
      useCameraStore.getState().setRecordingState(RecordingState.Recording);
      mockCameraService.release.mockResolvedValue(success(undefined));

      await viewModel.release();

      expect(mockCameraService.release).toHaveBeenCalledTimes(1);
      expect(useCameraStore.getState().recordingState).toBe(RecordingState.Idle);
    });
  });

  describe('getRecordingState', () => {
    it('returns the current recording state from the store', () => {
      useCameraStore.getState().setRecordingState(RecordingState.Recording);
      expect(viewModel.getRecordingState()).toBe(RecordingState.Recording);
    });
  });
});
