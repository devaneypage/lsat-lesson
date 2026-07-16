# LSAT Nexus Current-State Audit

**Baseline date:** 2026-07-16  
**Baseline commit:** `c54cf44`  
**Audit scope:** application structure, routes, roles, feature flags, migrations, tests, runtime evidence, data foundations, and the four partially implemented learner-experience surfaces.

## Executive finding

The application has a viable full-stack foundation and a meaningful LSAT content corpus, but the learner experience and administrative experience are still interleaved. The approved rebuild should therefore preserve the React/tRPC/Drizzle/authentication foundation and proceed through additive, feature-flagged vertical releases rather than replace the system wholesale.

The baseline passes automated tests, type checking, and a production build. The principal immediate risks are architectural and experiential rather than compilation failures: mixed-audience navigation, static or weakly evidenced dashboard claims, incomplete curriculum-to-skill mappings, empty learner-evidence tables, legacy route naming, stale runtime errors that require fresh verification, and partially implemented learner surfaces that have not yet been checkpointed.

## Baseline inventory

| Measure | Baseline |
|---|---:|
| React page modules | 24 |
| React component modules | 90 |
| Focused server routers | 7 |
| Vitest files | 10 |
| Passing tests | 61 |
| Drizzle SQL migration files | 5 |
| Production build | Passed in 30.96 seconds |
| Type check | Passed |
| Uncommitted files at audit start | 14 |

The production bundle completes successfully, but the build reports a large primary client chunk of approximately 3.16 MB before gzip. Route-level code splitting and heavy visualization/editor dependencies should be evaluated during the shell and legacy-retirement phases.

## Representative production data

| Entity | Rows | Interpretation |
|---|---:|---|
| Users | 1 | The production environment currently reflects an owner/admin account rather than a multi-learner cohort. |
| Questions | 484 | The question corpus is a durable asset and must not be destructively rewritten. |
| Tags | 125 | Taxonomy exists, but quality and orphan checks are still required. |
| Question–tag links | 2,515 | Tagging is substantial enough to support targeted discovery after integrity checks. |
| Feature flags | 20 | Release infrastructure exists and should remain the rollout mechanism. |
| Learner profiles | 0 | Profile-dependent recommendations cannot yet be considered production-evidenced. |
| Learner preferences | 0 | Accessibility persistence has no production usage evidence yet. |
| Curriculum skills | 0 | Mastery must remain gated because stable skill mappings do not yet exist in production. |
| Question–skill links | 0 | Question-level mastery attribution is not yet possible. |
| Lesson progress | 1 | The learner-state foundation is active but extremely sparse. |
| Question attempts | 0 | Confidence, timing, calibration, review, and mastery currently lack durable attempt evidence. |
| Review items | 0 | Adaptive review is structurally available but not populated. |
| Mistake-journal entries | 0 | Private reflection has not yet been exercised in production. |
| Mastery snapshots | 0 | Existing mastery displays must not imply server-derived mastery. |
| Study plans and tasks | 0 | Current plan generation is not yet a durable learner workflow. |
| Product events | 0 | Feature-usage decisions currently lack privacy-bounded behavioral evidence. |

## Route and audience findings

The current application shell mounts one global navigation bar across public, learner, commercial, content-management, and administrative routes. Its primary destinations include Dashboard, Lessons, Question Bank, Curriculum, AI Plan, Import, Tags, About, and Booking. Import and taxonomy controls therefore appear in the same navigation hierarchy as learner study work, and the import action is also presented as a persistent top-level button.

