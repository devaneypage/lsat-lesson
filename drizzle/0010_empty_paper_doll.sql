CREATE TABLE `questionSubmissionSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`skillId` varchar(64) NOT NULL,
	`weight` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionSubmissionSkills_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionSubmissionSkills_submission_skill_unique` UNIQUE(`submissionId`,`skillId`)
);
--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD `assignedReviewerId` int;--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD `editorialDueAt` timestamp;--> statement-breakpoint
ALTER TABLE `questionSubmissionSkills` ADD CONSTRAINT `questionSubmissionSkills_submissionId_questionSubmissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `questionSubmissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `questionSubmissionSkills_skill_idx` ON `questionSubmissionSkills` (`skillId`);--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_assignedReviewerId_users_id_fk` FOREIGN KEY (`assignedReviewerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `questionSubmissions_assignedReviewer_idx` ON `questionSubmissions` (`assignedReviewerId`,`status`);--> statement-breakpoint
CREATE INDEX `questionSubmissions_due_idx` ON `questionSubmissions` (`editorialDueAt`);