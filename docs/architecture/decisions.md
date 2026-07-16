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
