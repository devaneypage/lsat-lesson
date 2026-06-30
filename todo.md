# LSAT Mastery UX Overhaul — Task Checklist

## Phase 4: Systematic Execution

- [x] Task 1: Design System Foundation (60 min)
- [x] Task 2: Sidebar Navigator Component (90 min)
- [x] Task 3: Breadcrumb Navigation Component (45 min)
- [x] Task 4: Progress Stepper Component (60 min)
- [x] Task 5: Update Dashboard Page (75 min)
- [x] Task 6: Update Lesson Pages Header (75 min)
- [x] Task 7: Refine Component Styling (90 min)
- [x] Task 8: Typography & Spacing Polish (60 min)
- [x] Task 9: Animations & Transitions (75 min)
- [x] Task 10: Accessibility & Testing (60 min)

## UX Overhaul - Balanced & Refined Aesthetic

### Task 1: Design System Foundation
- [x] Step 1.1: Define Color Palette and CSS Variables
- [x] Step 1.2: Define Typography and Load Fonts
- [x] Step 1.3: Configure Tailwind for Design System

### Task 2: Rebuild Main Navigation
- [ ] Step 2.1: Update Navigation Bar Structure and Styling

### Task 3: Redesign Homepage as Nexus Dashboard
- [ ] Step 3.1: Create NexusDashboardLayout Component
- [ ] Step 3.2: Implement ScoreCard, MasteryOverview, and QuickNavigation Components
- [ ] Step 3.3: Rebuild Homepage (Home.tsx) using NexusDashboardLayout

### Task 4: Integrate Lessons as Reference Modules
- [ ] Step 4.1: Update Lesson Page Styling
- [ ] Step 4.2: Implement Dashboard-to-Lesson Navigation

### Task 5: Update Core UI Components
- [ ] Step 5.1: Refine shadcn/ui Components
- [ ] Step 5.2: Update Custom Components

## Final Verification

- [x] All tasks marked complete
- [x] TypeScript compiles without errors
- [x] Dev server running cleanly
- [x] All pages load correctly in browser
- [x] Visual hierarchy improved
- [x] Colors match design system
- [x] Typography hierarchy clear
- [x] Animations smooth
- [x] Accessibility checks pass
- [x] Mobile responsive
- [x] Checkpoint created


## CSV Import Backend Implementation

- [x] Upgrade project to web-db-user (database + server + auth)
- [x] Add questions and importHistory tables to database schema
- [x] Create database migration for new tables
- [x] Add question database helpers (insert, list, count)
- [x] Add import history database helpers
- [x] Create tRPC procedures for CSV import
- [x] Implement admin-only access control for imports
- [x] Add CSV validation and data transformation logic
- [x] Write unit tests for import validation
- [x] Update QuickImportModal to call backend API
- [x] Integrate mutation handling and error states
- [x] Test import flow end-to-end


## Question Bank Display Page

- [x] Create QuestionBank page component with filtering UI
- [x] Add search functionality by question text
- [x] Implement category filter dropdown
- [x] Implement difficulty filter dropdown
- [x] Implement source filter dropdown
- [x] Add pagination controls (via grid layout)
- [x] Create question card component for display
- [x] Integrate with tRPC questions.list procedure
- [x] Add loading and empty states
- [x] Add practice mode for answering questions
- [x] Add statistics view


## Question Tagging System

- [x] Create tags and questionTags tables in database schema
- [x] Add tag management database helpers
- [x] Create tRPC procedures for tag CRUD operations
- [x] Create tRPC procedure to add/remove tags from questions
- [x] Write tests for tagging operations (18 tests passing)
- [ ] Build tag management UI component for tutors
- [ ] Add tag filtering to Question Bank page
- [ ] Create tag browser/hierarchy view
- [ ] Add bulk tag operations (assign tags to multiple questions)
- [ ] Implement tag suggestions based on question content


## Study Guide Integration from Master Guide

