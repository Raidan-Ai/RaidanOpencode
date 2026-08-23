# Source Research — Batch B

Date: 2026-08-23
Method: webfetch of github.com repository pages (README + repo metadata). Read-only research for the unified OpenCode-based agent OS (RaidanOpenCode). Working environment is native Windows — platform support weighted accordingly.

## Summary Table

| Repo | Exists | License | Lang | Purpose(5 words) | Total | Verdict |
|---|---|---|---|---|---|---|
| YoanWai/agent-manager | YES | Apache-2.0 | Go | tmux TUI agent session manager | 79 | INSPIRE |
| agent-of-empires/agent-of-empires | YES | MIT | Rust+TS | TUI/Web multi-agent session manager | 93 | ADAPT |
| Untrivial-ai/agent-orchestrator | YES | Apache-2.0 | TS/Electron | Desktop agent fleet IDE orchestrator | 89 | ADAPT |
| agent-squid/squid | YES | MIT | Python/FastAPI | Chat-lane CLI agent unifier | 71 | INSPIRE |
| ramarlina/agx | YES | MIT | TypeScript/Node | Ticket-to-PR gated agent workspace | 74 | INSPIRE |

---

## 1. YoanWai/agent-manager

- Repository: agent-manager | Owner: YoanWai | EXISTS? YES
- License: Apache-2.0. MIT compatibility: YES (preserve NOTICE on redistribution).
- Language(s): Go; Runtime: single static Go binary; hard dependencies tmux 3.1+ and git.
- Primary purpose: TUI session manager running Claude Code, Codex, OpenCode, Grok, Gemini CLI, Pi, and Hermes side by side, one persistent tmux session per tool. Adds live status, quick prompts, worktrees, and diff review as a thin layer over existing CLIs.
- Architecture summary: thin supervisor over user-installed CLI agents; sessions live on a private tmux server (`agentmgr`) so they survive manager exit. Bubble Tea TUI list with foldable project-tree groups. No daemon, no database.
- Agent model: each session launches one installed CLI as-is (your login, subscription, config files, MCP servers carry over). Per-tool status detection rules, extensible via `[tools.<name>]` config blocks.
- Orchestration model: none beyond manual grouping/spawning; an agent can spawn another agent, message it, and wait (spawn tools carried on MCP-capable sessions); `space` quick-prompt answers selected session or spawns a new agent.
- Task model: no first-class tasks — sessions are the unit. Fork continues a conversation in a separate named fork; revive; restart on empty context.
- Memory/context model: none owned by the manager — context lives inside each CLI's own session.
- Team model: project-tree groups only; no roles or routing.
- Process/terminal/workspace/git-worktree: tmux panes; optional per-session git worktree (`<repo>-worktrees/<name>`, branch `am/<name>`); plain shell under selected agent/group.
- Model routing / provider routing: NO — delegated entirely to each CLI's own provider config.
- MCP: passthrough; uses MCP-capable sessions to expose agent-spawn/message/wait tools. A2A: No.
- Hooks/events: desktop notifications on status change only. HITL: manual supervision — permission prompts visible; diff review shows full-file diffs, line comments sent back to the agent's pane as one numbered review round. No autonomy levels.
- Persistence/database: none (tmux server state only). Observability/logging: minimal. UI: Bubble Tea TUI only. Security: none (agents run with full user privileges).
- Platform support: macOS + Linux native; Windows ONLY via WSL2. tmux dependency blocks native Windows.
- Installation method: Homebrew tap, checksum-verified curl install.sh, Arch package, mise, go install, prebuilt binaries. Configuration: `[tools.<name>]` blocks.
- Reusable components: status-detection rule schema; diff-review → numbered-comments → single-prompt loop UX; worktree naming convention (`am/<name>` branches); private-tmux-server isolation pattern; fork/revive/restart semantics.
- Integration value: MEDIUM — session UX patterns map well onto an OpenCode-native session layer, but the Go+tmux stack cannot run natively on Windows.
- Duplication risk: HIGH if we build our own multi-agent session dashboard.
- Unique features: uniform keys across heterogeneous CLIs incl. OpenCode; comment-to-prompt review rounds; dead-session self-revive; 347 stars, 465 commits traction.
- Features to reject: tmux dependency (Windows blocker); no cost tracking; no persistence layer.
- SCORES 0-10: Architecture Fit 7 | OpenCode Fit 8 | Agent Relevance 9 | Documentation 9 | Maintenance 8 | Community 6 | Security 6 | Composability 5 | Integration Value 6 | Duplication Risk 7 | Installation Quality 8
- TOTAL_SCORE: 79 — VERDICT: INSPIRE — copy the session UX patterns (diff-review comments, revive/fork, worktree toggle) into a Windows-native OpenCode session layer; do not port Go/tmux.

