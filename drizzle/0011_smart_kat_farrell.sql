CREATE TABLE `questionCurriculumMappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`lessonId` varchar(64) NOT NULL,
	`module` varchar(32) NOT NULL,
	`topic` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionCurriculumMappings_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionCurriculumMappings_question_lesson_unique` UNIQUE(`questionId`,`lessonId`)
);
--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD `lessonId` varchar(64);--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD `module` varchar(32);--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD `topic` varchar(128);--> statement-breakpoint
ALTER TABLE `questionCurriculumMappings` ADD CONSTRAINT `questionCurriculumMappings_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `questionCurriculumMappings_lesson_idx` ON `questionCurriculumMappings` (`lessonId`);--> statement-breakpoint
CREATE INDEX `questionCurriculumMappings_module_topic_idx` ON `questionCurriculumMappings` (`module`,`topic`);--> statement-breakpoint
CREATE INDEX `questionSubmissions_lesson_idx` ON `questionSubmissions` (`lessonId`);