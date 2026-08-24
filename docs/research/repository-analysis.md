# Repository Analysis Matrix — All 21 Source Repositories

**Date:** 2026-08-24 · **Method:** Live fetch of READMEs, package manifests (`package.json` / `Cargo.toml` / `go.mod` / `pyproject.toml`), directory listings, GitHub API metadata. No reliance on memory or assumptions.
**Anti-hallucination rule applied:** every value below was fetched; unverifiable items are marked UNKNOWN.

---

## 1. Decision Summary

| # | Repository | Language | License (verified) | Stars | Recommendation |
|---|-----------|----------|--------------------|-------|----------------|
| 1 | darrenhinde/OpenAgentsControl | TS/Markdown | MIT | 4.8k | REFERENCE_ONLY |
| 2 | 5dive-ai/5dive | Bash/SQLite/systemd | MIT | 54 | REFERENCE_ONLY |
| 3 | 777genius/agent-teams-ai | TS/Electron | **AGPL-3.0** | 2.0k | OPTIONAL (companion app only) |
| 4 | buhuipao/agent-console | Rust | MIT OR Apache-2.0 | 16 | REJECT |
| 5 | asheshgoplani/agent-deck | Go | MIT | 783 | **ADAPTER** |
| 6 | YoanWai/agent-manager | Go | Apache-2.0 | 350 | REFERENCE_ONLY |
| 7 | agent-of-empires/agent-of-empires | Rust | MIT | 3.1k | **ADAPTER** |
| 8 | ZaxbyHub/opencode-swarm | TS/Bun | MIT | 451 | REFERENCE_ONLY (vendoring viable) |
| 9 | nimbalyst/nimbalyst | TS/Electron | MIT | 1.5k | OPTIONAL |
| 10 | DietrichGebert/ponytail | JS/Node | MIT | 109k | OPTIONAL (skill pack) |
| 11 | ruvnet/agentic-flow | TS/Node | Declared MIT, **NO LICENSE FILE** | 797 | REJECT |
| 12 | bytedance/deer-flow | Python+Node | MIT | 80k | REFERENCE_ONLY |
| 13 | ruvnet/ruflo | TS/Node | MIT | 69k | REJECT |
| 14 | code-yeongyu/oh-my-openagent | TS/Bun | **SUL-1.0 (custom)** | 68k | REFERENCE_ONLY |
| 15 | Untrivial-ai/agent-orchestrator | Go+TS | Apache-2.0 | 9.9k | REFERENCE_ONLY |
| 16 | agent-squid/squid | Python/FastAPI | MIT | 14 | REFERENCE_ONLY |
| 17 | ramarlina/agx | Node/TS | MIT declared, file unverified | 27 | REFERENCE_ONLY |
| 18 | rustykuntz/clideck | Node/xterm | MIT | 152 | **ADAPTER** |
| 19 | 23blocks-OS/ai-maestro | Next.js/tmux | MIT | 757 | REFERENCE_ONLY |
| 20 | zeronsh/comet (Zeron) | Rust/gpui | MIT | 1.1k | REFERENCE_ONLY |
| 21 | kdlbs/kandev | Go+React/Tauri | **AGPL-3.0** | 684 | **ADAPTER** (license check first) |

**Tally:** 4 ADAPTER · 3 OPTIONAL · 10 REFERENCE_ONLY · 2 REJECT · 2 ADAPTER-with-license-caveat.

---

## 2. License Compliance Analysis

### ✅ Safe to adapt or vendor (MIT / Apache-2.0, license file verified)
agent-deck, agent-of-empires, clideck, opencode-swarm, ponytail, nimbalyst,
OpenAgentsControl, 5dive, deer-flow, agent-manager, agent-orchestrator, squid,
ai-maestro, comet, agent-console.

### ⚠️ Copyleft — process-boundary integration ONLY (no code copying into this repo)
- **agent-teams-ai (AGPL-3.0)** — usable solely as a standalone companion application.
- **kandev (AGPL-3.0)** — integrate via its external MCP / ACP interfaces at arm's length;
  any code reuse would force AGPL onto RaidanOpencode.

