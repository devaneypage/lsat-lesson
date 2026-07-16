# LSAT Master Study Guide: Systematic Learner-Support Roadmap

## Goal and planning premise

The goal is to implement all ten requested capabilities as one coherent **learner feedback system**, rather than as ten unrelated interface additions. The system should help a learner decide what to do next, capture what happened during study, convert that evidence into review and mastery signals, and then refine future recommendations. Implementation will preserve the current React 19, tRPC, Drizzle/MySQL, Manus Auth, and feature-flag architecture.

The plan assumes that authenticated learners receive cross-device persistence and personalization, while unauthenticated visitors retain a useful local-only experience. Each major capability will be separately gated through the existing deterministic feature-flag system and delivered through a verified checkpoint. No implementation begins until this plan is approved.

## Current-state assessment

The application already contains many of the correct presentation surfaces, but most learner-state data is not yet persisted. The current dashboard, progress metrics, mastery summaries, and concept-map percentages are largely static. Lesson progress and completion are stored in browser `localStorage`; the question bank can display and filter real questions but does not persist attempts, confidence, timing, or errors; and the AI study-plan generator produces an unsaved Markdown response. The application already has questions, tags, question-tag relations, user authentication, admin roles, reusable command-palette primitives, breadcrumbs, and a hardened feature-flag system.

| Existing surface | Reuse decision | Required extension |
|---|---|---|
| `Dashboard.tsx`, `QuickNavigation`, `MasteryOverview`, `ConceptMap` | Preserve the established Nexus visual system and composition | Replace hardcoded values with a single learner-home response and explicit empty/loading/error states |
| `QuestionBank.tsx` and question/tag procedures | Retain the current catalog, filters, and practice entry point | Add attempt submission, confidence capture, timing, review actions, and journal integration |
| `StudyGuide.tsx` and lesson routes | Reuse the existing curriculum vocabulary and lesson links | Extract canonical metadata for skills, prerequisites, time estimates, and orientation headers |
| `ProgressTracker.tsx` | Reuse its information hierarchy, not its mock data | Replace all hardcoded metrics with derived learner analytics |
| `LessonPlanGenerator.tsx` and `lessonPlan.generate` | Preserve the current input and generation experience | Add authenticated persistence, editable tasks, completion state, and recommendation integration |
| `MainNavigationBar.tsx` and `ui/command.tsx` | Reuse navigation and existing cmdk primitives | Add a global `Cmd/Ctrl+K` command and search surface |
| Existing feature-flag system | Use as the release-control layer | Register one independently reversible flag per capability or tightly coupled capability group |

## Architectural decisions

The implementation will use a **single learner-state foundation**. Attempts, progress, review scheduling, plans, preferences, and events will be user-owned records. Server procedures will enforce ownership from `ctx.user.id`; clients will never send an authoritative user ID. The server will compute next actions, review eligibility, and mastery outputs so the same rules apply across browsers and interfaces.

| Decision | Chosen approach | Reason |
|---|---|---|
| Learner identity | Require authentication for durable state; retain local guest state and provide an explicit one-time import after login | Preserves the current low-friction public experience without creating anonymous account complexity |
| Local progress migration | Import only when the server has no corresponding lesson state; never overwrite existing server records; mark the import idempotently | Existing browser records lack reliable timestamps, so conservative merge behavior prevents data loss |
| Curriculum ontology | Create a canonical skill and content registry with stable keys, routes, prerequisites, estimated time, and question-tag mappings | Dashboard, search, orientation, mastery, and study plans need one shared vocabulary |
| Mastery | Derive scores from persisted evidence and store only versioned snapshots if performance later requires caching | Avoids competing sources of truth while keeping the algorithm explainable and replaceable |
| Adaptive review | Use a deterministic interval schedule with explicit due dates and transparent queue reasons | Keeps behavior testable and understandable; an opaque recommendation model is not required initially |
| Search | Use the existing command components, static in-memory indexing for routes/curriculum, and a debounced server query for questions | Matches the present corpus and avoids premature Algolia/Typesense infrastructure; external search is deferred until scale or latency warrants it |
| Analytics | Use first-party, allow-listed events with minimal metadata and finite retention | Supports product decisions without recording journal text, question content, explanations, or other sensitive study material |
| AI study plans | Treat AI output as a draft that is parsed into editable, versioned tasks; deterministic progress data remains authoritative | Prevents generated prose from becoming an unreviewable source of learner truth |
| Feature release | Default all new flags off, test with owner/admin, then roll out at 10%, 25%, 50%, and 100% with a kill switch | Uses the existing deterministic rollout system and makes each release reversible |

## Foundation data model

Schema work will be performed through `drizzle/schema.ts`, generated migrations, explicit SQL review, application of the migration, and post-migration verification. Foreign-key columns and frequent lookup fields will be indexed. Business timestamps will remain UTC and be localized only in the client.

