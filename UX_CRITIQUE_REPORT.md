# UX Critique Report: Dashboard (Nexus) & Lessons Hub

**Project:** LSAT Mastery — lsat-lesson  
**Date:** 2026-07-06  
**Scope:** Dashboard (`/dashboard`) and Lessons Hub (`/lessons`)  
**Critique Framework:** Visual Hierarchy · Color · Typography · Composition · Brand Consistency  
**Design Target:** Balanced & Refined — Nexus Command Center aesthetic  

---

## Summary Scorecard

| Dimension | Dashboard | Lessons Hub |
|---|---|---|
| Visual Hierarchy | ⚠️ Minor issue | ⚠️ Minor issue |
| Color | ⚠️ Minor issue | 🔴 Major issue |
| Typography | ⚠️ Minor issue | ⚠️ Minor issue |
| Composition | 🔴 Major issue | ⚠️ Minor issue |
| Brand Consistency | ⚠️ Minor issue | ⚠️ Minor issue |

**Overall:** The Nexus aesthetic is coherent and the design system is well-defined. The most critical issues are (1) the ConceptMap being non-interactive and visually inert as the primary dashboard content, (2) two undefined CSS color variables (`--nexus-blue`, `--nexus-purple`) that will cause LessonGrid cards to render with no color, and (3) the NexusDashboardLayout having no page-level header or context, making the dashboard feel like it starts mid-content.

---

## 1. Visual Hierarchy

### Dashboard (`/dashboard`)

**Entry Point** — `minor issue`

> **Observation:** The ConceptMap occupies the full main column (min-height 500px) with a centered text overlay reading "LSAT Concept Map." The sidebar ScoreCard displays a 3.5rem monospace score number in teal.

> **Problem:** There is a competition between two potential entry points: the large teal score number in the sidebar and the centered heading in the ConceptMap. Neither is clearly dominant because the score has stronger color weight but the ConceptMap has greater spatial area. The user's eye has no single anchor.

> **Fix:** Establish the ConceptMap heading as the unambiguous primary by increasing its size to `2rem` and adding a subtle amber underline accent. Reduce the ScoreCard score to `2.75rem` to subordinate it to the main content area.

**Eye Flow** — `minor issue`

> **Observation:** The two-column layout (1fr + 320px) creates a left-to-right reading order. The main column contains the ConceptMap, and the sidebar stacks ScoreCard → MasteryOverview → QuickNavigation from top to bottom.

> **Problem:** The QuickNavigation (action items: Start Drill, Review Mistakes, Study Plan, View Progress) is buried at the bottom of the sidebar, below two data-display widgets. Users who arrive at the dashboard to take action must scroll past passive information to reach interactive controls.

> **Fix:** Reorder the sidebar to QuickNavigation → ScoreCard → MasteryOverview. Actions first, data second — this matches the primary goal of a study session dashboard.

**Weight** — `pass`

> **Observation:** The Archivo Black headings at 900 weight are clearly distinguished from Archivo body text at 400 weight. The 3.5rem score number creates a strong weight anchor in the sidebar. The 1.5px border system is applied consistently.

> **Problem:** None significant. The weight hierarchy is functional.

**Emphasis** — `minor issue`

> **Observation:** The ConceptMap contains a centered heading and subtitle overlaid on an SVG diagram. The SVG shapes (teal square, amber square, green diamond, terra circle, lime circle) have equal visual weight and no interactive affordance.

> **Problem:** The ConceptMap is the primary content area but communicates no actionable emphasis. It reads as decorative rather than functional — there is no "start here" signal, no hover state, no navigation affordance. The highest-emphasis zone on the page is visually passive.

> **Fix:** Add hover states to each SVG node (scale + shadow), make nodes clickable links to their respective lesson categories, and add a directional arrow or "Explore →" label to the central diamond to signal interactivity.

---

### Lessons Hub (`/lessons`)

**Entry Point** — `minor issue`

