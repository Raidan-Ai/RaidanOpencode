# ADR-007 — Memory Engine (Local-First, Ranked Retrieval)

Status: Accepted · Date: 2026-08-23

## Context
Memory approaches ranged from dump-all-history (rejected) to vector-store-first (premature infra) to scoped fact stores with write gates (deer-flow DeerMem).

## Decision
Layered memory types (working/short-term/episodic/semantic/procedural/project/team/org/long-term) stored first in filesystem + SQLite. Retrieval ALWAYS ranked by relevance·recency·importance·task-relation·similarity — never bulk-injected. Write-gates carry scope/durability/authority (deer-flow pattern). Vector backend (LanceDB default) becomes an optional index, not the source of truth.

## Consequences
+ Works fully offline day one; upgrade path to embeddings without migration cliff
− Ranking heuristics need tuning; evaluation harness includes memory-recall tests
