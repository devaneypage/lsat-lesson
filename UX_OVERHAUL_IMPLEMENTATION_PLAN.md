# UX Overhaul Implementation Plan

**Project:** LSAT Master Study Guidebook  
**Date:** 2026-06-30  
**Estimated Duration:** 12 hours

---

## Overview

**Design Direction:** The redesign will adopt a **Balanced & Refined** aesthetic, combining the technical precision and structured feel of the LSAT Nexus artifact with thoughtful design refinements for approachability. The primary entry point will be a Nexus-style dashboard, with existing lessons integrated as accessible reference modules. The visual language will be clean, modern, and professional, emphasizing clarity and user guidance.

**Key Changes:**
1.  Establish a new design system (colors, typography, spacing, borders, shadows) based on the 
Balanced & Refined aesthetic.
2.  Reimagine the homepage as a **Nexus-style dashboard**, providing a centralized hub for progress tracking, quick navigation to key sections (Learn, Practice, Review, Plan), and personalized insights.
3.  Integrate existing lessons into the new dashboard structure, making them accessible as **reference modules** rather than a linear progression.
4.  Update core UI components (navigation, cards, buttons, forms) to align with the new design system.
5.  Ensure **responsive design** across all breakpoints and maintain **accessibility** standards.

---

## Task Breakdown

### Task 1: Design System Foundation (120 min)

**Goal:** Establish the core visual language for the site, including color palette, typography, spacing, and component styling, implemented via CSS variables and Tailwind configuration.

**Files to Create:**
-   `/home/ubuntu/lsat-lesson/client/src/lib/design-tokens.ts` - TypeScript file for color constants.

**Files to Modify:**
-   `/home/ubuntu/lsat-lesson/client/src/index.css` - Global styles, CSS variables, and base layer rules.
-   `/home/ubuntu/lsat-lesson/tailwind.config.js` - Extend Tailwind theme with new colors, fonts, and spacing.
-   `/home/ubuntu/lsat-lesson/client/index.html` - Add Google Fonts CDN links.

**Steps:**

#### Step 1.1: Define Color Palette and CSS Variables (45 min)

**Action:** Based on the "Balanced & Refined" mockup and the LSAT Nexus artifact, define a cohesive color palette. Implement these colors as CSS variables in `client/src/index.css` and as TypeScript constants in `client/src/lib/design-tokens.ts`.

**Color Palette (Balanced & Refined):**
-   **Background:** `#F4EDE0` (Cream) - Main background color.
-   **Foreground:** `#111111` (Black) - Primary text color.
-   **Primary Accent:** `#1AABBC` (Teal) - For primary CTAs, highlights, active states.
-   **Secondary Accent:** `#EFA01C` (Amber) - For secondary accents, warnings, emphasis.
-   **Tertiary Accent:** `#D0452A` (Terra Red) - For errors, destructive actions, specific concept categories.
-   **Forest Green:** `#2A6B58` (Forest Green) - For success states, specific concept categories.
-   **Card Background:** `#FFFDF8` (White) - Background for cards and content blocks.
-   **Border Color:** `#111111` (Black) - For borders.

**Code (client/src/index.css - example snippet):**
```css
@layer base {
  :root {
    --background: #F4EDE0;
    --foreground: #111111;
    --primary: #1AABBC;
    --primary-foreground: #FFFDF8; /* White for contrast on primary */
    --secondary: #EFA01C;
    --secondary-foreground: #111111; /* Black for contrast on secondary */
    --destructive: #D0452A;
    --destructive-foreground: #FFFDF8;
    --card: #FFFDF8;
    --card-foreground: #111111;
    --border: #111111;
    --input: #111111;
    --ring: #1AABBC;
    --radius: 0.25rem; /* 4px for subtle rounding */

    /* Custom colors from Nexus */
    --nexus-terra: #D0452A;
    --nexus-teal: #1AABBC;
    --nexus-forest: #2A6B58;
    --nexus-amber: #EFA01C;
    --nexus-lime: #79C53E;
    --nexus-sky: #4BB8D8;
  }
}
```