| Current route | Current purpose | Target disposition |
|---|---|---|
| `/` | Public path selector and marketing entry | Retain as the public entry; keep outside the authenticated learner shell. |
| `/dashboard` | Mixed legacy and flagged learner dashboard | Alias to canonical `/today`; replace the body with server-evidenced daily action states. |
| `/lessons` | Lesson hub | Alias to `/learn`; retain lesson corpus and SEO metadata. |
| `/lessons/:slug` | Individual lessons | Support canonical `/learn/:lessonId` while preserving legacy aliases and external links. |
| `/question-bank` | Question discovery and practice | Alias to `/practice`; progressively separate discovery, session setup, active practice, and results. |
| `/progress` | Progress display | Retain route name, replace static evidence with server-derived explanations. |
| `/lesson-plan-generator` | AI-generated plan surface | Alias to `/plan`; convert output to a validated editable draft and persistent versions. |
| `/import` | Content import | Move under `/admin/content/import`; enforce server-side admin authorization. |
| `/tag-manager` | Taxonomy management | Move under `/admin/taxonomy`; enforce server-side admin authorization. |
| `/admin/flags` | Feature-flag management | Retain under the future admin shell. |
| `/about`, `/booking` | Public/commercial information | Keep outside primary study navigation. |

## Runtime evidence

Historical browser logs contain three noteworthy errors: a request to the removed `flags.list` procedure, a conditional-hook-order failure in `MainNavigationBar`, and a duplicate React key for `/question-bank`. Current source no longer calls `flags.list` from the feature-flag client and places the booking feature hook unconditionally near the top of `MainNavigationBar`, so the first two entries may be stale development/HMR evidence. They are nevertheless release blockers until fresh browser sessions show clean console and network logs. The duplicate-key warning must be reproduced or traced during command-palette and navigation verification.

## Partial learner-surface reconciliation

| Surface | Classification | Evidence | Required action |
|---|---|---|---|
| Continue Learning | **Retain and substantially refactor** | The client handles authentication, loading, error, empty, active, completed, recent-work, and summary states. The server aggregation is deterministic and tested. However, it currently considers lesson progress only and prioritizes in-progress lesson, unstarted lesson, then completed-lesson review. | Extend the server aggregator to the approved daily priority contract: due review, recent lesson, active-plan task, recommended drill, then onboarding/diagnostic. Remove or relabel any metric not backed by durable records. |
| Contextual orientation | **Retain and refactor** | The component already renders breadcrumb, purpose, prerequisites, estimate, status, and next action. Coverage is limited to exact lesson routes and one question-bank case, with legacy dashboard/lesson links embedded in the bridge. | Move metadata into a central typed route registry and cover every canonical learner route and meaningful state. |
| Accessibility controls | **Retain and refine** | The component supports guest-local persistence, authenticated server persistence, optimistic cache updates, rollback on save failure, and global document preferences. | Reconcile styling with the consolidated design system; verify keyboard safety, focus restoration, text-entry shortcut exclusions, contrast, zoom, and `prefers-reduced-motion`. |
| Command palette | **Retain and refine** | The component provides local curriculum search, debounced paginated server question search, guest-safe behavior, keyboard shortcuts, deduplication, and an explicit trigger. The live flag key is `unified_command_search`. | Standardize the flag name in documentation and route registry, remove duplicate destination keys if reproducible, add canonical route search, and verify focus/announcement behavior. |

All four surfaces are currently uncheckpointed within a 14-file working tree. They should be reconciled and verified as one coherent first learner release rather than released independently in their present state.

## Feature-flag baseline

The production database contains learner-experience keys for `accessibility_controls`, `adaptive_review_queue`, `contextual_orientation`, `learner_dashboard_v2`, `mistake_journal`, `persistent_study_plans`, `skill_mastery_map`, and `unified_command_search`. Documentation that refers to `global_command_palette` should be corrected to the implemented canonical key `unified_command_search`, unless an explicit migration is introduced. Missing requested keys must be registered additively rather than inferred by the client.

## Data and evidence risks

