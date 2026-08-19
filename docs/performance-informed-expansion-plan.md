# Evidence-Ready Practice Expansion Plan

## Evidence Basis

The current library has six questions per active lesson in a 2-easy, 3-medium, 1-hard distribution. There are no learner attempts yet, so no observed error rate can responsibly be treated as a performance signal. The expansion therefore uses an **evidence-ready** design: it adds discriminating item forms that will generate useful future evidence while correcting the structural shortage of hard questions.

## Approved Difficulty Architecture

Each lesson receives six new original items: **one easy, two medium, and three hard**. Combined with the existing six, every lesson will hold **three easy, five medium, and four hard** items.

| Lesson | New easy focus | New medium focuses | New hard focuses |
|---|---|---|---|
| Necessary Assumptions | Basic negation test | Quantifier necessity; alternative-cause assumption | Comparative claim; conditional dependency; multi-premise evidence gap |
| Sufficient Assumptions | Direct conclusion bridge | Conditional chain; policy criterion | Multi-condition guarantee; scope bridge; competing-condition resolution |
| Flaw in Reasoning | Simple causal alternative | Sampling frame; relative/absolute shift | Equivocation in context; necessary/sufficient reversal; interacting causal explanations |
| Common Flaws | Overgeneralization | Division/composition; probability/base-rate confusion | Ambiguity; causal interaction; hybrid comparative-scope flaw |
| Strengthen & Weaken | Direct causal support | Representative-sample evidence; plan feasibility | Alternative explanation; conditional counterfactual; competing causal mechanisms |
| Reading Comprehension | Main conclusion in a short original passage | Viewpoint contrast; supported inference | Analogical role; argumentative method; subtle qualification/inference |
| Formal Logic | Single conditional inference | Quantifier translation; either/or constraint | Multi-rule deduction; contraposition chain; conditional exception analysis |

## Content Standards

Every item must be wholly original, include five non-empty answer choices, have one defensible credited answer, and include a concise instructional explanation. Each record must preserve canonical lesson, module, topic, and mastery-skill associations. The same reviewed-original-content manifest and publication safeguards that govern the initial library will govern the second tranche.

## Final Audit

The second tranche has a reviewed subskill manifest with six non-duplicative designations per lesson. The manifest is enforced against the stable `nexus-84` question IDs, compared against the first tranche’s reviewed introductory-subskill manifest, and paired with the original-content provenance review. A content-level audit identified five initially over-similar patterns; each was replaced, then independently re-audited with a question-text evidence phrase and an approved distinction from its first-tranche lesson patterns. Every new item passes the established answer, confidence-calibration, and active-time evidence contract. A repository-bound regression test verifies that practice submission reads stored skill mappings and returns typed skill evidence with the scored attempt. A final non-mutating live-database regression invoked that same persisted-skill loader for `nexus-84-necessary-assumptions-009`, confirming database question ID `60003` and its stored `argument-core` and `necessary-assumption` mappings. An automated rollback-only integration test then submitted that real persisted question through the complete practice-submission boundary, asserted both returned mapped evidence records, and rolled back the temporary attempt and product events. A separate non-mutating database query confirmed that all five repaired `nexus-84` records contain their reviewed replacement text and retain one or two persisted skill mappings.