---

## 2. agent-of-empires/agent-of-empires (AoE)

- Repository: agent-of-empires | Owner: agent-of-empires | EXISTS? YES
- License: MIT. Compatibility: IDENTICAL.
- Language(s): Rust (Cargo workspace) + TypeScript/React web frontend. Runtime: native binary; tmux required; Docker/Podman/Apple Containers optional; axum web server behind `serve` feature.
- Primary purpose: session manager for AI coding agents driven from a TUI or any browser (installable PWA) so agents stay reachable from laptop, phone, or tablet. Runs many agents in parallel across different branches, each in its own isolated tmux session with optional container sandboxing.
- Architecture summary: Rust core managing tmux sessions; ACP (Agent Client Protocol) worker renders structured agent state (plan panels, tool-call cards, swipe-to-approve) as the default mobile-first web view; axum HTTP server + React frontend; plugin API crate (aoe-plugin-api).
- Agent model: auto-detects installed CLIs among 15 supported including OpenCode, Claude Code, Codex CLI, Gemini CLI, Cursor CLI, Hermes, Qwen Code, Kimi Code. Per-agent command overrides / sandboxed wrappers.
- Orchestration model: manual parallel sessions plus external orchestrators via CLI and HTTP API (explicitly integrates with tools like OpenClaw); no built-in planner agent.
- Task model: sessions are the unit; profiles, repo config, hooks, and agent overrides per project; multi-repo workspaces let one session drive several git repositories.
- Memory/context model: session resume persists Claude conversations across reboots/upgrades using native resume handles; AoE stores session metadata, not agent context.
- Team model: none.
- Process/terminal/workspace/git-worktree: tmux sessions outlive terminal/SSH disconnects; first-class git worktrees (parallel agents across branches); multi-repo workspaces; diff view with in-TUI file editing.
- Model routing / provider routing: NO — each CLI keeps its own provider/model config.
- MCP: passthrough via underlying CLIs. A2A: No — but ACP structured rendering is its protocol innovation.
- Hooks/events: repo-config hooks per project; browser/PWA push notifications when an agent needs attention.
- HITL: swipe-to-approve in the structured web view; permission prompts surfaced in TUI preview; otherwise manual supervision.
- Persistence/database: per-platform app data dirs. Observability/logging: AOE_LOG_LEVEL, AOE_ACP_TRACE raw JSON-RPC firehose, `aoe logs` viewer. UI/CLI/TUI/Web: all four surfaces. Security/sandboxing: Docker/Podman sandboxing with shared auth volumes; remote access via HTTPS with QR + passphrase auth through Tailscale Funnel or Cloudflare Tunnel.
- Platform support: Linux + macOS native; FAQ states Windows ONLY via WSL2 ("AoE depends on tmux and POSIX process handling, so native Windows is not supported").
- Installation method: curl install script, brew, nix run, cargo build. Configuration approach: layered — global settings, per-repo config, per-agent overrides, profiles.
- Reusable components: ACP structured-view pattern (mobile-first agent-state rendering); plugin API surface; HTTP API design for external orchestrators; sandbox-with-shared-auth-volume recipe; remote-access auth; logging trace taxonomy.
- Integration value: HIGH conceptually — OpenCode is a first-class citizen and ACP aligns with opencode's client-protocol direction; but the Rust/tmux process layer conflicts with a native-Windows goal.
- Duplication risk: HIGH — closest existing artifact to a "unified agent OS" front-end.
- Unique features: PWA mobile control with swipe-to-approve; container sandboxing with shared auth volumes; Mozilla.ai-supported maintenance; 3.1k stars / 2161 commits community.
- Features to reject: tmux/POSIX-only process handling; no built-in planning agent.
- SCORES 0-10: Architecture Fit 8 | OpenCode Fit 8 | Agent Relevance 10 | Documentation 10 | Maintenance 9 | Community 9 | Security 7 | Composability 7 | Integration Value 8 | Duplication Risk 8 | Installation Quality 9
- TOTAL_SCORE: 93 — VERDICT: ADAPT — highest-value reference in batch: adopt ACP structured-view, plugin API, and sandbox/auth patterns; reimplement the process layer Windows-natively instead of porting tmux.

---

## 3. Untrivial-ai/agent-orchestrator (AO)