> **Observation:** The page shell is a plain cream wrapper with `padding: 2rem 1rem` containing a single `LessonGrid` component. The LessonGrid renders an "Available Lessons" h2 heading at 1.5rem followed immediately by the card grid.

> **Problem:** There is no page-level hero, no subtitle, and no context statement. The first thing a user sees is a heading and seven cards — functional but cold. The entry point is the heading, which is correct, but it lacks the gravitational pull of a proper page introduction.

> **Fix:** Add a page header section above the LessonGrid with a 2rem+ page title ("Core Concepts"), a one-line subtitle ("Seven structured lessons in Logical Reasoning and Reading Comprehension"), and a horizontal rule. This creates a clear entry point and frames the grid as a curated collection rather than a raw list.

**Eye Flow** — `pass`

> **Observation:** The auto-fill grid (`repeat(auto-fill, minmax(280px, 1fr))`) creates a natural left-to-right, top-to-bottom reading order. Each card has a consistent internal structure: icon+title header → description → "Start Lesson →" CTA.

> **Problem:** None. The F-pattern reading order is well-supported.

**Weight** — `minor issue`

> **Observation:** All seven lesson cards have identical visual weight — same padding, same font sizes, same card dimensions. The only differentiation is border color.

> **Problem:** Equal weight across all seven cards implies equal priority, but the lessons have a natural pedagogical sequence (Necessary Assumptions → Sufficient Assumptions → Flaw in Reasoning → ...). A student arriving for the first time has no signal about where to start.

> **Fix:** Add a "Start Here" badge or a subtle "Step 1" indicator to the Necessary Assumptions card. Alternatively, add a sequence number to each card header to communicate the recommended learning order.

**Emphasis** — `pass`

> **Observation:** The "Start Lesson →" CTA at the bottom of each card is styled in the card's accent color with uppercase tracking. It is visually consistent and clearly distinguishable as an action.

---

## 2. Color

### Dashboard (`/dashboard`)

**Contrast** — `pass`

> **Observation:** The primary text (`#111111`) on the card background (`#FFFDF8`) produces a contrast ratio of approximately 18.5:1, well above WCAG AA (4.5:1). The muted text at `rgba(17,17,17,0.6)` on `#FFFDF8` produces approximately 5.8:1, which passes AA for body text. The teal score number (`#1AABBC`) on `#FFFDF8` produces approximately 3.1:1, which passes for large text (3rem+) but would fail for body-sized text.

> **Problem:** The teal score number passes at its current size (3.5rem) but if it is ever used at smaller sizes, it will fail WCAG AA. This is a latent risk rather than a current failure.

> **Fix:** Document in the design system that `--nexus-teal` on `--card` is approved only for text ≥ 24px. Add a comment to ScoreCard.tsx noting this constraint.

**Palette Coherence** — `pass`

> **Observation:** The dashboard uses only defined token values: `var(--card)`, `var(--border)`, `var(--foreground)`, `var(--nexus-teal)`, `var(--nexus-amber)`, `var(--nexus-forest)`, `var(--nexus-terra)`, `var(--nexus-lime)`. No arbitrary hex values appear in the dashboard components.

**Semantic Use** — `minor issue`

> **Observation:** The QuickNavigation component assigns colors to actions: Start Drill (teal), Review Mistakes (terra/red), Study Plan (amber), View Progress (forest/green). These colors are purely decorative — they are not semantically meaningful (e.g., terra does not indicate an error state here).

> **Problem:** Using terra (the destructive/error color) for "Review Mistakes" creates a mild semantic mismatch — it implies danger or failure rather than a constructive review activity. A student may unconsciously associate the action with negative feedback.

> **Fix:** Reassign "Review Mistakes" to amber (caution/attention) and reserve terra exclusively for error states and destructive actions throughout the site.

**Accessibility** — `pass`

> **Observation:** The palette is warm-neutral (cream, teal, amber, terra). The teal/amber combination is distinguishable under common deuteranopia and protanopia simulations because teal is blue-dominant and amber is red-dominant, providing hue separation even when green-red channels are collapsed.

