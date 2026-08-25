CREATE TABLE `errorLogEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`questionType` varchar(64) NOT NULL,
	`errorReason` varchar(128),
	`notes` text,
	`source` varchar(255),
	`confidence` int NOT NULL DEFAULT 1,
	`resolved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `errorLogEntries_id` PRIMARY KEY(`id`)
);