| Severity | Issue | Affected workflow | Release consequence |
|---|---|---|---|
| Critical | Curriculum skills and question–skill mappings are empty in production. | Progress and mastery | Block evidence-based mastery until coverage thresholds pass. |
| Critical | Question attempts are empty and current question delivery does not yet establish protected answer submission evidence. | Practice, review, progress | Block confidence calibration, adaptive review, and mastery claims. |
| High | Learner/admin/public navigation is mixed. | All navigation | Build role-separated shells before expanding learner features. |
| High | Existing dashboard fallback includes static score/mastery/concept-map surfaces. | Today and Progress | Remove fabricated or weakly evidenced claims from the coherent learner release. |
| High | Import and taxonomy controls are publicly prominent. | Administration | Move to an admin shell and enforce procedure-level authorization. |
| High | Historical runtime errors have not yet been cleared in a fresh session. | Navigation and flags | Require clean browser/network logs before checkpoint. |
| Medium | The primary bundle is large. | Performance | Add route-level lazy loading during shell decomposition. |
| Medium | Legacy and canonical route names diverge. | Navigation, search, bookmarks | Add a typed registry and reversible aliases before UI replacement. |
| Medium | Sparse production learner data limits recommendation validation. | Today, review, planning | Use deterministic fixtures and explicit empty states; do not invent history. |

## Phase 0 decisions

The current full-stack architecture, authentication, question corpus, tags, learner tables, feature flags, and canonical curriculum contracts are retained. The four partial learner components are not discarded; they form the seed of the first coherent learner release after route, design-system, and contract reconciliation.

The immediate implementation order is: establish a typed route registry and role-separated shells; consolidate semantic design/accessibility foundations; split and harden server domains; then complete the Today release against real server evidence. Mastery, adaptive review, and study planning remain gated behind their prerequisite evidence and mapping work.

## Phase 0 exit status

The unchanged codebase passes tests, type checking, and production build. Routes, audiences, data foundations, flags, partial learner features, and known runtime risks are catalogued. Phase 0 is complete when fresh responsive screenshots and clean current-session console/network verification are added, the session tracker is updated, and a baseline checkpoint is saved.

## Responsive visual baseline

Fresh desktop and 390 × 844 mobile captures confirm that the primary learner-facing routes render without a blank application shell. They also sharpen the rebuild priorities.

The public entry is responsive and visually coherent, but it combines product onboarding, tutoring promotion, and learner-path selection in one long page. The learner shell should begin only after a learner enters or authenticates; commercial calls to action should not remain in persistent study navigation.

The current dashboard visibly presents a score of 157, a 63rd percentile, a 170 target, and section-mastery percentages despite the production database containing no question attempts or mastery snapshots. The Progress page likewise presents accuracy, question counts, hours, estimated score gain, weekly performance, and topic performance with no durable attempt evidence. These displays are confirmed fabricated or placeholder learner metrics and are **critical removal blockers** for the first coherent learner release.

On mobile, the concept map becomes a small, low-information graphic inside a very tall card while unsupported score and mastery cards remain prominent. The lesson hub itself responds cleanly, although the mobile cards consume substantial vertical space. The question bank renders as an extremely long dense table in both captures; the mobile image collapses to an unreadable narrow strip, confirming that the current table is not a viable mobile practice/discovery experience. The AI lesson-plan form adapts acceptably to mobile dimensions, but its generated plan is not yet persistent or evidence-constrained.

The administrative feature-flag page renders and shows all new learner flags disabled at 0% rollout. Legacy flags and administrative controls remain visually available beneath the same global learner/public navigation, reinforcing the need for a separate authorized admin shell.

## Fresh runtime verification

The responsive capture sessions reproduced one active React runtime error: `QuickNavigation` rendered both “Start Drill” and “Analyze Errors” with the same `/question-bank` key because it keyed actions by destination route. The component now keys actions by their stable, unique labels while preserving the intentionally shared destination. A focused Vitest regression specification verifies label uniqueness and the valid shared-route case. The focused suite passes, TypeScript passes, the dashboard renders unchanged, and a fresh console inspection contains no duplicate-key or other errors.
