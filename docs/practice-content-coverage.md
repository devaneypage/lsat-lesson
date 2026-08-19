# Curriculum Practice Library Coverage

## First Original Expansion

The first substantive practice expansion contains **42 original LSAT-style items**. It assigns six items to each active lesson and uses a two-easy, three-medium, and one-hard progression per lesson. Each item includes five answer choices, a credited answer, an instructional explanation, original-content provenance, canonical lesson/module/topic metadata, and one or more curriculum-skill mappings.

| Lesson | Module | Items | Difficulty gradient |
|---|---:|---:|---|
| Necessary Assumptions | LR | 6 | 2 easy, 3 medium, 1 hard |
| Sufficient Assumptions | LR | 6 | 2 easy, 3 medium, 1 hard |
| Flaw in Reasoning | LR | 6 | 2 easy, 3 medium, 1 hard |
| Common Flaws | LR | 6 | 2 easy, 3 medium, 1 hard |
| Strengthen & Weaken | LR | 6 | 2 easy, 3 medium, 1 hard |
| Reading Comprehension | RC | 6 | 2 easy, 3 medium, 1 hard |
| Formal Logic | Logic | 6 | 2 easy, 3 medium, 1 hard |

## Publication and Visibility

The 42 records are published under the `LSAT Nexus Original Curriculum Library` source. Their question-to-lesson mappings and skill mappings are stored separately from the question text, allowing the learner Question Bank to filter by lesson and allowing attempts to contribute to the existing mastery-evidence model.

Every seeded item is covered by the `CURRICULUM_PRACTICE_REVIEW_MANIFEST`, which links its stable question ID to an original-content attestation, a proprietary-content review, and an excluded-content review. The seed routine enforces this manifest before writing records; a subsequent idempotent verification run confirmed that the library retained **42** published items and added no duplicates.

## Visual Verification

The desktop `/practice` view displays the coverage cards and the lesson filter alongside the expanded practice grid. At the mobile viewport, the coverage cards, lesson selector, existing browse controls, and question cards stack without horizontal clipping. The first load presents the full library, while selecting a coverage card or lesson filter confines the server query to that canonical lesson.
