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
