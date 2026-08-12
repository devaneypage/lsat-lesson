# LSAT Nexus Product Workflow Audit

**Audit date:** 2026-07-16  
**Scope:** current public, learner, and administrative routes; entry-to-outcome workflows; evidence integrity; state handling; role separation; responsive viability.

## Executive finding

The application contains viable feature modules but does not yet behave as one coherent learning product. A single global navigation exposes learner study, marketing, booking, import, taxonomy, curriculum, and feature administration together. The learner-facing dashboard and progress route present unsupported score and mastery claims, while the most evidence-backed workflow—the question bank—combines discovery, practice, explanation, and statistics in one large client component. Administrative functionality ranges from durable and authorized (feature flags and most taxonomy mutations) to simulated and unauthenticated at the route level (CSV import).

The rebuild should preserve working data and procedure contracts, then reorganize them behind three explicit shells: **public**, **learner**, and **admin**. Canonical learner workflows should be outcome-oriented: Today, Learn, Practice, Review, Progress, Plan, and Search. Administrative workflows should move to `/admin/*` and rely on server-side authorization rather than visibility alone.

## Current workflow disposition

| Current page | Audience | Evidence status | Principal risk | Disposition |
|---|---|---|---|---|
| Dashboard | Learner | Feature flags are durable; score, percentile, target, and mastery cards are hardcoded. | Fabricated learner claims and mixed legacy/new composition. | **Refactor** into canonical Today with one server-evidenced primary action and explicit sparse-data states. |
| Lessons | Learner | Lesson content is bundled locally; feature flag is durable. | Hardcoded count, no content error/empty contract, and legacy route naming. | **Retain and refactor** as Learn with a typed curriculum registry and canonical lesson routes. |
| Question Bank | Learner | Questions and tags are server-backed. | Fetches up to 10,000 records, conflates discovery and active practice, exposes answer state client-side, and collapses on mobile. | **Decompose and refactor** into discovery, session setup, active attempt, and results. |
| Progress | Learner | No server evidence; all performance values are static. | Unsupported accuracy, score gains, time, trends, and topic claims. | **Replace body** with server-derived evidence and a Not enough data state. |
| Lesson Plan Generator | Learner | AI generation is server-backed, but output is ephemeral client state. | No persistent plan versions, editable tasks, evidence-constrained rationale, or malformed-output boundary. | **Refactor** into persistent, validated, editable Plan. |
| CSV Import | Admin | Import is simulated with client timeout; no durable mutation is called. | Administrative action appears real without persistence or route authorization. | **Move and replace workflow** at `/admin/content/import` with validated server import, preview, commit, and audit history. |
| Tag Manager | Admin | Queries and mutations are server-backed; admin actions are role-sensitive. | Learner-visible route, partial client visibility gating, 200-record ceiling, and weak small-screen layout. | **Move and refine** at `/admin/taxonomy` with procedure-level authorization and paginated selection. |
| Feature Flags | Admin | Durable server list/toggle/rollout procedures and admin checks. | Hardcoded category lists and temporary client-cache inconsistency. | **Retain and refactor** inside the admin shell with registry-driven grouping and explicit rollout state. |

## Target workflow model

| Shell | Canonical destinations | Navigation rule |
|---|---|---|
| Public | Home, About, Booking | No learner or administrative controls. Authentication or learner entry leads into `/today`. |
| Learner | Today, Learn, Practice, Review, Progress, Plan | Every route exposes orientation, a primary action, honest loading/empty/error states, and a clear next step. |
| Admin | Overview, Content, Import, Taxonomy, Feature Flags, Analytics | Server-authorized routes and procedures only; no admin controls appear in learner navigation. |

## Entry-to-outcome findings

### Daily learning

The current dashboard is a composition surface rather than a workflow. It lacks an evidence-backed empty state and does not resolve competing actions. The target Today workflow must choose exactly one deterministic primary action in this order: due review, recent lesson, active-plan task, recommended drill, then onboarding or diagnostic. Secondary actions may be shown, but they must not compete visually with the primary recommendation.

### Learning

The lesson hub provides usable access to seven lesson modules, but lesson count and route metadata are hardcoded in multiple places. The target Learn workflow must use one curriculum registry for title, slug, section, prerequisites, estimated time, next step, and skill mappings. Legacy `/lessons/*` URLs remain aliases until link migration is complete.

