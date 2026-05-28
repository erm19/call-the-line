import { create } from 'zustand';

/**
 * Recording state machine states for CameraViewModel.
 */
export enum RecordingState {
  Idle = 'idle',
  Recording = 'recording',
  Saving = 'saving',
  Done = 'done',
  Error = 'error',
}

export interface CameraStoreState {
  recordingState: RecordingState;
  currentClipPath: string | null;
  error: string | null;
  setRecordingState: (state: RecordingState) => void;
  setCurrentClipPath: (path: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  recordingState: RecordingState.Idle,
  currentClipPath: null as string | null,
  error: null as string | null,
};

export const useCameraStore = create<CameraStoreState>(set => ({
  ...initialState,
  setRecordingState: recordingState => set({ recordingState }),
  setCurrentClipPath: currentClipPath => set({ currentClipPath }),
  setError: error => set({ error }),
  reset: () => set(initialState),
}));
