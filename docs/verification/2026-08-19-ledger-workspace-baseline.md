# Ledger Workspace Overhaul — Visual Baseline

**Rollback checkpoint:** `9c422ce9`

The authenticated learner workspace currently uses a fixed dark left navigation rail on desktop and a dark hamburger header on mobile. Today is split across a route-orientation banner, a second “Your next move” header, a primary lesson card, a recent-work card, and an evidence sidebar. Learn is a card atlas of the seven canonical lessons. Practice is a very long client-side question-card grid, while a direct question link opens the current single-question answer flow.

At 390px, Today and Learn stack correctly but retain duplicate page/orientation hierarchy. Practice becomes excessively long because the entire question catalog is rendered before a learner begins a set. The direct question flow is functional but is visually disconnected from the mockup’s shared drill-player system.

The overhaul must preserve the current authenticated data visible in these baseline captures: the seven-lesson curriculum, private learner progress, server-selected primary action, question provenance, confidence capture, and the absence of fabricated score or mastery claims. Public and administrator shells are outside the visual replacement scope.