---

### Lessons Hub (`/lessons`)

**Contrast** — `pass`

> **Observation:** Same as Dashboard — `#111111` on `#FFFDF8` passes at 18.5:1. Duration labels in `lesson.color` on `#FFFDF8` pass for large text where colors are teal, amber, terra, and forest. The lime color (`#79C53E`) on `#FFFDF8` produces approximately 2.6:1, which fails WCAG AA for all text sizes.

> **Problem:** The lime color (`--nexus-lime`, `#79C53E`) is used for the "Common Flaws" lesson card border, icon, duration label, and "Start Lesson →" CTA. At 0.75rem–0.85rem text sizes, this fails WCAG AA (requires 4.5:1). This is a real accessibility failure affecting one lesson card.

> **Fix:** Darken `--nexus-lime` to `#4A8A1A` (approximately 5.1:1 on `#FFFDF8`) or replace it with `--nexus-forest` (`#2A6B58`, approximately 5.8:1) for the Common Flaws card.

**Palette Coherence** — `🔴 Major issue`

> **Observation:** Two lessons reference undefined CSS variables: Reading Comprehension uses `var(--nexus-blue)` and Formal Logic uses `var(--nexus-purple)`. Neither variable is defined in `index.css` or anywhere in the design system.

> **Problem:** These two lesson cards will render with no border color, no icon color, no duration label color, and no "Start Lesson →" color — they will appear visually broken, defaulting to browser defaults (likely transparent or black). This is a production-breaking defect affecting 2 of 7 lesson cards.

> **Fix:** Add the missing variables to `:root` in `index.css`:
> ```css
> --nexus-blue: #4BB8D8;   /* maps to existing --nexus-sky */
> --nexus-purple: #7B5EA7;  /* new: muted violet */
> ```
> Or remap the two lessons to existing tokens: Reading Comprehension → `--nexus-sky`, Formal Logic → `--nexus-forest`.

**Semantic Use** — `pass`

**Accessibility** — `minor issue`

> See lime contrast failure above.

---

## 3. Typography

### Dashboard (`/dashboard`)

**Scale Usage** — `minor issue`

> **Observation:** The dashboard uses the following type sizes: ScoreCard heading at 0.75rem (uppercase label), score at 3.5rem (monospace), percentile at 0.8rem, target label at 0.75rem, target score at 1.5rem. MasteryOverview uses 0.75rem labels and 0.75rem percentages. ConceptMap overlay uses 1.5rem heading and 0.9rem subtitle.

> **Problem:** The scale has too many intermediate sizes (0.75, 0.8, 0.85, 0.9, 1.0, 1.5, 3.5rem) that are not derived from a consistent modular scale. The difference between 0.75rem, 0.8rem, and 0.85rem is imperceptible and adds no hierarchy value — it is scale drift.

> **Fix:** Consolidate to a defined 5-step scale: `caption: 0.75rem`, `small: 0.875rem`, `body: 1rem`, `subheading: 1.25rem`, `heading: 1.5rem`, `display: 2rem`, `score: 3.5rem`. Replace all intermediate values with the nearest defined step.

**Readability** — `pass`

> **Observation:** Body text is at 0.8–0.9rem in sidebar components, which is below the 1rem desktop minimum recommended by the typography critique skill. However, these are data labels in a compact sidebar widget context, which is an accepted exception.

> **Problem:** Minor — the sidebar labels are slightly below ideal minimum but acceptable in context.

**Consistency** — `minor issue`

> **Observation:** Section headings in ScoreCard and MasteryOverview use `fontFamily: "'Archivo', sans-serif"` with `fontWeight: 600` and uppercase tracking. The ConceptMap heading uses `fontFamily: "'Archivo Black', sans-serif"` with `fontWeight: 900`. These are semantically equivalent elements (card section headings) but use different font families and weights.

> **Problem:** Card section headings are inconsistent — some use Archivo 600, others use Archivo Black 900. This breaks the visual rhythm of the sidebar.

