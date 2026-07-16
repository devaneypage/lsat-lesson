# Feature Flags

## Purpose

Feature flags separate deployment from release. The application stores flag configuration in the `featureFlags` database table, evaluates each flag on the server, and returns only boolean decisions to ordinary clients. Operational metadata and mutations are restricted to administrators at `/admin/flags`.

## Evaluation Semantics

A flag is enabled for a visitor only when both conditions are satisfied: the global `enabled` control is on, and the visitor's deterministic rollout bucket is below `rolloutPercentage`. Buckets range from 0 through 99 and are derived from the flag key plus a stable subject identifier.

Authenticated visitors use their account `openId` as the stable subject. Anonymous visitors use a random identifier persisted in browser local storage. Consequently, repeated visits from the same browser or account receive the same decision for a fixed flag configuration. Clearing browser storage creates a new anonymous identity; signing in switches evaluation to the account identity.

| Configuration | Result |
|---|---|
| Disabled at any percentage | Off for everyone |
| Enabled at 0% | Off for everyone |
| Enabled between 1% and 99% | On for the deterministic fraction assigned below the configured threshold |
| Enabled at 100% | On for everyone |
| Missing or failed flag data | Client consumers fail closed and treat the feature as off |

## Flag Registry

The database seeds missing registry entries with the following defaults. Administrators may change enabled state and rollout percentage without redeploying the application.

| Key | Default | Rollout | Primary capability |
|---|---:|---:|---|
| `lesson_progress_bar` | On | 100% | Lesson reading progress indicator |
| `assumption_family_arc_cta` | On | 100% | Cross-lesson continuation prompt |
| `about_testimonials` | On | 100% | About-page learner feedback section |
| `ai_lesson_plan_generator` | Off | 0% | AI-assisted lesson-plan generation |
| `question_bank` | Off | 0% | Question-bank workspace |
| `nexus_dashboard` | On | 100% | Nexus dashboard |
| `booking_cta` | On | 100% | Booking entry points |
| `lesson_grid` | On | 100% | Nexus lesson-grid experience |
| `concept_map` | On | 100% | Interactive concept map |
| `score_card` | On | 100% | Readiness score card |

The typed key registry lives in `shared/featureFlags.ts`. New consumers should import `FeatureFlagKey` or use `useFeatureFlag` from `client/src/lib/flags.ts`; they should not define ad hoc key strings outside the registry.

## Safe Rollout Workflow

For a new or materially changed capability, begin with the global control disabled and a 0% rollout. After verifying the hidden state, enable the flag at a small percentage and test the relevant route with an authorized account. Increase the percentage in deliberate steps only after checking application errors and the complete user path. A percentage increase preserves existing bucket assignments and adds subjects below the new threshold.

If a release causes a regression, turn the global flag off. This kill switch overrides the rollout percentage immediately at the server. Browser clients cache evaluated decisions for up to 60 seconds; the administrator's current client invalidates its evaluation cache after a management change.

## Adding a Flag

Add the key to `FEATURE_FLAG_KEYS` in `shared/featureFlags.ts`, add matching seed metadata to `DEFAULT_FLAGS` in `server/db.ts`, and gate the client capability with `useFeatureFlag`. Add evaluator or router coverage for any new behavior. Use a disabled, 0% default unless immediate universal release is intentional and independently verified.
