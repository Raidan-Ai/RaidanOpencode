# Source Research — Batch A

Date: 2026-08-23
Project: RaidanOpencode (unified OpenCode-based agent OS)
Method: webfetch of github.com repository pages (main page incl. rendered README). Read-only research; no code cloned or executed.

## Batch Summary

| Repo | Exists | License | Lang | Total | Verdict |
|---|---|---|---|---|---|
| darrenhinde/OpenAgentsControl | YES | MIT | Markdown/Bash/TS | 92 | ADAPT |
| asheshgoplani/agent-deck | YES | MIT | Go | 90 | ADAPT |
| 5dive-ai/5dive | YES | MIT | Bash/TS | 81 | REIMPLEMENT |
| 777genius/agent-teams-ai | YES | AGPL-3.0 | TypeScript/Electron | 73 | INSPIRE |
| buhuipao/agent-console | YES | MIT OR Apache-2.0 | Rust | 60 | INSPIRE |

---

## 1. darrenhinde/OpenAgentsControl

- Repository: OpenAgentsControl | Owner: darrenhinde | EXISTS: YES
- License: MIT — fully compatible with MIT project.
- Languages: Markdown (agents/context), Bash (installer/scripts), TypeScript tooling. Runtime: inside OpenCode CLI (also ships a BETA Claude Code plugin).
- Primary purpose: Plan-first AI coding workflow layer built directly on OpenCode: an approval-gated Propose→Approve→Execute→Validate→Ship pipeline plus a team-shareable "context system" that teaches agents your coding patterns with MVI (Minimal Viable Information) token efficiency.
- Architecture summary: pure markdown agent definitions under `.opencode/agent/{core,specialists}` + context library under `.opencode/context/` (files <200 lines, lazy loading, local-wins resolution with global fallback for core/ only). No daemon, no database — OpenCode IS the runtime.
- Agent model: main agents OpenAgent / OpenCoder / SystemBuilder + subagents ContextScout, TaskManager, CoderAgent, TestEngineer, CodeReviewer, BuildAgent, DocWriter, ExternalScout (live-docs fetcher), plus category specialists (frontend, devops, copywriter, technical-writer, data-analyst).
- Orchestration model: strictly sequential pipeline with delegation to specialists; explicitly anti-parallel (positions itself against Oh My OpenCode's autonomous parallelism).
- Task model: TaskManager decomposes complex features into atomic, verifiable subtasks with agent suggestions.
- Memory/context model: git-committed markdown context; `/add-context` wizard + `/add-context --update` versioning; claims ~80% token reduction; project-intelligence always resolved locally, core standards may fall back to global install.
- Team model: "team-ready" = shared committed context files inherited by new developers; no runtime teams or hierarchy.
- Process/terminal/workspace/git-worktree: none of its own — delegates entirely to OpenCode; can ingest context from worktrees, GitHub, URLs, local files.
- Model routing: YES — per-agent `model:` frontmatter (e.g. `anthropic/claude-sonnet-4-5`); any OpenCode provider; default inherits OpenCode default model.
- MCP: inherited from OpenCode (no own layer). A2A: no. Hooks/events: none documented. Human-in-the-loop: CORE FEATURE — mandatory approval gates before every write/edit/bash/delegation; explicitly rejects autonomy.
- Persistence: filesystem/git only. Observability: `evals/` directory; no metrics. UI: OpenCode TUI. Security: approval gates + SECURITY.md; no sandboxing.
- Platform support: macOS/Linux native (Bash 3.2+); Windows via Git Bash (recommended) or WSL — stated in FAQ. No native Win32.
- Installation method: `curl …/install.sh | bash -s developer` (bootstraps OpenCode if missing); `update.sh`; alternative Claude Code plugin marketplace install. Configuration: edit markdown frontmatter directly; local (`.opencode/`) vs global (`~/.config/opencode/`) install choice.
- Reusable components: MVI context-file format and size budgets (<100 concepts/<150 guides/<80 examples); ContextScout local-first resolution algorithm (max 2 globs, local wins, global fallback core-only); ExternalScout live-documentation pattern; SystemBuilder meta-agent that generates entire custom agent systems; approval-gate prompt language; agents-as-editable-markdown philosophy.
- Integration value for unified OpenCode-based agent OS: VERY HIGH — direct prior art for our agent/context layer; MIT markdown assets liftable near-verbatim.
- Duplication risk vs building our own orchestrator: HIGH — overlaps almost exactly with the agent-definition/context half of RaidanOpencode.
- Unique features: SystemBuilder generator; ExternalScout; always-approval stance; team pattern inheritance via git.
- Features to reject: sequential-only execution (we need parallel); no programmatic API/hooks; Windows only via Git Bash/WSL.
- SCORES (0-10): Architecture Fit 9 | OpenCode Fit 10 | Agent Relevance 9 | Documentation 8 | Maintenance 7 | Community 9 (4.8k stars, 386 forks) | Security 7 | Composability 8 | Integration Value 9 | Duplication Risk 8 | Installation Quality 8
- TOTAL_SCORE: 92
- VERDICT: ADAPT — mine its context system, MVI budgets, and approval-gate patterns directly into our OpenCode layer; treat as a donor library, not a competitor.

---

## 2. asheshgoplani/agent-deck

- Repository: agent-deck | Owner: asheshgoplani | EXISTS: YES
- License: MIT — fully compatible.
- Languages: Go 1.25; Runtime: Go binary driving tmux panes; optional Python bridge daemon; embedded web UI.
- Primary purpose: "Mission control" TUI for fleets of AI coding agents (Claude, OpenCode, Codex, Gemini, Pi…) across many projects: one terminal shows every session's live status, plus a phone-controlled Conductor that supervises the fleet and escalates to humans only when needed.
- Architecture summary: Go TUI over tmux; state DB under XDG dirs; web UI on 127.0.0.1:8420; Conductor = persistent agent session (CLAUDE.md/AGENTS.md identity, meta.json/state.json/task-log.md) watching other sessions; bridge.py connects Telegram/Slack; watcher "doorbells" (GitHub events, gmail, ntfy) wake the conductor.
- Agent model: tmux-hosted CLI sessions with custom-command support; per-session account/config; fork inherits conversation via each tool's native fork (Claude, OpenCode, Pi, Codex; Jujutsu repos too).
- Orchestration model: Conductor supervises workers — answers routine questions, auto-responds when confident, escalates otherwise; explicit parent linkage (`--parent`, `session children`); groups carry enforcement policy.
- Task model: implicit (sessions + parent linkage); groups enforce max_concurrent (serial vs bounded parallelism) and default_path.
- Memory/context model: state DB + preserved transcripts; shared agent-neutral POLICY.md/LEARNINGS.md; per-conductor task-log; stable-title semantics (title-lock vs agent-driven rename sync).
- Process/terminal/workspace/git-worktree: BEST-IN-CLASS worktree support — sibling/subdirectory/custom locations, sparse-checkout inheritance (git ≥2.32), bare repos (nested `.bare/` AND true-bare-at-root layouts), `.worktreeinclude` gitignored-file copying, setup/destruction scripts with env vars + 60s timeout, finish/cleanup/orphan sweep.
- Model routing: PARTIAL — per-group/per-conductor CLAUDE_CONFIG_DIR + env_file with precedence chain (env > conductor > group > profile > global > default); account switching migrates the conversation file; not a generic multi-provider matrix.
- MCP: YES — MCP Manager (attach/detach per session or global scope, automatic restart) plus MCP Socket Pool sharing MCP processes across all sessions via Unix sockets (85–90% memory reduction, ~3s crash auto-recovery).
- A2A: no formal protocol (conductor messaging instead). Hooks/events: watcher templates; tmux status-bar notification bar. HITL: waiting-status detection, phone escalation via bridges, archive/restore, 30-second undo on delete.
- Persistence: XDG config/data/state; `.agent-deck/skills.toml` project state; state DB. Observability: Cost Dashboard, global search across all conversations, status polling (running/waiting/idle/error). UI: TUI + web. Security: optional Docker sandbox (project bind-mounted RW, host tool auth shared into container, Keychain extraction on macOS), SECURITY.md.
- Platform support: macOS, Linux, Windows (WSL) — README-stated; WSL required on Windows, no native Win32.
- Installation method: curl|bash script, Homebrew tap, `go install`, source `make install`; `agent-deck uninstall`. Configuration: `$XDG_CONFIG_HOME/agent-deck/config.toml` (declarative groups, worktree, fork, docker, keys, profiles).
- Reusable components: Conductor pattern; MCP socket-pool; worktree lifecycle (setup/destruction hooks, .worktreeinclude semantics); group-policy model (concurrency/default_path/config precedence chain); fork-with-state defaults; watcher event doorbells; declarative additive group reconciliation.
- Integration value: HIGH — closest existing blueprint for a unified agent-OS control plane; OpenCode explicitly supported including native fork.
- Duplication risk vs building our own orchestrator: HIGH — conductor/fleet/worktree layers overlap heavily with what RaidanOpencode must build.
- Unique features: socket-pooled MCP processes; per-account conversation migration; Jujutsu support; Telegram/Slack bridges with name-routing; skills pool materialization into `.claude/skills`.
- Features to reject: tmux dependency (blocks native Windows); Go/TUI-centric surface (we want OpenCode-native + headless APIs); Claude-specific config plumbing.
- SCORES (0-10): Architecture Fit 8 | OpenCode Fit 8 | Agent Relevance 9 | Documentation 9 | Maintenance 9 (2,886 commits) | Community 8 (775 stars, Discord) | Security 7 | Composability 7 | Integration Value 9 | Duplication Risk 7 | Installation Quality 9
- TOTAL_SCORE: 90
- VERDICT: ADAPT — port its conductor, worktree-lifecycle, and MCP-pool designs into our OpenCode-native stack rather than adopting the Go/tmux binary wholesale.

---

## 3. 5dive-ai/5dive

- Repository: 5dive | Owner: 5dive-ai | EXISTS: YES
- License: MIT — fully compatible.
- Languages: Bash (CLI/orchestrator), TypeScript helpers; Runtime: systemd + tmux + SQLite + cron on Linux.
- Primary purpose: Run a "company" of AI agents on a server you own: each agent is its own Linux user running an official coding CLI as a systemd service; agents coordinate through one bash CLI (the bus) off a shared SQLite backlog, pinging your phone only when a human must decide.
- Architecture summary: deliberately OS-as-platform — "No framework, no protocol, no broker": unix users = identity/isolation, systemd = supervision, journald = logs, SQLite = task queue, cron = heartbeat, shared filesystem + shared CLI = message bus. Declarative `5dive.yaml` compose; team templates; character-pack marketplace.
- Agent model: named agents wrapping claude/codex/antigravity/grok/devin/hermes/openclaw/opencode/pi CLIs; BYO Anthropic-compatible `--base-url`; accounts = shared auth profiles with automatic rebinding across agents.
- Orchestration model: org-chart reporting; maker→verifier task handoffs; `goal add` compiles outcomes into guarded task graphs; bounded autonomous loops; Council adversarial review (seats/chair/threshold/veto=human); `company` one-command self-steering org.
- Task model: SQLite DIVE-* rows with assignee/verifier; recurring cron-materialized templates; `need --type=approval` human gates answered via Telegram tap-to-answer buttons; `trace` gives causal timeline origin→verdict.
- Memory/context model: durable team memory with provenance (`memory search`); daily self-update restart mitigates context rot ("session resets, knowledge stays").
- Process/terminal/workspace/git-worktree: strong process ops (start/stop/restart/logs/tui/watch); git handled via DELEGATED PUSH — your own GitHub App lends a repo-scoped short-lived token atomically inside a root-only helper; gate-gated, single non-protected branch, fail-closed committer-author scan; the agent never holds a credential.
- Model routing: YES, extensive — per-agent type/provider/model/effort tiers; live model switching persisted across restarts; background-tier cheap defaults.
- MCP: not featured. A2A: `5dive acp` exposes agents over Agent Client Protocol (Zed/Buzz clients). Hooks/events: heartbeat wake, watchers. HITL: CORE — human gates with recommendation + options, escalation tiers, public "zero-human" releases-vs-escalations ratio badge.
- Persistence: SQLite queue; journald logs; memory store. Observability: `watch` (htop-style live view), read-only loopback web UI, `--json` on every command with `{ok,data|error}` contract. UI: CLI + minimal web. Security: three isolation tiers (standard/admin/sandboxed: own home, no sudo, systemd resource limits); no telemetry; tokens never reach vendor.
- Platform support: LINUX ONLY — systemd required (Ubuntu 22.04+ recommended), root installer. NO native Windows/macOS — hard blocker for our win32 host.
- Installation method: `curl -fsSL https://install.5dive.ai | sudo bash`; `sudo 5dive init` wizard; Docker. Configuration: `5dive.yaml` + CLI verbs.
- Reusable components: unix-user-per-agent isolation model; gate-gated delegated-push design; Council adversarial-review protocol with human veto; goal→guarded-task-graph compiler; provenance-tagged durable memory; uniform JSON CLI contract; heartbeat wake pattern; team-template import.
- Integration value: HIGH conceptually, LOW operationally — best security/orchestration thinking, but cannot run on Windows; concepts must be rebuilt platform-neutrally.
- Duplication risk vs building our own orchestrator: HIGH — queue, gates, routing, and org chart duplicate our planned orchestrator core.
- Unique features: delegated GitHub App push; Council with human veto seat; measurable zero-human autonomy metric.
- Features to reject: Linux/systemd coupling; sudo-curl installer posture; privileged Docker fallback.
- SCORES (0-10): Architecture Fit 6 | OpenCode Fit 7 | Agent Relevance 9 | Documentation 9 | Maintenance 8 | Community 5 (54 stars) | Security 9 | Composability 7 | Integration Value 7 | Duplication Risk 7 | Installation Quality 7
- TOTAL_SCORE: 81
- VERDICT: REIMPLEMENT — treat it as the specification for our isolation tiers, human gates, delegated push, and council review; rebuild those mechanisms Windows-portable on OpenCode.

---

## 4. buhuipao/agent-console

- Repository: agent-console | Owner: buhuipao | EXISTS: YES
- License: Dual MIT OR Apache-2.0 — fully compatible.
- Language: Rust; Runtime: single native TUI binary (crates.io).
- Primary purpose: Local terminal control plane for Codex and Claude Code sessions: discovers recent sessions, shows working/waiting/idle/failed state, resumes the NATIVE agent UI, keeps persistent shells beside each agent in its own workspace.
- Architecture summary: single Rust binary; PTY-owned child processes with a 128 KiB daemon replay-tail reconnect transport; up to 2,000 scrollback rows; local state under `~/.local/state/agent-console`. No server, no database beyond local state.
- Agent model: external CLIs (codex/claude) launched or resumed; only processes IT launched are reconnectable.
- Orchestration model: NONE — monitoring/navigation only (jump-to-alert, search, archive/restore).
- Task model: none. Memory/context model: reads provider transcript/session stores for titles, summaries; summaries generated out-of-band by the same provider.
- Team model: none.
- Process/terminal/workspace/git-worktree: excellent PTY craft — globally reserved chords Ctrl-\ / Ctrl-^ / Ctrl-Q chosen because Codex/Claude leave them free; Codex run with `--no-alt-screen`; focus cycling Agent↔Shell↔Sessions.
- Model routing: NO — provider launch wrappers via TOML config only.
- MCP: no. A2A: no. Hooks/events: alert system for waiting/approval states. HITL: surfaces "waiting on approval" sessions and jumps you straight into the native approval UI.
- Persistence: local state dir. Observability: status detection + `doctor` preflight. UI: TUI only. Security: takeover requires explicit force; macOS builds signed + notarized; no sandboxing.
- Platform support: macOS Intel/ARM (signed/notarized), Linux x86_64/arm64, Windows 10+ x86_64 MSVC zip — explicit tri-platform evidence including a Windows executable.
- Installation method: GitHub release archives; `cargo install agent-console`; `make install` with atomic rename; `doctor` verifies prerequisites. Configuration: TOML file + env vars.
- Reusable components: session-discovery/status-heuristic design; reserved-key-chord strategy; atomic binary-upgrade practice; doctor-style preflight; alert-jump UX; workspace-shell pairing concept.
- Integration value: MODERATE — patterns transfer well; code less useful (Codex/Claude-specific, no OpenCode support).
- Duplication risk: MODERATE-HIGH (score 6) — a fleet dashboard is on our roadmap.
- Unique features: native-resume philosophy; per-provider wrapper config; paired workspace shells; strict chord hygiene.
- Features to reject: two-provider lock-in; no scripting/API surface; zero orchestration capability.
- SCORES (0-10): Architecture Fit 5 | OpenCode Fit 3 | Agent Relevance 6 | Documentation 8 | Maintenance 5 (27 commits) | Community 3 (15 stars) | Security 6 | Composability 4 | Integration Value 5 | Duplication Risk 6 | Installation Quality 9
- TOTAL_SCORE: 60
- VERDICT: INSPIRE — copy the UX contracts (status taxonomy, reserved chords, doctor preflight, alert-jump) into our own control plane; do not adopt the Rust binary.

---

## 5. 777genius/agent-teams-ai

- Repository: agent-teams-ai | Owner: 777genius | EXISTS: YES
- License: AGPL-3.0 — NOT compatible with embedding in an MIT project; any code reuse would impose copyleft obligations on RaidanOpencode. Study/ideas only.
- Languages: TypeScript (Electron 40, React 19, Zustand 4, Tailwind 3); Runtime: Electron desktop app + Bun-run orchestrator + pnpm monorepo.
- Primary purpose: Free desktop app where you assemble AI agent TEAMS that autonomously plan, delegate, message each other, and peer-review work while you watch a live kanban board; spans Claude Code, Codex, OpenCode, Cursor, SuperGrok, Copilot, Z.AI, MiniMax, Kiro.
- Architecture summary: Electron main/renderer with feature-sliced `src/features`; separate orchestrator CLI process run via Bun; bundled `mcp-server` package; vendored terminal-platform for PTY; standalone HTTP dashboard (explicitly unauthenticated — local/trusted-network only).
- Agent model: teammates = auto-detected/connected runtimes with defined roles; Solo mode; per-teammate branch strategy (main checkout OR dedicated git worktree).
- Orchestration model: lead-agent delegation onto a 5-column kanban; linked/blocking tasks; cross-team messaging (@team-name); nested Organizations (departments/squads) with a live org map; guarded "nudge" system (rate-limited wake-ups for stalled sync, rate-limit cooldown auto-resume).
- Task model: rich — attachments, comments, `#task-id` references, workflow-history timeline, smart session-log↔task matching, per-hunk diff review (accept/reject/comment).
- Memory/context model: post-compact context recovery (re-injects team-management instructions after runtime compaction); context monitoring by category with window share and estimated cost; task context persists via descriptions/comments/attachments.
- Team model: first-class — multiple teams per project, organizational hierarchy, member performance stats, cross-team collaboration.
- Process/terminal/workspace/git-worktree: integrated visual PTY terminal; per-agent CPU/RAM history; built-in Git-aware code editor; teammate backend = app-managed processes.
- Model routing: YES — provider connection UI, token/cost analytics across team/agent/task/project/model/runtime/session/command/run dimensions, monthly budgets with 80%/100% alerts and HARD CAPS on scheduled runs.
- MCP: YES — bundled mcp-server plus extensible plugins. A2A: informal. Hooks/events: notification triggers. HITL: configurable autonomy spectrum — fully autonomous ↔ per-action approval notifications; built-in review workflow.
- Persistence: local app state; no cloud code storage (stated). Observability: deep session analysis, per-task execution logs, usage trends/forecasts. UI: polished desktop GUI with 29 interface languages. Security: IPC/HTTP boundary validation, path-traversal blocked, writes constrained to selected project root, SECURITY.md, Dependabot; HTTP dashboard lacks authentication (documented warning).
- Platform support: FULL TRI-PLATFORM — Windows Setup.exe, macOS dmg, Linux AppImage/deb/rpm/pacman.
- Installation method: per-OS installers from GitHub Releases; from source: Node 24.16 LTS + pnpm 10+. Configuration: in-app wizards; env overrides.
- Reusable components (design-level ONLY due to AGPL): kanban + per-hunk review UX; budget hard-cap model; nudge/auto-resume policies; post-compact context recovery; organization-hierarchy data model; context-category monitoring.
- Integration value: LOW for code (license barrier), MEDIUM as UX/product specification for our future GUI layer.
- Duplication risk: HIGH (score 8) — functionally the "unified agent OS GUI + orchestration" we plan to build.
- Unique features: mixed-runtime teams including IDE agents; free no-auth onboarding; 29-language i18n; per-hunk code review.
- Features to reject: AGPL licensing; Electron monolith architecture; unauthenticated HTTP dashboard.
- SCORES (0-10): Architecture Fit 4 | OpenCode Fit 6 | Agent Relevance 9 | Documentation 8 | Maintenance 9 (4,425 commits, v2.7.0) | Community 8 (2.0k stars, Discord) | Security 6 | Composability 3 | Integration Value 4 | Duplication Risk 8 | Installation Quality 8
- TOTAL_SCORE: 73
- VERDICT: INSPIRE — the AGPL license bars any code adoption; harvest interaction patterns (hunk review, budgets, nudges, context recovery) for our own MIT implementation.

---

## Critical Warnings

1. **LICENSE TRAP**: 777genius/agent-teams-ai is AGPL-3.0. Zero code, config, or asset reuse is permissible in RaidanOpencode (MIT). Design inspiration only.
2. **PLATFORM BLOCKER**: 5dive-ai/5dive requires Linux + systemd + root installer. It cannot run on our Windows host (win32). Concepts must be reimplemented portably.
3. **WINDOWS GAPS**: agent-deck supports Windows only via WSL; OpenAgentsControl only via Git Bash/WSL. Only agent-console (native MSVC binary) and agent-teams-ai (Electron installer) ship true native Windows artifacts.
4. All five repositories EXIST and were verified via live fetch; none were NOT_FOUND.
5. Highest-value donors for an OpenCode-native agent OS: OpenAgentsControl (agent/context layer, MIT, 4.8k stars) and agent-deck (fleet/conductor/worktree/MCP-pool patterns, MIT).