- Repository: agent-orchestrator | Owner: Untrivial-ai | EXISTS? YES
- License: Apache-2.0. MIT compatibility: YES (preserve NOTICE/attribution).
- Language(s): TypeScript/JavaScript npm-workspaces monorepo: backend/ (local daemon), frontend/ (Electron desktop app), packages/, contracts/cloud/.
- Primary purpose: local desktop "Agent IDE" to plan, run, and supervise fleets of coding agents from one Kanban workspace. Ships an agentic orchestrator that plans tasks, spawns agents, and autonomously handles CI fixes, merge conflicts, and code reviews.
- Architecture summary: Electron desktop app over a local daemon that watches agent activity and source-control state; per-worker lifecycle attaches task, conversation, terminal, changed files, isolated browser, PR, CI, and review state; Kanban columns derived from live facts rather than manual moves. Documented in docs/architecture.md.
- Agent model: worker = unit of execution (one task + one coding agent + one isolated workspace); 26 agents supported including opencode, Claude Code, Codex, Cursor, Aider, Copilot, Goose, Cline, Devin, Kimi, Qwen; structured Chat OR the agent's native terminal UI per worker.
- Orchestration model: persistent project-scoped orchestrator agent performs planning/delegation; workers own implementation, tests, commits, PRs. Cleanest orchestrator/worker separation in this batch.
- Task model: New-task flow (describe outcome, choose agent + model, attach relevant files); Scratch workers get AO-managed branchless directories; Git-backed workers get their own branch + worktree.
- Memory/context model: orchestrator's project-scoped conversation preserves goals, decisions, constraints; combined with repository context and live AO state.
- Team model: implicit — orchestrator delegates to workers; no explicit role teams.
- Process/terminal/workspace/git-worktree: every Git-backed worker gets its own branch and worktree automatically; attach-to-terminal per worker; per-worker isolated browser profiles prevent parallel UI tasks sharing state.
- Model routing / provider routing: YES at task level — agent AND model chosen per task in the New-task form.
- MCP: not prominent (agents bring their own). A2A: No.
- Hooks/events: daemon watches agent activity and SCM events; `.agents/skills/bug-triage/SKILL.md` drives agent-led bug reproduction and GitHub issue filing.
- HITL: spectrum — direct worker chat up to orchestrator autonomously handling CI fixes, merge conflicts, and reviews; "Needs you" Kanban column surfaces blocked sessions, missing input, failed CI, requested changes.
- Persistence/database: backend persistence + CDC documented; internals owned by daemon. Observability/logging: anonymous privacy-preserving telemetry (documented). UI/CLI/TUI: desktop GUI + CLI with daemon route mapping. Security: per-worker browser isolation; no container sandbox advertised.
- Platform support: ALL THREE native — macOS dmg, Windows win32-x64 .exe installer, Linux AppImage/deb/rpm. Only batch member with true native Windows support. Built-in auto-update.
- Installation method: prebuilt desktop downloads per platform. Configuration: point the app at a repository; per-agent setup guides.
- Reusable components: orchestrator-plans/workers-execute contract; fact-derived Kanban status derivation (session+PR+CI+review → column); per-worker context-bundle pattern; bug-triage skill; architecture documentation style.
- Integration value: HIGH as blueprint — daemon/status-derivation/orchestrator concepts transfer directly even though the Electron app itself would duplicate scope.
- Duplication risk: VERY HIGH (9) — this IS an agent IDE/orchestrator; building ours without studying it risks reinventing it worse.
- Unique features: agentic orchestrator with autonomous CI-fix/conflict/review handling; agent-controllable per-worker browser; 26-agent breadth; 9.9k stars / 2363 commits (top-6k GitHub repo).
- Features to reject: Electron desktop-app weight (we target OpenCode-native surfaces); contracts/cloud hints at SaaS pull; telemetry present (documented as anonymous).
- SCORES 0-10: Architecture Fit 8 | OpenCode Fit 8 | Agent Relevance 10 | Documentation 9 | Maintenance 9 | Community 9 | Security 6 | Composability 5 | Integration Value 7 | Duplication Risk 9 | Installation Quality 9
- TOTAL_SCORE: 89 — VERDICT: ADAPT — mine architecture docs plus the orchestrator/Kanban-status concepts as the blueprint for our swarm layer; do not vendor the Electron monolith.

---

## 4. agent-squid/squid (AgentSquid)

