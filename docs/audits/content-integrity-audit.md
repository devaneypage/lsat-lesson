# LSAT Nexus Content Integrity Audit

**Audit date:** 2026-07-16  
**Scope:** the production question corpus, answer integrity, explanations, taxonomy links, and prerequisites for learner evidence.

## Executive finding

The 484-question corpus is structurally usable: every question has nonblank question text, a valid A–E answer key, category and difficulty values, and at least one tag. There are no duplicate question-text groups or duplicate question–tag pairs. Two material defects block an evidence-trustworthy release, however: **71 questions have blank explanations**, and **45 question–tag rows reference question records that no longer exist**.

## Measured integrity results

| Check | Count | Severity | Release disposition |
|---|---:|---|---|
| Invalid correct-answer values | 0 | Pass | No action required. |
| Correct answer E with missing option E | 0 | Pass | No action required. |
| Blank question text | 0 | Pass | No action required. |
| Blank explanations | 71 | High | Do not promise explanations for affected questions; backfill or explicitly label explanation unavailability before practice-result release. |
| Missing category | 0 | Pass | No action required. |
| Missing difficulty | 0 | Pass | No action required. |
| Duplicate question-text groups | 0 | Pass | No action required. |
| Questions without tags | 0 | Pass | No action required. |
| Orphan question–tag links | 45 | High | Remove or repair orphaned links through a reviewed migration after exporting their identifiers. |
| Orphan tag links | 0 | Pass | No action required. |
| Duplicate question–tag pairs | 0 | Pass | No action required. |

## Interpretation

The blank-explanation defect is a learner-facing trust problem, not merely a content-completeness statistic. Practice results must branch explicitly between a substantive explanation and an honest “explanation not yet available” state. The interface must not infer, generate, or display an explanation that is absent from the durable source record.

The orphaned question links indicate that the junction table lacks enforced referential integrity or that historical deletions bypassed it. They do not currently leave any live question untagged, but they inflate relationship counts and can corrupt administrative reporting. Before deleting them, the rebuild should export the 45 link identifiers, determine whether their missing question IDs correspond to a known import or deletion event, then apply a bounded cleanup migration with a post-migration zero-orphan assertion.

## Required gates

| Gate | Passing condition |
|---|---|
| Practice explanation honesty | Every result renders either the stored explanation or a deliberate unavailable state. |
| Taxonomy integrity | Orphan question links equal zero after a reviewed, reversible cleanup. |
| Import protection | New imports reject invalid answer values and empty explanations according to an explicit content policy. |
| Administrative visibility | Content administrators can filter records missing explanations without exposing controls in the learner shell. |
| Regression coverage | Tests cover answer-key validation, explanation absence, duplicate relations, and orphan detection. |

## Priority issues

1. **CI-01 — Blank explanations:** 71 of 484 questions cannot support an explanation-dependent review experience.
2. **CI-02 — Orphaned taxonomy relations:** 45 `questionTags` rows reference missing questions and must be investigated before cleanup.
3. **CI-03 — Missing database-level relation enforcement:** schema and import/delete workflows must prevent future orphan creation.
