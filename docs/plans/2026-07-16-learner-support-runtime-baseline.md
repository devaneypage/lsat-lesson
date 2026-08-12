# Runtime Baseline

Captured at **2026-07-16T05:32:58Z** from the latest 500 entries in each managed development log. Benign JSON fields such as `"error": null` are excluded from the failure criteria.

| Signal | Count | Detection rule |
|---|---:|---|
| Server failures | 0 | Uncaught, unhandled, fatal, or explicit error messages |
| Browser console failures | 3 | Error-level console records, uncaught errors, or unhandled errors |
| HTTP failures | 4 | Response status from 400 through 599 |

This file records the pre-roadmap runtime baseline used for later regression comparison.