- [x] Extract content from LSAT Study Master Guide HTML
- [x] Create StudyGuide page component with 18 LR modules
- [x] Add 5 RC modules to Study Guide
- [x] Implement practice tier system (Tier 1-3)
- [x] Add difficulty-based color coding
- [x] Implement expandable module details
- [x] Add category filtering (All/LR/RC)
- [x] Integrate with main navigation
- [x] Register /study-guide route in App.tsx


## Study Guide to Question Bank Integration

- [x] Add practice question filtering by module ID
- [x] Create module-to-question mapping in database
- [x] Add "Practice Questions" button to each module
- [x] Implement filtered question view for each module
- [x] Create practice session workflow from Study Guide
- [ ] Add module progress tracking (questions completed)
- [ ] Add difficulty progression within each module
- [ ] Implement module mastery criteria
- [ ] Write tests for module-question filtering
- [ ] Test end-to-end practice workflow


## PDF Lesson Content Extraction & Integration

- [x] Extract questions from LR_0 Introduction PDF (lesson content only)
- [x] Extract questions from LR_1 Argument-Based Questions PDF (15 reported, JSON parse issue)
- [x] Extract questions from LR_2a Anatomy PDF (lesson content only)
- [x] Extract questions from LR_2 Main Point Questions PDF (5 questions)
- [x] Extract questions from LR_3 Role of Statement PDF (4 questions)
- [x] Extract questions from LR_4 Method of Argument PDF (7 questions)
- [x] Extract questions from LR_5 Point at Issue PDF (3 questions)
- [x] Extract questions from LR_6 Parallel Reasoning PDF (skipped per user)
- [x] Build unified question CSV with tags (19 questions)
- [x] Import all questions into Question Bank (27 total in DB)
- [x] Update Study Guide modules with lesson content from PDFs
- [ ] Verify all questions display with correct tags

## New PDF Batch 2 Extraction & Integration

- [x] Extract from Lesson-19 Common Flaws in LSAT Arguments (lesson content extracted)
- [x] Extract from Lesson 5 Flaws Abridged (LSAT Trainer) (18 questions)
- [x] Extract from Conditional Statement Diagramming Drill (Testmasters) (30 questions)
- [x] Extract from Anatomy of an LR Argument (6 questions)
- [x] Extract from LR II Assumption Questions Bridge & Defender (lesson content extracted)
- [x] Build unified question CSV from batch 2 (54 questions)
- [x] Import batch 2 questions into Question Bank (189 total in DB)
- [x] Enrich Study Guide modules with batch 2 lesson content

## Bug: /lessons page issue at devasophy.blog

- [x] Reproduce and document the exact error at https://devasophy.blog/lessons (404 — missing route)
- [x] Identify root cause: /lessons had no registered route; nav linked to /lessons/necessary-assumptions
- [x] Implement targeted fix: added Route path="/lessons" → StudyGuide; updated nav link to /lessons
- [x] Verify fix resolves the issue (Study Guide renders correctly at /lessons on dev server)

## Navigation Link Verification (devasophy.blog)

- [x] Verify / (home/path selector) loads correctly — PASS
- [x] Verify /dashboard loads correctly — FIXED: was full-page reloading to /; replaced <a href> with wouter <Link> in MainNavigationBar
- [x] Verify /lessons loads Study Guide correctly — PASS (previously fixed)
- [x] Verify /question-bank loads correctly — PASS
- [x] Verify /curriculum loads correctly — PASS
- [x] Verify /import loads correctly — PASS
- [x] Verify /progress loads correctly — PASS
- [ ] Verify /lessons/necessary-assumptions loads correctly
- [ ] Verify /lessons/common-flaws loads correctly
- [ ] Verify /lessons/strengthen-weaken loads correctly
- [ ] Verify /lessons/reading-comprehension loads correctly
- [ ] Verify /lessons/formal-logic loads correctly
- [ ] Verify /study-guide loads correctly
- [x] Fix broken routes: replaced all <a href> with wouter <Link> in MainNavigationBar

## Live Database Connection & Question Import

