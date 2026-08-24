# Deduplication Record — One Canonical Subsystem Per Concern

**Date:** 2026-08-24 · **Enforces:** master-prompt invariants (§1/§46) and ADR-002/003.
**Decision vocabulary:** REUSE · EXTEND · MERGE · SPECIALIZE · CREATE (never duplicate).

> This document is the authoritative answer to "why does X exist once?".
> Companion docs: `integration-map.md` (source→component routing), `repository-analysis.md`
> (per-source detail + license findings §2 + extraction patterns §3). Those three plus
> `capability-matrix.md` form the complete Phase 1 record — no overlapping duplicates are
> maintained between them.

---

## Invariant Register

| # | Canonical subsystem | Owner (path) | Status | Primary pattern source | Secondary inspirations | REJECTED | Reason |
|---|---|---|---|---|---|---|---|
| 1 | **Orchestrator** | `src/core/orchestration` | scaffolded | opencode-swarm gated pipeline | OpenAgentsControl plan→approve→execute; deer-flow lead-agent graph; agent-orchestrator daemon model | Absorbing ruflo / agentic-flow / kandev orchestrators | Each imports a competing control plane; upstream roadmaps would couple to ours |
| 2 | **Task Engine** | `src/core/tasks` | scaffolded | 5dive shared SQLite backlog | agx constant-cost checkpoints; deer-flow leases + delivery receipts; agent-teams-ai budgets/stall-resume | kandev board as state store; Notion Tasks DB as runtime state | AGPL boundary; ownership rule — Notion governs, kernel executes |
| 3 | **Team/Swarm Engine** | `src/core/teams` | scaffolded | agent-teams-ai org nesting (concept) | oh-my-openagent Team Mode tools; ruflo topologies (mesh/hierarchical) | ruflo swarm runtime; standalone team plugins | Minimum-sufficient-team must be policy-driven inside OUR kernel |
| 4 | **Session Manager** | `src/core/sessions` (planned) | planned | agent-deck primitive set | comet CRDT ledger + steering mailbox; clideck signal-watching; agent-of-empires reboot-safe resume; agent-manager tmux namespace | Shipping agent-deck/console/manager as-is | All tmux-bound or provider-narrow; violates Windows-first |
| 5 | **Agent Registry** | `src/core/agents` | exists | OpenAgentsControl editable agents | oh-my-openagent agent roster + contracts; kandev role≠implementation | Per-runtime duplicate registries | Hidden registries forbidden (§113) |
| 6 | **Capability Model + Router** | `src/core/routing` (planned) | planned | oh-my-openagent category-based routing | kandev per-step agent selection; agent-orchestrator fact-derived status | Name-based agent matching | Explicitly superseded by capability-first routing (master spec §11) |
| 7 | **Model Router / AI Gateway** | `src/core/gateway` | exists | oh-my-openagent caller-never-picks-model | ruflo multi-provider failover; deer-flow provider catalog; existing omiroute-local gateway | New second gateway beside existing local gateway | §33: build policy ON TOP of current provider infra |
| 8 | **Context Engine** | `src/core/context` | exists | OpenAgentsControl MVI discipline | opencode-swarm context-budget guard (0.7/0.9 thresholds); deer-flow compaction | Whole-codebase injection patterns | Token waste is the #1 measured failure mode |
| 9 | **Memory Engine** | `src/core/memory` | exists | 5dive durable memory + provenance | ai-maestro CozoDB layers; deer-flow long-term store; ruflo AgentDB (concept) | Vector DB by default; Postgres/Redis defaults | §49/§103: smallest durable local state first |
| 10 | **Skill Registry** | `src/core/skills` + user inventory | exists (1,565 installed) | OpenCode native skill model | agent-deck Skills Manager; ponytail pack format | Installing duplicate skills per source repo | §47/§50: dedupe before install; compare actual capabilities |
| 11 | **MCP Registry** | `src/core/mcp` | exists | agent-deck socket-pool governance | kandev bidirectional MCP; oh-my-openagent ephemeral skill-MCPs | Forking MCP servers; parallel MCP universes | §45: govern native OpenCode MCP, don't compete with it |
| 12 | **A2A Layer** | `integrations/a2a` (planned) | planned | ai-maestro AMP signed messages | agent-manager MCP spawn/message/wait tools | Using A2A for tool access; using MCP for agent↔agent | Protocol confusion forbidden (§44): MCP=agent↔tools, A2A=agent↔agent |
| 13 | **Policy Engine** | `src/core/policies` | exists | opencode-swarm file-authority + scope-TTL + shell-write AST detection | 5dive isolation tiers; OpenAgentsControl approval-before-write | Per-agent ad-hoc permission logic | Centralized evaluation is the whole point (§82) |
| 14 | **Approval Engine** | within `policies` | planned | 5dive human-escalation-only-on-decision | agx approve/reject at irreversible steps; OpenAgentsControl gates | Auto-approve modes without policy | Human control is configurable but never bypassable |
| 15 | **Review Engine** | `core/review` (planned) | planned | opencode-swarm critic→coder→reviewer→test_engineer gates | kandev review workspace; agent-manager diff-comment round-trip | External review bots as parallel pipelines | Gates must live inside the ONE kernel (§38) |
| 16 | **Runtime Supervisor** | `core/runtime` (planned) | planned | comet Harness trait + process ownership | 5dive systemd users (Linux backend); kandev executors (local/Docker/SSH); clideck PTY handling | systemd-only design; tmux dependency | §12/§100: abstract supervisor, Windows/Linux backends equal |
| 17 | **Worktree Manager** | `core/worktrees` (planned) | planned | agent-deck sparse-checkout + hooks | opencode-swarm disjoint-file grouping; agx branch-per-task; kandev multi-repo | Uncontrolled shared-write parallelism | Conflict prevention requires managed lifecycle |
| 18 | **Event Kernel** | `src/core/events` | exists | deer-flow run events | swarm plan-ledger (jsonl audit trail) | Heavyweight broker (Kafka/NATS) by default | §103: internal bus first |
| 19 | **Observability** | `src/core/observability` (planned) | planned | deer-flow tracing integrations (OTel-compatible shape) | agent-teams-ai token analytics; squid lane stats | Mandatory external platform | Local-first; OTel optional adapter |
| 20 | **Notification Engine** | `core/notifications` (planned) | planned | agent-deck Telegram/Slack bridges | deer-flow IM channels; 5dive Telegram escalation | Notification channel per source repo | One abstraction, pluggable providers |
| 21 | **Evaluation Engine** | `core/evaluation` (planned) | planned | OpenAgentsControl evals/ harness | ponytail benchmark methodology (LOC/cost deltas) | Vibes-based promotion | Evidence-gated promotion only (§73) |
| 22 | **Migration Engine** | `src/core/migrate` | exists | (internal) | agx checkpoint portability; comet export shapes | Blind overwrite migrators | §140: parse→compare→plan→backup→merge |
| 23 | **Config Manager** | `src/core/config` | exists | oh-my-openagent config walk-up (closest wins) | agent-deck declarative groups | Second config system beside OpenCode's | §74: respect native precedence, layer safely |
| 24 | **Setup Wizard** | `apps/cli/setup` (planned) | planned | (master spec §122 flow) | kandev profile composition | Install-everything defaults | Default profile stays minimal (§131) |
| 25 | **CLI** | `src/cli` | scaffolded | (existing `raidan` bin) | agent-deck/agent-manager command ergonomics | Multiple CLIs per subsystem | ONE CLI (§46) |
| 26 | **Control Center** | `apps/control-center` | deferred-view | agent-of-empires web/API/ACP surface | nimbalyst GUI; agent-teams-ai kanban; squid SSE dashboard | Several dashboards with separate state | UI reads the same API; zero business logic (§68) |
| 27 | **Connectors** | `integrations/notion` ✅ | shipped | (internal) | deer-flow IM adapters (pattern) | Connector-per-vendor duplication | Registry + least privilege (§87) |
| 28 | **Hooks System** | `core/hooks` (planned) | planned | oh-my-openagent 54-hook taxonomy (individual disable flags) | OpenAgentsControl plugin points | Untogglable monolithic hook packs | Granular enable/disable is a measured need |
| 29 | **Prompt Compiler** | `core/prompts` (planned) | planned | ponytail fragment-injection economics | OpenAgentsControl instruction layering | Duplicated directives across agent files | Measured −54% LOC shows fragment value |
| 30 | **Terminal Abstraction** | within `runtime` | planned | clideck PTY + status-signals (cross-OS proof) | kandev ConPTY usage | tmux as hard dependency | Windows-first (ADR-014) |
| 31 | **Search Providers** | `core/search` (planned) | planned | (gap — no source covers well) | deer-flow/oh-my-openagent websearch MCPs | Bundling one vendor SDK | Fallback routing needs abstraction |
| 32 | **Sandboxing** | within `policies`/`runtime` | planned | 5dive three isolation tiers | deer-flow sandbox providers; aofe Docker/Podman | K8s-first sandboxing | Local-first escalation path |

