# Capability Matrix — Canonical Ontology vs Source Ecosystem

**Date:** 2026-08-24 · **Inputs:** `repository-analysis.md` (21 sources, license-verified)
**Rule:** every capability below has exactly ONE canonical Raidan owner. Sources inform design; none become parallel engines.

## Legend

● = strong native implementation in source · ○ = partial/adjacent · – = absent

Source abbreviations:
`OAC` OpenAgentsControl · `5D` 5dive · `ATA` agent-teams-ai · `DECK` agent-deck ·
`AOFE` agent-of-empires · `SWRM` opencode-swarm · `NIM` nimbalyst · `DEER` deer-flow ·
`RUFLO` ruflo · `OMO` oh-my-openagent · `KAN` kandev · `COMET` comet/Zeron ·
`MAES` ai-maestro · `CLID` clideck · `AGX` agx · `AORC` agent-orchestrator ·
`AMGR` agent-manager · `SQ` squid · `PONY` ponytail

---

## 1. Core Execution Capabilities

| Capability | Strongest sources | Raidan owner (`src/core/*`) | Decision |
|---|---|---|---|
| Agent Orchestration (ONE kernel) | SWRM● DEER● RUFLO● AORC● | `orchestration` | REIMPLEMENT (gated pipeline pattern) |
| Complexity classification / Meta Routing | OAC○ AORC○ KAN○ | `orchestration` | CREATE native |
| Task Engine (DAG, priorities) | 5D● ATA● KAN● AGX● | `tasks` | REIMPLEMENT (SQLite WAL queue) |
| Task Leases / resumable runs | DEER● AGX● COMET● | `tasks` | REIMPLEMENT |
| Checkpoints (constant-cost resume) | AGX● COMET● 5D○ | `tasks` | ADAPT concept |
| Kanban view over task state | ATA● KAN● AORC● NIM● | `tasks` (view only) | VALIDATED (derived, never hand-edited) |
| Workflow Engine + compiler | SWRM● KAN● DEER○ | `workflows` (planned) | REIMPLEMENT |
| Team / Swarm engine | ATA● RUFLO● OMO● MAES○ | `teams` | REIMPLEMENT (min-sufficient-team policy) |
| Conductor / fleet supervision role | DECK● ATA○ AORC○ | `orchestration` (role) | ADAPT (role, NOT second brain) |
| Agent Registry / profiles | OAC● OMO● KAN○ | `agents` | EXTEND existing module |
| Role ≠ Implementation separation | KAN● OMO○ AORC○ | `agents` | CREATE native |
| Structured agent contracts/results | OAC● SWRM● | `agents` | ADAPT |
| Session Manager (fleet, fork, resume) | DECK● COMET● CLID● AOFE● | planned `sessions` | ADAPT best primitives |
| Session status detection w/o interception | CLID● DECK● AOFE● | `sessions` | ADAPT (signal-watching pattern) |
| Durable command ledger / crash journal | COMET● DEER○ | `sessions` | ADAPT concept |
| Runtime abstraction (multi-CLI agents) | KAN● AOFE● CLID● SQ● | planned `runtime` | REIMPLEMENT (RAAP) |
| Executor backends (local/Docker/SSH/cloud) | KAN● DEER● MAES○ | `runtime` | INSPIRE |
| Process supervision / persistent agents | 5D● COMET● DEER○ | `runtime` | REIMPLEMENT (platform-abstract) |
| Worktree manager | DECK● SWRM● AOFE● KAN● AGX● | planned `worktrees` | ADAPT (sparse-checkout, hooks) |
| Terminal abstraction (no tmux lock-in) | CLID● KAN● COMET● | `runtime` | CREATE native (ConPTY/PTY) |
| Sandbox / isolation tiers | 5D● DEER● AOFE○ DECK○ | `policies` | INSPIRE |

## 2. Intelligence Layer

| Capability | Strongest sources | Raidan owner | Decision |
|---|---|---|---|
| Capability-first routing | OMO● (category routing) KAN○ | `gateway` + `routing` | REIMPLEMENT |
| Model Router (per-role models) | RUFLO● OMO● DEER● SWRM○ | `gateway` | REIMPLEMENT |
| Provider health / failover | RUFLO○ DEER○ SWRM○ | `gateway` | CREATE native |
| Cost/token accounting | ATA● DECK○ SQ○ | `observability` | ADAPT |
| Context Engine (MVI, budgets) | OAC● SWRM● (budget guard) OMO○ | `context` | EXTEND existing module |
| Context compaction / recovery | OAC○ DEER● | `context` | ADAPT |
| Memory Engine (levels, provenance) | 5D● MAES● DEER● RUFLO○ | `memory` | EXTEND existing module |
| Code-graph / knowledge memory | MAES● (CozoDB) | `memory` (optional adapter) | REFERENCE |
| Hook / lifecycle system | OMO● (54+ hooks) SWRM○ | planned `hooks` | INSPIRE taxonomy, native impl |
| Prompt fragments / compiler | OAC○ OMO○ PONY● | planned `prompts` | CREATE native |
| Skill registry + lazy activation | OAC● DECK● OMO● | `skills` | EXTEND existing module |
| Behavioral skill packs | PONY● | `skills` (shipped pack) | WRAP/OPTIONAL |
| Research workflow (plan→parallel→synthesis) | DEER● | `workflows` (research template) | INSPIRE |
| Evidence/citation discipline | DEER○ OAC○ | `research` (planned) | CREATE native |

