CREATE TABLE `questionCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionCategories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `questionDifficulties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`description` text,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionDifficulties_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionDifficulties_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `questionSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionSources_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionSources_name_unique` UNIQUE(`name`)
);
