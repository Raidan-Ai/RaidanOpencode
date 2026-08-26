# Architecture Documentation Index

Canonical architecture document: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) (Blueprint v1.0, 94 sections).

Architecture decisions live in [`../adr/`](../adr/) — one ADR per decision, numbered sequentially.

## Blueprint section map

| Topic | Blueprint § | Related ADRs |
|-------|-------------|--------------|
| Executive summary & goals | 1–3 | — |
| System context (C4 L1) | 4 | — |
| Container architecture | 5 | — |
| Control Plane | 6 | ADR-019 |
| Raidan Agent Kernel (RAK) | 7 | — |
| Domain model | 8 | — |
| Capability system | 9 | — |
| Meta Router | 10–11 | — |
| Deduplication engine | 12 | ADR-015 |
| Agent model | 13 | ADR-003 |
| Skill system & registry | 14–15 | ADR-015 |
| Prompt architecture | 16 | — |
| Orchestration kernel | 17 | ADR-002 |
| Task engine & leases | 18–19 | ADR-005 |
| Workflow engine & compiler | 20–21 | — |
| Swarm engine | 22 | ADR-004 |
| Parallelization | 23 | — |
| Session manager | 24 | — |
| Conductor | 25 | — |
| Runtime abstraction & RAAP | 26–29 | ADR-001, ADR-013 |
| Workspace / worktrees | 30 | — |
| Terminal abstraction | 31 | — |
| Process supervisor | 32 | — |
| Cross-platform layer | 33 | ADR-014 |
| AI Gateway & model routing | 34–37 | ADR-008, ADR-009 |
| Cost engine & resources | 38–39 | — |
| Context engine | 40–41 | ADR-006 |
| Memory engine | 42–43 | ADR-007 |
| MCP registry | 44 | ADR-010 |
| A2A layer | 45 | ADR-011 |
| Connector registry | 46 | ADR-016 |
| Search layer | 47 | — |
| RAG & vector layers | 48–49 | — |
| Security architecture | 50–53 | ADR-012 |
| Event kernel | 54 | — |
| Observability | 55 | — |
| Evaluation engine | 56 | — |
| Testing strategy | 59–65 | — |
| Package boundaries | 74 | — |
| Documentation plan | 75–79 | — |
| Roadmap phases | 80 | — |
| Definition of Done | 91 | — |

## Implementation status

Live status is tracked in [`../../ROADMAP.md`](../../ROADMAP.md). Key contracts already implemented:

- `src/core/runtime/adapter.ts` — `RuntimeAdapter` interface + RAAP v1.0 envelope (§26, §29)
- `src/adapters/opencode/` — first concrete runtime adapter (§28)
- `src/core/migrate/engine.ts` — hardened migration with backup/restore (§BACKUP, ADR-018)

## Rules

1. Every major architecture change requires an ADR **before** implementation merges.
2. The Architecture Auditor questions (§92) gate every release.
3. One control plane, one task model, one capability registry, one memory/session/runtime abstraction — always.