| Entity | Essential fields and behavior | Capabilities enabled |
|---|---|---|
| `learnerProfiles` | `userId`, target score, test date, weekly hours, onboarding state, created/updated timestamps | Personal plans and recommendation context |
| `learnerPreferences` | `userId`, text scale, reading width, contrast mode, reduced motion, passage-focus mode, keyboard preferences | Accessibility and cross-device settings |
| `curriculumSkills` | Stable key, label, section, description, display order, prerequisite keys, active state | Mastery, search, orientation, plans |
| `lessonProgress` | `userId`, stable lesson key, step key/index, status, started/completed/last-activity timestamps, optional accumulated seconds | Continue Learning, mastery, analytics |
| `questionAttempts` | `userId`, question ID, selected answer, correctness, confidence, duration, context, attempted timestamp | Confidence, review, mastery, journal, analytics |
| `reviewItems` | Unique user/question pair, state, due date, interval, repetition count, last outcome, priority reason, updated timestamp | Adaptive review queue |
| `mistakeJournalEntries` | User, question, source attempt, controlled error type, tempting answer, missed clue, corrective rule, notes, status | Mistake journal and reflection workflow |
| `studyPlans` and `studyPlanTasks` | User, input snapshot, generated draft/version, active status; dated and ordered editable tasks with type, content reference, estimate, and completion | Persisted personal study plans and dashboard actions |
| `productEvents` | User or privacy-safe visitor identifier, allow-listed event name, surface, entity reference, feature-flag snapshot, constrained metadata, UTC timestamp | Feature-usage analytics and funnel analysis |

The initial controlled mistake taxonomy will include task misidentification, stimulus or passage misread, logical-gap error, scope or degree shift, answer-choice trap, conditional or diagramming error, timing pressure, and careless execution. A learner may add notes, but analytics and mastery calculations will use only controlled categories.

## Implementation roadmap

### Release 0 — Domain foundation and safe migration

This release creates the canonical curriculum registry, learner-owned schema, data-access helpers, modular tRPC routers, and one-time browser-progress import. The current `server/routers.ts` should be decomposed into focused routers such as `learner`, `practice`, `review`, `studyPlan`, `search`, `preferences`, and `analytics`, while preserving the exported `appRouter` contract. The migration flow must be additive; existing question, tag, user, and flag data must remain untouched.

| Atomic task | Main files | Completion evidence |
|---|---|---|
| Define shared identifiers and curriculum metadata | New `shared/curriculum.ts`, `shared/learner.ts`; extract metadata from `StudyGuide.tsx` | Every lesson, skill, route, prerequisite, and estimate resolves from one registry |
| Add user-owned tables and indexes | `drizzle/schema.ts`, generated migration | Migration applies successfully; constraints and indexes are verified |
| Add repository helpers and ownership-safe routers | `server/db.ts`, new `server/routers/*.ts`, `server/routers.ts` | Authenticated CRUD tests prove users cannot access another learner’s records |
| Add local-state import | Existing lesson hooks plus a new migration utility and protected procedure | Empty server state imports once; repeated import is a no-op; existing server state wins |
| Register release flags | Shared flag registry and admin seed path | Every subsequent release can be disabled independently without deployment |

### Release 1 — Continue Learning, contextual orientation, accessibility, and command search

This release provides immediate usability gains before the full adaptive engine is available. A new `learner.home` query will return one server-selected primary action plus secondary cards, preventing the client from assembling conflicting recommendations. The priority order will be: resume an activity started within the previous 72 hours; complete due review work; complete today’s active-plan task; otherwise begin a drill associated with the weakest available skill. The interface will explain why the action was selected.

| Capability | Implementation approach | Acceptance criteria |
|---|---|---|
| Continue Learning dashboard | Refactor `Dashboard.tsx` to consume one typed home payload containing resume state, due-review count, plan task, weakness recommendation, and summary metrics | A learner always sees one primary CTA; new learners see a guided diagnostic/onboarding state rather than fabricated metrics |
| Contextual orientation | Create a reusable `LearningContextHeader` using the canonical registry; integrate it into lessons, drills, and study-guide detail surfaces | Each learning surface shows breadcrumb, purpose, prerequisite, estimated time, current status, and next step |
| Accessibility controls | Add a persistent preferences panel connected to CSS variables and semantic layout tokens; retain local fallback for guests | Text scale, line width, high contrast, reduced motion, keyboard focus, and passage-focus mode work on desktop and mobile |
| Unified command palette | Attach `Cmd/Ctrl+K` from the main navigation; index routes and curriculum locally; query questions through a debounced, paginated server endpoint | Keyboard users can locate lessons, concepts, questions, saved items, and permitted admin destinations without navigating through menus |