### 🚫 Unverified / non-standard — architectural reference only until resolved
- **agentic-flow** — claims MIT in `package.json` but ships **no LICENSE file** (404).
- **oh-my-openagent** — custom **SUL-1.0** license (GitHub: NOASSERTION); terms unread.
- **agx** — MIT declared in manifest but no LICENSE file detected in listing.

**Rule enforced:** when license compatibility is unclear → clean-room reimplementation of concepts, zero code copying.

---

## 3. Source → Raidan Component Mapping (key extractions)

| Source | Pattern extracted | Raidan component | Type |
|---|---|---|---|
| opencode-swarm | Gated pipeline: plan → critic-gate → code → review → test → phase gates; file-authority per agent; circuit breakers; scope enforcement w/ TTL + symlink guards; PowerShell/cmd write-detection | Review Engine + Policy Engine + validation gates | REIMPLEMENT (pattern) |
| agent-deck | Conductor supervision role; Unix-socket MCP process pool (85–90% mem reduction); sparse-checkout worktrees w/ `.worktreeinclude`; fork-inheriting sessions | Session Manager + MCP Registry + Worktree Manager | ADAPT |
| agent-of-empires | axum web/mobile dashboard + HTTP API + ACP structured rendering; reads OpenCode SQLite store directly | Control Center transport + OpenCode Adapter | ADAPT |
| clideck | Purpose-built OpenCode plugin/bridge; PTY status detection on Win/Linux/macOS without intercepting prompts | OpenCode Adapter session surface | ADAPT |
| kandev | Bidirectional MCP (task-agent MCP + external management MCP); ACP adapters; executor abstraction (local/Docker/SSH/cloud); ConPTY native Windows | Runtime executors + MCP architecture reference | INSPIRE (license-safe distance) |
| deer-flow | Plan → parallel sub-agent investigation → synthesis w/ delivery receipts; run leases/cancellation; sandbox providers | Research Workflow + Task durability semantics | INSPIRE |
| oh-my-openagent | 54+ lifecycle hooks; category-based model routing (caller never picks model); team_* tool family; skill-embedded ephemeral MCPs; Hashline content-hash edit anchors | Hook System + Model Router taxonomy + Team tools | INSPIRE |
| OpenAgentsControl | MVI lazy context (<200-line files); approval-before-every-write; ContextScout discovery; team-shared project-intelligence files | Context Engine + Approval Engine | ADAPT (concepts) |
| 5dive | SQLite shared task queue; human-escalation-only-on-decision protocol; gate-gated git push via owned GitHub App (agents never hold tokens) | Task persistence + Human Control + credential isolation | REIMPLEMENT |
| comet/Zeron | Loro-CRDT session documents; durable command ledger; steering mailbox; crash-recovery journal | Future device-sync layer + Session durability | REFERENCE |
| ai-maestro | AMP signed/prioritized agent messaging; cryptographic agent identity; CozoDB code-graph memory | A2A message model + Memory design | INSPIRE |
| agx | Constant-cost checkpoint resume regardless of thread age; human approve/reject at every irreversible step | Task checkpoints + autonomy gates | INSPIRE |
| agent-orchestrator | Kanban positions derived from session/PR/CI facts (never hand-edited state) | Validates ONE-task-model principle | VALIDATION |
| ponytail | YAGNI behavioral ruleset as portable skill pack (~54% LOC reduction benchmarked) | Optional shipped skill pack | WRAP/OPTIONAL |

---

## 4. Platform Insight — the Windows Gap

Native-Windows-capable sources: **kandev** (ConPTY + Scoop), **clideck**, **agent-teams-ai**, **nimbalyst**, **ponytail**.
Everything tmux/systemd-bound (5dive, ai-maestro, agent-deck*, agent-of-empires*, comet) is WSL-limited.
(*Go/Rust TUIs run under WSL only.)

➡️ **First-class native Windows support is an open differentiator RaidanOpencode owns** if its runtime/session layers avoid tmux assumptions (per ADR-014 cross-platform).

---

## 5. Per-Repository Notes (condensed)

