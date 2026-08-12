# LSAT Nexus — Validated Learner Roadmap

**Prepared:** August 12, 2026  
**Inputs reviewed:** `UXOverhaulImplementationPlan.md`; `LSATNexus—DevelopmentReview&ContentGapAnalysis.md`; current application routes, source inventory, and browser verification results.

## Executive Position

The original UX overhaul has substantially shipped. The current product has deliberately separated a **public tutoring site** (`/`, `/about`, `/booking`) from a **private learner workspace** (`/dashboard`, `/question-bank`, `/progress`, and related learner routes). This is an architectural improvement over the earlier plan’s assumption that a single public Nexus dashboard would serve every visitor.

The next build phase should prioritize **content depth and authenticated learner acceptance testing**, not another visual-system rebuild. The Question Bank now has an initial five-question original Logical Reasoning sample set, learner-attempt outcomes, and detailed answer walkthroughs. It is no longer empty, but it is not yet broad enough to support sustained targeted drilling.

## Verified Application State

| Surface | Current behavior | Evidence | Status |
|---|---|---|---|
| Public landing page | Renders the learning-path entry point | Browser verification | Passed |
| About page | Renders the instructor page | Browser verification | Passed |
| Booking page | Renders the public booking surface | Browser verification | Passed |
| Dashboard | Enforces the learner sign-in boundary when unauthenticated | Browser verification | Passed |
| Question Bank | Enforces the learner sign-in boundary when unauthenticated | Browser verification | Passed |
| Question catalog | Returns all five `nexus-lr-sample-001` through `-005` records | Public API verification | Passed |

> **Testing boundary:** Protected learner actions were not exercised through an owner-authenticated browser session. The current browser verification confirms the sign-in guard; it does not substitute for an authenticated acceptance test of attempt submission, outcomes, and explanation rendering.

## Planning Assumptions Requiring Update

| Earlier claim | Validated current state | Implication |
|---|---|---|
| The Question Bank is empty. | Five original Logical Reasoning samples are seeded and verified. | Downgrade “empty” to “initial content cohort; expansion required.” |
| No progress persistence exists. | Attempt evidence, latest outcomes, timing, confidence, and per-question result states now exist for signed-in learners. | Replace with “complete authenticated acceptance testing and connect mastery views to evidence.” |
| `/progress` returns 404. | `/progress` is registered as a learner-workspace route. | Audit the authenticated experience rather than rebuild the route blindly. |
| Ten production feature flags govern the system. | The current default registry includes the original flag family plus additional learner-release controls. | Update documentation and admin-facing inventory from the live registry before making rollout decisions. |
| The dashboard is a public entry point. | The learner workspace is protected; the public entry point remains the tutoring and learning-path site. | Maintain the public/private distinction in UX documentation and acceptance tests. |

## Recommended Next Sprint

### P0 — Build a Quality-Controlled Question Content Cohort

Expand from the five original samples to a deliberate first cohort across Logical Reasoning and Reading Comprehension. Each item should have five answer choices, an authoritative answer key, an explanation, category/difficulty/source metadata, and explicit curriculum-skill mapping. Use the existing sample seed as the content-quality reference rather than importing unreviewed bulk material.

**Success criteria:** at least one complete drillable cohort per high-priority skill, zero duplicate stable IDs, all questions browseable, and an auditable source/ownership record for every item.

### P1 — Run Authenticated Learner Acceptance Testing

Test the signed-in flow end-to-end: begin a question, select an answer, submit a confidence judgment, see the answer result, open the detailed walkthrough, return to the Question Bank, and confirm the latest outcome and counts update. Verify isolation by confirming a second learner cannot receive the first learner’s outcomes.

**Success criteria:** persisted attempt evidence appears exactly once per idempotency key, latest outcome reflects the newest attempt, correct/review badges update after submission, and private learner data remains owner-scoped.

### P1 — Connect Mastery and Next Actions to Evidence

Replace static score and mastery displays only where the learner evidence supports them. The current learner-domain foundation already provides the proper boundaries for attempt evidence, review items, and skill snapshots. Enable these features behind their existing release controls and test empty, emerging, and established evidence states.

**Success criteria:** dashboard recommendations explain their evidence, avoid fabricated score claims, and degrade gracefully when a learner has insufficient activity.

### P2 — Establish a Diagnostic-to-Plan Path

Create a short diagnostic assessment that writes ordinary attempt evidence, then uses the same curriculum/skill mapping to recommend lessons, drills, and review work. The diagnostic should be a first-class learner flow, not a separate untracked questionnaire.

**Success criteria:** every diagnostic item maps to a skill, submission creates standard attempt records, and the resulting recommendation cites the learner’s observed outcomes.

### P2 — Define Curriculum and Error-Analysis Scope

Audit `/curriculum`, resources, and the existing mistake-journal/review foundations against the published workbook materials. Prioritize a narrow error-analysis loop: choose a missed question, record the missed clue and corrective rule, and schedule a review item. Avoid broad content-page expansion until curriculum coverage and source rights are confirmed.

## Verification Sequence

| Layer | Required check | Evidence artifact |
|---|---|---|
| Unit | Outcome aggregation, answer explanations, input validation | Vitest suite |
| API | Browse-safe list, protected outcome endpoint, attempt idempotency | Router/repository tests |
| Browser — public | Landing, About, Booking, sign-in guards, public catalog availability | `artifacts/primary-flow-verification.json` |
| Browser — authenticated | Submit → explanation → updated outcome → review list | Signed-in Playwright run and screenshots |
| Release | Feature flag default/rollout behavior and kill-switch fallback | Flag-admin test record |

## Immediate Decision

>The recommended next implementation is **P0: a quality-controlled first Question Bank cohort**, followed by **P1: authenticated learner acceptance testing**. This sequence turns the existing platform architecture into a useful learning loop without making unsupported product claims or revisiting already-shipped visual work.
