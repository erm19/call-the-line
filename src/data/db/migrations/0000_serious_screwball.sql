CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`clip_ids` text NOT NULL DEFAULT '[]',
	`calibration_id` text,
	`notes` text,
	`location` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clips` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`video_path` text NOT NULL,
	`duration` real NOT NULL,
	`recorded_at` integer NOT NULL,
	`file_size` integer NOT NULL,
	`resolution` text NOT NULL,
	`fps` real NOT NULL,
	`thumbnail_path` text,
	`ai_result_id` text,
	`point_decision_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `calibrations` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`corner_points` text NOT NULL,
	`lines` text NOT NULL DEFAULT '[]',
	`transformation_matrix` text,
	`camera_params` text NOT NULL DEFAULT '{}',
	`confidence` real NOT NULL,
	`is_valid` integer NOT NULL DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_results` (
	`id` text PRIMARY KEY NOT NULL,
	`clip_id` text NOT NULL,
	`status` text NOT NULL,
	`outcome` text NOT NULL,
	`confidence` real NOT NULL,
	`trajectory` text NOT NULL DEFAULT '[]',
	`bounces` text NOT NULL DEFAULT '[]',
	`primary_bounce_index` integer NOT NULL DEFAULT 0,
	`model_version` text NOT NULL,
	`processing_time_ms` integer NOT NULL,
	`raw_output` text,
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`clip_id`) REFERENCES `clips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `nrt_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`enabled` integer NOT NULL DEFAULT true,
	`mode` text NOT NULL,
	`target_fps` integer NOT NULL,
	`actual_fps` real,
	`resolution` text NOT NULL,
	`buffer_window_seconds` real NOT NULL,
	`max_latency_ms` integer NOT NULL,
	`device_tier` text NOT NULL,
	`auto_adjust_quality` integer NOT NULL DEFAULT true,
	`min_confidence_threshold` real NOT NULL,
	`camera_device` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `clips_session_id_idx` ON `clips` (`session_id`);
--> statement-breakpoint
CREATE INDEX `calibrations_session_id_idx` ON `calibrations` (`session_id`);
--> statement-breakpoint
CREATE INDEX `ai_results_clip_id_idx` ON `ai_results` (`clip_id`);
--> statement-breakpoint
CREATE INDEX `nrt_configs_session_id_idx` ON `nrt_configs` (`session_id`);
--> statement-breakpoint
PRAGMA foreign_keys = ON;