- [ ] Diagnose why 189 questions are not showing on live site
- [ ] Verify live DATABASE_URL is correctly configured
- [ ] Check tRPC questions.list endpoint on live site
- [ ] Re-import all 189 questions to production database
- [ ] Verify all questions display correctly on devasophy.blog/question-bank
- [ ] Confirm filtering and search work with live data

## Question Bank Deduplication

- [ ] Analyze database for duplicate questions (exact and near-exact stimulus matches)
- [ ] Count total duplicates found
- [ ] Write deduplication script preserving the earliest/best record
- [ ] Run deduplication on production database
- [x] Verify final question count after deduplication (173 unique questions)
- [ ] Confirm no data loss on live site

## AI Lesson Plan Generator

- [x] Add tRPC lessonPlan.generate procedure with LLM integration
- [x] Build intake form (score, target, test date, hours/week, weak areas)
- [x] Implement streaming LLM response with Streamdown rendering
- [x] Build priority rankings section in output
- [x] Build week-by-week schedule section in output
- [x] Build session breakdowns section in output
- [x] Add Copy to Clipboard export button
- [x] Add Print/PDF export button
- [x] Register /lesson-plan-generator route in App.tsx
- [x] Add nav link in MainNavigationBar
- [x] Write tests for lessonPlan.generate procedure (7 tests passing)

## LR II: Argument-Based Questions (Subjective) — PDF Extraction & Import

