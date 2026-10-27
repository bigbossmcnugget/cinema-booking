CREATE TABLE `booking_seats` (
	`booking_id` text NOT NULL,
	`showtime_key` text NOT NULL,
	`seat` text NOT NULL,
	PRIMARY KEY(`booking_id`, `seat`),
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_seats_showtime_seat_unique` ON `booking_seats` (`showtime_key`,`seat`);--> statement-breakpoint
CREATE INDEX `idx_booking_seats_showtime` ON `booking_seats` (`showtime_key`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`showtime_key` text NOT NULL,
	`movie_title` text NOT NULL,
	`city` text NOT NULL,
	`show_date` text NOT NULL,
	`show_time` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_reference_unique` ON `bookings` (`reference`);--> statement-breakpoint
CREATE INDEX `idx_bookings_email_created` ON `bookings` (`customer_email`,`created_at`);