# ADR-019 - Control Center (Deferred View Layer)
Status: Accepted · Date: 2026-08-23
Scaffold-only in v1: single web dashboard reading canonical core state (SQLite+ledger); NO business logic in UI; NO Electron monolith; NO multiple dashboards (§92-93). Views follow fact-derived status derivation (AO pattern). Ships behind profile flag until core stabilizes.
Consequences: + CLI remains single source of truth early; - GUI users wait; acceptable tradeoff per local-first doctrine.
