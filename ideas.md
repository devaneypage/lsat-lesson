# Design Ideas for LSAT Mastery: Necessary Assumptions

## Approach 1 — Legal Modernism
<response>
<text>
**Design Movement:** Bauhaus meets Modern Legal Publishing
**Core Principles:** Structured hierarchy, editorial clarity, authority without coldness, purposeful asymmetry
**Color Philosophy:** Deep navy (#0F1E3C) as the dominant background with warm cream (#F5F0E8) for text areas and a sharp amber (#E8A020) as the accent. The navy signals intellectual authority; the amber creates urgency and highlights key terms — like a highlighter on a legal brief.
**Layout Paradigm:** A left-anchored vertical progress rail (like a legal document's margin) tracks the student's position in the lesson. Content flows in a wide right column with generous margins. Section headers break the grid intentionally.
**Signature Elements:** Thin horizontal rules in amber separating sections; large serif numerals for section labels; a "stamp" motif for correct/incorrect feedback.
**Interaction Philosophy:** Each concept is gated — the student must click "I understand" before the next section unlocks. This mirrors the deliberate, sequential nature of legal reasoning.
**Animation:** Sections slide up from below on reveal. Correct answers get a satisfying "stamp" animation. Wrong answers shake gently.
**Typography System:** Playfair Display (bold) for headers + Source Serif 4 for body text. All-caps tracking for labels and UI elements.
</text>
<probability>0.07</probability>
</response>

## Approach 2 — Academic Chalkboard Deconstructed
<response>
<text>
**Design Movement:** Deconstructed Classroom / Editorial Dark Mode
**Core Principles:** Dark slate background evoking a chalkboard, hand-drawn diagram aesthetics, warm lighting accents, tactile feel
**Color Philosophy:** Deep charcoal (#1C1F26) background, chalk-white (#F0EDE6) text, sage green (#6BAF8A) for correct states, terracotta (#C4614A) for incorrect, and a soft yellow (#F0D060) for highlights. Feels like a late-night study session with a brilliant tutor.
**Layout Paradigm:** Full-bleed sections with a centered content column. The Bridge Diagram is the hero visual — large, illustrated, and animated. Diagrams feel hand-sketched using SVG with a slightly rough stroke style.
**Signature Elements:** Dashed SVG lines connecting concepts; "chalk dust" texture overlay on dark sections; a progress bar styled as a timeline at the top.
**Interaction Philosophy:** Progressive disclosure — concepts appear as the student scrolls, mimicking a tutor writing on a board in real time.
**Animation:** Text "writes in" character by character for key definitions. The bridge diagram assembles piece by piece. Answer choices slide in from the left.
**Typography System:** Space Grotesk (bold, wide tracking) for headers + Lora (italic) for stimulus text to evoke legal documents. Monospace for the Negation Test steps.
</text>
<probability>0.08</probability>
</response>

## Approach 3 — Precision Legal Tech
<response>
<text>
**Design Movement:** Legal Tech SaaS / Structured Clarity
**Core Principles:** Clean white canvas, strong typographic hierarchy, color used surgically for state and emphasis, grid-disciplined layout
**Color Philosophy:** Pure white background with a very light grey (#F7F8FA) for section alternation. A single strong accent — deep indigo (#3730A3) — for interactive elements, progress, and emphasis. Red (#DC2626) and green (#16A34A) reserved exclusively for wrong/correct feedback. No decorative color.
**Layout Paradigm:** A sticky top navigation shows lesson progress (5 steps). Each section is a full-width card with a max-width content column. The practice question uses a two-column layout: stimulus on the left, answer choices on the right.
**Signature Elements:** A bold step indicator (01, 02, 03...) in large light-grey numerals behind section titles; a "Negation Test™" branded badge; a progress bar that fills as the student advances.
**Interaction Philosophy:** The student actively participates — clicking to reveal the negation of each answer choice, then selecting their answer. Immediate, clear feedback with an explanation panel.
**Animation:** Smooth fade-and-slide transitions between sections. The bridge diagram uses clean CSS animation. The answer explanation panel expands with a smooth accordion.
**Typography System:** DM Sans (variable weight) for UI + DM Serif Display for lesson headers. Creates a contrast between the editorial lesson content and the clean functional UI.
</text>
<probability>0.09</probability>
</response>

---

## Selected Approach: **Academic Light — Warm Parchment** *(revised from original Approach 2 selection)*

**Design Decision Log:** The initial selection was Approach 2 (Academic Chalkboard Deconstructed — dark charcoal `#1C1F26`). During implementation, the design was pivoted to a warm parchment light theme for the following reasons:

1. **Commercial viability** — Light backgrounds perform better for sustained reading sessions and are more accessible across device types and ambient lighting conditions.
2. **LSAT audience** — Students studying for high-stakes exams tend to prefer clean, distraction-free reading environments. The warm parchment (`#F7F4EF → #EDE8DF → #E4DDD0`) achieves the same warmth and academic feel without the cognitive load of dark mode.
3. **Typography legibility** — Lora italic for stimulus text reads more naturally on light backgrounds, which is critical when students are parsing dense logical arguments.

**Retained from Approach 2:** Space Grotesk + Lora typography system, progressive disclosure interaction model, amber/green/terracotta feedback color palette.

**Actual implementation palette:**
- Background: Warm parchment gradient `#F7F4EF → #EDE8DF → #E4DDD0`
- Primary text: Deep navy `#1E2130`
- Accent / highlights: Amber `#C8860A`
- Correct feedback: Sage green `#2E7D52`
- Incorrect feedback: Terracotta `#B84030`
- Secondary accent: Deep violet `#5B4A8A`
