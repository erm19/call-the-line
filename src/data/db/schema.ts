import { integer, real, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

// ─── sessions ────────────────────────────────────────────────────────────────

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp_ms' }),
  /** JSON-serialized string[] */
  clipIds: text('clip_ids').notNull().default('[]'),
  calibrationId: text('calibration_id'),
  notes: text('notes'),
  location: text('location'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

// ─── clips ───────────────────────────────────────────────────────────────────

export const clips = sqliteTable(
  'clips',
  {
    id: text('id').primaryKey().notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    videoPath: text('video_path').notNull(),
    duration: real('duration').notNull(),
    recordedAt: integer('recorded_at', { mode: 'timestamp_ms' }).notNull(),
    fileSize: integer('file_size').notNull(),
    /** JSON-serialized {width: number, height: number} */
    resolution: text('resolution').notNull(),
    fps: real('fps').notNull(),
    thumbnailPath: text('thumbnail_path'),
    aiResultId: text('ai_result_id'),
    pointDecisionId: text('point_decision_id'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => ({
    sessionIdIdx: index('clips_session_id_idx').on(table.sessionId),
  }),
);

// ─── calibrations ────────────────────────────────────────────────────────────

export const calibrations = sqliteTable(
  'calibrations',
  {
    id: text('id').primaryKey().notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    /** JSON-serialized [top-left, top-right, bottom-right, bottom-left] corner array */
    cornerPoints: text('corner_points').notNull(),
    /** JSON-serialized {type, points[]}[] court line definitions */
    lines: text('lines').notNull().default('[]'),
    /** JSON-serialized 3×3 homography matrix (row-major), nullable until computed */
    transformationMatrix: text('transformation_matrix'),
    /** JSON-serialized {focalLength?, principalPoint?, distortion?} */
    cameraParams: text('camera_params').notNull().default('{}'),
    confidence: real('confidence').notNull(),
    isValid: integer('is_valid', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => ({
    sessionIdIdx: index('calibrations_session_id_idx').on(table.sessionId),
  }),
);

// ─── ai_results ──────────────────────────────────────────────────────────────

export const aiResults = sqliteTable(
  'ai_results',
  {
    id: text('id').primaryKey().notNull(),
    clipId: text('clip_id')
      .notNull()
      .references(() => clips.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    /** 'in' | 'out' | 'uncertain' — matches PointOutcome enum */
    outcome: text('outcome').notNull(),
    confidence: real('confidence').notNull(),
    /** JSON-serialized TrajectoryPoint[] */
    trajectory: text('trajectory').notNull().default('[]'),
    /** JSON-serialized {frameNumber, point, confidence}[] */
    bounces: text('bounces').notNull().default('[]'),
    primaryBounceIndex: integer('primary_bounce_index').notNull().default(0),
    modelVersion: text('model_version').notNull(),
    processingTimeMs: integer('processing_time_ms').notNull(),
    /** JSON-serialized raw inference output for debugging */
    rawOutput: text('raw_output'),
    error: text('error'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => ({
    clipIdIdx: index('ai_results_clip_id_idx').on(table.clipId),
  }),
);

// ─── nrt_configs ─────────────────────────────────────────────────────────────

export const nrtConfigs = sqliteTable(
  'nrt_configs',
  {
    id: text('id').primaryKey().notNull(),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    mode: text('mode').notNull(),
    targetFps: integer('target_fps').notNull(),
    actualFps: real('actual_fps'),
    /** JSON-serialized {width: number, height: number} */
    resolution: text('resolution').notNull(),
    bufferWindowSeconds: real('buffer_window_seconds').notNull(),
    maxLatencyMs: integer('max_latency_ms').notNull(),
    deviceTier: text('device_tier').notNull(),
    autoAdjustQuality: integer('auto_adjust_quality', { mode: 'boolean' }).notNull().default(true),
    minConfidenceThreshold: real('min_confidence_threshold').notNull(),
    cameraDevice: text('camera_device').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  table => ({
    sessionIdIdx: index('nrt_configs_session_id_idx').on(table.sessionId),
  }),
);