> **Fix:** Standardize all card section headings to Archivo 600 uppercase (the smaller, label-style treatment). Reserve Archivo Black 900 for page-level and section-level headings only.

**Token Compliance** — `minor issue`

> **Observation:** Multiple components use hardcoded inline values instead of CSS tokens: `rgba(17, 17, 17, 0.6)` (should be `var(--muted-foreground)`), `rgba(17, 17, 17, 0.7)` (no exact token match), `rgba(17, 17, 17, 0.5)` (loading state). The loading skeleton uses hardcoded `fontFamily: "'Archivo', sans-serif"` instead of inheriting from the body.

> **Fix:** Replace `rgba(17, 17, 17, 0.6)` with `var(--muted-foreground)`. Add a `--muted-foreground-strong: rgba(17, 17, 17, 0.8)` token for the 0.7/0.8 variants. Remove the hardcoded font-family from the loading state.

---

### Lessons Hub (`/lessons`)

**Scale Usage** — `pass`

> **Observation:** LessonGrid uses h2 at 1.5rem (card title), h3 at 1rem (lesson title), duration at 0.75rem, description at 0.85rem, CTA at 0.8rem. This is a reasonable 4-step hierarchy for a card grid.

**Readability** — `minor issue`

> **Observation:** The description text is at 0.85rem with `lineHeight: 1.5`. The CTA "Start Lesson →" is at 0.8rem uppercase. The duration label is at 0.75rem uppercase.

> **Problem:** Three text sizes between 0.75rem and 0.85rem in the same card create imperceptible differentiation. The description at 0.85rem is slightly below the 1rem body minimum.

> **Fix:** Increase description text to 0.9rem and consolidate the duration/CTA labels to a single 0.75rem caption size.

**Consistency** — `pass`

> **Observation:** All seven lesson cards use identical internal typography structure. Semantically equivalent elements share the same type style across all cards.

**Token Compliance** — `minor issue`

> **Observation:** `rgba(17, 17, 17, 0.7)` is used for description text (should be `var(--muted-foreground)`). The grid gap of `1.5rem` and card padding of `1.5rem` are hardcoded inline rather than using spacing tokens.

---

## 4. Composition

### Dashboard (`/dashboard`)

**Balance** — `🔴 Major issue`

> **Observation:** The NexusDashboardLayout is a raw grid wrapper with `gap-4 p-4 md:p-6 min-h-screen`. There is no page header, no page title, no breadcrumb, and no context-setting element above the two-column grid. The main content (ConceptMap) and sidebar (ScoreCard + MasteryOverview + QuickNavigation) begin immediately at the top of the viewport after the navigation bar.

> **Problem:** The dashboard has no visual anchor at the top. The page starts mid-content — the user lands in a two-column grid with no orientation. There is no "Welcome back" header, no page title, no date/session context. The layout tips left-heavy because the ConceptMap (1fr) dominates the 320px sidebar visually, but neither column has a clear primary/secondary relationship established by a page-level header.

> **Fix:** Add a dashboard header row above the two-column grid containing: a page title ("Study Dashboard" or "Nexus"), a session context line ("Today · [date]"), and a horizontal rule. This creates a stable top anchor and establishes the page's identity before the content begins.

**Whitespace** — `minor issue`

> **Observation:** The layout uses `gap-4` (1rem) between the main column and sidebar, and `p-4 md:p-6` (1–1.5rem) as the outer padding. The sidebar cards use `gap-4` (1rem) between them.

> **Problem:** The 1rem gap between the main column and sidebar is tight for a command-center aesthetic. The Balanced & Refined design targets a more spacious, contemplative feel. The sidebar cards feel compressed against each other.

> **Fix:** Increase the column gap to `gap-6` (1.5rem) and the sidebar card gap to `gap-5` (1.25rem). Increase outer padding to `p-6 md:p-8` on desktop.

**Rhythm** — `pass`

> **Observation:** The sidebar stacks three cards with consistent padding (p-6) and border treatment (1.5px solid var(--border)). The card rhythm is regular and predictable.

