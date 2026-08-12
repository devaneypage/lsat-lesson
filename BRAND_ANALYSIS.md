# Brand Analysis: LSAT Nexus + Workbook Concept

## LSAT Nexus Artifact (lsat-nexus.html)

**Design System:**
- **Color Palette:** Cream (#F4EDE0), White (#FFFDF8), Black (#111111), Terra Red (#D0452A), Teal (#1AABBC), Forest Green (#2A6B58), Amber (#EFA01C), Lime (#79C53E), Sky Blue (#4BB8D8)
- **Typography:** Archivo Black (display), Archivo (UI), JetBrains Mono (code/data)
- **Borders:** 2.5px solid black (sharp, geometric aesthetic)
- **Radius:** 0px (no border radius — strict geometric design)
- **Patterns:** Dot pattern (teal), wave pattern, stripe pattern

**Key UI Components:**
1. **Navigation Bar** — Fixed top, black background, amber brand mark (geometric diamond), tab-based navigation with amber underline for active state
2. **Nexus Grid Layout** — Two-column: main content area (left) + sidebar (right, 280px fixed width)
3. **Concept Cards** — Auto-fill grid (minmax 270px), hover state changes background to cream
4. **Elimination Matrix** — 6-column grid (1 label + 5 answer choices), interactive cell states (eliminated, picked)
5. **Mastery Bars** — Horizontal progress bars with percentage labels
6. **Fallacy Grid** — Cards with left terra border, name, description, spotting tip, example code
7. **Logic Table** — Black header, monospace font, hover state highlights rows
8. **Passage Grid** — 4-column layout with passage type, title, and question list
9. **Timing Dial** — 3-column grid showing time allocations
10. **Error Log** — Collapsible error entries with type, missed concept, fix strategy

**Sections/Tabs:**
- **Nexus** — Command center with map, score card, mastery tracker, quick nav
- **Learn** — Concept cards organized by LR/RC/FL with expandable details
- **Practice** — Elimination matrix, timing dial, trap identification
- **Review** — Error log, atlas (concept reference), form for logging errors
- **Plan** — Study tracking, phase plans, interleaving planner

**Visual Language:**
- Geometric shapes: squares (terra), circles (teal), diamonds (forest), triangles (amber)
- Tag system with color coding (terra, teal, forest, amber, lime)
- Monospace font for code/logic symbols
- Uppercase, letter-spaced labels for hierarchy
- Sharp borders, no shadows, high contrast

---

## LSAT Workbook Concept (PDF)

**Core Vision:**
Build a **mind-mapping-based study guide workbook** using diagnostic assessments to gauge student readiness, with skill-progression mapping to teach concepts, structure practice, and track progress.

**Architecture:**
- **Central Foldout Map** — Entire LSAT structure (LR, RC, FL) + Strategy, Schedule, Review sections
- **Color-Coding Key** — Sections (LR=terra, RC=teal, FL=forest), Concepts vs. Processes, Icons (timing, traps, rules)
- **Cross-Link Nodes** — References where concepts reappear (e.g., conditional logic: LR ↔ FL ↔ RC)
- **Progress Tracker** — Diagnostic → Phase Plans → Practice Tests → Test-Day Plan

**Content Maps (LR):**
1. **Argument Anatomy Map** — Conclusion, premises, assumptions, context, counterpoints; arrow conventions for support vs. attack
2. **Question Type Galaxy** — Clusters for Strengthen/Weaken, Flaw, Necessary vs. Sufficient Assumption, Inference, Principle, Parallel/Method, Paradox
3. **Fallacy Forest** — Branches for causal, sampling, equivocation, comparison, circularity; spotter tags + fix-it strategies
4. **Conditional Logic Chain Map** — Sufficient/necessary, contraposition, transitive links, either/or, unless translation
5. **Prephrase Pathway** — Stem cues → predict answer shape → eliminate by mismatch, scope, degree, reversal
6. **Timing Dial** — When to skip vs. stick; question triage map (easy, medium, hard markers)
7. **Elimination Matrix** — 5-answer grid with common wrong-answer patterns (out-of-scope, extreme, shell game, opposite, too weak/strong)
8. **Mini-Drill Maps** — 3–5-question sets with pre-map (what to watch) and post-map (what happened vs. plan)
9. **Blind Review Map** — Mark uncertainty level → revisit reasoning tree → resolve deltas between timed and BR answers

**Content Maps (RC):**
1. **Passage Structure Map** — Background → thesis → support → counter → resolution; tag author attitude and tone
2. **Viewpoints & Roles Map** — Track stakeholders, claims, evidence; comparative passage A vs. B alignment map
3. **Question Type Constellation** — Main point, primary purpose, detail, inference, function, attitude, logic, analogy; line-reference tactics
4. **Evidence Chain Map** — Quote → paraphrase → role → inference; avoid "outside passage" creep
5. **Passage Typology** — Science, law/policy, humanities, social science; common structures and traps per type
6. **Note-Taking Minimalism Map** — Margin symbols for claims, contrast, definitions; when to annotate vs. skim strategically
7. **Timing Ribbon** — Target per passage, when to flag and move, re-reading decision points

**Content Maps (FL):**
- Formal Logic maps (not detailed in PDF but implied in workbook architecture)

**Planning & Schedules:**
- **Diagnostic Debrief Map** — Strengths, weaknesses, timing issues, mindset; 2–3 focus nodes
- **Phase Plan Maps** — Foundation (learn), Integration (mixed practice), Performance (PTs and refinement)
- **Interleaving Planner** — Rotate LR/FL/RC emphasis with spaced repetition nodes
- **30/60/90-Day Roadmaps** — Milestones, PT cadence, review quotas
- **Daily Session Map** — Warm-up, core drills, review, cooldown reflection
- **Test-Day Readiness Map** — Sleep, nutrition, logistics, mindset cues, last-light drills

**Review & Analytics:**
- **Error Log Mind Map** — Misconception, trigger, context, correct approach, prevention rule; connect to future drills
- **Trap Pattern Atlas** — Common LR trap archetypes, RC distractor shapes
- **Timing Leak Map** — Where minutes spill, fix via micro-goals and decision thresholds
- **Confidence Calibration Map** — Predicted vs. actual correctness; adjust when to commit or flag
- **Post-PT Autopsy Map** — Section scores → top 5 error themes → timing deltas → next 3 drills mapped to calendar

**Templates & Worksheets:**
- "Translate to Symbols" drills
- "Map-to-Prose" and "Prose-to-Map" exercises
- One-Page Master Maps (Common Fallacies, Conditional Logic Rules, Rule Interaction Patterns, RC Signal Words)
- Reusable dry-erase pages for practice layouts
- Color-Coding Key card and icon stickers

**Strategies:**
- **Mindset Map** — Growth statements, reframe mistakes as data, confidence anchors
- **Stress Circuit Breakers** — Short breathing map, reset cues between sections
- **Reward Pathway** — Streaks, mini-goals, small rewards tied to map completions

**Format & Production:**
- Spiral-bound with foldout central map and perforated template pages
- High-contrast, dyslexia-friendly fonts; left-handed layout considerations
- QR codes linking to printable templates and quick explainer clips
- Versioned by score bands (120–150, 150–165, 165+) with tailored maps

**Digital Companion (Optional):**
- Interactive mind-map templates with timed modes and auto-logging
- Tag questions by trap type and link to Error Log Map
- Spaced repetition notifications keyed to interleaving plan
- Progress heatmaps mirroring workbook nodes
- Exportable "Next Week Plan" from analytics map

---

## Synthesis: Nexus + Workbook

**Nexus** is the **digital command center** — a real-time dashboard for tracking progress, accessing concept cards, practicing with interactive tools (elimination matrix, timing dial, error log), and planning study sessions.

**Workbook** is the **structured reference & practice system** — mind maps, templates, and worksheets that students fill in to deepen understanding and build visual memory.

**Integration Opportunity:**
- Nexus dashboard could display **mini-versions of workbook maps** (Argument Anatomy, Fallacy Forest, Conditional Logic Chain, etc.) as interactive, collapsible concept cards
- Students could **log errors in Nexus** and have them auto-populate into a digital Error Log Map
- **Phase plans** and **interleaving planner** from the workbook could be visualized in Nexus as a timeline/roadmap
- **Diagnostic debrief** could be the entry point to Nexus, guiding students to their personalized phase plan

---

## Design Direction for lsat-lesson Redesign

### Visual System (from Nexus):
- **Color Palette:** Cream, white, black, terra, teal, forest, amber, lime, sky
- **Typography:** Archivo Black (display), Archivo (UI), JetBrains Mono (code/logic)
- **Borders:** 2.5px solid black (geometric, sharp)
- **Radius:** 0px (no rounding)
- **Patterns:** Dot, wave, stripe overlays

### Content Architecture (from Workbook):
- **Mind Maps** as primary learning structure (Argument Anatomy, Fallacy Forest, Conditional Logic Chain, etc.)
- **Concept Cards** with expandable details, spotter tags, fix-it strategies
- **Interactive Tools** (Elimination Matrix, Timing Dial, Error Log, Mastery Tracker)
- **Progress Tracking** (Diagnostic → Phase Plans → Practice → Test-Day)
- **Templates & Worksheets** for active learning (Translate to Symbols, Map-to-Prose, etc.)

### UX Priorities:
1. **Unified Dashboard** (Nexus-style) showing score, mastery, quick nav, and concept access
2. **Mind-Map-Based Learning** replacing current linear lesson structure
3. **Interactive Practice Tools** (elimination matrix, timing dial, error log)
4. **Diagnostic-Driven Personalization** (entry point determines phase plan and focus areas)
5. **Visual Hierarchy** using geometric shapes, color coding, and monospace fonts for logic
6. **Accessibility** — high contrast, dyslexia-friendly fonts, clear labeling
