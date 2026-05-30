import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import type { DbClient } from '../../db/client';
import { clips } from '../../db/schema';
import { ClipDTO } from '../../models/ClipDTO';

type ClipRow = typeof clips.$inferSelect;

const resolutionSchema = z.object({ width: z.number(), height: z.number() });

const parseResolution = (raw: string): { width: number; height: number } => {
  const result = resolutionSchema.safeParse(JSON.parse(raw));
  if (!result.success) {
    throw new Error(`Malformed resolution in clip record: ${raw}`);
  }
  return result.data;
};

const rowToDTO = (row: ClipRow): ClipDTO => ({
  id: row.id,
  session_id: row.sessionId,
  video_path: row.videoPath,
  duration: row.duration,
  recorded_at: row.recordedAt.toISOString(),
  file_size: row.fileSize,
  resolution: parseResolution(row.resolution),
  fps: row.fps,
  thumbnail_path: row.thumbnailPath ?? undefined,
  ai_result_id: row.aiResultId ?? undefined,
  point_decision_id: row.pointDecisionId ?? undefined,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});

const dtoToInsert = (dto: ClipDTO): typeof clips.$inferInsert => ({
  id: dto.id,
  sessionId: dto.session_id,
  videoPath: dto.video_path,
  duration: dto.duration,
  recordedAt: new Date(dto.recorded_at),
  fileSize: dto.file_size,
  resolution: JSON.stringify(dto.resolution),
  fps: dto.fps,
  thumbnailPath: dto.thumbnail_path ?? null,
  aiResultId: dto.ai_result_id ?? null,
  pointDecisionId: dto.point_decision_id ?? null,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

const partialDtoToSet = (updates: Partial<ClipDTO>): Partial<typeof clips.$inferInsert> => {
  const set: Partial<typeof clips.$inferInsert> = {};
  set.updatedAt = new Date();
  if (updates.video_path !== undefined) set.videoPath = updates.video_path;
  if (updates.duration !== undefined) set.duration = updates.duration;
  if (updates.recorded_at !== undefined) set.recordedAt = new Date(updates.recorded_at);
  if (updates.file_size !== undefined) set.fileSize = updates.file_size;
  if (updates.resolution !== undefined) set.resolution = JSON.stringify(updates.resolution);
  if (updates.fps !== undefined) set.fps = updates.fps;
  if (updates.thumbnail_path !== undefined) set.thumbnailPath = updates.thumbnail_path ?? null;
  if (updates.ai_result_id !== undefined) set.aiResultId = updates.ai_result_id ?? null;
  if (updates.point_decision_id !== undefined)
    set.pointDecisionId = updates.point_decision_id ?? null;
  return set;
};

export class ClipLocalDataSource {
  constructor(private readonly db: DbClient) {}

  async create(clip: ClipDTO): Promise<ClipDTO> {
    const rows = await this.db.insert(clips).values(dtoToInsert(clip)).returning();
    if (!rows.length) throw new Error('Clip insert returned no rows');
    return rowToDTO(rows[0]);
  }

  async getById(id: string): Promise<ClipDTO | null> {
    const rows = await this.db.select().from(clips).where(eq(clips.id, id));
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rowToDTO(rows[0]);
  }

  async getAll(): Promise<ClipDTO[]> {
    const rows = await this.db.select().from(clips).orderBy(desc(clips.createdAt));
    if (!Array.isArray(rows)) return [];
    return rows.map(rowToDTO);
  }

  async getBySessionId(sessionId: string): Promise<ClipDTO[]> {
    const rows = await this.db.select().from(clips).where(eq(clips.sessionId, sessionId));
    if (!Array.isArray(rows)) return [];
    return rows.map(rowToDTO);
  }

  async update(id: string, updates: Partial<ClipDTO>): Promise<ClipDTO | null> {
    const rows = await this.db
      .update(clips)
      .set(partialDtoToSet(updates))
      .where(eq(clips.id, id))
      .returning();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rowToDTO(rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(clips).where(eq(clips.id, id)).returning();
    return Array.isArray(rows) && rows.length > 0;
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await this.db.delete(clips).where(eq(clips.sessionId, sessionId));
  }
}
