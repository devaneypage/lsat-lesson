# Original-Question Authoring and Review Workflow

## Purpose

This workflow lets administrators expand the LSAT Nexus Question Bank with **original LSAT-style practice items** while ensuring that unreviewed content can never appear to learners. It deliberately does not reproduce official LSAC questions or other proprietary assessment content.

## Lifecycle

| Status | Meaning | Permitted next states |
|---|---|---|
| `draft` | Author is editing a private submission. | `submitted` |
| `submitted` | Submission awaits an independent editorial decision. | `needs_revision`, `approved`, `rejected` |
| `needs_revision` | Reviewer requires a substantive revision. | `draft`, `submitted` |
| `approved` | Content is ready for a controlled publication action. | `published` |
| `rejected` | Content does not satisfy the quality or rights protocol. | `draft` |
| `published` | A durable learner-visible Question Bank record has been created. | none |

## Required Controls

Every submission has an author, source label, rights-attestation, and immutable lifecycle timestamps. The workflow collects the question stem, answer options, keyed answer, rationale, skill category, and difficulty before submission. Review actions require a recorded decision and, when a revision or rejection is selected, editorial notes.

Publication copies an approved submission into the established `questions` collection. It resolves the category, difficulty, and source through existing lookup records, records the learner-visible question identifier on the submission, and then makes the submission immutable as `published`. Drafts and submitted items are never returned by learner-facing procedures.

## Quality Protocol

Review must confirm that the item is original, scoped to Logical Reasoning or Reading Comprehension, has one defensible credited response, includes non-misleading distractors, and supplies an instructional explanation. Reviewers must reject or return any item with uncertain provenance, verbatim external text, missing rationale, or a missing rights attestation.

## Verification Contract

The server test suite will cover input validation, administrator-only access, state-transition rules, requirement of review notes for non-approval outcomes, idempotent publication, and learner isolation. The administrative screen will be checked at desktop and mobile widths before release.

### Responsive review

The administrator workspace was reviewed at 1280px and 375px widths. At desktop size, the authoring form and queue establish a readable two-column editorial workspace. At mobile size, the protocol, form fields, rights attestation, save control, and empty queue stack without horizontal clipping. The management route remains visibly separated from learner navigation.

The final review confirmed that the revised authoring form remains readable at both widths after adding the draft-revision path. A queued `draft`, `needs_revision`, or `rejected` item can now be reopened in the authoring form, edited, and returned to private-draft status before resubmission.

### Authoring extensions review

The skill-mapping and CSV draft-intake additions were verified at 1280px and 375px widths. The desktop workspace keeps the intake preview above the authoring form, retains a readable two-column skills checklist, and reserves the review queue alongside authoring. At the mobile width, the CSV upload/preview control, mapped-skill checklist, rights attestation, and draft action remain vertically ordered with no horizontal clipping. Reviewer assignment and editorial due-date controls appear only after an administrator selects a queue item, keeping the primary authoring path focused.

## Authoring Extensions

### Curriculum-skill mapping

Authors can map up to five canonical curriculum skills to a question submission. The skills come from the existing registry, rather than from ad hoc labels, and the mappings remain private alongside the draft. At publication, the mappings are copied to the learner-visible question evidence relation, so subsequent attempts can contribute to the established mastery model.

### CSV draft intake

The intake panel parses a selected CSV locally, then asks the protected server procedure to preview every row. Preview checks the authoring field contract, credited-answer structure, maximum batch size, and each semicolon-delimited `skill_ids` entry against the curriculum registry. The preview commits nothing. Only a separate, rights-attested confirmation can create valid rows as private drafts; invalid rows must be corrected first.

Malformed rows do not terminate the preview. Each row returns its own validation findings, including invalid answer choices, unsupported difficulty values, incomplete fields, and unknown skills. An administrator can remove an invalid row from the staged set and re-run the preview, or correct the source CSV and select it again. The confirmation action remains disabled until every remaining row validates.

### Reviewer assignment and editorial due dates

An administrator can assign a submitted item to an active administrator and record an editorial due date. Assignment is separate from the eventual reviewer decision, so the record distinguishes work ownership from the administrator who approves, rejects, or requests revision. Both properties remain on the private submission and never alter learner-facing question data.
