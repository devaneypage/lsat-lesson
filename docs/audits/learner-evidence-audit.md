# LSAT Nexus Learner-Evidence Audit

**Audit date:** 2026-07-16  
**Scope:** learner identity, lesson progress, question attempts, review state, mistake reflections, mastery snapshots, study plans, preferences, and product analytics.

## Executive finding

The production application has **one user and one lesson-progress row**, but no question attempts, review items, mistake-journal entries, mastery snapshots, persisted study plans, plan tasks, learner profiles, learner preferences, or product events. This is a structurally important empty-state condition: the system cannot honestly display accuracy, timing, score change, mastery, confidence calibration, review performance, weakness rankings, plan completion, or feature adoption.

The immediate learner release must therefore be designed around **orientation, resume state, content discovery, and explicit onboarding**, not synthetic performance. Practice submission is the first evidence-producing dependency. Review, mistake reflection, mastery, adaptive recommendations, and persistent planning must be enabled only in that order and only after their upstream evidence exists.

## Production evidence inventory

| Evidence domain | Rows | What may be claimed now | What must remain unavailable |
|---|---:|---|---|
| Users | 1 | An authenticated owner account exists. | Population-level learner conclusions. |
| Learner profiles | 0 | Nothing beyond authentication identity. | Target score, test date, weekly availability, priority weaknesses. |
| Learner preferences | 0 | Guest/local accessibility fallback may operate. | Claims of durable synchronized preferences. |
| Lesson progress | 1 | One lesson may be resumed from server state. | Broad completion rates or learning streaks. |
| Question attempts | 0 | No performance evidence. | Accuracy, timing, confidence calibration, topic strength, question-history recommendations. |
| Review items | 0 | No due review. | Adaptive queue urgency or review completion claims. |
| Mistake-journal entries | 0 | No reflection history. | Error-taxonomy frequencies or learner-specific mistake patterns. |
| Mastery snapshots | 0 | No mastery evidence. | Skill percentages, levels, strengths, or weaknesses. |
| Study plans | 0 | No saved plan. | Active-plan task recommendations or completion. |
| Study-plan tasks | 0 | No task evidence. | Weekly adherence or due-task claims. |
| Product events | 0 | No usage evidence. | Feature adoption, funnel, retention, or completion analytics. |

## Claim-to-evidence matrix

| Learner-facing claim | Minimum durable inputs | Current eligibility |
|---|---|---|
| Resume lesson | Lesson progress with valid lesson ID and route | **Eligible for one observed row**, with fallback when none exists. |
| Due review | Active review item with due timestamp and source attempt | Not eligible. |
| Recent accuracy | Server-authoritative submitted attempts in defined time window | Not eligible. |
| Average active time | Attempt-level active time with pause/background policy | Not eligible. |
| Confidence calibration | Pre-answer confidence plus correctness across minimum sample | Not eligible. |
| Skill mastery | Valid question-skill mappings plus thresholded attempts and formula version | Not eligible. |
| Priority weakness | Explainable skill evidence below threshold, with uncertainty | Not eligible. |
| Plan task due | Active persisted plan and pending task | Not eligible. |
| Review effectiveness | Repeated attempts tied to review items | Not eligible. |
| Feature adoption | Sanitized product events with exposure and completion definitions | Not eligible. |

## Required evidence sequence

1. **Protect identity and ownership.** Every learner mutation and read is scoped by `ctx.user.id`; private reflection text is never returned through aggregate analytics.
2. **Create authoritative attempts.** The server receives question ID, selected answer, pre-answer confidence, active time, context, and idempotency key; it derives correctness from protected question data.
3. **Schedule deterministic review.** Incorrect, uncertain, guessed, or slow attempts create/update one review state per learner/question using a versioned policy.
4. **Capture optional reflection.** A learner may classify the mistake and record private notes after submission. Reflection never fabricates an explanation and never changes correctness.
5. **Map questions to approved skills.** Only reviewed mappings contribute evidence.
6. **Calculate mastery snapshots.** Versioned, explainable calculations use attempts and mapping weights; insufficient samples remain explicitly insufficient.
7. **Generate constrained plans.** AI may draft tasks from observed evidence and learner-provided constraints, but outputs are validated, versioned, editable, and activated only by the learner.
8. **Measure product usage.** Sanitized allowlisted events quantify discovery and completion; no question content, answer text, journal prose, or arbitrary metadata is collected.

## Sparse-state contract

For every learner domain, the interface must distinguish four conditions:

| Condition | Required behavior |
|---|---|
| Loading | Stable skeleton or progress affordance without invented values. |
| No evidence yet | State exactly what is missing and offer the next evidence-producing action. |
| Partial evidence | Show observed facts and uncertainty; do not extrapolate unsupported trends. |
| Error | Preserve the previous trustworthy state when possible and offer a retry or escape route. |

The initial Today route should resolve its primary action from durable inputs in this order: due review, resumable lesson, active-plan task, recommendation supported by evidence, then onboarding or diagnostic. With current production data, the likely honest state is **resume the one observed lesson** for its owner or **begin onboarding/choose a lesson** for a learner without progress.

## Privacy and analytics boundaries

Product events may include only allowlisted metadata such as route, surface, content type, opaque content ID, result type, query-length bucket, feature key/variant, and status. They must not include question text, answer choices, selected-answer prose, explanation text, search text, mistake-journal prose, private notes, emails, names, or target-score narratives. Administrative analytics should default to aggregate counts and suppress or label segments too small to support responsible interpretation.

## Release gates

| Domain | Gate |
|---|---|
| Practice | Idempotent server submission; protected answer key; validated answer/confidence/time; explicit explanation-unavailable state. |
| Review | Deterministic policy tests; ownership isolation; due-order and daily cap; reason shown. |
| Journal | Ownership tests; controlled taxonomy; optional fields; privacy boundary tests. |
| Mastery | Registry parity; mapping coverage; formula tests; minimum evidence; explainability. |
| Plan | Schema validation; persistence; version history; one active plan invariant; editable tasks. |
| Analytics | Event-name and metadata allowlists; exposure semantics; aggregate-only admin output; retention policy. |

## Priority issues

1. **LE-01 — No authoritative attempt evidence:** practice submission is the first functional dependency for adaptive learning.
2. **LE-02 — Unsupported dashboard/progress claims:** all fabricated performance values must be removed before broader learner rollout.
3. **LE-03 — Review and mastery are structurally present but evidentially empty:** flags must remain off until upstream data and mappings pass gates.
4. **LE-04 — Plan generation is not durable:** generated text cannot be treated as an active study system.
5. **LE-05 — Analytics is empty:** future reporting requires explicit exposure and completion events, not retroactive inference.
6. **LE-06 — Privacy boundary must precede collection:** allowlists and aggregation rules are requirements, not a later cleanup.
