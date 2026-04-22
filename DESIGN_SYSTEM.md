# LSAT Mastery Design System

## Brand Direction
- **Aesthetic**: Energetic & Modern meets Bold & Distinctive
- **Mood**: High contrast, striking, memorable, forward-thinking
- **Navigation**: Progress Stepper + Sidebar Navigator + Breadcrumb

---

## Color Palette

### Primary Colors
- **Background**: Off-white (`#F9F8F6`)
- **Primary Text**: Indigo Blue (`#2D1B69`)
- **Secondary Text**: Indigo Blue with opacity (`rgba(45, 27, 105, 0.7)`)

### Accent Colors
- **Accent 1 (Primary CTA)**: Electric Blue (`#0066FF`)
- **Accent 2 (Secondary)**: Golden Yellow (`#FFB81C`)
- **Accent 3 (Success)**: Neon Orange (`#FF6B35`)

### Semantic Colors
- **Error**: Crimson Red (`#DC2626`)
- **Warning**: Golden Yellow (`#FFB81C`)
- **Success**: Neon Orange (`#FF6B35`)
- **Info**: Electric Blue (`#0066FF`)

### Neutral Colors
- **Border**: `rgba(45, 27, 105, 0.15)`
- **Divider**: `rgba(45, 27, 105, 0.08)`
- **Hover State**: `rgba(45, 27, 105, 0.04)`
- **Card Background**: `#FFFFFF`
- **Disabled**: `rgba(45, 27, 105, 0.4)`

---

## Typography

### Font Families
- **Display Font**: `Poppins` (Bold, 700) — Headlines, lesson titles, CTAs
- **Body Font**: `Inter` (Regular 400, Medium 500) — Body text, descriptions
- **Mono Font**: `JetBrains Mono` (Regular 400) — Code, logical notation

### Type Scale
- **H1**: 2.5rem (40px) | Poppins 700 | Line height 1.2
- **H2**: 2rem (32px) | Poppins 700 | Line height 1.3
- **H3**: 1.5rem (24px) | Poppins 700 | Line height 1.4
- **H4**: 1.25rem (20px) | Poppins 600 | Line height 1.4
- **Body**: 1rem (16px) | Inter 400 | Line height 1.6
- **Small**: 0.875rem (14px) | Inter 400 | Line height 1.5
- **Tiny**: 0.75rem (12px) | Inter 500 | Line height 1.4

---

## Spacing System

### Base Unit: 4px
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Padding & Margin
- **Compact**: 0.5rem (8px)
- **Standard**: 1rem (16px)
- **Comfortable**: 1.5rem (24px)
- **Spacious**: 2rem (32px)

---

## Visual Effects

### Shadows
- **Subtle**: `0 1px 3px rgba(45, 27, 105, 0.08)`
- **Soft**: `0 2px 8px rgba(45, 27, 105, 0.12)`
- **Medium**: `0 4px 16px rgba(45, 27, 105, 0.15)`
- **Bold**: `0 8px 24px rgba(45, 27, 105, 0.2)`

### Border Radius
- **sm**: 0.25rem (4px)
- **md**: 0.5rem (8px)
- **lg**: 1rem (16px)
- **xl**: 1.5rem (24px)
- **full**: 9999px

### Transitions
- **Fast**: 150ms ease-in-out
- **Standard**: 250ms ease-in-out
- **Slow**: 350ms ease-in-out

---

## Component Guidelines

### Buttons
- **Primary**: Electric Blue background, white text, bold shadow
- **Secondary**: Golden Yellow background, indigo text
- **Tertiary**: Neon Orange background, white text
- **Outline**: Transparent background, indigo border, indigo text
- **Hover**: Darken by 10%, increase shadow

### Cards
- **Background**: White
- **Border**: 1px solid `rgba(45, 27, 105, 0.15)`
- **Shadow**: Soft shadow
- **Padding**: 1.5rem (24px)
- **Border Radius**: 1rem (16px)

### Inputs
- **Background**: White
- **Border**: 1px solid `rgba(45, 27, 105, 0.15)`
- **Focus**: 2px solid Electric Blue
- **Padding**: 0.75rem (12px)
- **Border Radius**: 0.5rem (8px)

### Progress Indicators
- **Track**: `rgba(45, 27, 105, 0.1)`
- **Fill**: Electric Blue
- **Accent**: Golden Yellow or Neon Orange

---

## Accessibility

### Color Contrast
- Primary text on background: 7.5:1 (AAA)
- Accent colors on white: 4.5:1+ (AA)
- All interactive elements: 4.5:1+ (AA)

### Focus States
- All interactive elements: 2px Electric Blue outline
- Outline offset: 2px

### Motion
- Respect `prefers-reduced-motion` media query
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid flashing or strobing (> 3 Hz)

---

## Implementation Checklist

- [ ] Update `client/src/index.css` with CSS variables
- [ ] Add Google Fonts (Poppins, Inter, JetBrains Mono)
- [ ] Create `client/src/lib/design-tokens.ts` with color constants
- [ ] Update all component colors to use CSS variables
- [ ] Ensure all buttons follow new design system
- [ ] Update card styling across all lessons
- [ ] Implement progress stepper component
- [ ] Implement sidebar navigator component
- [ ] Add breadcrumb navigation
- [ ] Test accessibility (contrast, focus states, keyboard navigation)
- [ ] Verify all pages load correctly
- [ ] Create checkpoint
