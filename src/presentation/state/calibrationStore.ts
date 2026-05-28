import { create } from 'zustand';
import { Point2D } from '@domain/entities/CourtCalibration';

/**
 * Zustand store for court calibration state.
 * Tracks corner point placement during the calibration flow.
 */
export interface CalibrationStoreState {
  cornerPoints: Point2D[];
  isSubmitting: boolean;
  error: string | null;
  isComplete: boolean;
  addPoint: (point: Point2D) => void;
  setCornerPoints: (points: Point2D[]) => void;
  removeLastPoint: () => void;
  setIsSubmitting: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const MAX_CORNER_POINTS = 4;

const initialState = {
  cornerPoints: [] as Point2D[],
  isSubmitting: false,
  error: null as string | null,
  isComplete: false,
};

export const useCalibrationStore = create<CalibrationStoreState>(set => ({
  ...initialState,
  addPoint: (point: Point2D) =>
    set(state => {
      if (state.cornerPoints.length >= MAX_CORNER_POINTS) return state;
      const next = [...state.cornerPoints, point];
      return { cornerPoints: next, isComplete: next.length === MAX_CORNER_POINTS };
    }),
  setCornerPoints: (points: Point2D[]) =>
    set({ cornerPoints: points, isComplete: points.length === MAX_CORNER_POINTS }),
  removeLastPoint: () =>
    set(state => {
      const next = state.cornerPoints.slice(0, -1);
      return { cornerPoints: next, isComplete: false };
    }),
  setIsSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
  setError: (error: string | null) => set({ error }),
  reset: () => set(initialState),
}));
