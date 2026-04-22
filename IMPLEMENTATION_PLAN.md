# LSAT Mastery UX Overhaul — Implementation Plan

## Overview

Transform LSAT Mastery from a generic test-prep site into a **bold, distinctive learning platform** with:
- High-contrast, energetic color palette (indigo, electric blue, golden yellow, neon orange)
- Improved visual hierarchy through progress stepper, sidebar navigator, and breadcrumb
- Refined typography and spacing for better readability
- Cohesive design system across all components

**Total Estimated Time**: 8-10 hours

---

## Task Breakdown

### Task 1: Design System Foundation (60 min)
**Goal**: Establish CSS variables and global styles

**Steps**:
1. Update `client/index.html` to add Google Fonts (Poppins, Inter, JetBrains Mono)
2. Rewrite `client/src/index.css` with new color palette and CSS variables
3. Create `client/src/lib/design-tokens.ts` with TypeScript color constants
4. Update Tailwind configuration to use new colors
5. Verify TypeScript compilation

**Verification**: No TypeScript errors, colors display correctly in browser

---

### Task 2: Sidebar Navigator Component (90 min)
**Goal**: Build collapsible sidebar showing lesson structure

**Steps**:
1. Create `client/src/components/SidebarNavigator.tsx`
2. Implement collapsible sidebar with lesson sections
3. Add active section highlighting
4. Add smooth animations for open/close
5. Style with new color palette
6. Test on mobile (responsive collapse)

**Verification**: Sidebar opens/closes smoothly, active section highlighted, mobile responsive

---

### Task 3: Breadcrumb Navigation Component (45 min)
**Goal**: Add breadcrumb trail showing current location

**Steps**:
1. Create `client/src/components/Breadcrumb.tsx`
2. Implement breadcrumb with Dashboard > Lesson > Section
3. Add click handlers for navigation
4. Style with indigo text and electric blue links
5. Add responsive behavior

**Verification**: Breadcrumbs display correctly, links navigate properly

---

### Task 4: Progress Stepper Component (60 min)
**Goal**: Build visual step indicator

**Steps**:
1. Create `client/src/components/ProgressStepper.tsx`
2. Implement step indicators (1/5, 2/5, etc.)
3. Add visual progression (completed, current, upcoming)
4. Use golden yellow for current, electric blue for completed
5. Add smooth animations

**Verification**: Steps display correctly, animations smooth, colors accurate

---

### Task 5: Update Dashboard Page (75 min)
**Goal**: Redesign dashboard with new colors and typography

**Steps**:
1. Update lesson card styling with new color palette
2. Refine card borders, shadows, and spacing
3. Update button styles (electric blue primary, golden yellow secondary)
4. Improve typography hierarchy (Poppins for titles)
5. Add hover effects and transitions
6. Ensure responsive layout

**Verification**: Dashboard looks cohesive, colors match design system, buttons functional

---

### Task 6: Update Lesson Pages Header (75 min)
**Goal**: Add navigation components to all lesson pages

**Steps**:
1. Update `LessonNecessaryAssumptions.tsx` header
2. Add breadcrumb, progress stepper, and sidebar navigator
3. Implement section navigation (Next/Previous buttons)
4. Update colors to match design system
5. Repeat for all other lesson pages (Common Flaws, Strengthen & Weaken, RC, Formal Logic)

**Verification**: All lesson pages have consistent navigation, colors correct

---

### Task 7: Refine Component Styling (90 min)
**Goal**: Update all interactive components with new design system

**Steps**:
1. Update button styles across all components
2. Refine card styling (borders, shadows, spacing)
3. Update input/form styling
4. Refine practice question styling
5. Update answer choice styling
6. Ensure all text uses correct typography scale

**Verification**: All components styled consistently, no visual inconsistencies

---

### Task 8: Typography & Spacing Polish (60 min)
**Goal**: Refine typography hierarchy and spacing

**Steps**:
1. Update all H1/H2/H3 headings to use Poppins
2. Refine line heights and letter spacing
3. Adjust padding/margins to match spacing system
4. Improve readability of body text
5. Test on multiple screen sizes

**Verification**: Typography hierarchy clear, spacing consistent, readable on all devices

---

### Task 9: Animations & Transitions (75 min)
**Goal**: Add smooth, purposeful animations

**Steps**:
1. Add page load animations (staggered reveals)
2. Add hover effects to buttons and links
3. Add smooth transitions to sidebar/breadcrumb
4. Add section transition animations
5. Ensure animations respect `prefers-reduced-motion`

**Verification**: Animations smooth, purposeful, not distracting

---

### Task 10: Accessibility & Testing (60 min)
**Goal**: Ensure accessibility and cross-browser compatibility

**Steps**:
1. Verify color contrast (WCAG AA/AAA)
2. Test keyboard navigation
3. Test focus states
4. Test on mobile devices
5. Verify TypeScript compilation
6. Test all interactive elements

**Verification**: All accessibility checks pass, no TypeScript errors, works on mobile

---

## Implementation Order

1. Task 1: Design System Foundation (60 min)
2. Task 2: Sidebar Navigator (90 min)
3. Task 3: Breadcrumb Navigation (45 min)
4. Task 4: Progress Stepper (60 min)
5. Task 5: Update Dashboard (75 min)
6. Task 6: Update Lesson Pages (75 min)
7. Task 7: Refine Components (90 min)
8. Task 8: Typography & Spacing (60 min)
9. Task 9: Animations & Transitions (75 min)
10. Task 10: Accessibility & Testing (60 min)

**Total**: ~690 minutes (11.5 hours)

---

## Rollback Procedure

If critical issues arise:
1. Use `webdev_rollback_checkpoint` to revert to previous checkpoint
2. Identify the problematic task
3. Fix the issue
4. Re-execute remaining tasks

---

## Success Criteria

- [ ] All tasks completed and marked in `todo.md`
- [ ] TypeScript compiles without errors
- [ ] Dev server running cleanly
- [ ] All pages load correctly in browser
- [ ] Visual hierarchy improved (stepper, sidebar, breadcrumb)
- [ ] Colors match design system (indigo, electric blue, golden yellow, neon orange)
- [ ] Typography hierarchy clear (Poppins for headings, Inter for body)
- [ ] Animations smooth and purposeful
- [ ] Accessibility checks pass (contrast, keyboard, focus)
- [ ] Mobile responsive
- [ ] Checkpoint created with detailed description