- Repository: squid | Owner: agent-squid | EXISTS? YES
- License: MIT. Compatibility: IDENTICAL.
- Language(s): Python (FastAPI). Runtime: Python managed by uv; local CLI subprocesses; SQLite; HTTP + SSE; browser UI at http://127.0.0.1:8000.
- Primary purpose: "meta harness orchestrator" unifying Claude Code, OpenAI Codex, Cursor Agent, OpenCode, and Pi (plus Ollama local models) under one browser/chat UI with named lanes. Real CLI processes remain the runtime; Squid adds names, history, queues, controls.
- Architecture summary: Browser/phone → HTTP+SSE → FastAPI server → SQLite (history, stats, topics, session handles) + TopicDispatcher → FIFO worker per #topic@agent lane + ephemeral worker per adhoc ! turn → local CLI subprocesses. Small, legible, single-process.
- Agent model: agent = named config (harness + provider + model + working directory); sticky @agent per topic; six backends (claude/codex/cursor-agent/opencode/pi/ollama).
- Orchestration model: queue-per-lane dispatcher; adhoc `!` turns bypass queues and run immediately; no planner agent, no DAGs.
- Task model: topics (#tags created dynamically) are lightweight workstreams; Goldfish mode `#topic@agent!N` runs a fresh one-off turn with only the last N exchanges as context.
- Memory/context model: the CLI owns the real conversation context (native resume); Squid stores session handles + history; context pin injects a useful answer into another session or adhoc turn; context bookmark saves answers for later.
- Team model: none (lanes are not teams).
- Process/terminal/workspace/git-worktree: cwd-aware subprocesses with cwd locks; no worktree management; process controls (stop by command/topic, drain queues, clear sessions, compact/reset context).
- Model routing / provider routing: PARTIAL — provider + model chosen per named agent config; switching providers mid-thread supported.
- MCP: passthrough only. A2A: No.
- Hooks/events: none documented; live progress bubble streams queued state, tool/status output.
- HITL: manual stop/control only; no approval gates.
- Persistence/database: SQLite for history, stats, topics, active session IDs, cwd locks, UI state. Observability/logging: per-prompt usage metadata (input/output/cache/reasoning tokens, cost, duration, quota signals where exposed) + analytics rollups by time/topic/agent. UI/CLI: browser UI + `agentsquid start`. Security/sandboxing: binds 127.0.0.1 only; Tailscale HTTPS proxy with token-in-URL QR for remote; no sandboxing.
- Platform support: macOS-centric (bash installers, activate.sh); Linux implied; NO Windows evidence found. Treat as unverified on Windows.
- Installation method: curl -fsSL https://agentsquid.ai/install.sh | bash; uv-managed dependencies. Configuration approach: agent configs created in the UI.
- Reusable components: #topic@agent lane grammar; goldfish/adhoc limited-context turns; context pin/bookmark primitives; per-prompt token-cost attribution attached to real work; FIFO-lane dispatcher sketch.
- Integration value: MODERATE — ideas portable; the Python/FastAPI stack duplicates what an OpenCode-native server would do better.
- Duplication risk: MODERATE.
- Unique features: "EVERY. TOKEN. COUNTS." manifesto with per-prompt usage/quota deltas; session-vs-adhoc context experiments; sticky dynamic tags; QR-token couch coding via Tailscale.
- Features to reject: token-in-URL auth (leaks via referrer/logs — use headers/sessions instead); near-zero community (13 stars, 0 forks, 0 issues) means no maintenance safety net; no Windows path.
- SCORES 0-10: Architecture Fit 7 | OpenCode Fit 7 | Agent Relevance 9 | Documentation 7 | Maintenance 6 | Community 3 | Security 7 | Composability 6 | Integration Value 6 | Duplication Risk 6 | Installation Quality 7
- TOTAL_SCORE: 71 — VERDICT: INSPIRE — harvest lane-syntax, goldfish-mode, and per-prompt cost-attribution ideas; skip the codebase.

---

## 5. ramarlina/agx

- Repository: agx | Owner: ramarlina | EXISTS? YES
- License: MIT. Compatibility: IDENTICAL.
- Language(s): TypeScript / Node.js >=22.16 (npm workspace: lib/ CLI runtime, commands/, apps/local Next.js dashboard, apps/desktop Electron, src/graph/). Runtime: Node + tsx; SQLite WAL; EventSource streaming CLI→board.
- Primary purpose: local workspace running coding agents across tickets, repos, and PRs as a persistent team with objectives, memory, and coordinated work — human stays the author. Ships CLI + local web dashboard + macOS desktop app from one repo.
- Architecture summary: three layers — State layer (SQLite WAL, durable checkpoints), CLI+daemon (provider tool calls, filesystem edits, worktree isolation), Decision layer (human gate transitions, review flow). npm-workspace monorepo.
- Agent model: provider-agnostic chat (Claude/Codex/Gemini/Ollama aliases c/x/g/o) switchable mid-thread; reviewer-agent first-pass before human PR review; agent teams grouped by role (engineering/research/ops).
- Orchestration model: ticket → implementation → PR → review loop; Jira/Linear tickets enter, agents draft, humans approve at gates, PRs ship; objectives + scheduled jobs live under projects; tag-based automatic work routing to teams.
- Task model: tickets are tasks; every ticket has a home (objectives, scheduled jobs, chat threads, terminal sessions nested under project); constant-cost resume regardless of thread age.
- Memory/context model: checkpointed state (not rebuilt from conversation history) — close laptop, resume instantly; ticket remembers context; env-var store.
- Team model: EXPLICIT — role-based agent teams with automatic tag routing (unique in this batch).
- Process/terminal/workspace/git-worktree: worktree isolation in daemon; embedded terminal sessions per project.
- Model routing / provider routing: YES — four providers switchable freely mid-thread; per-provider CLIs invoked.
- MCP: not documented. A2A: No.
- Hooks/events: scheduled jobs; live presence (which agents active on which projects/tickets); EventSource push to board.
- HITL: STRONGEST in batch — built-in approve/reject before anything irreversible; human-gate transitions are a named architectural layer; signed actions + destructive-command safeguards.
- Persistence/database: SQLite WAL mode, durable checkpoints, no external DB required. Observability/logging: dashboard, live presence, full activity log. UI/CLI/TUI: CLI + Next.js web board + Electron macOS app. Security: fully local (code never leaves machine), signed actions, destructive-command safeguards — BUT telemetry ON by default (anonymous: OS/arch/node version/AGX version/commands/provider/task outcomes/timing; opt-out via `agx telemetry off`, AGX_TELEMETRY=0).
- Platform support: macOS desktop app official; Node CLI cross-platform in principle but README/docs showcase macOS only; no Windows evidence stated. Unverified on Windows.
- Installation method: npm i -g @mndrk/agx && agx init; macOS desktop from Releases. Configuration: agx init/config wizard; ~/.agx/config.json.
- Reusable components: human-gate decision-layer pattern; durable-checkpoint state model (constant-cost resume); reviewer-agent-first-pass PR flow; role-team + tag-routing; Jira/Linear ticket ingestion loop.
- Integration value: GOOD pattern source — gates/checkpoints/team-routing slot directly into our orchestration semantics; JS stack closer to the OpenCode ecosystem than Go/Rust/Python peers.
- Duplication risk: MODERATE-HIGH.
- Unique features: self-hosted dogfooding claim (167+ merged PRs by its own agents, 93% clean); explicit decision layer; objectives + scheduled-jobs hierarchy; signed actions.
- Features to reject: telemetry-default-on (must be inverted for our OS); macOS-only desktop packaging; solo-maintainer bus factor (27 stars).
- SCORES 0-10: Architecture Fit 8 | OpenCode Fit 6 | Agent Relevance 9 | Documentation 8 | Maintenance 6 | Community 3 | Security 6 | Composability 6 | Integration Value 7 | Duplication Risk 7 | Installation Quality 8
- TOTAL_SCORE: 74 — VERDICT: INSPIRE — take the human-gate/checkpoint/team-routing patterns into our design; don't adopt the product.

---

## Batch B synthesis notes

- All five manage the same object (local coding-agent CLI sessions) from different angles: TUI ergonomics (agent-manager), mobile/web reach + sandbox (AoE), planner/worker IDE (AO), chat lanes + cost analytics (squid), gated ticket pipeline (agx).
- Windows reality check: ONLY agent-orchestrator ships a native win32-x64 installer. agent-manager and AoE are WSL2-only (tmux/POSIX). squid and agx are unverified on Windows. Any adoption must respect RaidanOpenCode's native-Windows working environment.
- License posture: 3× MIT (AoE, squid, agx), 2× Apache-2.0 (agent-manager, AO — compatible, keep NOTICE).
- Highest-leverage takeaways: (1) AO's orchestrator-plans/workers-execute + fact-derived Kanban; (2) AoE's ACP structured view + plugin API + sandboxed-auth-volumes; (3) agx's human-gate decision layer + durable checkpoints; (4) squid's lane grammar + per-prompt cost attribution; (5) agent-manager's diff-review-comment→prompt loop.
- Warnings: telemetry defaults (agx ON, AO anonymous-documented); squid token-in-URL auth anti-pattern; single-maintainer risk on squid/agx.
