import { sessionFromDTO, sessionToDTO } from '@data/mappers/sessionMapper';
import { Session, SessionStatus } from '@domain/entities/Session';
import { SessionDTO } from '@data/models/SessionDTO';

describe('sessionMapper', () => {
  const mockDTO: SessionDTO = {
    id: 'session-1',
    name: 'Test Session',
    started_at: '2025-01-01T00:00:00.000Z',
    ended_at: null,
    status: 'active',
    clip_ids: ['clip-1', 'clip-2'],
    calibration_id: 'cal-1',
    notes: 'Test notes',
    location: 'Test Court',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  };

  const mockEntity: Session = {
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

  describe('sessionFromDTO', () => {
    it('should map DTO to domain entity correctly', () => {
      const result = sessionFromDTO(mockDTO);
      expect(result).toEqual(mockEntity);
    });

    it('should handle null values', () => {
      const dtoWithNulls: SessionDTO = {
        ...mockDTO,
        ended_at: null,
        calibration_id: null,
        notes: undefined,
        location: undefined,
      };

      const result = sessionFromDTO(dtoWithNulls);
      expect(result.endedAt).toBeNull();
      expect(result.calibrationId).toBeNull();
    });
  });

  describe('sessionToDTO', () => {
    it('should map domain entity to DTO correctly', () => {
      const result = sessionToDTO(mockEntity);
      expect(result).toEqual(mockDTO);
    });
  });
});

