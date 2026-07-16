# LSAT Nexus Design System

## Direction

LSAT Nexus uses **Academic Light — Warm Parchment**: an editorial study environment designed for sustained reading, precise reasoning, and low-distraction knowledge work. The system is authoritative without feeling institutional, and warm without becoming decorative.

The visual hierarchy is intentionally restrained. Color communicates navigation, action, feedback, and evidence state; it is not used as unstructured decoration. Dense administrative tools may use tighter spacing, but learner reading surfaces retain generous line height and controlled measure.

## Typography

| Role | Family | Use |
|---|---|---|
| Interface and display | Space Grotesk | Navigation, headings, controls, labels, metadata, tables |
| Sustained reading | Lora | Lesson prose, reading passages, quotations, stimulus text |
| Structured notation | JetBrains Mono | Logic notation, code-like rules, stable identifiers, compact numerical sequences |

All former Archivo and Archivo Black references were retired. `font-sans` and `font-display` resolve to Space Grotesk; `font-serif` resolves to Lora. Headings use balanced wrapping and tighter tracking, while prose uses 1.6 line height and pretty wrapping.

## Core color tokens

| Token | Value | Role |
|---|---:|---|
| `background` | `#F7F4EF` | Warm parchment application ground |
| `foreground` | `#1E2130` | Deep indigo primary text |
| `card` | `#FFFDF8` | Elevated reading and task surfaces |
| `primary` | `#0052CC` | Primary calls to action and keyboard focus |
| `secondary` | `#C8860A` | Academic emphasis, orientation, and selected metadata |
| `accent` | `#C94D12` | Tertiary emphasis and high-energy actions |
| `success` | `#2E7D52` | Verified correct or successfully completed state |
| `destructive` | `#B84030` | Incorrect, destructive, or blocking state |
| `warning` | `#E7B62A` | Caution, incomplete migration, or review-needed state |
| `info` | `#5B4A8A` | Evidence boundaries, explanations, and neutral guidance |

Compatibility aliases such as `--nexus-amber`, `--nexus-teal`, and `--nexus-purple` remain available while legacy screens migrate, but new work should prefer semantic Tailwind classes (`bg-primary`, `text-success`, `border-warning/45`) rather than direct hex values.

## Contrast gate

`scripts/check-design-contrast.mjs` calculates WCAG relative luminance for all semantic foreground/background pairs. Current ratios are:

| Pair | Ratio |
|---|---:|
| Foreground / background | 14.55:1 |
| Muted foreground / background | 5.70:1 |
| Primary foreground / primary | 6.82:1 |
| Secondary foreground / secondary | 5.22:1 |
| Accent foreground / accent | 4.61:1 |
| Destructive foreground / destructive | 5.51:1 |
| Success foreground / success | 5.03:1 |
| Warning foreground / warning | 7.36:1 |
| Info foreground / info | 7.52:1 |

All text-bearing semantic pairs meet or exceed WCAG AA for normal text. Primary text on the application background exceeds AAA.

## Shared page primitives

New learner and administrator surfaces should compose these primitives from `client/src/components/PagePrimitives.tsx`:

| Primitive | Responsibility |
|---|---|
| `PageFrame` | Canonical responsive page gutters and reading, wide, or full widths |
| `PageHeader` | Eyebrow, page title, explanation, and page-level actions |
| `SectionCard` | Section hierarchy, optional description/actions, and consistent surface treatment |
| `MetadataRow` | Label/value context such as estimated time, prerequisites, and evidence state |
| `StatePanel` | Honest loading, empty, information, success, warning, and error states |

Canonical Review, Progress, and administrator migration states already use these primitives. Existing pages migrate incrementally; avoid introducing additional page-local equivalents.

## Accessibility behavior

Accessibility preferences use root data attributes and work independently of page implementation:

| Preference | Applied behavior |
|---|---|
| Text scale | 112.5% or 125% root scaling |
| Reading width | Comfortable 72ch, wide 92ch, or unconstrained |
| Contrast | Stronger text, boundary, input, and focus tokens |
| Motion | System preference or near-instant reduced transitions/animations |
| Passage focus | Primary border and low-intensity focus halo on `.reading-passage` |
| Keyboard shortcuts | Enables or disables global command-palette shortcuts |

Global skip links, visible focus indicators, semantic landmarks, labeled controls, and `prefers-reduced-motion` support are required. Preference controls persist locally for guests and to the authenticated learner profile when enabled.

## Motion and interaction

Interaction feedback is restrained and interruptible. Buttons use a 150ms transition and a 0.97 active scale. Popovers and dialogs may use existing Radix motion primitives, but keyboard-initiated navigation should remain immediate. Only opacity and transforms should carry non-essential motion. Reduced-motion preferences override every animation and transition.

## Content-type colors

When the future notebook or saved-resource system distinguishes content types, use the project-wide mapping consistently: quotes yellow, books green, articles orange, glossary terms pink, and lists violet. These colors identify content type only and must not replace semantic success, warning, or error tokens.

## Guardrails

Do not present sample mastery, score, percentile, or progress values as learner data. Do not use color alone to distinguish answer or workflow state. Do not introduce a second navigation map, private page-level authentication convention, or new hard-coded font stack. Any new semantic foreground/background pair must be added to the contrast utility and pass its stated threshold before release.
