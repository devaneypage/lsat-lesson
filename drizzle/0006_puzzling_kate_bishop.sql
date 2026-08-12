ALTER TABLE `questions` ADD `categoryId` int;--> statement-breakpoint
ALTER TABLE `questions` ADD `difficultyId` int;--> statement-breakpoint
ALTER TABLE `questions` ADD `sourceId` int;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_categoryId_questionCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `questionCategories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_difficultyId_questionDifficulties_id_fk` FOREIGN KEY (`difficultyId`) REFERENCES `questionDifficulties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_sourceId_questionSources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `questionSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `questions_categoryId_idx` ON `questions` (`categoryId`);--> statement-breakpoint
CREATE INDEX `questions_difficultyId_idx` ON `questions` (`difficultyId`);--> statement-breakpoint
CREATE INDEX `questions_sourceId_idx` ON `questions` (`sourceId`);--> statement-breakpoint
ALTER TABLE `questions` DROP COLUMN `category`;--> statement-breakpoint
ALTER TABLE `questions` DROP COLUMN `difficulty`;--> statement-breakpoint
ALTER TABLE `questions` DROP COLUMN `source`;