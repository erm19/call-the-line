import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import type { DbClient } from '../../db/client';
import { sessions } from '../../db/schema';
import { SessionDTO } from '../../models/SessionDTO';
import { SessionStatus } from '@domain/entities/Session';

type SessionRow = typeof sessions.$inferSelect;

const isSessionStatus = (value: string): value is SessionStatus =>
  Object.values(SessionStatus).includes(value as SessionStatus);

const parseClipIds = (raw: string): string[] => {
  try {
    return z.array(z.string()).parse(JSON.parse(raw));
  } catch {
    return [];
  }
};

const rowToDTO = (row: SessionRow): SessionDTO => ({
  id: row.id,
  name: row.name,
  started_at: row.startedAt.toISOString(),
  ended_at: row.endedAt ? row.endedAt.toISOString() : null,
  status: isSessionStatus(row.status) ? row.status : SessionStatus.Active,
  clip_ids: parseClipIds(row.clipIds),
  calibration_id: row.calibrationId ?? null,
  notes: row.notes ?? undefined,
  location: row.location ?? undefined,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});

const dtoToInsert = (dto: SessionDTO): typeof sessions.$inferInsert => ({
  id: dto.id,
  name: dto.name,
  startedAt: new Date(dto.started_at),
  endedAt: dto.ended_at ? new Date(dto.ended_at) : null,
  status: dto.status,
  clipIds: JSON.stringify(dto.clip_ids),
  calibrationId: dto.calibration_id ?? null,
  notes: dto.notes ?? null,
  location: dto.location ?? null,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

const partialDtoToSet = (updates: Partial<SessionDTO>): Partial<typeof sessions.$inferInsert> => {
  const set: Partial<typeof sessions.$inferInsert> = {};
  set.updatedAt = new Date();
  if (updates.name !== undefined) set.name = updates.name;
  if (updates.started_at !== undefined) set.startedAt = new Date(updates.started_at);
  if (updates.ended_at !== undefined)
    set.endedAt = updates.ended_at ? new Date(updates.ended_at) : null;
  if (updates.status !== undefined) set.status = updates.status;
  if (updates.clip_ids !== undefined) set.clipIds = JSON.stringify(updates.clip_ids);
  if (updates.calibration_id !== undefined) set.calibrationId = updates.calibration_id ?? null;
  if (updates.notes !== undefined) set.notes = updates.notes ?? null;
  if (updates.location !== undefined) set.location = updates.location ?? null;
  return set;
};

export class SessionLocalDataSource {
  constructor(private readonly db: DbClient) {}

  async create(session: SessionDTO): Promise<SessionDTO> {
    const rows = await this.db.insert(sessions).values(dtoToInsert(session)).returning();
    if (!rows.length) return session;
    return rowToDTO(rows[0]);
  }

  async getById(id: string): Promise<SessionDTO | null> {
    const rows = await this.db.select().from(sessions).where(eq(sessions.id, id));
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rowToDTO(rows[0]);
  }

  async getAll(): Promise<SessionDTO[]> {
    const rows = await this.db.select().from(sessions).orderBy(desc(sessions.createdAt));
    if (!Array.isArray(rows)) return [];
    return rows.map(rowToDTO);
  }

  async update(id: string, updates: Partial<SessionDTO>): Promise<SessionDTO | null> {
    const rows = await this.db
      .update(sessions)
      .set(partialDtoToSet(updates))
      .where(eq(sessions.id, id))
      .returning();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rowToDTO(rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(sessions).where(eq(sessions.id, id)).returning();
    return Array.isArray(rows) && rows.length > 0;
  }
}
