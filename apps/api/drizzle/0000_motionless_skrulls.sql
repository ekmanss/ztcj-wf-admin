CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`first_name` varchar(120) NOT NULL,
	`last_name` varchar(120) NOT NULL,
	`username` varchar(120) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone_number` varchar(64) NOT NULL,
	`status` enum('active','inactive','invited','suspended') NOT NULL DEFAULT 'invited',
	`role` enum('superadmin','admin','cashier','manager') NOT NULL DEFAULT 'cashier',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
