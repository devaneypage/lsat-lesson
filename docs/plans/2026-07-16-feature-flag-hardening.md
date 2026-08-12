# Feature-Flag Hardening Plan

## Overview

The application already has a database-backed feature-flag table, administrator controls, and several boolean consumers. The critical gap is semantic: `rolloutPercentage` is editable and described as controlling the fraction of users who receive a feature, but the public API and client hooks ignore it. The current public endpoint also exposes administrative metadata that ordinary feature consumers do not require.

This change will preserve the existing database schema and flag keys while making percentage rollouts deterministic, stable, and testable. A single subject receives the same decision for a given flag until the rollout configuration changes. Authenticated visitors are assigned by their durable account identifier; anonymous visitors receive a locally persisted random identifier. A disabled flag always evaluates to false, a 0% rollout evaluates to false, and a 100% rollout evaluates to true.

## Architecture

| Layer | Decision |
|---|---|
| Data model | Retain the existing `featureFlags` table. No migration is required because `enabled` and `rolloutPercentage` already contain the necessary control data. |
| Evaluation | Add a shared deterministic hash evaluator that maps `flag key + subject identifier` into one of 100 rollout buckets. |
| Public API | Replace public administrative listing usage with an evaluation procedure that returns only `{ key, enabled }` decisions for the requesting subject. |
| Admin API | Keep metadata and rollout controls in a separate administrator-only listing procedure. Preserve administrator-only mutations. |
| Client identity | Use the authenticated account identifier when available; otherwise generate and persist an anonymous identifier in local storage. |
| Client hooks | Keep the existing `useFeatureFlag` and `useAllFeatureFlags` interfaces, but source their booleans from evaluated decisions and expose error state explicitly. |
| Administration | Retain the current management page and clarify that rollout assignment is deterministic and sticky by visitor identity. |
| Demonstration | Preserve existing real application gates, especially `lesson_grid` and `booking_cta`, as end-to-end examples rather than adding a synthetic demo feature. |

## Implementation Sequence

First, add shared flag types, known keys, bucket hashing, and evaluation functions with unit tests. Second, split the server procedures into public evaluation and administrator-only management views, then adjust mutations to return complete management results. Third, update client hooks to create a stable anonymous identifier, evaluate flags through the new endpoint, and handle loading and error fallback states. Fourth, migrate the administration page to the protected listing endpoint and query-cache invalidation. Finally, verify representative gated routes, administrator authorization, percentage boundaries, stable assignment, type checking, tests, and production build.

## Success Criteria

| Criterion | Verification |
|---|---|
| Kill switches work | Disabled flags always return false, regardless of rollout percentage. |
| Rollouts are real | A partial percentage produces deterministic mixed decisions across many subjects. |
| Assignments are stable | Repeated evaluation for the same subject and flag returns the same result. |
| Public data is minimal | Ordinary visitors receive decisions only, not descriptions or operational timestamps. |
| Admin controls remain secure | Non-admin users cannot list management metadata or mutate flags. |
| Existing consumers remain compatible | Current hooks retain their primary boolean contract and gated routes render without errors. |
| Quality gates pass | Vitest, TypeScript checking, production build, and responsive visual review succeed. |

## Rollback Plan

The work will be saved as a single project checkpoint after verification. If runtime behavior regresses, restore the preceding checkpoint. Because this plan does not alter the database schema or delete flag rows, rollback does not require a database migration or data repair.