---

## Rejection Ledger (permanent record — do not revisit without new evidence)

| Rejected | Why | Reconsider only if |
|---|---|---|
| ruflo as dependency | Claude/Codex-hardwired competing control plane; scope = our entire OS | Never as engine; federation/trust-scoring concepts may inform Phase 10 study |
| agentic-flow as dependency | No LICENSE file despite MIT claim; alpha hygiene; Claude-bound | After license verification AND multi-runtime refactor |
| agent-console | Two-provider scope, no OpenCode, maturity << peers | If it adds OpenCode + grows a maintainer community |
| Wholesale vendoring of opencode-swarm | 120MB v7.x plugin; roadmap coupling | Its MIT license permits targeted extraction if a primitive proves too costly to reimplement |
| Notion as task/runtime store | Ownership boundary (ADR-021) | Never — boundary is architectural |
| tmux as required dependency | Breaks native Windows (our differentiator) | Only as optional Linux convenience backend behind TerminalAdapter |

## Doc-Level Deduplication

- `repository-analysis.md` = per-source analysis + license findings (§2) + extraction patterns (§3).
- `integration-map.md` = source→capability→component routing (pre-existing, remains canonical for that view).
- `capability-matrix.md` = ontology coverage across sources.
- This file = subsystem uniqueness decisions + rejection ledger.
- No content is duplicated between them; each links rather than copies.
