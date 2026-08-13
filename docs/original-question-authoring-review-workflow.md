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
