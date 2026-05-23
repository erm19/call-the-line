import { Session, SessionStatus } from '@domain/entities/Session';
import { SessionDTO } from '../models/SessionDTO';

/**
 * Maps Session DTO to Domain Entity
 */
export const sessionFromDTO = (dto: SessionDTO): Session => {
  return {
    id: dto.id,
    name: dto.name,
    startedAt: dto.started_at,
    endedAt: dto.ended_at,
    status: dto.status as SessionStatus,
    clipIds: dto.clip_ids,
    calibrationId: dto.calibration_id,
    notes: dto.notes,
    location: dto.location,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

/**
 * Maps Session Domain Entity to DTO
 */
export const sessionToDTO = (session: Session): SessionDTO => {
  return {
    id: session.id,
    name: session.name,
    started_at: session.startedAt,
    ended_at: session.endedAt,
    status: session.status,
    clip_ids: session.clipIds,
    calibration_id: session.calibrationId,
    notes: session.notes,
    location: session.location,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
};
