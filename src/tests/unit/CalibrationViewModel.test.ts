import { CalibrationViewModel } from '@presentation/screens/Camera/CalibrationViewModel';
import { useCalibrationStore } from '@presentation/state/calibrationStore';
import { SaveCalibration } from '@domain/useCases/SaveCalibration';
import { CourtCalibration } from '@domain/entities/CourtCalibration';
import { success, failure } from '@core/utils/result';
import { StorageError, ValidationError } from '@core/errors/AppError';

const NOW = '2025-01-01T00:00:00.000Z';

const makeCalibration = (): CourtCalibration => ({
  id: 'cal-1',
  sessionId: 'session-1',
  cornerPoints: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ],
  lines: [],
  transformationMatrix: [],
  cameraParams: {},
  confidence: 1.0,
  isValid: true,
  createdAt: NOW,
  updatedAt: NOW,
});

describe('CalibrationViewModel', () => {
  let viewModel: CalibrationViewModel;
  let mockSaveCalibration: jest.Mocked<Pick<SaveCalibration, 'execute'>>;

  beforeEach(() => {
    useCalibrationStore.getState().reset();
    mockSaveCalibration = { execute: jest.fn() };
    viewModel = new CalibrationViewModel(mockSaveCalibration as unknown as SaveCalibration);
  });

  describe('addPoint', () => {
    it('adds a point to the store', () => {
      viewModel.addPoint(10, 20);
      expect(useCalibrationStore.getState().cornerPoints).toHaveLength(1);
      expect(useCalibrationStore.getState().cornerPoints[0]).toEqual({ x: 10, y: 20 });
    });

    it('clamps at 4 points and does not add a fifth', () => {
      viewModel.addPoint(0, 0);
      viewModel.addPoint(100, 0);
      viewModel.addPoint(100, 100);
      viewModel.addPoint(0, 100);
      viewModel.addPoint(50, 50);

      expect(useCalibrationStore.getState().cornerPoints).toHaveLength(4);
    });
  });

  describe('removeLastPoint', () => {
    it('removes the most recently added point', () => {
      viewModel.addPoint(10, 10);
      viewModel.addPoint(20, 20);
      viewModel.removeLastPoint();

      const points = useCalibrationStore.getState().cornerPoints;
      expect(points).toHaveLength(1);
      expect(points[0]).toEqual({ x: 10, y: 10 });
    });

    it('does nothing when there are no points', () => {
      viewModel.removeLastPoint();
      expect(useCalibrationStore.getState().cornerPoints).toHaveLength(0);
    });
  });

  describe('saveCalibration', () => {
    it('returns ValidationError when fewer than 4 points', async () => {
      viewModel.addPoint(10, 10);
      const result = await viewModel.saveCalibration('session-1');

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
      expect(mockSaveCalibration.execute).not.toHaveBeenCalled();
    });

    it('calls SaveCalibration.execute with correct sessionId and cornerPoints', async () => {
      viewModel.addPoint(0, 0);
      viewModel.addPoint(100, 0);
      viewModel.addPoint(100, 100);
      viewModel.addPoint(0, 100);

      mockSaveCalibration.execute.mockResolvedValue(success(makeCalibration()));

      await viewModel.saveCalibration('session-1');

      expect(mockSaveCalibration.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
          cornerPoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        }),
      );
    });

    it('returns success and clears error on success', async () => {
      viewModel.addPoint(0, 0);
      viewModel.addPoint(100, 0);
      viewModel.addPoint(100, 100);
      viewModel.addPoint(0, 100);

      mockSaveCalibration.execute.mockResolvedValue(success(makeCalibration()));

      const result = await viewModel.saveCalibration('session-1');

      expect(result.isSuccess).toBe(true);
      expect(useCalibrationStore.getState().error).toBeNull();
      expect(useCalibrationStore.getState().isSubmitting).toBe(false);
    });

    it('sets error on failure', async () => {
      viewModel.addPoint(0, 0);
      viewModel.addPoint(100, 0);
      viewModel.addPoint(100, 100);
      viewModel.addPoint(0, 100);

      mockSaveCalibration.execute.mockResolvedValue(failure(new StorageError('DB error')));

      await viewModel.saveCalibration('session-1');

      expect(useCalibrationStore.getState().error).toBe('DB error');
      expect(useCalibrationStore.getState().isSubmitting).toBe(false);
    });

    it('sets isSubmitting to false after completion', async () => {
      viewModel.addPoint(0, 0);
      viewModel.addPoint(100, 0);
      viewModel.addPoint(100, 100);
      viewModel.addPoint(0, 100);

      mockSaveCalibration.execute.mockResolvedValue(success(makeCalibration()));

      await viewModel.saveCalibration('session-1');

      expect(useCalibrationStore.getState().isSubmitting).toBe(false);
    });
  });
});
