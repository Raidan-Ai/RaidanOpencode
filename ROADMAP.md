# RaidanOpencode Roadmap

This roadmap follows the phased execution protocol defined in
[ARCHITECTURE.md](./ARCHITECTURE.md) (§80 Roadmap, §93 Final Execution Protocol).

Status legend:

| Marker | Meaning |
|--------|---------|
| ✅ | Done / merged |
| 🚧 | In progress |
| 📋 | Planned |
| 🔮 | Future / exploratory |

---

## Phase 1 — Kernel ✅

Raidan Agent Kernel primitives: domain model, event bus, config manager,
context engine, memory engine, policy engine.

- [x] Domain entities and stable identifiers (`src/core`)
- [x] Event Kernel (`src/core/events/bus.ts`)
- [x] Configuration management (`src/core/config/manager.ts`)
- [x] Context Engine (`src/core/context/engine.ts`)
- [x] Memory Engine (`src/core/memory/engine.ts`)
- [x] Policy Engine (`src/core/policies/engine.ts`)

## Phase 2 — OpenCode Adapter ✅

Normalize existing OpenCode configuration, agents, skills, commands, MCP,
models and routing into Raidan contracts without leaking OpenCode
assumptions into the kernel.

- [x] Skill registry (`src/core/skills/registry.ts`)
- [x] Agent registry (`src/core/agents/registry.ts`)
- [x] MCP registry (`src/core/mcp/registry.ts`)
- [x] `RuntimeAdapter` interface + RAAP v1.0 contract (`src/core/runtime/adapter.ts`)
- [x] OpenCode adapter package (`src/adapters/opencode/`) — full process lifecycle; RAAP transport explicitly stubbed pending verified stdio/SDK surface
- [x] Migration engine hardening — atomic state, corrupt-state quarantine, case-insensitive ownership, backup/restore (`src/core/migrate/engine.ts`)

## Phase 3 — Agents / Skills ✅ (core complete)

- [x] Capability Registry + capability graph with routing queries (`src/core/capabilities/registry.ts`)
- [x] Meta Router — capability requirements → deterministic team plans (`src/core/routing/meta-router.ts`)
- [x] Prompt Fragment Registry + Prompt Compiler (`src/core/prompt/compiler.ts`)
- [x] Deduplication Engine — REUSE/EXTEND/MERGE/SPECIALIZE/CREATE verdicts (`src/core/dedup/engine.ts`)
- [ ] Skill quality scoring and usage statistics (uses dedup similarity primitives)

## Phase 4 — Tasks / Swarms 🚧

- [x] Task Engine (`src/core/tasks/engine.ts`)
- [x] Teams/Swarm engine (`src/core/teams/engine.ts`)
- [ ] Task leases (claim, heartbeat, expiry, recovery)
- [ ] Workflow Engine with built-in workflow library
- [ ] Workflow Compiler (objective → DAG)
- [ ] Minimum-sufficient-team sizing policies (seeded by MetaRouter team sizing)

## Phase 5 — Runtime / Sessions 📋

- [x] Process supervisor (`src/core/runtime/supervisor.ts`)
- [ ] Session Manager (fleet, search, fork, resume, watchdog)
- [ ] Terminal abstraction (PTY / PowerShell / WSL backends)
- [ ] Workspace & Worktree Manager
- [ ] Conductor role implementation
- [ ] OpenCode RAAP transport over verified stdio/SDK surface

## Phase 6 — Memory / Messaging 📋

- [x] Logical memory hierarchy L0–L7 (engine skeleton)
- [ ] Pluggable providers (filesystem, SQLite, vector store)
- [ ] Memory provenance metadata enforcement
- [ ] Internal messaging contracts

## Phase 7 — Security / Policy 📋

- [x] Policy engine baseline
- [ ] Trust levels (SAFE / CONTROLLED / SENSITIVE / DANGEROUS) enforcement
- [ ] Approval gates for destructive operations
- [ ] Autonomy levels L0–L5 per task
- [ ] Audit trail for privileged actions

## Phase 8 — Evaluation / Learning 📋

- [ ] Evaluation Engine (success rate, quality, latency, cost)
- [ ] Benchmark suite
- [ ] Failure-based routing scores (feeds MetaRouter weights × telemetry)
- [ ] Observability query layer expansion (`src/core/observability/query.ts`)

## Phase 9 — Cross-Agent Adapters 🔮

- [ ] Codex adapter
- [ ] Claude Code adapter
- [ ] Gemini CLI adapter
- [ ] Generic CLI agent adapter

## Phase 10 — Distributed Execution 🔮

- [ ] Multi-node execution
- [ ] Remote runtimes
- [ ] Distributed task leases

## Phase 11 — Advanced UI 🔮

- [ ] TUI
- [ ] Web Control Center (read-only first)

## Phase 12 — Ecosystem / SDK 🔮

- [ ] Adapter SDK for third-party runtimes
- [ ] Plugin system
- [ ] Connector Registry (GitHub, Notion, Slack, …)
- [ ] Export / Import (`raidan export` / `raidan import`)

---

## Continuous Tracks

These are never "done" — they gate every phase:

- **Security**: secret scan, dependency scan, threat-model review before release
- **License compliance**: `sources.lock.json`, `THIRD_PARTY_NOTICES.md`, attribution
- **Documentation**: English + Arabic parity (`README.ar.md`, `docs/ar/`)
- **Cross-platform**: Windows, Linux, WSL CI validation
- **Architecture audit**: single control plane, single task engine, no duplicates