### Release 2 — Attempt capture and question-level confidence

The question interaction will become an auditable learning event. Confidence must be selected **before** submission to avoid hindsight contamination. Timing begins when a question becomes active, pauses when the page is hidden, and is stored in milliseconds. The response will persist atomically, return correctness and explanation data, and create or update the corresponding review item.

| Atomic task | Main files | Completion evidence |
|---|---|---|
| Add the attempt service and validation | `server/routers/practice.ts`, repository helpers, shared schemas | Duplicate submissions are idempotent; invalid answers, missing confidence, and unauthorized access are rejected |
| Upgrade practice mode | `QuestionBank.tsx` plus extracted practice components | Learners choose certain, unsure, or guessed before submitting and receive explicit success/error/retry states |
| Derive calibration metrics | Learner analytics service and dashboard/progress responses | Accuracy can be segmented by confidence and timing without exposing private notes |
| Instrument allow-listed events | Shared event registry and server event writer | Discovery, start, submission, and completion events are recorded once and contain no question or journal text |

### Release 3 — Adaptive review queue and mistake journal

The review scheduler will use deterministic intervals of 1, 3, 7, 14, and 30 days. Incorrect answers reset the sequence; correct-but-unsure answers advance conservatively; correct-and-certain answers advance normally. Slow correct answers remain eligible with lower priority. The queue orders overdue items first, then incorrect or guessed items, then slower items; the default daily set is capped at 20 and remains manually adjustable.

| Capability | Implementation approach | Acceptance criteria |
|---|---|---|
| Adaptive review queue | Add `review.listDue`, `review.summary`, `review.submit`, and `review.snooze`; display a reason for every queued item | The same attempt history always produces the same due date and ordering; timezone boundaries are tested |
| Mistake journal | Add create/edit/archive flows from result and review screens; provide controlled taxonomy plus private notes | A learner can convert a mistake into a structured record without re-entering question context |
| Dashboard integration | Promote due review to the primary CTA according to the documented priority rule | Counts, queue contents, and dashboard CTA remain consistent after submissions and snoozes |
| Safety and recovery | Use optimistic UI only for reversible journal edits; invalidate and refetch for attempt/review mutations | Failed mutations do not show false completion or lose journal content |

### Release 4 — Skill mastery map and real progress analytics

The static mastery presentation will be replaced by an explainable, versioned calculation. Initial mastery will combine recent question accuracy at 50%, review retention at 25%, confidence calibration at 15%, and lesson completion at 10%. Each output will include sample size and confidence status; insufficient evidence will be labeled **Not enough data**, not converted into a misleading percentage. The formula and version will be centralized and unit-tested.

| Atomic task | Main files | Completion evidence |
|---|---|---|
| Map questions and lessons to stable skills | Curriculum registry, administrative mapping validation, existing tags/question-tag data | Every mastery-bearing item resolves to one or more recognized skills; unmapped content is reportable |
| Implement mastery aggregation | New pure scoring module and protected analytics router | Fixed attempt fixtures produce exact, reproducible scores and confidence labels |
| Upgrade `MasteryOverview`, `ConceptMap`, and `ProgressTracker` | Existing components and pages | All displayed values come from the server; drill-down explains contributing evidence and recommended next action |
| Add regression and edge-case coverage | Unit and integration tests | Sparse data, repeated attempts, old attempts, ties, and missing mappings are handled explicitly |

### Release 5 — Persistent personal study-plan workspace

The current AI generator will become the drafting stage of a persistent workflow. Authenticated learners may save a generated plan, edit priorities and tasks, reschedule work, mark tasks complete, and activate only one plan at a time. Generation inputs and raw output will be versioned so regeneration does not silently overwrite learner edits. The recommendation system will use objective mastery evidence when available and clearly distinguish it from self-reported weaknesses.

| Atomic task | Main files | Completion evidence |
|---|---|---|
| Add structured generation output | `lessonPlan` router, shared Zod contract, LLM prompt | The model returns validated priorities, weeks, and task objects; malformed output fails safely |
| Persist drafts and versions | Study-plan tables and protected router | Save, edit, activate, archive, and regenerate operations preserve prior versions |
| Build editable workspace | Refactor `LessonPlanGenerator.tsx`; add weekly plan and task components | Learners can edit dates, duration, and order; conflicts and past dates are explained |
| Connect plan to dashboard and mastery | `learner.home` and recommendation service | Today’s task appears as a next action, and task completion updates progress without directly inflating mastery |

### Release 6 — Feature-usage analytics and administrative decision support

Instrumentation begins with Release 1, but the administrative analytics surface is deferred until event quality is verified. The dashboard will emphasize actionable funnels rather than vanity totals: feature discovery to start, start to completion, repeat usage, queue completion, plan adherence, search success, empty-search rate, and flag-cohort comparison. Event metadata will be allow-listed; raw journal text, lesson notes, question text, explanations, and search strings that may contain personal information will not be stored.

