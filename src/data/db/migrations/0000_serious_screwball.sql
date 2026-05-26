CREATE TABLE `ai_results` (
	`id` text PRIMARY KEY NOT NULL,
	`clip_id` text NOT NULL,
	`decision` text NOT NULL,
	`confidence` real NOT NULL,
	`bounding_box` text,
	`court_position` text,
	`processing_time` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`clip_id`) REFERENCES `clips`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `calibrations` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`corner_points` text NOT NULL,
	`homography_matrix` text,
	`calibrated_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clips` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`file_path` text NOT NULL,
	`duration` real NOT NULL,
	`file_size` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nrt_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`max_fps` integer NOT NULL,
	`resolution` text NOT NULL,
	`inference_timeout` integer NOT NULL,
	`enabled` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`clip_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
