CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`confirmed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guests_normalized_name_unique` ON `guests` (`normalized_name`);