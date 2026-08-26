# Changelog

All notable changes to RaidanOpencode are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Phase 3 — Agents / Skills (core complete)

#### Added
- **Capability Registry** (`src/core/capabilities/registry.ts`) — first-class
  capability definitions, graph bindings across 7 subject types, bidirectional
  lookups, `findCandidates` routing primitive with level/tool/subject-type
  filters and score×confidence ranking.
- **Meta Router** (`src/core/routing/meta-router.ts`) — turns capability
  requirements into deterministic `RoutingPlan`s: primary + fallback
  assignments, explicit unresolved tracking, minimum-sufficient-team sizing,
  workspace strategy heuristic, normalized multi-objective weights (§11).
- **Prompt Compiler** (`src/core/prompt/compiler.ts`) — fragment registry
  (9 categories) + deterministic assembly of 8 canonical prompt sections;
  validation warnings for security gaps, duplicates, unknown fragments, and
  char-budget overrun.
- **Deduplication Engine** (`src/core/dedup/engine.ts`) — deterministic
  composite similarity (keywords/capabilities/purpose, Latin+Arabic tokenizer)
  with REUSE / EXTEND / MERGE / SPECIALIZE / CREATE verdicts, configurable
  thresholds, rationale on every decision.

### Phase 2 — OpenCode Adapter (complete)

#### Added
- **RuntimeAdapter contract** (`src/core/runtime/adapter.ts`) — kernel-level
  interface (16 lifecycle methods) + RAAP v1.0 wire envelope with monotonic
  per-session seq, correlation/trace ids, factory + structural guard.
- **OpenCode adapter** (`src/adapters/opencode/index.ts`) — full process
  lifecycle over `RuntimeSupervisor`; configurable availability probe; typed
  `RaapTransportNotImplementedError` for unimplemented RAAP transport (no
  invented OpenCode APIs); persistent-state factory.

#### Changed
- **Migration engine hardening** (`src/core/migrate/engine.ts`) — atomic state
  persistence (tmp+rename), corrupt-state quarantine + recovery,
  case-insensitive ownership matching across plan/apply/rollback, explicit
  `backup()`/`restore()` snapshots.

### Restructuring

#### Added
- `ARCHITECTURE.md` — full Architecture Blueprint v1.0: C4 context/containers,
  Raidan Agent Kernel, capability system, Meta Router, runtime abstraction,
  RAAP protocol, security model, event kernel, testing strategy, package
  boundaries, and Definition of Done checklist.
- `ROADMAP.md` — phased delivery plan (Phase 1 Kernel → Phase 12 Ecosystem/SDK)
  mapped against the current codebase state.
- `NOTICE` — project attribution notice.
- `.env.example` — template for required environment variables.
- `docs/architecture|legal|guides|prompts|generated/` — blueprint §75 taxonomy
  completed with index/policy files.
- `sources.lock.json` — machine-readable pin of all 27 researched sources;
  commit SHAs intentionally null until license-audit pinning (no fabricated
  pins); zero-reuse flags for AGPL-3.0/SUL-1.0/UNKNOWN licenses.

#### Changed
- `LICENSE` — corrected copyright holder attribution.

#### Removed
- Stray `test.txt` from repository root.

## [0.6.0] — 2026-08

### Added

#### Runtime & Orchestration
- Process supervisor for agent runtimes (`src/core/runtime/supervisor.ts`)
- Orchestrator engine (`src/core/orchestration/orchestrator.ts`)
- Task Engine (`src/core/tasks/engine.ts`)
- Teams/Swarm engine (`src/core/teams/engine.ts`)

#### Intelligence Layer
- AI Gateway router — model/provider routing (`src/core/gateway/router.ts`)
- Context Engine — progressive context assembly (`src/core/context/engine.ts`)
- Memory Engine — L0–L7 logical hierarchy (`src/core/memory/engine.ts`)
- Policy Engine (`src/core/policies/engine.ts`)

#### Registries
- Agent registry (`src/core/agents/registry.ts`)
- Skill registry (`src/core/skills/registry.ts`)
- MCP registry (`src/core/mcp/registry.ts`)

#### Platform Services
- Event bus / Event Kernel (`src/core/events/bus.ts`)
- Observability tracing + query layer (`src/core/observability/`)
- Notifications engine (`src/core/notifications/engine.ts`)
- Migration engine for safe OpenCode config migration (`src/core/migrate/engine.ts`)
- Configuration manager (`src/core/config/manager.ts`)

#### Surfaces
- CLI entrypoint (`src/cli/index.ts`)
- Worker host (`src/worker/index.ts`)

#### Docs & Research
- Research corpus under `docs/research/`: capability matrix, deduplication
  analysis, license analysis, integration map, provider/deployment/connector
  landscapes, platform analysis (OpenCode + A2A), current inventories
  (skills, MCP, OpenCode), architecture comparison, batched repo reviews.
- Source acknowledgements (`docs/sources/THANK_YOU.md`,
  `docs/sources/source-manifest.yaml`)
- Superpowers integration notes (`docs/integrations/superpowers.md`)
- Arabic README (`README.ar.md`)
- `raidan-os` skill (`skills/raidan-os/SKILL.md`)

#### Distribution
- Installers for Windows (`install.cmd`, `install.ps1`) and POSIX (`install.sh`)
- Remote helper script (`scripts/raidan-remote.ps1`)
- GitHub Actions CI (`.github/workflows/ci.yml`)

### Fixed
- CI typecheck failures in event bus and gateway router.

[Unreleased]: https://github.com/Raidan-Ai/RaidanOpencode/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/Raidan-Ai/RaidanOpencode/releases/tag/v0.6.0
