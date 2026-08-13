# Question Bank Content Baseline Plan

## Objective

This batch makes the currently available original starter set a truthful, coherent learner experience without representing it as a complete question bank or importing proprietary LSAT content. It preserves the active Academic Light / Nexus design system and uses the existing server-authoritative question model.

## Current State

| Area | Current condition | Decision for this batch |
|---|---|---|
| Question data | Five original Logical Reasoning items are available through the existing idempotent seed workflow. | Preserve and label the source as an original starter set. |
| Persistence | Questions, attempts, progress, and evidence models already exist. | Do not introduce a schema migration. |
| Browse controls | Difficulty and tag controls appear twice in the learner interface. | Consolidate to one control per filter axis. |
| Content readiness | The interface lists five questions but does not clearly frame their limited, starter-set coverage. | Surface scope, provenance, and category coverage. |
| Visual consistency | The Question Bank retains pre-Nexus hard-coded presentation patterns. | Align its surface, state messaging, and controls with active tokens and page primitives. |

## First Implementation Batch

### Task 1 — Consolidate the browse controls

Retain category, difficulty, source, and tag filtering while removing the duplicated difficulty and tag selectors. The resulting filter row must remain keyboard-accessible and responsive at narrow widths.

### Task 2 — Add a transparent content baseline

Add a learner-facing availability panel that reports the loaded count, identifies the entries as original LSAT-style practice items rather than official LSAC questions, and explains that the collection is a starter set. The panel will derive category coverage from loaded data and will not claim content that is not present.

### Task 3 — Normalize the active Question Bank states

Apply the current academic surface, semantic tokens, and state primitives consistently to browse, practice, and statistics views. This includes neutral loading, no-results, and unauthenticated states, while preserving existing answer-submission behavior and privacy statements.

## Verification

The batch will receive a focused Vitest contract for the visible content-baseline and filtering invariants. It will also receive type checking, the existing test suite, and desktop/mobile visual verification of the `/practice` workflow.

### Visual verification findings

The desktop review confirms a single difficulty and tag selector, a visible original-starter-set disclosure, and a legible three-column card grid. The mobile review confirms that the scope panel, filter controls, view-mode buttons, and practice cards stack cleanly without horizontal overflow. The collection-scope metadata remains readable at the narrow viewport and accurately identifies the five-item original starter set.

The final verification pass, after applying the semantic background and surface updates to browse, practice, and statistics states, preserved the same desktop and mobile behavior. No visual regression, horizontal clipping, duplicate filter control, or misleading content claim was observed in the authenticated `/practice` route.

## Deferred Work

Expanding the starter set into a broad curricular bank requires an approved original-question authoring and review pipeline. Diagnostic delivery and further evidence-derived mastery work remain separate, follow-on batches because they need their own assessment taxonomy and scoring contracts.

### Final semantic-token verification

The final desktop and mobile passes retain the intended hierarchy, original-content disclosure, single filter control per axis, and responsive card layout. The Question Bank no longer contains hardcoded color literals in its loading, browse, practice, or statistics view source; the active semantic tokens now carry those states consistently.

Validation completed for this batch: `pnpm check` passed, the focused Question Bank suite passed with four tests, the full Vitest suite passed with 119 tests, and responsive `/practice` visual review passed at 1280px and 375px widths.
