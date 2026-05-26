import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ─── sessions ────────────────────────────────────────────────────────────────

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().notNull(),
  status: text('status').notNull(),
  startedAt: integer('started_at').notNull(),
  endedAt: integer('ended_at'),
  clipCount: integer('clip_count').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ─── clips ───────────────────────────────────────────────────────────────────

export const clips = sqliteTable('clips', {
  id: text('id').primaryKey().notNull(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  duration: real('duration').notNull(),
  fileSize: integer('file_size').notNull(),
  status: text('status').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ─── calibrations ────────────────────────────────────────────────────────────

export const calibrations = sqliteTable('calibrations', {
  id: text('id').primaryKey().notNull(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  /** JSON-serialized [top-left, top-right, bottom-right, bottom-left] corner array */
  cornerPoints: text('corner_points').notNull(),
  /** JSON-serialized 3×3 homography matrix (row-major), nullable until computed */
  homographyMatrix: text('homography_matrix'),
  calibratedAt: integer('calibrated_at').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ─── ai_results ──────────────────────────────────────────────────────────────

export const aiResults = sqliteTable('ai_results', {
  id: text('id').primaryKey().notNull(),
  clipId: text('clip_id')
    .notNull()
    .references(() => clips.id, { onDelete: 'cascade' }),
  /** 'in' | 'out' | 'uncertain' */
  decision: text('decision').notNull(),
  confidence: real('confidence').notNull(),
  /** JSON-serialized { x, y, w, h } bounding box, nullable */
  boundingBox: text('bounding_box'),
  /** JSON-serialized { x, y } normalized court position, nullable */
  courtPosition: text('court_position'),
  processingTime: integer('processing_time').notNull(),
  /** 'pending' | 'processing' | 'completed' | 'failed' */
  status: text('status').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ─── nrt_configs ─────────────────────────────────────────────────────────────

export const nrtConfigs = sqliteTable('nrt_configs', {
  id: text('id').primaryKey().notNull(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  maxFps: integer('max_fps').notNull(),
  /** JSON-serialized { width, height } resolution */
  resolution: text('resolution').notNull(),
  inferenceTimeout: integer('inference_timeout').notNull(),
  /** SQLite boolean: 0 = false, 1 = true */
  enabled: integer('enabled').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