## 3. Protocols & Integration

| Capability | Strongest sources | Raidan owner | Decision |
|---|---|---|---|
| MCP Registry (governance) | DECK● (pool) KAN● (bidirectional) OMO○ (ephemeral) | `mcp` | EXTEND existing module |
| MCP process pooling | DECK● (socket pool −85–90% mem) | `mcp` | ADAPT |
| A2A agent↔agent messaging | MAES● (AMP signed) ATA○ OMO○ | planned `a2a` | INSPIRE message model |
| Agent identity (cryptographic) | MAES● RUFLO○ | `agents` | REFERENCE (later phase) |
| Connectors (Notion first) | — (internal) | `integrations/notion` ✅ shipped | DONE |
| Search provider abstraction | OMO○ DEER○ | planned `search` | CREATE native |
| Git intelligence / gated push | 5D● (GitHub App gate) AGX○ | planned `git` | REIMPLEMENT (agents never hold tokens) |
| GitHub adapter | existing MCP config ✅ | `integrations` | DONE (native MCP) |

## 4. Safety & Control

| Capability | Strongest sources | Raidan owner | Decision |
|---|---|---|---|
| Policy Engine (domains, trust levels) | SWRM● (file authority, scope TTL) 5D○ | `policies` | EXTEND existing module |
| Approval gates / human-in-the-loop | OAC● 5D● AGX● SWRM● | `policies` | REIMPLEMENT |
| Gated review pipeline (critic/test/security) | SWRM● KAN○ | planned `review` | REIMPLEMENT (baseline) |
| Reviewer diversity (independent context) | SWRM○ (council) | `review` | ADAPT |
| Circuit breakers / loop detection | SWRM● (PRM L1→L3) | `policies` | ADAPT |
| Shell write-detection (PS/cmd/POSIX AST) | SWRM● | `policies` | ADAPT (Windows-first!) |
| Audit log | 5D○ (journald) SWRM○ | `observability` | CREATE native |
| Autonomy levels L0–L5 | 5D○ SWRM○ (session modes) | `policies` | CREATE native |
| Secret isolation (env-ref only) | 5D● (GitHub App pattern) | global rule ✅ | ENFORCED |

## 5. Platform & Delivery

| Capability | Strongest sources | Raidan owner | Decision |
|---|---|---|---|
| Event Kernel | DEER○ SWRM○ | `events` | EXTEND existing module |
| Observability (runs, traces) | DEER● (LangSmith/Langfuse refs) | `observability` | CREATE native, OTel optional |
| Notifications (terminal/desktop/IM) | DECK● DEER● MAES● | planned `notifications` | ADAPT |
| Evaluation engine / benchmarks | OAC● (evals/) OMO○ | planned `evaluation` | CREATE native |
| Native Windows support | KAN● CLID● ATA● NIM● | **differentiator** | FIRST-CLASS (ADR-014) |
| WSL interop | DECK● AOFE● MAES● | installer | SUPPORTED |
| CLI (`raidan`) | existing scaffold ✅ | `src/cli` | EXTEND |
| TUI | DECK● CLID● AOFE● | deferred-view | STAGED |
| Web Control Center / HTTP API | AOFE● SQ● AORC● | `apps/control-center` | STAGED (AOFE surface pattern) |
| Installer (Win PS / Linux sh / npx) | existing install.* ✅ | root scripts | EXTEND |
| Migration engine (backup/rollback) | existing `migrate` ✅ | `src/core/migrate` | EXTEND |
| Doctor / health checks | existing doctor ✅ | `src/cli` | EXTEND |
| Config profiles & precedence | OMO● (config walk) DECK○ | `config` | EXTEND existing module |
| Device sync (CRDT) | COMET● (Loro) | future | REFERENCE ONLY |
| Federation / multi-machine trust | RUFLO● MAES○ | future flag | REFERENCE ONLY |

---

## 6. Coverage Insight

- **No single source covers >60% of the ontology** — confirming the fusion architecture is necessary rather than optional.
- **Windows-native coverage is ~24%** of sources — our first-class Windows stance (ADR-014) is a genuine differentiator.
- **Existing `src/core` modules already own 11 capabilities** — Phase 3+ means deepening them with researched patterns, not creating new engines.
