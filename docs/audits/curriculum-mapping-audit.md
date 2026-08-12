# LSAT Nexus Curriculum Mapping Audit

**Audit date:** 2026-07-16  
**Scope:** canonical local curriculum registry, persisted skill registry, lesson prerequisites, question-to-skill evidence mappings, and mastery-release readiness.

## Executive finding

The codebase contains a coherent initial registry of **7 skills and 7 lessons**, including lesson sequence, duration, section, prerequisites, and primary skills. The production database contains **0 persisted curriculum skills and 0 question-to-skill mappings**. Consequently, **all 484 questions are unmapped** for mastery purposes. Existing question tags are useful editorial metadata, but they cannot be treated as skill evidence without a reviewed, explicit crosswalk.

No mastery percentage, skill map, priority weakness, or skill-based study-plan rationale should be released until the registry is persisted, lesson and skill identifiers are validated, question mappings have reviewed coverage, and learner attempts exist.

## Registry inventory

| Artifact | Local code | Production database | Disposition |
|---|---:|---:|---|
| Curriculum skills | 7 | 0 | Persist only after registry validation and versioning. |
| Curriculum lessons | 7 | Not stored as a dedicated table | Keep lesson metadata in one typed registry initially; do not duplicate it across components. |
| Question-to-skill mappings | N/A | 0 | Create through an explicit reviewed mapping workflow. |
| Questions mapped to at least one skill | N/A | 0 of 484 | Mastery remains unavailable. |
| Unmapped questions | N/A | 484 | Must be triaged by curriculum priority and content quality. |

## Current skill model

| Skill ID | Section | Prerequisites | Lesson coverage |
|---|---|---|---|
| `argument-core` | LR | None | Necessary Assumptions, Sufficient Assumptions, Flaw in Reasoning, Strengthen & Weaken |
| `necessary-assumption` | LR | Argument Core | Necessary Assumptions |
| `sufficient-assumption` | LR | Argument Core | Sufficient Assumptions |
| `flaw-recognition` | LR | Argument Core | Flaw in Reasoning, Common Flaws |
| `strengthen-weaken` | LR | Argument Core | Strengthen & Weaken |
| `passage-structure` | RC | None | Reading Comprehension |
| `conditional-logic` | Logic | None | Formal Logic |

The initial graph is acyclic and understandable, but it is deliberately coarse. It does not yet represent the breadth of the 484-question corpus, and it should not be expanded speculatively from display labels alone. A curriculum owner should approve every new skill definition, prerequisite edge, and tag-to-skill crosswalk.

## Mapping integrity results

| Check | Result | Interpretation |
|---|---:|---|
| Persisted curriculum-skill rows | 0 | Database reporting and referential validation cannot yet resolve local skill identifiers. |
| Question-skill rows | 0 | No question contributes to mastery evidence. |
| Mapped questions | 0 | Skill recommendations cannot be computed. |
| Unmapped questions | 484 | Complete mapping backlog. |
| Orphan question mappings | 0 | Vacuously passes because the table is empty. |
| Unknown-skill mappings | 0 | Vacuously passes because the table is empty. |
| Duplicate mappings | 0 | Vacuously passes because the table is empty. |
| Invalid mapping weights | 0 | Vacuously passes because the table is empty. |

## Required mapping workflow

1. **Validate the canonical registry.** Add tests for unique IDs, unique sequences, canonical routes, valid prerequisite references, valid primary-skill references, and an acyclic prerequisite graph.
2. **Version and persist skills.** Upsert the approved seven skills as registry version 1 through a reviewed migration or idempotent administrative seed operation.
3. **Define editorial mapping policy.** For each question, record one or more skill IDs plus integer weights from 1–100. A mapping means the question creates evidence for that skill; it is not merely topically related.
4. **Build a tag crosswalk as a proposal, not an automatic truth.** Existing topic/objective/section tags may suggest candidate skills. Every proposed crosswalk requires curriculum-owner approval before bulk application.
5. **Map the release-critical subset first.** Prioritize questions used by the seven existing lessons and the first review/practice pathways. Do not block honest generic practice on full-corpus mapping.
6. **Review coverage and ambiguity.** Report unmapped questions, multiply mapped questions, low-confidence proposals, section mismatch, invalid weights, and mappings to deprecated skills.
7. **Enable mastery only after evidence thresholds.** Mapping coverage alone is insufficient; representative, server-authoritative learner attempts must also exist.

## Release gates

| Gate | Passing condition |
|---|---|
| Registry integrity | All IDs and routes are unique; references resolve; graph is acyclic. |
| Persistence parity | Code registry and persisted registry match the same version. |
| Question mapping integrity | Zero orphan, unknown-skill, duplicate, or invalid-weight rows. |
| Coverage transparency | Admin coverage report shows mapped/unmapped counts by section, category, and lesson. |
| Mastery eligibility | A documented minimum-evidence threshold is satisfied; sparse users see `Not enough data`. |
| Explainability | Every mastery result links to contributing attempts, timing, confidence, and formula version without exposing answer keys or private notes. |

## Priority issues

1. **CM-01 — Empty persisted registry:** the local skill model is not available to production reporting or mappings.
2. **CM-02 — Zero mapping coverage:** 484 of 484 questions are unavailable as skill evidence.
3. **CM-03 — No approved tag crosswalk:** tags must not be silently reinterpreted as mastery skills.
4. **CM-04 — Premature mastery surfaces:** the existing mastery-related UI must remain disabled or evidence-empty until registry, mapping, and attempt gates pass.
5. **CM-05 — No mapping administration workflow:** the rebuild needs reviewable proposals, bounded bulk actions, and coverage reporting inside the admin shell.