**Gestalt** — `minor issue`

> **Observation:** The ConceptMap SVG has five nodes (central diamond + four peripheral shapes) connected by four lines. The nodes are positioned at fixed coordinates (200,150), (600,150), (200,350), (600,350) with the center at (400,250).

> **Problem:** The four peripheral nodes have no visual grouping — they are equidistant from the center and from each other. Gestalt proximity and similarity principles suggest that related concepts should be grouped closer together. Logical Reasoning and Assumptions are both LR-domain concepts but are placed in opposite corners (top-left and bottom-left), while Reading Comprehension and Flaws are also separated without apparent logic.

> **Fix:** Reorganize the ConceptMap into two semantic clusters: LR cluster (Logical Reasoning, Assumptions, Flaws) on the left; RC cluster (Reading Comprehension) on the right. Add a visual grouping indicator (light background zone or dashed boundary) to make the clusters perceptible.

---

### Lessons Hub (`/lessons`)

**Balance** — `minor issue`

> **Observation:** The Lessons page shell is a plain cream wrapper with `padding: 2rem 1rem` and a centered `maxWidth: 1200px` container. The LessonGrid fills the full container width.

> **Problem:** The page has no top-of-page framing — it is entirely the LessonGrid component. The page feels bottom-heavy because the grid cards have significant visual density but there is no counterbalancing header above them.

> **Fix:** Add a page header section (title + subtitle + horizontal rule) above the LessonGrid in `Lessons.tsx`, as noted in the hierarchy critique.

**Whitespace** — `pass`

> **Observation:** The card grid uses `gap: 1.5rem` and each card has `p-6` (1.5rem) internal padding. The outer page padding is `2rem 1rem`. This is sufficient breathing room for the card grid.

**Rhythm** — `pass`

> **Observation:** The seven lesson cards form a regular grid with `repeat(auto-fill, minmax(280px, 1fr))`. At typical viewport widths, this produces 3 cards per row (rows of 3, 3, 1), which creates a slight imbalance in the final row.

> **Problem:** A single orphaned card in the last row (Formal Logic) looks incomplete and draws disproportionate attention. This is a minor rhythm issue.

> **Fix:** Consider a fixed `grid-template-columns: repeat(3, 1fr)` at large viewports, or add an eighth card (e.g., "Diagnostic Assessment" or "Coming Soon: Arguments & Inference") to complete the 3×3 grid.

**Gestalt** — `pass`

> **Observation:** The cards use proximity (consistent gaps), similarity (identical structure), and figure/ground (white card on cream background) correctly. The colored borders create differentiation while the shared card structure maintains cohesion.

---

## 5. Brand Consistency

> **Note:** The project does not have `mood.md`, `voice.md`, or `tokens.md` files. This critique is conducted against the design system defined in `client/src/index.css` (`:root` variables and `@layer components`) and the stated Balanced & Refined aesthetic direction.

### Dashboard (`/dashboard`)

**Mood Alignment** — `pass`

> **Observation:** The dashboard uses the Balanced & Refined palette (cream, teal, amber, terra, forest), Archivo Black for headings, JetBrains Mono for data, and minimal 1.5px borders with 0.25rem radius. The overall aesthetic is professional, precise, and structured.

> **Problem:** The ConceptMap is the only element that risks breaking the mood — its static SVG with no interactivity feels more like a diagram in a textbook than a command-center tool. The Nexus aesthetic implies dynamism and agency; a non-interactive map undermines this.

> **Fix:** As noted in the hierarchy critique, add hover states and click-through navigation to the ConceptMap nodes to restore the "command center" mood.

**Voice Alignment** — `minor issue`

> **Observation:** The ScoreCard labels ("Current Score," "Target Score") and MasteryOverview labels ("Logical Reasoning," "Reading Comprehension") are functional and neutral. The QuickNavigation labels ("Start Drill," "Review Mistakes," "Study Plan," "View Progress") are imperative and action-oriented.