**Code (client/src/lib/design-tokens.ts - example snippet):**
```typescript
export const colors = {
  background: '#F4EDE0',
  foreground: '#111111',
  primary: '#1AABBC',
  secondary: '#EFA01C',
  destructive: '#D0452A',
  success: '#2A6B58',
  card: '#FFFDF8',
  border: '#111111',
  input: '#111111',
  ring: '#1AABBC',
  nexusTerra: '#D0452A',
  nexusTeal: '#1AABBC',
  nexusForest: '#2A6B58',
  nexusAmber: '#EFA01C',
  nexusLime: '#79C53E',
  nexusSky: '#4BB8D8',
};

export const borderRadius = '0.25rem'; // 4px
export const borderWidth = '1.5px';
```

**Verification:**
-   [ ] `client/src/index.css` updated with new CSS variables.
-   [ ] `client/src/lib/design-tokens.ts` created with color constants.
-   [ ] No TypeScript errors after running `npx tsc --noEmit`.

#### Step 1.2: Define Typography and Load Fonts (30 min)

**Action:** Select primary (UI) and display (headers) fonts. Use Archivo for UI and Archivo Black for display, as per the Nexus artifact. Add Google Fonts CDN links to `client/index.html`.

**Code (client/index.html - example snippet):**
```html
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

**Code (client/src/index.css - example snippet):**
```css
@layer base {
  :root {
    /* ... existing CSS variables ... */
    --font-sans: 'Archivo', sans-serif;
    --font-display: 'Archivo Black', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
}

body {
  font-family: var(--font-sans);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
}

code, pre {
  font-family: var(--font-mono);
}
```

**Verification:**
-   [ ] `client/index.html` updated with font CDN links.
-   [ ] `client/src/index.css` updated with font variables.
-   [ ] No TypeScript errors.

#### Step 1.3: Configure Tailwind for Design System (45 min)

**Action:** Extend `tailwind.config.js` to use the new color palette, font families, border radius, and border width. Add custom utilities for geometric shapes and patterns if needed.

**Code (tailwind.config.js - example snippet):**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom Nexus colors
        nexusTerra: 'var(--nexus-terra)',
        nexusTeal: 'var(--nexus-teal)',
        nexusForest: 'var(--nexus-forest)',
        nexusAmber: 'var(--nexus-amber)',
        nexusLime: 'var(--nexus-lime)',
        nexusSky: 'var(--nexus-sky)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      borderWidth: {
        '1.5': '1.5px',
        '2.5': '2.5px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

**Verification:**
-   [ ] `tailwind.config.js` updated with new theme extensions.
-   [ ] No TypeScript errors.
-   [ ] Dev server restarts without issues.

---

### Task 2: Rebuild Main Navigation (90 min)

**Goal:** Redesign the main navigation bar to align with the Nexus aesthetic, featuring the geometric brand mark, uppercase tab labels, and a clear call to action.

**Files to Modify:**
-   `/home/ubuntu/lsat-lesson/client/src/components/MainNavigationBar.tsx` - Implement new styling and structure.

**Steps:**

#### Step 2.1: Update Navigation Bar Structure and Styling (60 min)

**Action:** Modify `MainNavigationBar.tsx` to reflect the Nexus navigation style: black background, amber geometric logo, uppercase letter-spaced tab labels, and amber underline for the active state. Ensure the 
Book a Session CTA remains prominent.

**Code (MainNavigationBar.tsx - conceptual changes):**
```typescript
// Example: Update navigation structure and styling
<nav className="fixed top-0 left-0 right-0 h-[56px] z-10 bg-black flex items-center px-5 border-b-2.5 border-black">
  <div className="flex items-center gap-2 mr-8">
    <div className="w-[26px] h-[26px] bg-nexusAmber clip-path-polygon(50% 0%,100% 50%,50% 100%,0% 50%)"></div>
    <span className="font-display text-lg text-nexusAmber tracking-wider">LSAT COMMAND</span>
  </div>
  <div className="flex">
    {/* Navigation tabs */}
    <NavLink to="/dashboard" className={({ isActive }) =>
      `px-4 h-[56px] flex items-center cursor-pointer text-sm font-semibold uppercase tracking-wider transition-all duration-300 ease-in-out border-b-[3px] ${isActive ? 'text-nexusAmber border-nexusAmber' : 'text-white/50 border-transparent hover:text-white hover:bg-white/10'}`
    }>
      Dashboard
    </NavLink>
    {/* ... other navigation items ... */}
  </div>
  <div className="ml-auto">
    <Link to="/booking">
      <Button variant="primary" className="font-display uppercase tracking-wider text-sm px-4 py-2">
        Book a Session
      </Button>
    </Link>
  </div>
</nav>
```

**Verification:**
-   [ ] Navigation bar reflects the new design.
-   [ ] All navigation links are functional.
-   [ ] "Book a Session" CTA is visible and routes correctly.
-   [ ] Responsive behavior of the navigation bar is maintained.
-   [ ] No TypeScript errors.

---

### Task 3: Redesign Homepage as Nexus Dashboard (180 min)

**Goal:** Transform the existing homepage (`client/src/pages/Home.tsx`) into a Nexus-style dashboard, serving as the central hub for student progress, quick navigation, and personalized insights.

**Files to Modify:**
-   `/home/ubuntu/lsat-lesson/client/src/pages/Home.tsx` - Rebuild the page layout and content.
-   `/home/ubuntu/lsat-lesson/client/src/components/PathSelector.tsx` - Update the "Book a Session" CTA to align with the new dashboard.

**Files to Create:**
-   `/home/ubuntu/lsat-lesson/client/src/components/NexusDashboardLayout.tsx` - A new layout component for the dashboard structure (main content + sidebar).
-   `/home/ubuntu/lsat-lesson/client/src/components/ScoreCard.tsx` - Component to display overall score and percentile.
-   `/home/ubuntu/lsat-lesson/client/src/components/MasteryOverview.tsx` - Component for skill mastery progress bars.
-   `/home/ubuntu/lsat-lesson/client/src/components/QuickNavigation.tsx` - Component for quick links to key sections.
-   `/home/ubuntu/lsat-lesson/client/src/components/ConceptMap.tsx` - Component to visualize the LSAT concept map.

**Steps:**

#### Step 3.1: Create NexusDashboardLayout Component (60 min)

**Action:** Create a new React component `NexusDashboardLayout.tsx` that establishes the two-column grid structure (main content area and sidebar) as seen in the Nexus mockup. This will serve as the primary layout for the new homepage.

**Code (client/src/components/NexusDashboardLayout.tsx - conceptual):**
```typescript
import React from 'react';

interface NexusDashboardLayoutProps {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

const NexusDashboardLayout: React.FC<NexusDashboardLayoutProps> = ({ mainContent, sidebarContent }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-4">
      <div classNameName="main-content">
        {mainContent}
      </div>
      <div classNameName="sidebar flex flex-col gap-3 overflow-y-auto">
        {sidebarContent}
      </div>
    </div>
  );
};

export default NexusDashboardLayout;
```

**Verification:**
-   [ ] `NexusDashboardLayout.tsx` created.
-   [ ] No TypeScript errors.

#### Step 3.2: Implement ScoreCard, MasteryOverview, and QuickNavigation Components (60 min)

**Action:** Create `ScoreCard.tsx`, `MasteryOverview.tsx`, and `QuickNavigation.tsx` components to populate the sidebar of the dashboard. These components will display mock data initially.

**Code (client/src/components/ScoreCard.tsx - conceptual):**
```typescript
const ScoreCard: React.FC = () => (
  <div className="card border-2.5 border-black p-4 text-center">
    <h3 className="text-sm uppercase tracking-wider text-black/50">Current Score</h3>
    <p className="font-display text-6xl text-black">157</p>
    <p className="text-xs text-black/70">Predicted Range: 155-159</p>
  </div>
);
```

**Verification:**
-   [ ] `ScoreCard.tsx`, `MasteryOverview.tsx`, `QuickNavigation.tsx` created.
-   [ ] No TypeScript errors.

#### Step 3.3: Rebuild Homepage (Home.tsx) using NexusDashboardLayout (60 min)

**Action:** Refactor `client/src/pages/Home.tsx` to use the `NexusDashboardLayout` and integrate the new sidebar components. Replace existing homepage content with a placeholder for the main concept map.

**Code (client/src/pages/Home.tsx - conceptual):**
```typescript
import NexusDashboardLayout from '@/components/NexusDashboardLayout';
import ScoreCard from '@/components/ScoreCard';
import MasteryOverview from '@/components/MasteryOverview';
import QuickNavigation from '@/components/QuickNavigation';
import ConceptMap from '@/components/ConceptMap'; // Placeholder

const Home: React.FC = () => {
  return (
    <NexusDashboardLayout
      mainContent={<ConceptMap />}
      sidebarContent={
        <>
          <ScoreCard />
          <MasteryOverview />
          <QuickNavigation />
        </>
      }
    />
  );
};

export default Home;
```

**Verification:**
-   [ ] Homepage renders with the new dashboard layout and sidebar components.
-   [ ] No TypeScript errors.

---

### Task 4: Integrate Lessons as Reference Modules (180 min)

**Goal:** Adapt existing lesson pages to function as reference modules accessible from the new dashboard, ensuring they maintain the new design system.

**Files to Modify:**
-   `/home/ubuntu/lsat-lesson/client/src/pages/lessons/*.tsx` (all lesson files) - Update styling and navigation.
-   `/home/ubuntu/lsat-lesson/client/src/App.tsx` - Adjust routing if necessary.

**Steps:**

#### Step 4.1: Update Lesson Page Styling (90 min)

**Action:** Apply the new design system (colors, typography, borders, subtle rounding) to all existing lesson pages. Ensure consistency with the dashboard aesthetic. This will involve updating Tailwind classes and potentially replacing some custom CSS.

**Verification:**
-   [ ] All lesson pages reflect the new design system.
-   [ ] Content remains readable and functional.
-   [ ] No TypeScript errors.

#### Step 4.2: Implement Dashboard-to-Lesson Navigation (90 min)

**Action:** Create a mechanism within the dashboard (e.g., via the `ConceptMap` or `QuickNavigation` components) to link directly to specific lesson modules. Ensure a clear "Back to Dashboard" or "Back to Map" navigation is available on lesson pages.

**Verification:**
-   [ ] Users can navigate from the dashboard to any lesson.
-   [ ] Users can easily return to the dashboard from a lesson page.
-   [ ] No TypeScript errors.

---

### Task 5: Update Core UI Components (120 min)

**Goal:** Apply the new design system to common UI components across the site, ensuring a consistent and refined user experience.

**Files to Modify:**
-   `/home/ubuntu/lsat-lesson/client/src/components/ui/*.tsx` (shadcn/ui components) - Adjust `cn` utility for custom styling.
-   `/home/ubuntu/lsat-lesson/client/src/components/Button.tsx` - Update button styles.
-   `/home/ubuntu/lsat-lesson/client/src/components/Card.tsx` - Update card styles.
-   `/home/ubuntu/lsat-lesson/client/src/components/ManusDialog.tsx` - Update dialog styles.

**Steps:**

#### Step 5.1: Refine shadcn/ui Components (60 min)

**Action:** Review and adjust the styling of commonly used shadcn/ui components (e.g., Button, Card, Input, Dialog) to align with the new design system. This will primarily involve modifying `tailwind.config.js` and potentially overriding default styles in `index.css` or component files.

**Verification:**
-   [ ] Core shadcn/ui components reflect the new design.
-   [ ] No TypeScript errors.

#### Step 5.2: Update Custom Components (60 min)

**Action:** Apply the new design system to custom components such as `ManusDialog.tsx` and any other bespoke UI elements to ensure visual consistency across the application.

**Verification:**
-   [ ] Custom components reflect the new design.
-   [ ] No TypeScript errors.

---

## Implementation Checklist

### Before Starting
-   [ ] Read entire plan
-   [ ] Gather all brand assets (logo, colors, fonts) - *Already done in Phase 1*
-   [ ] Create `todo.md` with all tasks listed
-   [ ] Backup current state (create checkpoint if applicable) - *Checkpoint created before this phase*

### During Implementation
-   [ ] Execute tasks in order
-   [ ] Update `todo.md` after each task completion
-   [ ] Run TypeScript compilation after each task
-   [ ] Test in browser after major changes
-   [ ] Take conservative approach when refactoring (preserve existing functionality)

### After Completion
-   [ ] Verify all tasks marked complete in `todo.md`
-   [ ] Run full TypeScript compilation
-   [ ] Restart dev server to clear stale errors
-   [ ] Check status (no errors, server running)
-   [ ] Create checkpoint with detailed description
-   [ ] Test all pages in browser

---

## Design System Summary

**Color Palette:**
-   Background: `#F4EDE0` (Cream)
-   Foreground: `#111111` (Black)
-   Primary: `#1AABBC` (Teal)
-   Primary Foreground: `#FFFDF8` (White)
-   Secondary: `#EFA01C` (Amber)
-   Secondary Foreground: `#111111` (Black)
-   Destructive: `#D0452A` (Terra Red)
-   Destructive Foreground: `#FFFDF8` (White)
-   Card: `#FFFDF8` (White)
-   Card Foreground: `#111111` (Black)
-   Border: `#111111` (Black)
-   Input: `#111111` (Black)
-   Ring: `#1AABBC` (Teal)
-   Radius: `0.25rem` (4px)
-   Nexus Terra: `#D0452A`
-   Nexus Teal: `#1AABBC`
-   Nexus Forest: `#2A6B58`
-   Nexus Amber: `#EFA01C`
-   Nexus Lime: `#79C53E`
-   Nexus Sky: `#4BB8D8`

**Typography:**
-   Font Family (UI): `Archivo`, sans-serif
-   Font Family (Display/Headers): `Archivo Black`, sans-serif
-   Font Family (Mono): `JetBrains Mono`, monospace
-   Font Source: Google Fonts CDN

**Effects:**
-   Card Shadow: Subtle (e.g., `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);`)
-   Glow Effect: Minimal, for interactive elements (e.g., `ring` color)
-   Backdrop Blur: Not explicitly defined, to be added if needed for specific components.

**Spacing:**
-   Container Padding: `px-4` (responsive)
-   Card Padding: `p-4`
-   Section Spacing: `space-y-4` (default, adjustable)

---

## Risk Mitigation

**Conservative Approach:**
-   When refactoring complex pages, add new UI above/below existing UI first.
-   Test thoroughly before removing old UI.
-   Preserve all existing functionality.
-   Use feature flags if needed for gradual rollout.

**Rollback Plan:**
-   Create checkpoint before starting each major task.
-   Document all file changes.
-   Keep old code commented out temporarily.
-   Test rollback procedure before final commit.

---

## Success Criteria

-   [ ] All TypeScript errors resolved
-   [ ] Dev server running without errors
-   [ ] All pages load correctly
-   [ ] Navigation works on all pages
-   [ ] Brand assets display correctly
-   [ ] Color scheme applied consistently
-   [ ] Responsive design works on mobile/tablet/desktop
-   [ ] No console errors in browser
-   [ ] User can complete core workflows
-   [ ] Checkpoint created with detailed description

---

## Notes

-   The existing `client/src/index.css` already has some `Archivo Black`, `Archivo`, and `JetBrains Mono` imports. These will be consolidated and aligned with the new design system.
-   The `client/src/App.tsx` will need updates to its routing to accommodate the new dashboard as the primary entry point.
-   The `PathSelector.tsx` component will be updated to reflect the new dashboard structure and potentially integrate into the dashboard itself.
-   The existing `RecapSection.tsx` and individual lesson recap components will be updated to align with the new design system and potentially link back to the dashboard.