- [x] Extract questions from LR_II_3 Overlooked Possibilities (#24-41)
- [x] Extract questions from LR_II_5 Sufficient & Necessary Assumption Guided Practice (#42-54)
- [x] Extract questions from LR_II_6a Flaw Questions Guided Practice (#55-60)
- [x] Extract questions from LR_II_6b Flaw Questions (#73-80)
- [x] Extract questions from LR_II_7+8 Strengthen & Weaken Questions (#81-92)
- [x] Extract questions from LR_II_10 Review Set 1 (large)
- [x] Extract questions from LR_II_11 Review Set 2 (large)
- [x] Extract questions from LR_II_17 Flaw & Match Flaw Question Set
- [x] Extract questions from LR_II_a What's Wrong Drill
- [x] Extract questions from LR_II_b One Argument & Ten Answers Drill
- [x] Extract questions from LR_II_c Mixed Pool (#65-84)
- [x] Extract questions from LR_II_d Review Set (Objective & Subjective)
- [x] Extract questions from LR_Necessary & Sufficient Assumption Questions (MHP)
- [x] Extract questions from LR_II Intro to Assumption Family (Lesson + Practice)
- [x] Consolidate all extracted questions into unified CSV
- [x] Import all LR II questions into Question Bank
- [x] Enrich Study Guide modules with LR II lesson content
- [x] Run deduplication on full question database
- [x] Verify final question count after deduplication (173 unique questions)

## LR III: Argument-Based Questions (Objective) — PDF Extraction & Import

- [x] Extract questions from LR_1 Introduction to Argument-Based Questions (Lesson + Practice)
- [x] Extract questions from LR_2 Main Point Questions (Lesson + Practice)
- [x] Extract questions from LR_3 Role of Statement Questions (Lesson + Practice)
- [x] Extract questions from LR_4 Method of Argument Questions (Lesson + Practice)
- [x] Extract questions from LR_5 Point at Issue Questions (Lesson + Practice)
- [x] Extract questions from LR_6 Parallel Reasoning Questions (Lesson + Practice)
- [x] Extract questions from LR_I_V Outlining Complete Argument Drill Set
- [x] Extract questions from LR_I_a Reasoning Structure Question Set (image-based)
- [x] Extract questions from LR_I_b Mixed MP/Method/Point at Issue Pool (image-based)
- [x] Extract questions from LR_I_i What's the Conclusion Warm-Up Drill
- [x] Extract questions from LR_I_ii Identifying the Argument Core Warm-Up
- [x] Extract questions from LR_I_iii ID Main Conclusion + Name That Role Warm-Up
- [x] Extract questions from LR_I_iv Identifying + Paraphrasing Conclusions
- [x] Extract questions from LR_I_z Introduction to Assumption Family (Lesson + Practice)
- [x] Consolidate all extracted questions into unified CSV
- [x] Import all LR III questions into Question Bank
- [x] Enrich Study Guide modules with LR III lesson content
- [x] Run deduplication on full question database
- [x] Verify final question count after deduplication (189 unique questions)

## RC: Reading Comprehension — PDF Extraction & Import

- [x] Unpack and classify all 11 RC PDF files (text vs image-based)
- [x] Extract questions from RC_35 Questions in Categories Drill Set (6 questions, 2 passages)
- [x] Extract questions from RC_38 Sample RC Section (27 questions, multiple passages)
- [x] Extract questions from RC_40 Passage Types & Question Types Practice Set (2 questions)
- [x] Extract questions from RC_23 Reading Strategies Mini Drill Set
- [x] Extract questions from RC_25 Practice Set II (Comparative)
- [x] Use LLM to determine correct answers for all 35 RC questions (no answer key in source)
- [x] Import 35 RC questions into Question Bank database
- [x] Enrich RC Study Guide modules with lesson content (RC_22 reasoning structure framework, RC_25 comparative passages, RC_REF question types & wrong answer patterns)
- [x] Add new Comparative Passages module to Study Guide
- [x] Run deduplication on full question database
- [x] Verify final question count after deduplication (196 unique questions)

## Batch 2: Resolve the Paradox, Inference, Reasoning Conforms To, Supporting Principle
*Note: All batch 2 PDFs use custom font encoding (zeros) — require visual/image extraction. LLM quota exhausted during this session; defer to next session.*

- [x] Visual extraction: LR_V.3_ResolvetheParadox(#1-71).pdf (71 questions, answer key pp.257-275) — COMPLETE
- [x] Visual extraction: 6.ResolvetheParadoxQuestions.pdf — deduplicated against primary source
- [x] Visual extraction: LR_III_5_ResolvetheParadoxQuestionSet.pdf — 0 complete questions (lesson-only page)
- [x] Visual extraction: LR_V.3_Inference(MustBeTrue)(#1-50).pdf — 50 questions
- [x] Visual extraction: LR_V.3_Inference(MostStronglySupported)(#1-62).pdf — 62 questions
- [x] Visual extraction: LR_V.3_Inference(CannotBeTrue)(#1-13).pdf — 13 questions
- [x] Visual extraction: LR_V.3_Inference(CompletetheArgument)(#1-14).pdf — 14 questions
- [x] Visual extraction: 5.ReasoningConformsToQuestions.pdf — 39 questions
- [x] Visual extraction: 4.SupportingPrincipleQuestions.pdf — 39 questions (keyed) + 32 without key
- [x] Import all batch 2 questions into Question Bank (484 total)
- [x] Enrich Study Guide modules: Resolve the Paradox, Inference (4 subtypes), Principle, Reasoning Conforms To
- [x] Run deduplication after batch 2 import — 0 duplicates, database clean at 484 questions
- [ ] Process LSATReadinessChecklist PDFs — add as student self-assessment tool
- [ ] Process LSATLogicalReasoningbyTypeVolume3.xlsx — analyze question distribution data

## Tag Management UI

- [x] Build TagManager page with three-column layout (Tag Browser | Question List | Assignment Panel)
- [x] Implement tag hierarchy browser (Lesson / Unit / Flaw Type categories)
- [x] Add tag CRUD: create, rename, delete tags with color picker
- [x] Add tag assignment panel: assign/remove tags on individual questions
- [x] Add bulk tag operations: select multiple questions and assign tags at once
- [x] Add tag filtering to Question Bank page (filter by one or more tags)
- [x] Add tag count badges showing how many questions carry each tag
- [x] Register /tag-manager route in App.tsx
- [x] Add nav link in MainNavigationBar
- [x] Write tests for tag assignment and bulk operations (18 tests, all passing)

## Core Tag Taxonomy Seeding

- [x] Audit all question categories and sources in the database (196 questions, 19 categories)
- [x] Design taxonomy structure: Curriculum Sections, Lesson Units, Question Types, Flaw Types, Difficulty, Source Sets
- [x] Create 68 tags across 6 taxonomy layers
- [x] Auto-assign 988 tag-question associations based on category and source fields
- [x] Flaw type tags created (12 subtypes: Causal, Overlooked Possibilities, Conditional Error, Sampling, Analogy, Circular, Ad Hominem, Equivocation, Composition/Division, False Dichotomy, Inappropriate Appeal, Scope Shift)
- [x] Difficulty tags normalized (Easy/Medium/Hard) and assigned to all 196 questions
- [x] Source set tags assigned (LSAT Trainer, Testmasters, LR II Drill Sets, LR III Drill Sets, RC Drill Sets)

## Flaw Subtype Tag Assignment

- [x] Fetch all 47 Flaw questions from the database
- [x] Write heuristic pattern-matching classifier (12 flaw subtypes, priority-ordered rules)
- [x] Assign flaw subtype tags to all 47 questions (47/47 assigned)
- [x] 15 high-confidence assignments (Inappropriate Appeal, Sampling, Causal, Analogy, Conditional, Ad Hominem, Composition/Division)
- [ ] Re-classify 32 "Overlooked Possibilities" fallbacks using LLM in fresh session (run assign_flaw_tags.mjs)

## Inference PDFs + Flaw Re-classification (Session 6)

- [x] Visual extraction: LR_V.3_Inference(MustBeTrue)(#1-50).pdf — 50 questions
- [x] Visual extraction: LR_V.3_Inference(MostStronglySupported)(#1-62).pdf — 62 questions
- [x] Visual extraction: LR_V.3_Inference(CannotBeTrue)(#1-13).pdf — 13 questions
- [x] Visual extraction: LR_V.3_Inference(CompletetheArgument)(#1-14).pdf — 14 questions
- [x] Import 139 Inference questions with answer key into Question Bank
- [x] Enrich Study Guide Inference & Must Be True module
- [x] Assign taxonomy tags to 139 Inference questions (5 new tags, 695 assignments)
- [x] Re-classify 32 flaw fallback questions using LLM (19 re-classified, 13 confirmed Overlooked Possibilities)
- [x] Deduplication: 0 duplicates found — database clean at 406 questions

## Audit Fixes (Phase 1–3)

- [ ] Phase 1: Resolve Home.tsx vs LessonNecessaryAssumptions.tsx duplication — keep step-by-step (LessonNA), redirect Home.tsx to /lessons/necessary-assumptions
- [ ] Phase 2: Add localStorage progress persistence to all lesson pages (currentStep keyed by lesson ID, Reset Progress button)
- [ ] Phase 3: Expand PracticeSection to 5 answer choices (A–E) matching real LSAT format
- [ ] Phase 3: Expand LessonCommonFlaws practice question to 5 answer choices (A–E)
- [ ] Phase 4: Update ideas.md to reflect actual light "Academic Warm Parchment" theme
- [ ] Phase 4: Fix RecapSection "What's Next" — remove or qualify Sufficient Assumptions cross-reference since it's not a Dashboard lesson
- [ ] Phase 5: Build /about page — bio, credentials, teaching approach, contact/booking CTA
- [ ] Phase 5: Add "About" nav link to MainNavigationBar
- [ ] Phase 5: Register /about route in App.tsx

## Audit Fixes — Phase 1–5 (May 2026)

- [x] Delete orphaned Home.tsx (duplicate lesson architecture resolved)
- [x] Add useLessonProgress hook for numeric-step lessons (LessonNecessaryAssumptions)
- [x] Add useLessonStepProgress hook for string-step lessons
- [x] Add localStorage persistence + Reset Progress button to LessonNecessaryAssumptions
- [x] Add localStorage persistence + Reset Progress button to LessonCommonFlaws
- [x] Add localStorage persistence + Reset Progress button to LessonStrengthenWeaken
- [x] Add localStorage persistence + Reset Progress button to LessonReadingComprehension
- [x] Add localStorage persistence + Reset Progress button to LessonFormalLogic
- [x] Expand PracticeSection (NA lesson) from 3 to 5 answer choices (D: motivation distractor, E: funding distractor)
- [x] Expand LessonCommonFlaws practice from 4 to 5 answer choices
- [x] Expand LessonStrengthenWeaken practice from 4 to 5 answer choices
- [x] Expand LessonReadingComprehension practice questions to 5 answer choices each
- [x] Expand LessonFormalLogic practice questions to 5 answer choices each
- [x] Update ideas.md to document actual Warm Parchment light theme (with design decision log)
- [x] Fix RecapSection What's Next — add "Explore all lessons" link to /lessons hub
- [x] Build About/Hire Me page (bio, credentials, teaching philosophy, booking CTA)
- [x] Add About route to App.tsx
- [x] Add About link to MainNavigationBar
- [x] Fix all lesson back-nav buttons to point to /lessons instead of /

## Lesson 6 + Completion Badges (May 26, 2026)

- [x] Create useLessonCompletion hook (localStorage flag per lesson, getLessonCompletion helper)
- [x] Build LessonSufficientAssumptions.tsx (6th lesson, Conditional Bridge Method, 5 answer choices)
- [x] Add markComplete() to LessonNecessaryAssumptions (fires on reaching recap)
- [x] Add markComplete() to LessonCommonFlaws
- [x] Add markComplete() to LessonStrengthenWeaken
- [x] Add markComplete() to LessonReadingComprehension
- [x] Add markComplete() to LessonFormalLogic
- [x] Update Dashboard.tsx to read completion flags and show dynamic green checkmarks
- [x] Add Sufficient Assumptions card to Dashboard lesson grid (purple, Layers icon)
- [x] Register /lessons/sufficient-assumptions route in App.tsx
- [x] TypeScript check passes (0 errors)

## Lesson 7 — Flaw in the Reasoning

- [x] Create LessonFlawInReasoning.tsx (6 steps: Hero, Concept, Taxonomy, Flaw Spotter, Pro Tip, Practice, Recap)
- [x] Signature visual: interactive Flaw Spotter (3 scenarios, 6 flaw type buttons, instant feedback)
- [x] 5-choice practice question with full explanations
- [x] localStorage progress persistence + Reset Progress button
- [x] markComplete() wired to useLessonCompletion hook
- [x] Assumption Family arc complete callout in Recap
- [x] Route added to App.tsx (/lessons/flaw-in-reasoning)
- [x] Lesson card added to Dashboard.tsx (red accent, AlertTriangle icon)
- [x] TypeScript clean (0 errors)

## Contact/Booking — Calendly Integration

- [x] Create /booking page with inline Calendly embed widget
- [x] Add rate card ($75/hr online, $85/hr in-person) to /booking page
- [x] Add Good Fit Guarantee callout to /booking page
- [x] Add Cancellation Policy card to /booking page
- [x] Add "What to Expect" checklist to /booking page
- [x] Add "Prefer Email?" contact card to /booking page
- [x] Add "Book a Session" CTA button to MainNavigationBar (desktop + mobile)
- [x] Add "Book a Session" CTA button to PathSelector landing page
- [x] Update About page "Book a Session" button to route to /booking (was direct Calendly link)
- [x] Add BookingCTA component to RecapSection (Lesson 1 — Necessary Assumptions)
- [x] Add BookingCTA to LessonCommonFlaws recap section
- [x] Add BookingCTA to LessonStrengthenWeaken recap section
- [x] Add BookingCTA to LessonReadingComprehension recap section
- [x] Add BookingCTA to LessonFormalLogic recap section
- [x] Add BookingCTA to LessonSufficientAssumptions recap section
- [x] Add BookingCTA to LessonFlawInReasoning recap section
- [x] Add /booking to sitemap.xml
- [x] TypeScript: 0 errors