> **Problem:** "Review Mistakes" has a slightly negative connotation that conflicts with the growth-oriented, encouraging voice appropriate for a tutoring platform. The word "mistakes" frames errors as failures rather than learning opportunities.

> **Fix:** Rename to "Analyze Errors" or "Error Review" — more clinical, less self-critical, and more consistent with the intellectual precision of the brand voice.

**Token Compliance** — `minor issue`

> **Observation:** As noted in the typography critique, multiple components use hardcoded `rgba(17, 17, 17, 0.6/0.7)` values instead of `var(--muted-foreground)`. The loading state uses hardcoded font-family strings.

> **Fix:** See typography token compliance fixes above.

---

### Lessons Hub (`/lessons`)

**Mood Alignment** — `minor issue`

> **Observation:** The Lessons Hub is a clean, well-structured grid. The card borders in six distinct colors (amber, teal, terra, lime, forest, and two undefined) create a colorful, energetic feel.

> **Problem:** Six different accent colors on seven cards creates a slightly chaotic visual register that edges toward "playful" rather than "precise." The Balanced & Refined aesthetic calls for purposeful color use, not decorative variety.

> **Fix:** Reduce the lesson card color palette to three or four colors maximum, grouping lessons by domain: LR lessons (amber), RC lessons (teal), Logic lessons (forest), with terra reserved for the most challenging content. This creates semantic color meaning while reducing visual noise.

**Voice Alignment** — `pass`

> **Observation:** Lesson descriptions are concise, active, and skill-focused ("Master the Negation Test™," "Identify logical fallacies," "Learn the 19 most tested logical fallacies"). The registered trademark on "Negation Test™" is a strong brand voice signal — proprietary methodology language.

**Token Compliance** — `🔴 Major issue`

> **Observation:** Two undefined CSS variables (`--nexus-blue`, `--nexus-purple`) are used in LessonGrid.tsx. These will silently fail in production, rendering two lesson cards without any accent color.

> **Fix:** Define both variables in `:root` in `index.css` immediately. This is the highest-priority fix in this entire audit.

---

## Priority Action List

The following fixes are ranked by severity and impact:

| Priority | Issue | File | Severity |
|---|---|---|---|
| P0 | Define `--nexus-blue` and `--nexus-purple` in `:root` | `index.css` | 🔴 Breaking |
| P1 | Add dashboard page header (title, date, horizontal rule) | `NexusDashboardLayout.tsx` or `Dashboard.tsx` | 🔴 Major |
| P2 | Make ConceptMap nodes interactive (hover + click-through) | `ConceptMap.tsx` | 🔴 Major |
| P3 | Darken `--nexus-lime` to pass WCAG AA contrast | `index.css` | ⚠️ Accessibility |
| P4 | Reorder sidebar: QuickNavigation first, then ScoreCard, then MasteryOverview | `Dashboard.tsx` | ⚠️ UX |
| P5 | Add page header to Lessons Hub (title + subtitle + rule) | `Lessons.tsx` | ⚠️ UX |
| P6 | Add sequence numbers or "Start Here" badge to lesson cards | `LessonGrid.tsx` | ⚠️ UX |
| P7 | Reorganize ConceptMap into LR/RC semantic clusters | `ConceptMap.tsx` | ⚠️ UX |
| P8 | Rename "Review Mistakes" → "Analyze Errors" in QuickNavigation | `QuickNavigation.tsx` | ℹ️ Voice |
| P9 | Replace `rgba(17,17,17,0.6/0.7)` with `var(--muted-foreground)` | All dashboard components | ℹ️ Tokens |
| P10 | Consolidate lesson card colors to 3–4 semantic groups | `LessonGrid.tsx` | ℹ️ Mood |
| P11 | Increase dashboard gap to `gap-6`, outer padding to `p-6 md:p-8` | `NexusDashboardLayout.tsx` | ℹ️ Spacing |

---

*Critique conducted using: critique-visual-hierarchy, critique-color, critique-typography, critique-composition, critique-brand-consistency skills.*