### 1. darrenhinde/OpenAgentsControl — MIT, TS, v0.7.1, 4.8k★
Plan-first methodology layer over OpenCode: editable Markdown agents, approval gates before write/bash/delegation, MVI context discipline, ContextScout, team-shared project-intelligence files. Windows via Git Bash/WSL only. → Methodology donor, not a dependency.

### 2. 5dive-ai/5dive — MIT, Bash+SQLite+systemd, 1.8k commits
"Company of AI agents" on Linux users + systemd services; org charts, shared SQLite backlog, council reviews, Telegram human escalation, gate-gated push via user-owned GitHub App. Hard systemd coupling → patterns only.

### 3. 777genius/agent-teams-ai — AGPL-3.0, Electron v2.x, 2k★
Kanban desktop app across Claude/Codex/OpenCode/Cursor; nested orgs, budgets, stall nudges, per-teammate worktrees, bundled MCP server, native NSIS installer. AGPL ⇒ standalone companion only.

### 4. buhuipao/agent-console — MIT/Apache dual, Rust v0.0.16, 16★
Codex/Claude-only TUI session monitor. Narrow scope, early stage, no OpenCode. Superseded by agent-deck/agent-of-empires. REJECT.

### 5. asheshgoplani/agent-deck — MIT, Go v1.9.x, 783★
Richest control-plane primitive set: conductor sessions, group concurrency policy, worktree sparse-checkout inheritance, MCP Manager + socket-pool, Skills Manager, Docker sandboxing, cost dashboards, Telegram/Slack bridges. WSL-only Windows. Primary ADAPTER candidate.

### 6. YoanWai/agent-manager — Apache-2.0, Go, 350★
Private tmux server namespace; MCP tools let sessions spawn/message/wait-on other agents; diff-review comments round-trip into agent panes. Cleanest MCP-spawn + review-loop reference.

### 7. agent-of-empires — MIT, Rust v1.15.0, 3.1k★, Mozilla.ai-backed
TUI + axum web/PWA dashboard, REST API, ACP rendering, QR remote access, plugin API crate, direct OpenCode SQLite reading, Docker/Podman sandboxes. Best remote-control-plane surface. WSL-only Windows.

### 8. ZaxbyHub/opencode-swarm — MIT, Bun ≥1.3, npm v7.146.1, 451★, pushed today
Canonical OpenCode-native gated orchestration: architect hub-and-spoke, critic gates, 19-agent roster, file authority, scope enforcement w/ symlink guards, bash-parser AST shell-write detection incl. PowerShell/cmd heuristics, circuit breakers, PRM loop detection, SAST/SBOM quality gates, context-budget guard, worktree-parallel coders, plan-ledger resumability. Same plugin API (`@opencode-ai/plugin`) as ours — highest-fidelity pattern source; wholesale absorption rejected to avoid roadmap coupling.

### 9. nimbalyst/nimbalyst — MIT, Electron monorepo v0.33.x, 1.5k★
Visual workspace: parallel-session kanban, agent-editable tasks, worktree tooling, iOS/Android companions, extension SDK/marketplace, OpenCode alpha support. Optional GUI front-end.

### 10. DietrichGebert/ponytail — MIT, npm v4.9.0, 109k★
Behavioral "lazy senior dev" ruleset: AGENTS.md injection + slash commands + lifecycle hooks; benchmarks −54% LOC / −20% cost. Drop-in optional skill pack; `%APPDATA%` config documented.

### 11. ruvnet/agentic-flow — license UNVERIFIED (no LICENSE file), alpha, stale 25d
Claude-Agent-SDK-bound swarms/learning hooks. Repo hygiene issues (committed artifacts). REJECT as dependency; learning-hook ideas noted.

### 12. bytedance/deer-flow — MIT, Python 3.12 + LangGraph + Next.js, 80k★, pushed today
SuperAgent harness: lead-agent plans → capped parallel sub-agents → synthesis w/ mandatory delivery receipts; run leases/cancellation; pluggable sandboxes (local/Docker/K8s/E2B); IM channels; long-term memory; Textual TUI. Windows dev requires Git Bash. Research-workflow reference.

