import { eq } from 'drizzle-orm';
import type { DbClient } from '../../db/client';
import { calibrations } from '../../db/schema';
import { CalibrationDTO } from '../../models/CalibrationDTO';

type CalibrationRow = typeof calibrations.$inferSelect;

const rowToDTO = (row: CalibrationRow): CalibrationDTO => ({
  id: row.id,
  session_id: row.sessionId,
  corner_points: JSON.parse(row.cornerPoints),
  lines: JSON.parse(row.lines),
  transformation_matrix: row.transformationMatrix ? JSON.parse(row.transformationMatrix) : [],
  camera_params: JSON.parse(row.cameraParams),
  confidence: row.confidence,
  is_valid: row.isValid,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});

const dtoToInsert = (dto: CalibrationDTO): typeof calibrations.$inferInsert => ({
  id: dto.id,
  sessionId: dto.session_id,
  cornerPoints: JSON.stringify(dto.corner_points),
  lines: JSON.stringify(dto.lines),
  transformationMatrix: JSON.stringify(dto.transformation_matrix),
  cameraParams: JSON.stringify(dto.camera_params),
  confidence: dto.confidence,
  isValid: dto.is_valid,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

const partialDtoToSet = (
  updates: Partial<CalibrationDTO>,
): Partial<typeof calibrations.$inferInsert> => {
  const set: Partial<typeof calibrations.$inferInsert> = {};
  set.updatedAt = new Date();
  if (updates.session_id !== undefined) set.sessionId = updates.session_id;
  if (updates.corner_points !== undefined)
    set.cornerPoints = JSON.stringify(updates.corner_points);
  if (updates.lines !== undefined) set.lines = JSON.stringify(updates.lines);
  if (updates.transformation_matrix !== undefined)
    set.transformationMatrix = JSON.stringify(updates.transformation_matrix);
  if (updates.camera_params !== undefined)
    set.cameraParams = JSON.stringify(updates.camera_params);
  if (updates.confidence !== undefined) set.confidence = updates.confidence;
  if (updates.is_valid !== undefined) set.isValid = updates.is_valid;
  return set;
};

export class CalibrationLocalDataSource {
  constructor(private readonly db: DbClient) {}

  async create(calibration: CalibrationDTO): Promise<CalibrationDTO> {
    const rows = await this.db
      .insert(calibrations)
      .values(dtoToInsert(calibration))
      .returning();
    if (!rows.length) return calibration;
    return rowToDTO(rows[0]);
  }

  async getById(id: string): Promise<CalibrationDTO | null> {
    const rows = await this.db.select().from(calibrations).where(eq(calibrations.id, id));
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rowToDTO(rows[0]);
  }

  async getAll(): Promise<CalibrationDTO[]> {
    const rows = await this.db.select().from(calibrations);
    if (!Array.isArray(rows)) return [];
    return rows.map(rowToDTO);
  }

  async getBySessionId(sessionId: string): Promise<CalibrationDTO | null> {
    const rows = await this.db
      .select()
      .from(calibrations)
      .where(eq(calibrations.sessionId, sessionId));
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rowToDTO(rows[0]);
  }

  async update(id: string, updates: Partial<CalibrationDTO>): Promise<CalibrationDTO | null> {
    const rows = await this.db
      .update(calibrations)
      .set(partialDtoToSet(updates))
      .where(eq(calibrations.id, id))
      .returning();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rowToDTO(rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(calibrations).where(eq(calibrations.id, id)).returning();
    return Array.isArray(rows) && rows.length > 0;
  }
}
