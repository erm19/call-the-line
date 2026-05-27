import { RecordClip, RecordClipInput } from '@domain/useCases/RecordClip';
import { IClipRepository } from '@domain/repositories/ClipRepository';
import { ISessionRepository } from '@domain/repositories/SessionRepository';
import { IAnalyticsService } from '@core/analytics/AnalyticsService';
import { ANALYTICS_CONSTANTS } from '@core/config/constants';
import { Clip } from '@domain/entities/Clip';
import { Session, SessionStatus } from '@domain/entities/Session';
import { success, failure } from '@core/utils/result';
import { StorageError, NotFoundError, ValidationError } from '@core/errors/AppError';

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session-1',
  name: 'Tennis Session',
  startedAt: '2025-01-01T00:00:00.000Z',
  endedAt: null,
  status: SessionStatus.Active,
  clipIds: [],
  calibrationId: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const makeClip = (overrides: Partial<Clip> = {}): Clip => ({
  id: 'clip-1',
  sessionId: 'session-1',
  videoPath: '/recordings/video.mp4',
  duration: 10,
  recordedAt: '2025-01-01T00:05:00.000Z',
  fileSize: 1024 * 1024 * 5,
  resolution: { width: 1280, height: 720 },
  fps: 60,
  createdAt: '2025-01-01T00:05:00.000Z',
  updatedAt: '2025-01-01T00:05:00.000Z',
  ...overrides,
});

const makeInput = (overrides: Partial<RecordClipInput> = {}): RecordClipInput => ({
  sessionId: 'session-1',
  videoPath: '/recordings/video.mp4',
  duration: 10,
  fileSize: 1024 * 1024 * 5,
  resolution: { width: 1280, height: 720 },
  fps: 60,
  ...overrides,
});

const makeMockClipRepository = (): jest.Mocked<IClipRepository> => ({
  create: jest.fn(),
  getById: jest.fn(),
  getBySessionId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteBySessionId: jest.fn(),
});

const makeMockSessionRepository = (): jest.Mocked<ISessionRepository> => ({
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

describe('RecordClip', () => {
  let recordClip: RecordClip;
  let mockClipRepository: jest.Mocked<IClipRepository>;
  let mockSessionRepository: jest.Mocked<ISessionRepository>;
  let mockAnalytics: jest.Mocked<IAnalyticsService>;

  beforeEach(() => {
    mockClipRepository = makeMockClipRepository();
    mockSessionRepository = makeMockSessionRepository();
    mockAnalytics = makeMockAnalytics();
    recordClip = new RecordClip(mockClipRepository, mockSessionRepository, mockAnalytics);
  });

  describe('happy path', () => {
    it('should persist a clip and return it on success', async () => {
      const session = makeSession();
      const clip = makeClip();

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(success(clip));
      mockSessionRepository.update.mockResolvedValue(success(session));

      const result = await recordClip.execute(makeInput());

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual(clip);
      }
    });

    it('should call clip repository create with correct data', async () => {
      const session = makeSession();
      const clip = makeClip();
      const input = makeInput({ thumbnailPath: '/thumb.jpg' });

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(success(clip));
      mockSessionRepository.update.mockResolvedValue(success(session));

      await recordClip.execute(input);

      expect(mockClipRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
          videoPath: '/recordings/video.mp4',
          duration: 10,
          fileSize: 1024 * 1024 * 5,
          fps: 60,
          resolution: { width: 1280, height: 720 },
          thumbnailPath: '/thumb.jpg',
        }),
      );
    });

    it('should update session clipIds with the new clip id', async () => {
      const session = makeSession({ clipIds: ['existing-clip'] });
      const clip = makeClip({ id: 'new-clip' });

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(success(clip));
      mockSessionRepository.update.mockResolvedValue(success(session));

      await recordClip.execute(makeInput());

      expect(mockSessionRepository.update).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({
          clipIds: ['existing-clip', 'new-clip'],
        }),
      );
    });

    it('should track CLIP_RECORDED analytics event on success', async () => {
      const session = makeSession();
      const clip = makeClip();

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(success(clip));
      mockSessionRepository.update.mockResolvedValue(success(session));

      await recordClip.execute(makeInput());

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ name: ANALYTICS_CONSTANTS.EVENTS.CLIP_RECORDED }),
      );
    });

    it('should include sessionId, clipId, duration, fps and resolution in analytics', async () => {
      const session = makeSession();
      const clip = makeClip({ id: 'clip-42' });

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(success(clip));
      mockSessionRepository.update.mockResolvedValue(success(session));

      await recordClip.execute(makeInput());

      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            sessionId: 'session-1',
            clipId: 'clip-42',
            duration: 10,
            fps: 60,
            resolution: '1280x720',
          }),
        }),
      );
    });
  });

  describe('error path', () => {
    it('should return failure when session is not found', async () => {
      mockSessionRepository.getById.mockResolvedValue(
        failure(new NotFoundError('Session not found')),
      );

      const result = await recordClip.execute(makeInput());

      expect(result.isFailure).toBe(true);
      expect(mockClipRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate session repository failure error', async () => {
      const notFoundError = new NotFoundError('Session not found');
      mockSessionRepository.getById.mockResolvedValue(failure(notFoundError));

      const result = await recordClip.execute(makeInput());

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(notFoundError);
      }
    });

    it('should return failure when clip repository create fails', async () => {
      const session = makeSession();
      const storageError = new StorageError('DB write failed');

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(failure(storageError));

      const result = await recordClip.execute(makeInput());

      expect(result.isFailure).toBe(true);
    });

    it('should propagate clip repository failure error', async () => {
      const session = makeSession();
      const storageError = new StorageError('DB write failed');

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(failure(storageError));

      const result = await recordClip.execute(makeInput());

      if (result.isFailure) {
        expect(result.error).toBe(storageError);
      }
    });

    it('should not track analytics when clip repository create fails', async () => {
      const session = makeSession();
      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(failure(new StorageError('DB write failed')));

      await recordClip.execute(makeInput());

      expect(mockAnalytics.trackEvent).not.toHaveBeenCalled();
    });

    it('should not update session when clip repository create fails', async () => {
      const session = makeSession();
      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(failure(new StorageError('DB write failed')));

      await recordClip.execute(makeInput());

      expect(mockSessionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('input handling', () => {
    it('should pass recordedAt as an ISO string when creating the clip', async () => {
      const session = makeSession();
      const clip = makeClip();

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(success(clip));
      mockSessionRepository.update.mockResolvedValue(success(session));

      await recordClip.execute(makeInput());

      expect(mockClipRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recordedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        }),
      );
    });

    it('should handle optional thumbnailPath being absent', async () => {
      const session = makeSession();
      const clip = makeClip({ thumbnailPath: undefined });
      const input = makeInput();

      mockSessionRepository.getById.mockResolvedValue(success(session));
      mockClipRepository.create.mockResolvedValue(success(clip));
      mockSessionRepository.update.mockResolvedValue(success(session));

      const result = await recordClip.execute(input);

      expect(result.isSuccess).toBe(true);
    });

    it('should reject when sessionId is empty string', async () => {
      mockSessionRepository.getById.mockResolvedValue(
        failure(new ValidationError('Session ID is required', 'sessionId')),
      );

      const result = await recordClip.execute(makeInput({ sessionId: '' }));

      expect(result.isFailure).toBe(true);
    });
  });
});
