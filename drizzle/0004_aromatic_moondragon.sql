CREATE TABLE `curriculumSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skillId` varchar(64) NOT NULL,
	`title` varchar(160) NOT NULL,
	`section` enum('LR','RC','Logic') NOT NULL,
	`description` text NOT NULL,
	`prerequisites` json NOT NULL,
	`registryVersion` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `curriculumSkills_id` PRIMARY KEY(`id`),
	CONSTRAINT `curriculumSkills_skillId_unique` UNIQUE(`skillId`)
);
--> statement-breakpoint
CREATE TABLE `learnerPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`textScale` enum('default','large','extra_large') NOT NULL DEFAULT 'default',
	`readingWidth` enum('comfortable','wide','full') NOT NULL DEFAULT 'comfortable',
	`contrast` enum('default','high') NOT NULL DEFAULT 'default',
	`motion` enum('system','reduced') NOT NULL DEFAULT 'system',
	`passageFocus` enum('off','on') NOT NULL DEFAULT 'off',
	`keyboardShortcuts` enum('off','on') NOT NULL DEFAULT 'on',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learnerPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `learnerPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `learnerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`targetTestDate` timestamp,
	`weeklyStudyMinutes` int NOT NULL DEFAULT 300,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learnerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `learnerProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `lessonProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` varchar(64) NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`step` int NOT NULL DEFAULT 0,
	`percentComplete` int NOT NULL DEFAULT 0,
	`source` enum('server','legacy_import') NOT NULL DEFAULT 'server',
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessonProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `lessonProgress_user_lesson_unique` UNIQUE(`userId`,`lessonId`)
);
--> statement-breakpoint
CREATE TABLE `mistakeJournalEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`attemptId` int,
	`category` enum('misread_stem','missed_conclusion','conditional_logic','causal_reasoning','scope_shift','quantifier_error','unsupported_inference','attractive_distractor','timing_pressure','other') NOT NULL,
	`temptingAnswer` varchar(1),
	`missedClue` text,
	`correctiveRule` text,
	`privateNotes` text,
	`archivedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mistakeJournalEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`anonymousId` varchar(64),
	`eventName` varchar(64) NOT NULL,
	`route` varchar(255),
	`metadata` json NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `productEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`idempotencyKey` varchar(64) NOT NULL,
	`selectedAnswer` varchar(1) NOT NULL,
	`isCorrect` int NOT NULL,
	`confidence` enum('certain','unsure','guessed') NOT NULL,
	`activeTimeMs` int NOT NULL,
	`context` enum('practice','review','lesson','diagnostic') NOT NULL DEFAULT 'practice',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionAttempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionAttempts_user_idempotency_unique` UNIQUE(`userId`,`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `questionSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`skillId` varchar(64) NOT NULL,
	`weight` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionSkills_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionSkills_question_skill_unique` UNIQUE(`questionId`,`skillId`)
);
--> statement-breakpoint
CREATE TABLE `reviewItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`stage` int NOT NULL DEFAULT 0,
	`status` enum('active','mastered','snoozed','archived') NOT NULL DEFAULT 'active',
	`dueAt` timestamp NOT NULL,
	`snoozedUntil` timestamp,
	`lastAttemptId` int,
	`reason` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviewItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviewItems_user_question_unique` UNIQUE(`userId`,`questionId`)
);
--> statement-breakpoint
CREATE TABLE `skillMasterySnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillId` varchar(64) NOT NULL,
	`score` int NOT NULL,
	`evidenceCount` int NOT NULL,
	`confidence` enum('insufficient','emerging','developing','established') NOT NULL,
	`formulaVersion` int NOT NULL DEFAULT 1,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skillMasterySnapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `skillMastery_user_skill_version_unique` UNIQUE(`userId`,`skillId`,`formulaVersion`)
);
--> statement-breakpoint
CREATE TABLE `studyPlanTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`itemType` enum('lesson','practice','review','reflection') NOT NULL,
	`lessonId` varchar(64),
	`skillId` varchar(64),
	`dueAt` timestamp,
	`position` int NOT NULL DEFAULT 0,
	`status` enum('pending','completed','skipped') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studyPlanTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studyPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`title` varchar(160) NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`targetTestDate` timestamp,
	`weeklyStudyMinutes` int NOT NULL,
	`rationale` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studyPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `studyPlans_user_version_unique` UNIQUE(`userId`,`version`)
);
--> statement-breakpoint
CREATE INDEX `lessonProgress_user_status_idx` ON `lessonProgress` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `mistakeJournal_user_created_idx` ON `mistakeJournalEntries` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `mistakeJournal_user_question_idx` ON `mistakeJournalEntries` (`userId`,`questionId`);--> statement-breakpoint
CREATE INDEX `productEvents_name_occurred_idx` ON `productEvents` (`eventName`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `productEvents_expiry_idx` ON `productEvents` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `questionAttempts_user_submitted_idx` ON `questionAttempts` (`userId`,`submittedAt`);--> statement-breakpoint
CREATE INDEX `questionAttempts_question_idx` ON `questionAttempts` (`questionId`);--> statement-breakpoint
CREATE INDEX `questionSkills_skill_idx` ON `questionSkills` (`skillId`);--> statement-breakpoint
CREATE INDEX `reviewItems_user_due_idx` ON `reviewItems` (`userId`,`dueAt`);--> statement-breakpoint
CREATE INDEX `skillMastery_user_score_idx` ON `skillMasterySnapshots` (`userId`,`score`);--> statement-breakpoint
CREATE INDEX `studyPlanTasks_plan_position_idx` ON `studyPlanTasks` (`planId`,`position`);--> statement-breakpoint
CREATE INDEX `studyPlanTasks_user_status_due_idx` ON `studyPlanTasks` (`userId`,`status`,`dueAt`);--> statement-breakpoint
CREATE INDEX `studyPlans_user_status_idx` ON `studyPlans` (`userId`,`status`);