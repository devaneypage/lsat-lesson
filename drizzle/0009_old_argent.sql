CREATE TABLE `questionSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionKey` varchar(64) NOT NULL,
	`status` enum('draft','submitted','needs_revision','approved','rejected','published') NOT NULL DEFAULT 'draft',
	`internalTitle` varchar(180) NOT NULL,
	`questionText` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text NOT NULL,
	`optionD` text NOT NULL,
	`optionE` text,
	`correctAnswer` varchar(1) NOT NULL,
	`explanation` text NOT NULL,
	`category` varchar(128) NOT NULL,
	`difficulty` varchar(64) NOT NULL,
	`source` varchar(256) NOT NULL,
	`rightsConfirmed` int NOT NULL DEFAULT 0,
	`authorNotes` text,
	`reviewNotes` text,
	`authorId` int NOT NULL,
	`reviewerId` int,
	`submittedAt` timestamp,
	`reviewedAt` timestamp,
	`publishedQuestionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionSubmissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionSubmissions_submissionKey_unique` UNIQUE(`submissionKey`)
);
--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_reviewerId_users_id_fk` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_publishedQuestionId_questions_id_fk` FOREIGN KEY (`publishedQuestionId`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `questionSubmissions_status_idx` ON `questionSubmissions` (`status`);--> statement-breakpoint
CREATE INDEX `questionSubmissions_author_idx` ON `questionSubmissions` (`authorId`,`status`);--> statement-breakpoint
CREATE INDEX `questionSubmissions_reviewer_idx` ON `questionSubmissions` (`reviewerId`);--> statement-breakpoint
CREATE INDEX `questionSubmissions_publishedQuestion_idx` ON `questionSubmissions` (`publishedQuestionId`);