### 13. ruvnet/ruflo — MIT, npm still `claude-flow` v3.38.x, 69k★, pushed today
100+ agent swarms, GOAP planner, HNSW AgentDB, mTLS federation w/ trust scoring, 35-plugin marketplace. Claude/Codex-hardwired competing control plane → REJECT; federation/trust-scoring concepts flagged for future study.

### 14. code-yeongyu/oh-my-openagent — SUL-1.0 (custom), Bun monorepo v5 beta, 68k★, pushed today
Deepest OpenCode-plugin technique map: 54+ hooks, intent gate, category-based model routing, Team Mode `team_*` tool family (lead + ≤8 members, tmux grid), background agents, ephemeral skill-embedded MCPs, Hashline hash-anchored edits, LSP/AST tools, Claude-compat layer, prebuilt win/linux binaries. License blocks reuse → study-and-reimplement.

### 15. Untrivial-ai/agent-orchestrator — Apache-2.0, Go daemon + React desktop, 9.9k★
Persistent project orchestrator delegating to workers (one task = one agent = one branch+worktree); Kanban derived from live session/PR/CI facts; autonomous CI-fix/merge-conflict loops; 26 agents incl. OpenCode; native Win/Linux/macOS packaging. End-product competitor → architecture reference.

### 16. agent-squid/squid — MIT, Python/FastAPI v0.1.5rc1, 14★
Control layer around real CLI processes preserving native resume; `#topic@agent` lanes w/ FIFO workers; SSE browser UI; token analytics. Early-stage → pattern reference only.

### 17. ramarlina/agx — MIT declared (file unverified), Node ≥22, npm v2.4.11, 27★
Ticket→PR loop with human gates at every irreversible step; SQLite WAL durable checkpoints with constant-cost resume; tag-based team routing; mid-thread model switching. macOS-centric packaging.

### 18. rustykuntz/clideck — MIT, Node v1.33.x, 152★
One-screen PTY dashboard (xterm.js) that never sits between prompt/output — watches status signals only; per-agent transcript parsers; autopilot routing; E2E-encrypted mobile relay; **ships `opencode-plugin/` + `opencode-bridge.js`**; explicit Windows 10 1809+ support. Direct adapter material.

### 19. 23blocks-OS/ai-maestro — MIT, Next.js v0.36.x, 757★
"OS for AI-first organizations": AMP signed prioritized messaging, cryptographic agent identity, CozoDB three-layer memory/code-graph, war-room meetings, P2P machine mesh, gateway prompt-injection filtering. tmux hard dependency → WSL2-only Windows.

### 20. zeronsh/comet (Zeron) — MIT, Rust workspace v0.2.27, 1.1k★, committed today
Local-first multi-device engine: Harness trait over agent CLIs, Loro-CRDT session docs (transcript + durable command queue), steering mailbox, crash-recovery journal, stall watchdog, worktrees under `~/.zeron`, optional Durable-Object sync. gpui/Linux/macOS only. Best session-durability + sync blueprint.

### 21. kdlbs/kandev — AGPL-3.0, Go v0.91.0 (released 2026-08-21), 684★
Server-first orchestrator: pluggable executors (local/Docker/SSH/cloud), ACP adapters with **first-class OpenCode**, bidirectional MCP (task-agent + external management), YAML workflows mixing agents per step, sub-task parent-session resume, ConPTY native Windows + Scoop. Strongest functional overlap; integrate strictly through external MCP/ACP boundary pending license review.

---

## 6. Immediate Implications for Architecture

1. **One orchestrator confirmed necessary** — ruflo/agentic-flow prove that absorbing any upstream control plane imports a competing brain (§ invariant: exactly ONE Orchestration Kernel).
2. **Gated pipeline is table stakes** — opencode-swarm's critic/test/security gates become the Raidan Review Engine baseline, reimplemented natively with our Policy Engine.
3. **Adapter shortlist for Phase 5 (Runtime/Sessions):** agent-deck primitives, agent-of-empires web/API surface, clideck OpenCode bridge — all MIT.
4. **License firewall:** AGPL sources (kandev, agent-teams-ai) touched only via network/process boundaries; SUL-1.0 and license-less repos are read-only references.
5. **Windows-first runtime** (no tmux assumption) converts the field's biggest weakness into our default strength.
