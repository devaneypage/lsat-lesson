# Learner Dashboard and Content Strategy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure the learner dashboard derives its action and contextual evidence from one server-authoritative Continue Learning contract, extend orientation coverage to every learner surface, and produce reusable strategy collateral for the public-resource rollout.

**Architecture:** `buildContinueLearning` remains the single deterministic policy surface for learner action priority. The feature-flagged dashboard consumes that aggregated response; its v2 sidebar must not reintroduce static action shortcuts. `RouteOrientation` remains a reusable learner-shell concern driven by the central route registry, so each learner surface receives breadcrumb, purpose, status, estimate, and a contextual next step.

**Tech Stack:** React 19, TypeScript, tRPC 11, Vitest, Wouter, Tailwind 4, Drizzle ORM, Manus Slides.

---

### Task 1: Establish and repair the baseline

**Files:**
- Modify: `server/repositories/practice.ts:67`
- Test: `pnpm check`, `pnpm test`

1. Reproduce the TypeScript error with `pnpm check`.
2. Confirm that the project target does not enable down-level Set iteration.
3. Replace the Set spread with `Array.from(new Set(...))` to preserve deduplication semantics without configuration-wide impact.
4. Run `pnpm check` and `pnpm test`; expect both to pass.

### Task 2: Add failing learner-rollout regressions

**Files:**
- Modify: `server/daily-learner-release.test.ts`
- Test: `pnpm vitest run server/daily-learner-release.test.ts`

1. Require `resources` in the orientation metadata map.
2. Require dashboard-v2 to avoid the static `QuickNavigation` action block.
3. Require the v2 sidebar to display aggregate due-review, active-plan, and primary-action information.
4. Run the focused test and confirm it fails before production changes.

### Task 3: Finish feature-flagged dashboard-v2 aggregation

**Files:**
- Modify: `client/src/pages/Dashboard.tsx:77-82`
- Modify: `client/src/components/ContinueLearningDashboard.tsx:96-112`
- Test: `server/daily-learner-release.test.ts`

1. Preserve the legacy dashboard and quick navigation beneath the existing flags.
2. Remove static quick navigation from the `learner_dashboard_v2` branch only.
3. Extend `ContinueLearningSidebar` to render due-review count, active-plan status, and the primary action using `continueLearning` query data.
4. Keep a clear no-pending-evidence state; do not invent learner progress or next actions client-side.
5. Run the focused regression and full suite.

### Task 4: Complete contextual orientation coverage

**Files:**
- Modify: `client/src/components/ContextualOrientationHeader.tsx:101-150`
- Test: `server/daily-learner-release.test.ts`

1. Add `resources` metadata from `ROUTE_BY_ID`.
2. Include breadcrumb, purpose, estimate, status label, and a contextual return-to-Today action.
3. Preserve the existing orientation header component contract and feature-flag guard.
4. Run the focused regression and confirm the resources route renders the shared header when enabled.

### Task 5: Verify responsive, runtime, and accessibility behavior

**Files:**
- Verify: `client/src/pages/Dashboard.tsx`
- Verify: `client/src/components/ContinueLearningDashboard.tsx`
- Verify: `client/src/components/ContextualOrientationHeader.tsx`

1. Run `pnpm check`, `pnpm test`, and `pnpm build`.
2. Inspect development-server and browser-console logs for fresh errors.
3. Capture desktop and mobile screenshots of `/today` and `/resources`.
4. Confirm the feature-flagged fallback remains intact and all interactive elements have meaningful accessible names.

### Task 6: Create strategy collateral

**Files:**
- Create: `docs/content-strategy/necessary-assumption-negation-test-guide-brief.md`
- Create: `docs/content-strategy/content-gap-strategy-deck.md`

1. Draft the public guide’s search intent, differentiated argument, structure, evidence boundaries, and conversion paths.
2. Write a slide-by-slide deck outline grounded in the completed content-gap audit.
3. Generate the slide presentation from the completed outline after all evidence and visual assets are prepared.

### Task 7: Document, checkpoint, and deliver

**Files:**
- Modify: `todo-oph90e16.md`
- Verify: all deliverables and tests

1. Mark each task complete only after its verification passes.
2. Create a checkpoint describing the behavior, tests, content deliverables, and remaining data caveats.
3. Deliver the slide deck, guide brief, and implementation summary.
