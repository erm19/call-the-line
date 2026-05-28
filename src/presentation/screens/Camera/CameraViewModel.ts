import { Result, failure } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { Clip } from '@domain/entities/Clip';
import { RecordClip } from '@domain/useCases/RecordClip';
import { ICameraService } from '@platform/camera/CameraService';
import { CameraConfig } from '@platform/camera/CameraConfig';
import { useCameraStore, RecordingState } from '@presentation/state/cameraStore';

export { RecordingState } from '@presentation/state/cameraStore';

/**
 * ViewModel for CameraScreen.
 * Drives the recording state machine: idle → recording → saving → done.
 * State lives in the Zustand cameraStore.
 */
export class CameraViewModel {
  constructor(
    private readonly cameraService: ICameraService,
    private readonly recordClipUseCase: RecordClip,
  ) {}

  async initialize(config: CameraConfig): Promise<void> {
    const { setRecordingState, setError } = useCameraStore.getState();
    setError(null);
    const result = await this.cameraService.initialize(config);
    if (result.isFailure) {
      setError(result.error.message);
      setRecordingState(RecordingState.Error);
      return;
    }
    setRecordingState(RecordingState.Idle);
  }

  async startRecording(): Promise<void> {
    const { setRecordingState, setError } = useCameraStore.getState();
    setError(null);
    const result = await this.cameraService.startRecording();
    if (result.isFailure) {
      setError(result.error.message);
      setRecordingState(RecordingState.Error);
      return;
    }
    setRecordingState(RecordingState.Recording);
  }

  async stopRecording(sessionId: string): Promise<Result<Clip, AppError>> {
    const { setRecordingState, setError, setCurrentClipPath } = useCameraStore.getState();
    setRecordingState(RecordingState.Saving);

    const stopResult = await this.cameraService.stopRecording();
    if (stopResult.isFailure) {
      setError(stopResult.error.message);
      setRecordingState(RecordingState.Error);
      return failure(stopResult.error);
    }

    const { videoPath, duration, fileSize, resolution, fps, thumbnailPath } = stopResult.value;
    setCurrentClipPath(videoPath);

    const clipResult = await this.recordClipUseCase.execute({
      sessionId,
      videoPath,
      duration,
      fileSize,
      resolution,
      fps,
      thumbnailPath,
    });

    if (clipResult.isFailure) {
      setError(clipResult.error.message);
      setRecordingState(RecordingState.Error);
      return clipResult;
    }

    setRecordingState(RecordingState.Done);
    return clipResult;
  }

  async release(): Promise<void> {
    const { reset } = useCameraStore.getState();
    await this.cameraService.release();
    reset();
  }

  getRecordingState(): RecordingState {
    return useCameraStore.getState().recordingState;
  }
}
