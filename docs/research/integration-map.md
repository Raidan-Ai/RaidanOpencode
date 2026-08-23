# Integration Map

Date: 2026-08-23
Maps each source → integration type → extracted components → landing zone in RaidanOpencode structure (per spec §94).

| Source | Type | Extracted | Lands in |
|---|---|---|---|
| OpenAgentsControl | ADAPT | MVI context budgets (<100/<150/<80); ContextScout local-first resolution; ExternalScout live-docs pattern; approval-gate prompt language | `core/context/`, `agents/subagents/contextscout*`, `core/policies/approval.ts` |
| opencode-swarm | ADOPT (candidate backbone) | Gated pipeline phases; PRM failure-pattern detection; circuit breakers; shell-write detection (POSIX AST + PS/cmd heuristics); scope enforcement; skill quarantine gates; `.swarm/` ledger shape | `core/orchestration/gates.ts`, `core/policies/guardrails/`, `core/observability/ledger` |
| ponytail | ADOPT (runtime plugin) | Whole plugin as dependency; 7-rung YAGNI ladder as default policy layer | root `opencode.json` `"plugin"` entry + policy docs |
| agent-deck | ADAPT | Conductor supervision pattern; worktree lifecycle (setup/destruction hooks, .worktreeinclude); MCP governance model; config precedence chain; watcher doorbells | `core/runtime/supervisor.ts`, `integrations/git/worktrees.ts`, `integrations/mcp/registry.ts` |
| 5dive | REIMPLEMENT | Isolation tiers spec; delegated-push credential design; Council review w/ human veto; goal→guarded-task-graph; heartbeat wake; uniform `{ok,data\|error}` CLI contract | `core/runtime/isolation.ts`, `integrations/git/delegated-push.ts` (post-v1), `core/orchestration/council.ts`, `apps/cli/output.ts` |
| agent-orchestrator (AO) | ADAPT | orchestrator-plans/workers-execute contract; fact-derived status derivation; per-worker context bundle; bug-triage loop concept | `core/orchestration/worker-contract.ts`, `core/tasks/status-derivation.ts` |
| agent-of-empires (AoE) | ADAPT | Structured agent-state rendering concept; plugin API surface design; sandbox-with-shared-auth recipe; remote QR+passphrase auth idea | Control Center view contracts (v2); `core/runtime/sandbox.ts` |
| deer-flow | ADAPT | Goal-evaluator loop w/ typed blockers; scheduled-task runner; memory scope/durability/authority write-gates; SkillScan two-phase scanner; sandbox-provider SPI; sub-agent caps | `core/orchestration/goal-evaluator.ts`, `core/workflows/scheduler.ts`, `core/memory/write-gates.ts`, `skills/skill-scan/` |
| agx | INSPIRE | Human-gate decision-layer naming; durable checkpoint resume; reviewer-agent first-pass PR flow | `core/policies/gates.ts`, `core/tasks/checkpoints.ts` |
| squid | INSPIRE | Lane grammar (#topic@agent) for task addressing; per-prompt token-cost attribution; goldfish limited-context turns | `core/events/addressing.ts`, `core/observability/cost.ts` |
| clideck | ADAPT | OpenCode bridge wiring reference; ask-another-session protocol (busy semantics); status detection taxonomy | `integrations/opencode/session-bridge.ts`, `core/observability/status.ts` |
| ai-maestro | INSPIRE | Gateway prompt-injection filter pattern list (re-implemented natively); multi-machine mesh deferred | `core/security/injection-filters.ts` |
| comet/Zeron | INSPIRE | Durable command queue w/ idempotent processed-ledger; steering mailbox; auth≠storage scope separation | `core/runtime/command-ledger.ts`, `core/config/scopes.ts` |
| kandev | WRAP-at-most / INSPIRE | Executor abstraction shape (local/docker/ssh/cloud); workflow YAML portability; multi-repo worktree-per-task scheme — concepts only, NO code (AGPL) | `core/runtime/executors/spi.ts`, `schemas/workflow.schema.json` |
| ruflo | REIMPLEMENT | Federation trust scoring model (deferred post-v1); PII-gate pipeline classes; plugin marketplace manifest shape; MetaHarness readiness grading | `docs/architecture/federation.md` (design), future `core/federation/` |
| agentic-flow | INSPIRE | LLM router cost/quality tradeoff function; hook-driven route→learn→metrics loop | `core/gateway/router-scoring.ts` |
| nimbalyst | ADAPT | Extension SDK contract idea; mobile approval flow requirements | Control Center (v2) extension points doc |
| OpenAgentsControl ExternalScout + ECC externalscout | ADAPT | Live external documentation discovery with caching | `agents/subagents/externalscout.md`, `core/context/external-cache/` |
| mattpocock/skills | ADOPT | Selected skills: grilling/grill-with-docs/tdd/diagnosing-bugs/code-review/writing-for-agents/handoff; user-vs-model-invoked taxonomy | `skills/engineering/*` (with attribution headers) |
| CodeAlive-AI/ai-driven-development | ADOPT | bash-guard AST+ask-not-deny design; mcp-management patterns; windows-health skill | `core/policies/hooks/bash-guard*`, `skills/os-health/` |
| ECC | ADAPT | Install-state ownership manifest; anti-stacking doctrine; doctor/repair/uninstall --dry-run UX; selected rule packs | `apps/cli/install-state.ts`, `apps/cli/doctor.ts`, `rules/` |
| awesome-opencode | ADAPT | Model capability fingerprints (26+ models → tier mapping); curated MCP candidate list; Docker sandbox matrix notes | `providers/catalog.yaml`, `integrations/mcp/catalog.yaml` |
| youdotcom-oss/agent-skills | WRAP | Optional search connector behind Search Provider abstraction | `connectors/search/youdotcom.ts` (adapter slot) |
| oh-my-openagent | INSPIRE (SUL — zero reuse) | Concepts: category→model routing UI, Todo Enforcer, Doctor command naming | noted in docs only |
| omni-skills | INSPIRE (no license) | Pinned-commit lockfile + ownership-aware reinstall mechanics | `apps/cli/install-state.ts` mechanics |

## Explicitly NOT integrated (rejected)
- Any second MCP client, second orchestrator, second task engine
- tmux/systemd as hard dependencies (Windows-native mandate)
- Electron desktop app as core surface
- Proprietary protocols (AMP/AID/AAP) as interop layer
- Telemetry-default-on behavior from any source (inverted: OFF by default)

## Landing-zone legend
- `core/*` — canonical subsystems (TypeScript packages)
- `apps/cli` — raidan CLI
- `integrations/*` — adapters to OpenCode/MCP/A2A/git/docker/platforms
- `skills/`, `agents/`, `commands/` — OpenCode-native assets distributed by installer
