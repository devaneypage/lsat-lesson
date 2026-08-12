# Learner-Support Domain Foundation

## Purpose

This release establishes the durable learner-state and release-control architecture required by the approved learner-support roadmap. It deliberately introduces no learner-facing workflow beyond a conservative authenticated import of existing browser lesson progress.

## Canonical contracts

`shared/learnerDomain.ts` is the source of truth for curriculum lesson and skill identifiers, confidence levels, lesson-progress states, review intervals, mistake categories, accessibility preferences, privacy-safe product-event names and metadata keys, feature releases, and mastery formula versioning.

The curriculum registry preserves the existing seven lesson routes and assigns stable skill identifiers. Application code should reference these shared IDs rather than creating route-specific aliases.

## Durable learner state

Migration `drizzle/0004_aromatic_moondragon.sql` adds ownership-scoped tables for learner profiles, accessibility preferences, lesson progress, question attempts, review items, mistake-journal entries, curriculum skills, skill-mastery snapshots, study plans, study-plan tasks, and privacy-safe product events.

The migration is additive. Existing users, questions, tags, question-tag relationships, feature flags, and learner content are not altered or deleted. The migration was reviewed before execution and the expected tables and indexes were verified after application.

## Server boundaries

The application router now exposes focused boundaries for learner state, preferences, practice, review, search, study plans, and analytics. Every learner-state procedure is protected; repositories require the authenticated numeric user ID and scope reads and writes by ownership.

The learner repository initializes profile and preference defaults, seeds the canonical skill registry, persists lesson progress, and plans conservative legacy imports.

## Legacy browser progress import

The application shell mounts a one-time authenticated import bridge. It reads only recognized legacy lesson-progress keys, normalizes supported values, and sends canonical lesson IDs to the protected learner import procedure.

The server filters unknown lesson IDs, deduplicates repeated browser entries, and inserts only lessons without an existing durable record. Existing server progress is never overwritten. Repeating the import becomes a no-op. Successful completion is recorded locally so the browser does not resubmit on every route.

## Release controls

The following independent feature flags are registered with disabled defaults:

- `learner_dashboard_v2`
- `adaptive_review_queue`
- `question_confidence_tracking`
- `unified_command_search`
- `skill_mastery_map`
- `persistent_study_plans`
- `mistake_journal`
- `accessibility_controls`
- `contextual_orientation`
- `feature_usage_analytics`

These flags permit capability-specific rollout, rollback, and percentage allocation without coupling unrelated releases.

## Verification

The foundation passed all 9 Vitest files and 54 tests, TypeScript validation, and the production build on 2026-07-16. Coverage includes canonical curriculum integrity, controlled vocabularies, release-flag registration, authorization, legacy import canonical filtering, deduplication, overwrite protection, and idempotency.

The saved verification output is available at `docs/plans/2026-07-16-foundation-verification.log`.
