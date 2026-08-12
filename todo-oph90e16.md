# Project TODO

- [x] Inspect the current application architecture, routes, data model, and administrative surfaces relevant to feature flags.
- [x] Define a database-backed feature-flag architecture supporting enabled state, deterministic percentage rollout, stable visitor assignment, and descriptive metadata.
- [x] Implement secure server-side flag evaluation, a minimal public evaluation response, and administrator-only flag management procedures.
- [x] Implement reusable client-side feature-flag access utilities with explicit loading and fallback behavior.
- [x] Refine the existing administrative feature-flag interface so rollout controls accurately reflect deterministic assignment behavior.
- [x] Integrate at least one non-disruptive application capability behind a feature flag to demonstrate end-to-end behavior.
- [x] Add Vitest coverage for evaluation logic, authorization, and management behavior.
- [x] Run type checking, automated tests, production build, and visual verification for relevant desktop and mobile routes.
- [x] Document the implemented flag keys, default behavior, and safe rollout workflow.
- [x] Save a checkpoint so the verified implementation is published and available in version history.

# Learner-Support Roadmap

- [x] Preserve the user-edited approved roadmap in project documentation and record current test, type-check, build, and runtime baselines.
- [x] Define canonical curriculum, skill, learner-state, confidence, review, mistake-taxonomy, study-plan, and analytics contracts in shared modules.
- [x] Add additive learner profile, preference, skill, lesson progress, question attempt, review item, mistake journal, study plan, study-plan task, and product-event tables with required indexes and ownership constraints.
- [x] Generate, review, apply, and verify the additive learner-state database migration without changing existing user, question, tag, question-tag, or feature-flag data.
- [x] Add ownership-safe learner-state repository helpers and establish focused router boundaries for learner, practice, review, preferences, search, study-plan, and analytics capabilities.
- [x] Add idempotent browser lesson-progress import that writes only to empty server records and never overwrites durable state.
- [x] Register independently reversible feature flags for all ten learner-support capabilities with safe disabled defaults.
- [x] Add unit and integration coverage for learner-state contracts, ownership isolation, local-progress import, and feature-flag registration.
- [x] Document, verify, checkpoint, and publish the domain-foundation release.
- [ ] Implement a single aggregated Continue Learning response with deterministic primary-action priority and explicit empty states.
- [ ] Replace static learner dashboard metrics and actions with the aggregated server response behind `learner_dashboard_v2`.
- [ ] Create and integrate a reusable contextual orientation header with breadcrumb, purpose, prerequisites, estimate, status, and next action.
- [ ] Implement persistent accessibility preferences for text scale, reading width, high contrast, reduced motion, passage focus, and keyboard behavior with guest-local fallback.
- [ ] Implement a keyboard-accessible global command palette with local curriculum indexing and debounced, paginated question search.
- [ ] Add automated, accessibility, responsive, runtime-log, and visual verification for Continue Learning, orientation, accessibility, and command search.
- [ ] Document, checkpoint, and publish the first learner-experience release.
- [ ] Implement idempotent, ownership-safe question-attempt persistence with answer validation, pre-answer confidence, active timing, correctness, and context.
- [ ] Upgrade question practice to require certain, unsure, or guessed confidence before submission and handle loading, retry, success, and explanation states.
- [ ] Compute confidence-calibration and timing metrics without exposing private learner text.
- [ ] Add privacy-safe allow-listed practice discovery, start, submission, and completion instrumentation.
- [ ] Add unit, integration, end-to-end, responsive, and accessibility verification for attempt capture and confidence tracking.
- [ ] Document, checkpoint, and publish the practice-evidence release.
- [ ] Implement the deterministic 1/3/7/14/30-day review scheduler, queue ordering, daily cap, and transparent queue reasons.
- [ ] Implement due-review listing, summary, submission, snooze, and dashboard-priority procedures with timezone-boundary coverage.
- [ ] Implement create, edit, and archive mistake-journal workflows using the controlled taxonomy and private learner notes.
- [ ] Integrate review and journal actions into question results, review screens, dashboard recommendations, and navigation.
- [ ] Add unit, integration, end-to-end, responsive, accessibility, and failure-recovery verification for review and reflection workflows.
- [ ] Document, checkpoint, and publish the adaptive-review and mistake-journal release.
- [ ] Validate and report question and lesson mappings to stable curriculum skills before exposing mastery.
- [ ] Implement the versioned explainable mastery formula with evidence counts, confidence states, recency handling, and a Not enough data state.
- [ ] Replace static MasteryOverview, ConceptMap, and ProgressTracker values with server-derived data and explanatory drill-downs.
- [ ] Add regression coverage for sparse data, repeated attempts, old attempts, ties, unmapped content, and deterministic score fixtures.
- [ ] Document, checkpoint, and publish the mastery and real-progress release.
- [ ] Convert AI study-plan generation to a validated structured draft contract with safe malformed-output handling.
- [ ] Implement persistent, versioned study plans and editable dated tasks with one active plan per learner.
- [ ] Refactor the study-plan interface into an editable workspace supporting save, reorder, reschedule, complete, archive, activate, and regenerate flows.
- [ ] Connect active study-plan tasks to Continue Learning without directly inflating mastery.
- [ ] Add unit, integration, end-to-end, responsive, accessibility, and version-preservation verification for study plans.
- [ ] Document, checkpoint, and publish the persistent study-plan release.
- [ ] Formalize an allow-listed, privacy-safe product-event schema with constrained metadata and finite retention.
- [ ] Implement admin-only aggregate analytics for discovery, start, completion, repeat usage, review completion, plan adherence, search success, and flag cohorts.
- [ ] Build an administrator analytics dashboard that exposes aggregate decisions without learner journal or question content.
- [ ] Document target metrics, guardrails, observation windows, rollback conditions, and data-retention policy for each rollout.
- [ ] Complete full automated tests, type checking, production build, migration verification, runtime-log review, keyboard and screen-reader checks, and desktop/mobile visual verification.
- [ ] Review the entire session tracker, complete final documentation, save the final checkpoint, and confirm the published version.

