## Cover

# Devasophy Content-Gap Strategy

### From private curriculum to public discovery—and into purposeful learning

Prepared for Devaney M. Page, JD · August 2026

## Slide 1

# The decision is architectural

- Devasophy already has a tutoring destination and private learning workspace.
- The missing layer is a public resource system that earns awareness-stage discovery.
- Recommendation: separate **public guide → private lesson/practice → tutoring** into one intentional path.

**Source:** Devasophy content-gap analysis [1].

## Slide 2

# The current public route stops at sign-in

- The sitemap lists lesson routes, but clean-session rendering returns a learner-workspace sign-in wall.
- The raw public lesson HTML exposed approximately eight words, no H2s, no byline, no imagery, and no structured data.
- Private learning is valuable; it simply cannot be the primary answer to a public instructional search query.

**Source:** Live page teardown [1].

## Slide 3

# Public coverage misses the learner’s research journey

- The public sample covered 20 representative LSAT queries.
- Nineteen were absent or only partially covered by public Devasophy content.
- Logical Reasoning had six partial cases; Reading Comprehension had four absent-or-partial cases; study planning, performance, and diagnostics were fully absent.

**Source:** Public SERP sample and coverage analysis [1].

## Slide 4

# Competitors convert explanation into entry points

- 7Sage, Kaplan, and PowerScore recurred most often in the evidence set.
- Their recurring mechanism: public question-type guides, planning assets, and diagnostic paths.
- The transferable lesson is structural—not a reason to mimic a competitor’s voice or material.

**Source:** Public SERP sample [1].

## Slide 5

# Start with one differentiated proof page

- Launch a public **Necessary Assumption / Negation Test™** guide first.
- Teach dependency—not mere improvement—and make the Negation Test™ a repeatable decision procedure.
- Use original mini-arguments, traps, and a clear next step into private learning or tutoring.

**Source:** Necessary Assumption guide brief [2].

## Slide 6

# Four pillars, eight high-value spokes

- Logical Reasoning: question-type hub plus Necessary Assumption, Sufficient Assumption, Flaw, and Strengthen/Weaken guides.
- Reading Comprehension: passage mapping, main point, inference, and comparative-passage guides.
- Formal Logic: conditional logic primer as a support layer.
- Study Planning: 6-, 8-, and 12-week schedule and diagnostic path.

**Source:** Prioritized content-gap workbook [1].

## Slide 7

# Build a coherent public-to-private learner path

- Public guide answers a focused question and makes Devasophy’s method visible.
- Private lesson adds guided instruction, durable progress, and practice evidence.
- Tutoring addresses individualized error patterns, pacing, and accountability.

**Decision principle:** Every public page needs one relevant next step—not a generic contact path.

## Slide 8

# A 60-day library is enough to prove the model

- Days 1–15: resource hub, canonical rules, authorship, review metadata, sitemap segmentation.
- Days 16–30: Necessary Assumption / Negation Test™ guide and Conditional Logic primer.
- Days 31–45: study schedule and diagnostic-planning path.
- Days 46–60: Reading Comprehension pillar with Main Point and Inference spokes.

**Source:** Content-gap analysis roadmap [1].

## Slide 9

# The learner dashboard follows the same philosophy

- One server-authoritative Continue Learning response selects the highest-priority action.
- Deterministic priority: due review, then most-recent active lesson, then active plan task, then next lesson or review.
- Explicit empty, active, and completed states prevent the dashboard from inventing learner evidence.

**Source:** LSAT Nexus learner-experience contract [3].

## Slide 10

# Orientation turns a route into a study decision

- Every learner surface should explain where the learner is and why it matters.
- Shared header elements: breadcrumb, purpose, prerequisites, time estimate, current status, and next action.
- The header is lightweight navigation architecture—not decorative chrome.

**Source:** LSAT Nexus orientation component and central route registry [3].

## Slide 11

# Measure learning transitions, not just page views

- Public layer: impressions, query mix, click-through rate, and scroll depth.
- Bridge layer: clicks into private lessons, practice starts, and diagnostic or plan creation.
- Service layer: tutoring-intake starts and conversion by originating guide.

**Constraint:** No traffic, ranking, volume, or difficulty estimates were invented in this analysis.

## Slide 12

# Make knowledge visible before asking for commitment

### Build the public resource layer. Prove the method with Necessary Assumption. Let evidence guide expansion.

**Next decision:** Approve the 60-day resource build and instrument the public-to-private transition path.

## References

[1]: [Devasophy content-gap analysis](../../../content-gap-devasophy/devasophy_content_gap_analysis.md), Manus AI, August 12, 2026.

[2]: [Necessary Assumption / Negation Test™ Guide Brief](necessary-assumption-negation-test-guide-brief.md), Manus AI, August 12, 2026.

[3]: LSAT Nexus learner-experience source review: `server/learnerDb.ts`, `client/src/components/ContinueLearningDashboard.tsx`, and `client/src/components/ContextualOrientationHeader.tsx`, accessed August 12, 2026.
