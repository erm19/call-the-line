import { Result, failure } from '@core/utils/result';
import { AppError, ValidationError } from '@core/errors/AppError';
import { CourtCalibration, Point2D } from '@domain/entities/CourtCalibration';
import { SaveCalibration } from '@domain/useCases/SaveCalibration';
import { useCalibrationStore } from '@presentation/state/calibrationStore';

const MAX_POINTS = 4;

const isFourPoints = (pts: Point2D[]): pts is [Point2D, Point2D, Point2D, Point2D] =>
  pts.length === MAX_POINTS;

export class CalibrationViewModel {
  constructor(private readonly saveCalibrationUseCase: SaveCalibration) {}

  addPoint(x: number, y: number): void {
    const { cornerPoints, addPoint } = useCalibrationStore.getState();
    if (cornerPoints.length >= MAX_POINTS) return;
    addPoint({ x, y });
  }

  removeLastPoint(): void {
    useCalibrationStore.getState().removeLastPoint();
  }

  async saveCalibration(sessionId: string): Promise<Result<CourtCalibration, AppError>> {
    const { cornerPoints, setIsSubmitting, setError } = useCalibrationStore.getState();
    setError(null);

    if (!isFourPoints(cornerPoints)) {
      return failure(
        new ValidationError('Place all 4 corner points before saving', 'cornerPoints'),
      );
    }

    setIsSubmitting(true);

    const result = await this.saveCalibrationUseCase.execute({
      sessionId,
      cornerPoints,
      lines: [],
      transformationMatrix: [],
      cameraParams: {},
      confidence: 1.0,
      isValid: true,
    });

    if (result.isFailure) {
      setError(result.error.message);
    }

    setIsSubmitting(false);
    return result;
  }
}
