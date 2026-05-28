import { SaveCalibration, SaveCalibrationInput } from '@domain/useCases/SaveCalibration';
import { CalibrationRepository } from '@domain/repositories/CalibrationRepository';
import { ISessionRepository } from '@domain/repositories/SessionRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { CourtCalibration, CourtLineType } from '@domain/entities/CourtCalibration';
import { Session, SessionStatus } from '@domain/entities/Session';
import { success, failure } from '@core/utils/result';
import { StorageError, NotFoundError } from '@core/errors/AppError';

const NOW = '2025-01-01T00:00:00.000Z';

const CORNER_POINTS: [
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number },
] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session-1',
  name: 'Test Session',
  startedAt: NOW,
  endedAt: null,
  status: SessionStatus.Active,
  clipIds: [],
  calibrationId: null,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const makeCalibration = (overrides: Partial<CourtCalibration> = {}): CourtCalibration => ({
  id: 'cal-1',
  sessionId: 'session-1',
  cornerPoints: CORNER_POINTS,
  lines: [],
  transformationMatrix: [],
  cameraParams: {},
  confidence: 0.95,
  isValid: true,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const makeInput = (overrides: Partial<SaveCalibrationInput> = {}): SaveCalibrationInput => ({
  sessionId: 'session-1',
  cornerPoints: CORNER_POINTS,
  lines: [],
  transformationMatrix: [],
  cameraParams: {},
  confidence: 0.95,
  isValid: true,
  ...overrides,
});

const makeMockCalibrationRepo = (): jest.Mocked<CalibrationRepository> => ({
  create: jest.fn(),
  getById: jest.fn(),
  getBySessionId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeMockSessionRepo = (): jest.Mocked<ISessionRepository> => ({
  create: jest.fn(),
  getById: jest.fn(),
  getAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getActiveSession: jest.fn(),
});

const makeMockAnalytics = (): jest.Mocked<IAnalyticsService> => ({
  trackEvent: jest.fn(),
  trackScreen: jest.fn(),
  setUserProperties: jest.fn(),
  logError: jest.fn(),
});

describe('SaveCalibration', () => {
  let useCase: SaveCalibration;
  let mockCalibrationRepo: jest.Mocked<CalibrationRepository>;
  let mockSessionRepo: jest.Mocked<ISessionRepository>;
  let mockAnalytics: jest.Mocked<IAnalyticsService>;

  beforeEach(() => {
    mockCalibrationRepo = makeMockCalibrationRepo();
    mockSessionRepo = makeMockSessionRepo();
    mockAnalytics = makeMockAnalytics();
    useCase = new SaveCalibration(mockCalibrationRepo, mockSessionRepo, mockAnalytics);
  });

  describe('happy path', () => {
    it('returns the created calibration on success', async () => {
      const session = makeSession();
      const calibration = makeCalibration();

      mockSessionRepo.getById.mockResolvedValue(success(session));
      mockCalibrationRepo.create.mockResolvedValue(success(calibration));
      mockSessionRepo.update.mockResolvedValue(success(session));

      const result = await useCase.execute(makeInput());

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.id).toBe('cal-1');
        expect(result.value.sessionId).toBe('session-1');
      }
    });

    it('calls calibrationRepository.create with the input', async () => {
      const session = makeSession();
      const calibration = makeCalibration();
      const input = makeInput();

      mockSessionRepo.getById.mockResolvedValue(success(session));
      mockCalibrationRepo.create.mockResolvedValue(success(calibration));
      mockSessionRepo.update.mockResolvedValue(success(session));

      await useCase.execute(input);

      expect(mockCalibrationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
          confidence: 0.95,
          isValid: true,
        }),
      );
    });

    it('updates session calibrationId on success', async () => {
      const session = makeSession();
      const calibration = makeCalibration({ id: 'new-cal' });

      mockSessionRepo.getById.mockResolvedValue(success(session));
      mockCalibrationRepo.create.mockResolvedValue(success(calibration));
      mockSessionRepo.update.mockResolvedValue(success(session));

      await useCase.execute(makeInput());

      expect(mockSessionRepo.update).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({ calibrationId: 'new-cal' }),
      );
    });

    it('tracks CALIBRATION_COMPLETED analytics event', async () => {
      const session = makeSession();
      const calibration = makeCalibration();

      mockSessionRepo.getById.mockResolvedValue(success(session));
      mockCalibrationRepo.create.mockResolvedValue(success(calibration));
      mockSessionRepo.update.mockResolvedValue(success(session));

      await useCase.execute(makeInput());

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: ANALYTICS_CONSTANTS.EVENTS.CALIBRATION_COMPLETED,
          properties: expect.objectContaining({
            sessionId: 'session-1',
            calibrationId: 'cal-1',
          }),
        }),
      );
    });
  });

  describe('error paths', () => {
    it('returns failure when session is not found', async () => {
      mockSessionRepo.getById.mockResolvedValue(
        failure(new NotFoundError('Session not found', 'session')),
      );

      const result = await useCase.execute(makeInput());

      expect(result.isFailure).toBe(true);
      expect(mockCalibrationRepo.create).not.toHaveBeenCalled();
    });

    it('returns failure when calibration creation fails', async () => {
      mockSessionRepo.getById.mockResolvedValue(success(makeSession()));
      mockCalibrationRepo.create.mockResolvedValue(failure(new StorageError('DB error')));

      const result = await useCase.execute(makeInput());

      expect(result.isFailure).toBe(true);
      expect(mockSessionRepo.update).not.toHaveBeenCalled();
      expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
    });

    it('propagates session not found error', async () => {
      const error = new NotFoundError('Session not found', 'session');
      mockSessionRepo.getById.mockResolvedValue(failure(error));

      const result = await useCase.execute(makeInput());

      if (result.isFailure) {
        expect(result.error).toBe(error);
      }
    });
  });
});