| Atomic task | Main files | Completion evidence |
|---|---|---|
| Formalize event schema and retention | Shared registry, analytics router, database cleanup policy | Unknown events or metadata keys are rejected; records expire according to the documented retention period |
| Add admin-only aggregates | Server aggregate queries and role-protected procedures | Non-admin requests are forbidden; aggregate queries do not expose learner-level private content |
| Build the analytics dashboard | New admin page and navigation entry | Operators can compare feature-flag cohorts and identify drop-off without exporting raw learner records |
| Establish product decision gates | Documentation and release checklist | Every rollout decision names its target metric, guardrail metric, observation window, and rollback condition |

## Cross-release feature flags

Each capability will be registered in the typed flag registry and seeded disabled. Suggested keys are `learner_dashboard_v2`, `contextual_orientation`, `accessibility_controls`, `global_command_palette`, `confidence_capture`, `adaptive_review_queue`, `mistake_journal`, `skill_mastery_map`, `persistent_study_plans`, and `product_usage_analytics`. Server-side authorization and data isolation will remain mandatory even when a flag is off; flags control exposure, not security.

## Verification plan

Verification will occur at each atomic task and again at each release checkpoint. The standard quality gate is `pnpm test`, `pnpm check`, and `pnpm build`, followed by database verification, runtime-log review, and manual browser testing. New tests will be colocated with focused server modules rather than expanding the current monolithic router test surface.

| Test layer | Required coverage |
|---|---|
| Pure unit tests | Next-action priority, local-state merge, review intervals, queue ordering, mastery formula, confidence calibration, plan parsing, search ranking, analytics allow-listing |
| Procedure and repository integration | Authentication, ownership isolation, admin authorization, transactional attempt/review updates, plan versioning, idempotency, pagination, migration compatibility |
| End-to-end workflows | Login and optional progress import; resume lesson; submit confidence and answer; receive review item; complete due review; journal a mistake; save and edit a plan; use command search |
| Accessibility | Keyboard-only completion, focus order, screen-reader names, contrast, zoom/text scaling, reduced motion, passage-focus mode, mobile touch targets |
| Responsive and visual | Dashboard, question practice, review queue, journal, mastery, plan workspace, command palette, and admin analytics at mobile and desktop widths |
| Performance | One aggregated dashboard request, paginated question/review/search responses, no unbounded event queries, and measured latency before considering an external search service |
| Rollout | Owner/admin verification at 0%; deterministic cohorts at 10%, 25%, and 50%; runtime and product-metric checks before 100%; kill-switch test before each expansion |

## Documentation, tracking, and checkpoints

Execution will create a new session-specific TODO file and mark tasks complete only after their tests pass. Each release will have its own implementation note in `docs/plans/`, data-contract documentation, flag description, migration record, verification evidence, and checkpoint. Deviations from this roadmap will be recorded before implementation continues. Checkpoints will be created after Foundation, Releases 1–3 individually, Release 4, Release 5, and Release 6, so rollback never requires discarding unrelated work.

## Success criteria

The roadmap is complete when a learner can sign in on a new device, resume meaningful work, answer a question with confidence and timing captured, receive and complete an explainable review queue, record a structured mistake, understand skill mastery with evidence quality, manage an editable study plan, find any relevant learning surface from the keyboard, and adjust reading/accessibility settings. Administrators must be able to release each capability gradually and evaluate discovery, completion, and repeat usage without accessing private reflection content.

## Assumptions and open risks

| Assumption or risk | Planned response |
|---|---|
| All ten capabilities are desired, but not as one release | Deliver them in dependency order through reversible checkpoints and independent flags |
| Existing local lesson state has no trustworthy timestamps | Import only into empty server records and never overwrite durable progress |
| Question tags may be incomplete or inconsistent | Add mapping validation and an unmapped-content report before mastery is exposed |
| The current corpus may not justify external search infrastructure | Start with local curriculum indexing and server question search; reconsider Algolia/Typesense only after measured scale or latency thresholds are exceeded |
| AI plan output can be malformed or pedagogically inconsistent | Require structured validation, preserve input/output versions, and keep learner edits and measured performance authoritative |
| Mastery percentages can imply unjustified precision | Display evidence counts and confidence states; show “Not enough data” for sparse samples |
| Analytics can become invasive | Use first-party allow-listed events, least-privilege admin aggregates, finite retention, and exclusion of free text and proprietary question content |
| Accessibility preferences can conflict with existing visual treatments | Implement through global semantic tokens and test every major workflow in each mode rather than patching pages independently |
| The ten-feature program is substantial | Treat each release as independently useful; do not begin the next release until the current one passes its checkpoint gate |