### Practice

The current question bank follows a coherent conceptual sequence—filter, select, answer, submit, view explanation—but all phases live in one client module and the initial query retrieves a very large set. The target workflow separates question discovery from a server-authoritative attempt session. Confidence is recorded before answer submission; elapsed time counts active interaction only; correctness is computed server-side; and explanations render only from stored content.

### Review and reflection

There is no complete learner route for due review or private reflection despite additive schema foundations. Review remains gated until durable question attempts exist. The review queue must explain why each item is due and allow completion or bounded snooze. Mistake-journal text is private learner data and must never appear in aggregate analytics.

### Progress

The current Progress route is entirely static and therefore cannot survive the first coherent learner release. Its replacement must distinguish observed facts from interpretations: attempt counts, accuracy, timing, confidence calibration, review completion, and skill evidence. Mastery remains unavailable until question-to-skill mapping coverage and minimum evidence thresholds pass.

### Planning

AI plan generation currently produces a transient document with copy and print affordances. The target Plan workflow validates a structured draft, saves a version, lets the learner edit and schedule tasks, and requires explicit activation. Generated recommendations do not directly increase mastery.

### Administration

Feature flags are the strongest administrative workflow and should anchor the new admin shell. Taxonomy is substantially server-backed but requires pagination and strict procedure authorization. Import is currently a simulated interface and must not remain available as if it were operational. The target import flow is upload → parse/validate → review errors and counts → explicit commit → immutable import history.

## Prioritized issue register

| ID | Severity | Finding | Required resolution | Verification |
|---|---|---|---|---|
| WF-01 | Critical | Dashboard and Progress present unsupported learner metrics. | Remove or gate every unsupported score, mastery, percentile, gain, time, and trend claim. | Sparse-data user sees no fabricated value; automated fixtures prove every displayed metric source. |
| WF-02 | Critical | CSV import simulates success without a durable server import. | Move behind admin authorization and implement preview/commit against validated procedures. | A committed import creates import history; failed rows remain uncommitted and reported. |
| WF-03 | High | Public, learner, commercial, and admin destinations share one global navigation. | Introduce typed route registry and three role-appropriate shells. | Route matrix and responsive screenshots show no cross-audience leakage. |
| WF-04 | High | Question Bank fetches up to 10,000 rows and is not mobile viable. | Add server pagination/filtering and split discovery from attempt UI. | Bounded query contract; keyboard/mobile attempt flow passes. |
| WF-05 | High | Administrative routes rely partly on page visibility and remain globally discoverable. | Require server-side admin procedures and admin route guard for all mutations. | Non-admin integration tests return FORBIDDEN; learner navigation omits admin routes. |
| WF-06 | High | Practice does not yet create authoritative attempt evidence. | Implement idempotent server submission, confidence, active timing, and protected correctness. | Duplicate submissions are idempotent; client cannot choose correctness. |
| WF-07 | High | Progress and mastery lack prerequisite evidence and mappings. | Keep gated until attempt and mapping thresholds pass. | Not enough data state and mapping coverage report. |
| WF-08 | Medium | Lesson metadata and navigation are duplicated and hardcoded. | Centralize in typed route/curriculum registries with aliases. | Registry tests cover unique IDs, routes, labels, and aliases. |
| WF-09 | Medium | Study-plan output is transient and not editable as durable tasks. | Add validated drafts, versions, persistence, activation, and editing. | Regeneration preserves prior versions; active plan invariant passes. |
| WF-10 | Medium | Loading, empty, error, and authentication states vary by page. | Standardize shared state primitives and page contracts. | State matrix covered by component/integration tests and screenshots. |
| WF-11 | Medium | Feature flags use hardcoded UI categories. | Drive grouping from one registry and expose exact effective rollout state. | Registry/client/server key parity test passes. |
| WF-12 | Medium | Command search and route orientation are not driven by canonical routes. | Bind both to the route registry and preserve legacy aliases. | Search resolves canonical destinations; breadcrumbs and next actions remain valid. |

## Workflow audit exit criteria

The workflow audit is complete when every current primary page has a documented audience, evidence source, failure-state contract, disposition, and canonical destination; critical trust defects are represented in the rebuild tracker; and role separation is encoded in the next implementation phase rather than left as a visual-only recommendation.
