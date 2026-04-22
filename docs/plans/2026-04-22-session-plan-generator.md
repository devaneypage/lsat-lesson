# Session Plan Template Generator — Implementation Plan

## Overview

Build a Session Plan Template Generator that converts curriculum outlines and documents into detailed, customizable lesson plans with timing, activities, and materials for individual tutoring sessions.

## Objectives

1. Allow tutors to input structured outlines or upload curriculum documents
2. Generate interactive session plans with customizable timing and activities
3. Export plans as PDF or Word documents
4. Integrate into lesson pages for quick plan generation
5. Provide full customization of activities, timing, and materials

## Requirements Summary

| Requirement | Details |
| --- | --- |
| Input | Structured markdown outlines + document upload (PDF/Word) |
| Output | Interactive templates + PDF/Word export |
| Session Type | Individual tutoring only |
| Customization | Full (timing, activities, materials) |
| Integration | Standalone tool + lesson page integration |

## Task Breakdown

### Task 1: Create Session Plan Data Model (20 min)
**Objective**: Define the data structure for session plans

**Steps**:
1. Create `client/src/types/sessionPlan.ts` with TypeScript interfaces:
   - `SessionPlan` (title, duration, objectives, activities, materials)
   - `Activity` (name, duration, description, materials, notes)
   - `Material` (name, quantity, notes)
2. Define validation schema using Zod
3. Create sample data for testing

**Success Criteria**:
- [ ] TypeScript file created with all interfaces
- [ ] Zod schema validates correctly
- [ ] Sample data matches schema

---

### Task 2: Build Session Plan Form Component (45 min)
**Objective**: Create form for inputting session plan details

**Steps**:
1. Create `client/src/components/SessionPlanForm.tsx`
2. Add form fields:
   - Session title, duration, learning objectives
   - Add/remove activities with timing
   - Add/remove materials
3. Use shadcn/ui form components (Input, Button, Card, etc.)
4. Implement add/remove activity buttons with dynamic form fields
5. Add form validation with error messages

**Success Criteria**:
- [ ] Form renders without errors
- [ ] Can add/remove activities dynamically
- [ ] Form validation works
- [ ] All fields are editable

---

### Task 3: Build Session Plan Preview Component (30 min)
**Objective**: Display formatted session plan for review

**Steps**:
1. Create `client/src/components/SessionPlanPreview.tsx`
2. Display session plan in readable format:
   - Title, duration, objectives
   - Activities table with timing
   - Materials list
3. Use consistent styling with design system colors
4. Make printable (add print-friendly styles)

**Success Criteria**:
- [ ] Component renders session plan correctly
- [ ] Layout is clean and readable
- [ ] Print preview looks good

---

### Task 4: Build PDF Export Functionality (40 min)
**Objective**: Export session plan as PDF

**Steps**:
1. Install `jspdf` and `html2canvas` packages
2. Create `client/src/lib/exportSessionPlan.ts` utility
3. Implement PDF export function:
   - Capture preview component as image
   - Generate PDF with formatted content
   - Add header/footer with tutor name
4. Add export button to preview

**Success Criteria**:
- [ ] PDF exports successfully
- [ ] PDF is readable and well-formatted
- [ ] File downloads with correct name

---

### Task 5: Build Outline Input Component (35 min)
**Objective**: Allow tutors to input structured outlines

**Steps**:
1. Create `client/src/components/OutlineInput.tsx`
2. Add textarea for markdown outline input
3. Parse markdown to extract topics and subtopics
4. Auto-generate activities from outline structure
5. Show preview of parsed activities

**Success Criteria**:
- [ ] Markdown parsing works correctly
- [ ] Activities generated from outline
- [ ] Preview shows parsed structure

---

### Task 6: Build Document Upload Component (35 min)
**Objective**: Allow tutors to upload curriculum documents

**Steps**:
1. Create `client/src/components/DocumentUpload.tsx`
2. Add file upload input (PDF, Word, text)
3. Parse uploaded document to extract text
4. Extract key topics/sections from document
5. Generate activities from extracted content

**Success Criteria**:
- [ ] File upload works
- [ ] Document parsing extracts text
- [ ] Activities generated from document

---

### Task 7: Create Session Plan Generator Page (50 min)
**Objective**: Build standalone tool page

**Steps**:
1. Create `client/src/pages/SessionPlanGenerator.tsx`
2. Add tabs/sections for:
   - Outline input
   - Document upload
   - Form editor
   - Preview
3. Implement workflow:
   - Input → Parse → Generate → Edit → Preview → Export
4. Add navigation back to dashboard
5. Integrate all components

**Success Criteria**:
- [ ] Page loads without errors
- [ ] All tabs work correctly
- [ ] Workflow is intuitive
- [ ] Can generate, edit, and export plans

---

### Task 8: Integrate into Lesson Pages (40 min)
**Objective**: Add "Generate Session Plan" button to lesson pages

**Steps**:
1. Create `client/src/components/GenerateSessionPlanButton.tsx`
2. Add button to each lesson page header
3. Pre-populate form with lesson data:
   - Title from lesson
   - Duration from lesson
   - Topics from lesson content
4. Open generator modal or navigate to generator
5. Return generated plan to lesson page

**Success Criteria**:
- [ ] Button appears on all lesson pages
- [ ] Button opens generator with pre-filled data
- [ ] Generated plan can be exported

---

### Task 9: Add Customization Features (35 min)
**Objective**: Allow full customization of activities and timing

**Steps**:
1. Make all form fields editable inline
2. Add drag-to-reorder activities
3. Add activity templates (warm-up, drill, practice, wrap-up)
4. Add timing presets (15 min, 30 min, 60 min sessions)
5. Add notes field for each activity

**Success Criteria**:
- [ ] All fields are editable
- [ ] Drag-to-reorder works
- [ ] Templates load correctly
- [ ] Timing presets work

---

### Task 10: Testing & Verification (45 min)
**Objective**: Test all features end-to-end

**Steps**:
1. Test outline input with sample markdown
2. Test document upload with sample PDF
3. Test form validation
4. Test activity add/remove
5. Test PDF export
6. Test lesson page integration
7. Test responsive design
8. Check for console errors

**Success Criteria**:
- [ ] All workflows work end-to-end
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] PDF exports correctly
- [ ] Lesson integration works

---

## Implementation Order

1. Task 1: Data Model (foundation)
2. Task 2: Form Component (input)
3. Task 3: Preview Component (output)
4. Task 4: PDF Export (export)
5. Task 5: Outline Input (input method 1)
6. Task 6: Document Upload (input method 2)
7. Task 7: Generator Page (integration)
8. Task 8: Lesson Integration (integration)
9. Task 9: Customization (polish)
10. Task 10: Testing (validation)

**Total Estimated Time**: 375 minutes (~6.25 hours)

## Success Criteria

- [ ] Session plans can be created from outlines
- [ ] Session plans can be created from uploaded documents
- [ ] Session plans can be customized (timing, activities, materials)
- [ ] Session plans can be exported as PDF
- [ ] Session plan generator is accessible from lesson pages
- [ ] All features work end-to-end
- [ ] No TypeScript errors
- [ ] Responsive design works on all devices

## Rollback Plan

If critical issues occur:
1. Revert to previous checkpoint using `webdev_rollback_checkpoint`
2. Identify root cause
3. Create new plan with adjusted approach
4. Re-implement with fixes

## Dependencies

- `jspdf` - PDF generation
- `html2canvas` - HTML to image conversion
- `zod` - Schema validation
- Existing shadcn/ui components
