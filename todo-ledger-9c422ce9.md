# LSAT Nexus Ledger Workspace Overhaul — Execution Checklist

Rollback baseline: WebDev checkpoint `9c422ce9`
Approved plan: `/home/ubuntu/plan.md`

## 1. Protected baseline and contracts
- [x] Record rollback checkpoint and capture desktop/mobile baseline screens
- [x] Add failing ledger workspace regression contract
- [x] Confirm current learner-domain and daily-release baseline tests

## 2. Ledger foundation and shell
- [x] Load Archivo/Spectral and define scoped ledger tokens
- [x] Add reusable ledger primitives
- [x] Replace authenticated learner rail with desktop ledger header and mobile bottom navigation
- [x] Consolidate route orientation into a compact page-heading primitive
- [x] Verify route, accessibility, token, and shell contracts

## 3. Authoritative Today aggregate
- [x] Extend Today signals with full review and plan-task records
- [x] Add learner profile workspace context
- [x] Add bounded recent-practice and skill-evidence summaries
- [x] Add repository/router tests for empty, sparse, and established evidence

## 4. Today and Learn ledgers
- [x] Recompose Today around one server-selected primary action
- [x] Add plan, recent-work, and evidence ledger modules
- [x] Convert Learn to a seven-lesson sequenced ledger with current lesson detail
- [x] Preserve feature-flag rollback paths

## 5. Practice set builder
- [ ] Extract the current browser, stats, and single-question views
- [ ] Add server-backed deterministic set matching and counts
- [ ] Add explainable recommendations and evidence panel
- [ ] Preserve direct links, tags, discovery, and confidence evidence

## 6. Persistent drill player
- [ ] Add additive practice-session schema and migration
- [ ] Apply and verify the migration through WebDev SQL
- [ ] Add protected session procedures and ownership checks
- [ ] Implement shared timed/untimed player and results
- [ ] Add timer, idempotency, resume, and result tests

## 7. Polish and verification
- [ ] Remove obsolete duplication without breaking rollback flags
- [ ] Verify 320px minimum, large text, high contrast, reduced motion, and fixed-nav clearance
- [ ] Run focused tests, TypeScript, full Vitest, production build, and WebDev health checks
- [ ] Capture desktop/tablet/mobile Today, Learn, Practice, player, feedback, and results
- [ ] Save final reviewable WebDev checkpoint
