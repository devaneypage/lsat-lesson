# Architecture Decisions

## ADR-001: Central route registry

**Status:** Accepted and implemented.

All primary destinations, labels, audiences, aliases, and shell memberships are defined in `client/src/lib/routes.ts`. Navigation, contextual orientation, command search, route aliases, and route-level access tests must use this registry rather than maintaining independent path lists.

### Canonical destinations

| Audience | Canonical destinations | Shell |
|---|---|---|
| Public | Home, About, Pricing, Methodology, Resources | Public shell |
| Learner | Today, Learn, Practice, Review, Progress, Plan, Settings | Learner shell |
| Administrator | Content, Curriculum, Releases, Insights | Administrator shell |

Legacy routes remain compatibility aliases only. Nested lesson aliases preserve path suffixes, query strings, and hashes. New internal links must use canonical paths.

## ADR-002: Role-separated application shells

**Status:** Accepted and implemented.

The former mixed-audience global navigation is replaced by public, learner, and administrator shells. The learner shell requires an authenticated learner. The administrator shell requires an authenticated user with the `admin` role. Access resolution is represented as a pure contract and covered by regression tests; page-level checks may remain temporarily during migration but are not the primary boundary.

## ADR-003: Evidence-honest learner states

**Status:** Accepted and implemented for the Today and Progress entry states.

No learner-facing score, percentile, mastery level, recommendation, or trend may be displayed unless it is derived from persisted authoritative learner evidence. The former illustrative Today metrics and simulated progress-import UI have been removed from canonical routes. Empty states explain what evidence is missing and what learner action can create it.

## ADR-004: Incremental migration rather than rewrite

**Status:** Accepted.

Existing viable lesson, practice, planning, flag, preference, and learner-history modules remain in place behind canonical shells while their domains are decomposed and hardened. Each replacement must have a feature-level verification gate and a compatibility or rollback path before legacy code is retired.

## ADR-005: Legacy Question Bank is a bounded migration risk

**Status:** Accepted as temporary debt.

The current Question Bank eagerly requests and renders all 484 question cards. It is functional in a normal viewport but creates an excessive full-page document and must not be treated as the final Practice architecture. The Practice-domain phase will replace it with bounded server pagination and server-side filtering; until then, it remains a compatibility surface and may not be used as evidence that the new practice experience is complete.

## Verification record

The route registry is covered for unique paths, alias canonicalization, nested deep links, query/hash preservation, audience separation, and role access. Responsive visual checks confirm the public, learner, and administrator shells render at desktop and mobile widths. The Practice route’s apparent blank full-page mobile capture was isolated to excessive document height; a normal viewport capture confirms the route renders.

## ADR-006: Composition-only tRPC root and focused domain routers

**Status:** Accepted and implemented.

`server/routers.ts` is a composition root only. Endpoint logic lives in focused routers for authentication, questions, taxonomy, feature flags, learner state, preferences, practice, review, search, analytics, study plans, and the legacy AI plan draft. The composition root may not contain `.query()` or `.mutation()` definitions and is protected by a regression test.

Question, taxonomy, and feature-rollout routers depend on focused repository boundaries under `server/repositories/`. The current repository adapters deliberately preserve the proven low-level Drizzle behavior in `server/db.ts` during migration. Direct Drizzle extraction from that compatibility module remains deferred until the Practice and Administration phases can replace the eager legacy queries without coupling a structural move to a behavioral rewrite.

## ADR-007: Centralized server-side authorization

**Status:** Accepted and implemented for extracted domains.

All question imports, taxonomy mutations, and feature-rollout mutations use `adminProcedure`. The legacy AI plan draft uses `protectedProcedure`. Routers must not repeat inline `ctx.user.role` checks when a reusable procedure already represents the boundary. Anonymous feature evaluation and bounded public content discovery remain public by explicit design; administrator metadata remains restricted.

## ADR-008: Bounded transport contracts

**Status:** Accepted and implemented for extracted domains.

Question, taxonomy, and flag inputs now enforce bounded strings, arrays, identifiers, offsets, and page sizes. CSV answer choices are normalized at the client parsing boundary and revalidated as the `A | B | C | D | E` union at the server boundary. This normalization is covered independently so malformed CSV values cannot weaken the server contract.

The current public question-list response still includes legacy answer fields because the existing Question Bank depends on that contract. It is not the final practice-delivery contract. The Practice phase must introduce answer-protected attempt procedures before the legacy list can be narrowed or retired.

## Backend decomposition verification record

The root-router composition contract, repository imports, administrator middleware, authenticated plan drafting, feature-flag privacy boundary, and CSV answer normalization are covered by focused Vitest suites. The extraction is also required to pass the full TypeScript and production-build gates before release.

## ADR-009: One server-derived Today action

**Status:** Accepted and implemented behind `learner_dashboard_v2`.

The Today response selects exactly one primary action by deterministic server priority: due review, then the most recently active incomplete lesson, then the next due task from the active study plan, then curriculum onboarding. The client renders this generic action contract and may not infer competing recommendations from separate requests. Supporting counts remain secondary evidence, not parallel calls to action.

## ADR-010: Canonical contextual orientation

**Status:** Accepted and implemented behind `contextual_orientation`.

Today, Learn, Practice, Review, Progress, and Plan share one route-derived orientation contract for breadcrumb, purpose, estimated time, current state, and next action. Lesson routes extend the same contract with prerequisite context. Orientation metadata is not duplicated inside individual page implementations.

## ADR-011: Bounded Practice discovery and nullable command-search deep links

**Status:** Accepted and implemented.

Practice browsing requests at most 200 questions per page and reports the accurate visible range against the authoritative server total. Command-search question results hydrate one bounded `questions.getById` lookup rather than loading the entire bank. A removed or stale result returns `null` as a normal read outcome; Practice presents an explicit browseable fallback without retries, full-page trapping, or expected API errors in runtime logs.

The later practice-evidence phase will replace public answer-bearing discovery records with answer-protected attempt contracts. Bounded discovery is an interim performance and navigation correction, not the final answer-security architecture.

## Daily learner release verification record

Deterministic priority coverage includes due review, active lesson, active plan task, onboarding, completed-curriculum review, and empty-data states. Release-level tests cover valid and stale question links, bounded pagination, and orientation coverage across every canonical learner surface. Desktop visual verification confirms real question hydration and the stale-link fallback. The complete automated suite, TypeScript check, and production build must pass before enabling the four daily learner feature flags.