# Broad Audit and Incremental Rebuild

- [x] Establish and document the live baseline: checkpoint, routes, roles, flags, migrations, tests, build, runtime logs, responsive screenshots, and representative data counts.
- [x] Reconcile partially implemented learner-experience components against the tracker, flags, tests, and release state; classify each as retain, refactor, or discard.
- [x] Produce the product workflow, content integrity, curriculum mapping, and learner-evidence audits with a prioritized issue register.
- [x] Implement a central route registry, canonical route aliases, a learner application shell, and a separately authorized admin application shell.
- [x] Consolidate the Academic Light design tokens, typography, semantic states, shared page primitives, and global accessibility behavior.
- [x] Decompose legacy question, taxonomy, flag, administration, and study-plan procedures into focused routers and repositories with hardened authorization and input contracts.
- [x] Complete and verify the coherent daily learner release: Today, orientation, command search, accessibility, and non-fabricated states.
- [ ] Complete and verify server-authoritative practice attempts, confidence calibration, active timing, answer protection, and practice analytics.
- [ ] Complete and verify deterministic adaptive review plus the private structured mistake journal.
- [ ] Complete and verify explainable mastery, curriculum mapping coverage, and server-derived progress.
- [ ] Complete and verify persistent, versioned, editable study planning with validated AI drafts.
- [ ] Complete and verify the administrator workspace and privacy-bounded aggregate analytics.
- [ ] Complete migration checks, staged rollout controls, legacy retirement, full quality gates, documentation, and final published checkpoint.

- [x] Audit and rebuild the practice-questions module and library.

- [x] Address database schema inconsistencies for questions module
- [ ] Implement color schema for sections (Logical Reasoning: red, Reading Comprehension: blue, Formal Logic: gold, Test Strategy: green)
- [ ] Update frontend components to use new questions module structure and color schema
- [ ] Verify functionality

# Content Gap Analysis — Devasophy Blog

- [x] Inventory public Devasophy Blog content and define the organic-search scope.
- [x] Discover representative organic competitors and collect public SERP evidence.
- [x] Assess topic, depth, buyer-journey, freshness, and content-velocity gaps.
- [x] Produce a prioritized content-gap workbook and cited decision-ready report.
- [x] Benchmark public content velocity with fallback-safe indexed/resource-page counts by domain and page type.
- [x] Expand the freshness assessment with live date, byline, update-signal, and structured-data evidence.
- [x] Deliver the evidence caveats and recommended editorial next actions.

# Content Strategy and Learner Experience Rollout

- [x] Audit the existing Continue Learning aggregation, dashboard-v2 flag integration, orientation-header coverage, and current typecheck/runtime failures.
- [x] Draft the Necessary Assumption / Negation Test™ guide outline and key argument brief.
- [x] Prepare the cited content-gap strategy presentation outline and visual plan.
- [x] Create the content-gap deck visual system: theme, color/typography direction, chart treatment, section dividers, and layout rules.
- [x] Complete any missing server-authoritative Continue Learning contract behavior and deterministic-priority regressions. Existing protected `learner.continueLearning` aggregation and priority tests already satisfy this requirement; no duplicate server contract was added.
- [x] Replace static learner dashboard metrics and actions with the aggregated response behind `learner_dashboard_v2`.
- [x] Refine and verify the reusable contextual orientation header for breadcrumbs, purpose, prerequisites, estimate, status, and next action.
- [x] Run Vitest, type/build, runtime, responsive, and accessibility verification; resolve root causes for failures introduced or blocking the rollout. Verified 110 Vitest tests, typecheck, production build, desktop/mobile rendering, and no fresh console errors.
- [x] Run protected-route accessibility checks for keyboard focus order, accessible names, and sign-in-shell controls on Today and Resources.
- [ ] Run authenticated learner-flow accessibility verification for Today and Resources with a dedicated test session, covering keyboard traversal, focus order, breadcrumb/orientation landmarks, and accessible names.
- [ ] Generate the content-gap strategy presentation and publish a checkpoint with the completed implementation.
- [ ] Deliver the strategy deck, guide brief, and implementation summary.
