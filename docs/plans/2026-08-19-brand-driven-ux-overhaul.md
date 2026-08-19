# LSAT Nexus Brand-Driven UX Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans principles to implement this plan task-by-task.

**Goal:** Refine the authenticated Today and Learn workspaces into a coherent, scholarly Nexus command center with a continuous dark navigation rail, stronger session hierarchy, semantic curriculum grouping, and progress-aware lesson cards.

**Architecture:** Preserve the existing learner shell, protected routes, feature flags, and server-authoritative learner domain. The overhaul is a frontend composition and design-system refinement: update semantic tokens and shell treatments, simplify redundant dashboard headings, restructure the Continue Learning presentation around one primary action, and rebuild the lesson grid from the shared curriculum registry plus the protected progress query. No schema, routing, authorization, or content changes are required.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, tRPC 11, Wouter, Lucide React, Vitest.

---

## Design Direction

The selected direction is **Scholarly Command Center**: deep ink navigation, warm parchment workspace surfaces, amber brand markers, a calm teal action color, Lora display typography, Space Grotesk interface text, and JetBrains Mono evidence labels. The system should feel like a precise legal-research workspace rather than a generic SaaS dashboard.

The memorable visual signature is the contrast between a continuous dark knowledge rail and a quiet paper-like workspace, with amber index marks and teal reserved for action and progress. Dense information is organized as an evidence ledger rather than a collection of colorful widgets.

## Task 1: Design-system and learner-shell foundation

**Files:**
- Modify: `client/src/index.css`
- Modify: `client/src/components/ApplicationShells.tsx`

**Steps:**
1. Add explicit ink, paper, rail, and domain tokens while retaining all existing semantic tokens.
2. Set the display family to Lora and keep Space Grotesk for interface copy.
3. Replace the learner shell’s disconnected dark logo strip with a continuous dark navigation rail.
4. Give learner navigation a restrained amber active marker, clear hover state, and accessible inverse text.
5. Keep the administrator shell unchanged unless a shared component requires a variant-specific adjustment.

**Verification:** Run `pnpm check` and inspect `/dashboard` at desktop and mobile sizes.

## Task 2: Dashboard hierarchy and evidence ledger

**Files:**
- Modify: `client/src/components/NexusDashboardLayout.tsx`
- Modify: `client/src/components/ContinueLearningDashboard.tsx`

**Steps:**
1. Remove the redundant nested “Study Dashboard” header because the contextual orientation header already identifies Today.
2. Introduce a concise section index and “Your next move” heading inside the dashboard content.
3. Recompose the primary learning card as an asymmetric session brief with a clear action, progress evidence, and refined states.
4. Rename the sidebar presentation to a learning ledger, emphasize one cumulative progress measure, and subordinate supporting counts.
5. Remove the duplicate sidebar primary action while retaining server-authoritative due-review and study-plan evidence.
6. Preserve loading, unauthenticated, and error states with the same visual system.

**Verification:** Existing daily-learner release tests must still confirm that actions and evidence come from `continueLearning`.

## Task 3: Progress-aware curriculum atlas

**Files:**
- Modify: `client/src/components/LessonGrid.tsx`
- Modify: `client/src/pages/Lessons.tsx`

**Steps:**
1. Replace the duplicated lesson definitions with `CURRICULUM_LESSONS` from the shared learner domain.
2. Query protected lesson progress through `trpc.learner.progress` and map it by lesson ID.
3. Consolidate card color to three semantic domains: Logical Reasoning, Reading Comprehension, and Formal Logic.
4. Present sequence, prerequisites, status, percent complete, duration, and a context-sensitive action label.
5. Use an editorial grid with a featured first lesson, consistent surface treatment, and graceful loading behavior.
6. Keep the `lesson_grid` feature-flag fallback and page metadata intact.

**Verification:** Confirm every card routes to the canonical `/learn/*` path and all seven lessons render from the shared registry.

## Task 4: Regression coverage

**Files:**
- Create: `server/brand-driven-ux-overhaul.test.ts`

**Steps:**
1. Add source-contract coverage for shared curriculum usage and the protected progress query.
2. Assert that the dashboard no longer renders the redundant “Study Dashboard” label.
3. Assert the learner rail uses the new rail tokens and brand marker treatment.
4. Assert semantic LR, RC, and Logic domain mapping remains present.
5. Run the focused test, full test suite, type check, and production build.

## Task 5: Visual verification and checkpoint

**Files:**
- Update: `todo.md`

**Steps:**
1. Capture full-page desktop screenshots of `/dashboard` and `/lessons`.
2. Capture mobile screenshots at 390×844 and verify navigation, card stacking, and readable actions.
3. Check the dev-server status and browser console.
4. Mark the overhaul checklist complete.
5. Save a WebDev checkpoint with implementation and verification details.

## Success Criteria

- The authenticated learner rail reads as one intentional brand surface rather than a light sidebar with a dark logo patch.
- Today has one unambiguous page identity and one primary action.
- Learning evidence is legible without duplicating the main CTA.
- Learn uses the shared curriculum registry and displays authoritative learner progress.
- Lesson color communicates domain, not decoration.
- Desktop and mobile layouts remain keyboard accessible and responsive.
- TypeScript, Vitest, production build, and WebDev health checks pass.

## Rollback

Use the WebDev checkpoint created after verification. No database or migration rollback is necessary because this plan changes only frontend source and regression tests.
