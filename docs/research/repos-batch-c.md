# Source Research — Batch C

**Date:** 2026-08-23

| Repo | Exists | License | Lang | Purpose (5 words) | Total | Verdict |
|---|---|---|---|---|---|---|
| rustykuntz/clideck | YES | MIT | JS/Node | Dashboard for multiple CLI agents | 73 | ADAPT |
| 23blocks-OS/ai-maestro | YES | MIT | TS/Next.js | Agent org OS dashboard | 72 | INSPIRE |
| zeronsh/comet (Zeron) | YES | MIT | Rust+TS | Multi-device agent controller | 66 | INSPIRE |
| kdlbs/kandev | YES | **AGPL-3.0** | Go+React | Kanban agent orchestration IDE | 89 | WRAP |
| ZaxbyHub/opencode-swarm | YES | MIT | TS/Bun | OpenCode gated agent swarm | 98 | ADOPT |

---

## 1. rustykuntz/clideck

- Repository: clideck | Owner: rustykuntz | EXISTS: YES (152★, 25 forks, 198 commits)
- License: MIT — fully compatible.
- Languages: JavaScript (Node.js, flat module layout — server.js, handlers.js, bridges) | Runtime: Node 18+
- Primary purpose: Local browser dashboard for running multiple AI CLI agents (Claude Code, Codex, Gemini CLI, OpenCode, Pi, Shell) in one window without terminal juggling. Deliberately does NOT sit between agent and terminal — only watches lightweight status signals; keys pass straight to the real PTY.
- Architecture: Node server spawning real PTYs (node-pty) + xterm.js/Tailwind browser frontend at localhost:4000. Per-agent bridges (`opencode-bridge.js`, `claude-session.js`, `codex-hooks.js`); transcript parser/normalizer; plugin loader; themes; single-instance lock.
- Agent model: external CLI agents in native terminals; per-agent status detection (working/idle/waiting); automatic session-ID capture enabling resume.
- Orchestration model: optional "Autopilot" plugin routes work between agents; signature feature `clideck ask --session X --message Y` — injects a question into another live session's terminal, waits for completion, returns the answer as command output. Busy targets NOT queued (explicit busy response). Cross-project addressing via `@project/Session`.
- Task model: none formal — projects grouping, prompt library, session search.
- Memory/context model: parsed transcripts from agent-native session storage; no own DB; resume via captured session IDs.
- Team model: named sessions within projects; no roles/teams.
- Process/terminal/workspace/git-worktree: native PTY per session; no worktree management.
- Model routing: NO. MCP: no own layer; ships `opencode-plugin/` + `skills/` dirs → direct OpenCode extension point exists. A2A: no standard (ask-another-session is de-facto channel).
- Hooks/events: codex hooks module; plugin API; browser+sound notifications on completion. HITL: human drives every session; Autopilot opt-in.
- Persistence: filesystem only. Observability: live status, previews, activity feed. UI: browser dashboard, 15 themes + CLI helpers. Security: E2E-encrypted mobile relay, no account, fully local claims.
- Platforms: macOS, Linux, **Windows 10 1809+ explicitly supported** — rare and valuable.
- Installation: `npm install -g clideck` / `npx clideck`. Configuration: config.js + agent-presets.json; plugin/theme system.
- Reusable components: OpenCode bridge/plugin wiring; ask-protocol (busy semantics, timeouts, scoping); status-signal detection taxonomy; transcript normalization.
- Integration value: good as optional cockpit/UI layer; not a core substrate. Duplication risk: moderate-low (4).
- Unique features: E2E mobile relay; cross-session consult; zero-middleman philosophy; broadest Windows support in batch.
- Features to reject: Autopilot routing (superseded by real orchestrator); flat JS architecture for anything larger.
- SCORES: ArchFit 6 | OC-Fit 7 | AgentRel 8 | Docs 7 | Maint 7 | Comm 5 | Sec 7 | Comp 6 | IntegVal 7 | DupRisk 4 | InstallQ 9
- TOTAL_SCORE: 73 — VERDICT: ADAPT — lift the OpenCode bridge, ask-protocol, and status-detection patterns; skip the app shell.

---

## 2. 23blocks-OS/ai-maestro

- Repository: ai-maestro | Owner: 23blocks-OS | EXISTS: YES (754★, 1,056 commits, v0.36.36)
- License: MIT — compatible.
- Languages: TypeScript (Next.js app + services) | Runtime: Node 18+, **tmux required**, PM2
- Primary purpose: Self-described "OS for AI-first organizations": one dashboard managing any terminal AI agent across multiple machines with persistent memory, code graph, and agent-to-agent messaging. Born from running 35–80 agents where the human became the message bus.
- Architecture: Next.js web app (:23000) + services layer; four deployment modes (tmux local, Docker, AWS EC2, ECS Fargate — Terraform-managed); peer-to-peer machine mesh, no central server; Claude Code plugin as git submodule; CozoDB + ts-morph code graph with delta indexing.
- Agent model: agent-agnostic (Claude Code, Codex, Aider, Cursor, OpenClaw, Hermes, Droid, scripts); auto-discovers tmux sessions; cryptographic AID identities.
- Orchestration model: human-centric dashboard plus AMP (Agent Messaging Protocol, agentmessaging.org) — email-like agent↔agent messages with priority, types, crypto signatures. Gateways connect Slack/Discord/Email/WhatsApp with **34 prompt-injection patterns filtered at gateway before agents see input**.
- Task model: Kanban board, 5 columns, dependencies, cross-machine teams; split-pane "war room" meetings.
- Memory/context model: three layers — persistent conversation/decision memory; Code Graph (CozoDB, delta-indexed); auto-generated searchable documentation.
- Team model: explicit teams, meetings, roles ("Lola" chief-of-staff reference framework).
- Process/terminal/workspace: tmux sessions primary; Docker resource limits; cloud via EC2/Fargate. No git-worktree handling documented.
- Model routing: NO. MCP: not prominent. A2A: proprietary AMP/AID/AAP stack (NOT Google A2A).
- Hooks/events: push notifications; gateway routing events. HITL: human orchestrates; no formal approval gates.
- Persistence: local stores + CozoDB graph; mesh-synced. Observability: presence/status dashboard; thin formal observability. UI: Next.js SPA + xterm.js terminals + mobile view. Security: SECURITY.md, AMP signatures, gateway injection filter, AID keys.
- Platforms: macOS + Linux native; **Windows ONLY via WSL2**.
- Installation: `curl …remote-install.sh | sh` or manual `yarn dev`. Configuration: .env.example, PM2 ecosystem file.
- Reusable components: AMP message-envelope/signature design; gateway prompt-injection pattern list; multi-machine mesh concept; Kanban/war-room UX; code-graph delta indexing idea; AID identity notion.
- Integration value: conceptual/design-level; stack conflicts with OpenCode-native core. Duplication risk: HIGH (8).
- Unique features: peer mesh multi-machine; open protocol triad; organizational gateways with pre-agent injection screening.
- Features to reject: hard tmux dependency; WSL2-only Windows; monolithic Next.js app; proprietary protocol lock-in vs MCP/A2A standards.
- SCORES: ArchFit 5 | OC-Fit 4 | AgentRel 9 | Docs 9 | Maint 8 | Comm 7 | Sec 6 | Comp 4 | IntegVal 6 | DupRisk 8 | InstallQ 6
- TOTAL_SCORE: 72 — VERDICT: INSPIRE — mine AMP envelopes, gateway injection filters, mesh and Kanban-team concepts; do not integrate the stack.

---

## 3. zeronsh/comet (product: "Zeron")

- Repository: comet | Owner: zeronsh | EXISTS: YES (1.1k★, 812 commits)
- License: MIT — compatible.
- Languages: Rust (engine/UI, gpui pinned to Zed rev) + TypeScript (Cloudflare Worker edge) | Runtime: single Rust binary (tokio), headed or headless
- Primary purpose: Multi-device controller for coding agents (Claude Code, Codex) — local-first by default, optional CRDT sync lets you start an agent on one device and drive/resume from another (VPS headless + laptop UI).
- Architecture: gpui viewport ↔ typed RPC ↔ Rust engine (sessions, harnesses, repos/worktrees, terminals, uploads, auth) ↔ optional edge: Cloudflare Durable Objects relaying **Loro CRDT docs**; SQLite snapshot store; on-disk run journals with crash auto-resume.
- Agent model: `Harness` trait — claude-code via stream-json subprocess (control protocol for permissions), codex via app-server JSON-RPC / `codex exec --json`; steering mailbox at step/turn boundaries.
- Orchestration model: durable command queue inside session doc — send/steer/interrupt/offline-queued commands executed only by chat's host device (mark-processed-before-execute idempotence); 10-min stall watchdog.
- Task model: chat/session-centric; "spaces" = (device, folder) pairs.
- Memory/context model: Loro CRDT transcripts, command ledger with dedupe/TTL/supersede, registry snapshot; strict Local/Synced/Development profile stores.
- Team model: none — single user, multi-device.
- Process/terminal/workspace/git-worktree: portable-pty terminals (1MB replay, detach≠close); **worktrees under ~/.zeron/worktrees**; git-subprocess diff capture (sha256, caps); fs watchers with repair.
- Model routing: PARTIAL — per-harness model/reasoning catalogs. MCP: no. A2A: no.
- Hooks/events: engine pub/sub hubs; presence frames; nudges wake sleeping hosts. HITL: permission prompts via QuestionPanel; human-driven throughout.
- Persistence: SQLite snapshots + Loro docs + run journals. Observability: replayable journals. UI: native gpui always-dark app; `zeron headless`. Security: WorkOS JWKS auth via edge; credential-slot swap (macOS Keychain); **scope machine prevents sign-in from silently swapping databases or attaching transports to local runtime**; attachments jailed per profile root.
- Platforms: Linux + macOS. **WINDOWS: NO evidence of support anywhere** — treat as unsupported.
- Installation: install.sh daemon; `zeron status/update`, `zeron daemon start|stop`. Configuration: workspace profiles, ui-settings.json.
- Reusable components: CRDT session-doc + command-ledger design; steering mailbox; host-gated executor with idempotent processed-ledger; worktree manager; subprocess harness protocol patterns; Local/Synced scope-separation discipline (auth ≠ storage boundary).
- Integration value: medium-high design reference; near-zero code reuse (Rust/gpui vs TS stack). Duplication risk: LOW-MEDIUM (3).
- Unique features: Loro CRDT multi-device convergence; offline durable command queue; headless-VPS-driving model; rigorous privacy-boundary engineering.
- Features to reject: gpui frontend; mandatory Cloudflare Durable Objects for sync; WorkOS dependency; no-Windows posture.
- SCORES: ArchFit 7 | OC-Fit 3 | AgentRel 7 | Docs 8 | Maint 7 | Comm 6 | Sec 8 | Comp 5 | IntegVal 6 | DupRisk 3 | InstallQ 6
- TOTAL_SCORE: 66 — VERDICT: INSPIRE — steal the CRDT command ledger, steering mailbox, and auth/storage scope separation; leave the Rust binary alone.

---

## 4. kdlbs/kandev

- Repository: kandev | Owner: kdlbs | EXISTS: YES (679★, 95 forks, 2,691 commits, very active, Discord)
- License: **AGPL-3.0** ⚠️ — NOT compatible with MIT for copied/linked code; safe only as an unmodified separately-hosted service or pure inspiration.
- Languages: Go backend + TypeScript/Vite React SPA + Tauri desktop shell | Runtime: Go server; Node 24/pnpm builds; Docker optional
- Primary purpose: AI Kanban & development environment: parallel task execution across 21+ coding agents with review gates, integrated IDE workspace (editor/LSP, terminal, browser preview, git changes), PR shipping. Server-first, self-hostable, explicitly no telemetry.
- Architecture: Web UI → Go orchestrator → pluggable executors (**Local Process, Docker, SSH remote, sprites.dev cloud**; K8s planned). All structured agents speak **ACP (Agent Client Protocol)** — including **OpenCode natively (`opencode-ai`)**; non-ACP TUIs run via CLI-passthrough PTY mode. SQLite + git worktrees under `~/.kandev`.
- Agent model: Claude Code, Codex, Copilot, Gemini, Amp, Auggie, **OpenCode**, Cursor, Devin, Qwen, Droid, iFlow, Kilocode, Pi, Kimi, Kiro, Qoder, Trae, Oh My Pi, Grok, Hermes; managed-runtime updates refresh advertised models/modes.
- Orchestration model: agentic workflows = multi-step pipelines mixing agents per step (Opus plans → Copilot implements → Codex reviews); sub-tasks resume parent session; parallel tasks; workflow YAML export/import.
- Task model: Kanban boards/columns/automation; **multi-repo tasks** (one worktree per repo, per-repo branches/PRs, grouped Changes panel); integrations pull issues from GitHub/Jira/Linear/GitLab.
- Memory/context model: session resume/review; **Task-agent MCP** lets agents create subtasks, message sibling tasks, read conversations, attach extra branches; redacted shareable Gist snapshots.
- Team model: shared team workflows; "Office mode" (feature-flagged): agent instances with roles/permissions, inbox/approvals, routines, budgets, cost tracking.
- Process/terminal/workspace/git-worktree: **git worktrees isolate concurrent agents**; embedded terminal; Docker isolation; SSH/cloud executor profiles.
- Model routing: YES (step-level) — different agent/model per workflow step. MCP: dual-direction — internal Task-agent MCP AND External MCP (streamable HTTP/SSE) so outside agents can manage kandev. A2A: no (ACP is interop layer).
- Hooks/events: workflow automation columns; real-time WebSocket subscriptions. HITL: review-first doctrine — review gates, Changes panel, humans decide what ships; Office mode adds approvals inbox.
- Persistence: SQLite + worktrees. Observability: productivity stats, debug-log guide, resource metrics. UI: Web SPA (Monaco, xterm.js, dockview) + Tauri desktop; phone via Tailscale/VPN. Security: no-telemetry pledge, secrets management, container isolation, self-host only.
- Platforms: macOS + Linux (Homebrew formula), **Windows NATIVE via Scoop bucket** plus WSL; universal NPX bundles. Strongest cross-platform story in this batch.
- Installation: brew | scoop | npx | nightly | make start. Configuration: profiles.yaml, rich Settings UI.
- Reusable components: ACP/OpenCode adapter reference; executor abstraction (local/docker/ssh/cloud); multi-repo worktree-per-task scheme; bidirectional MCP surfaces; portable workflow YAML; Office-mode role/approval sketch.
- Integration value: HIGH conceptually — closest existing thing to the unified agent OS goal, first-class OpenCode support. Duplication risk: HIGH (9).
- Unique features: ACP-native 21-provider breadth; multi-repo tasks; CLI passthrough preserving native TUIs; sprites.dev cloud executor; AGPL-clean no-telemetry stance.
- Features to reject: any code copying (AGPL); adopting wholesale duplicates our OS.
- SCORES: ArchFit 8 | OC-Fit 8 | AgentRel 10 | Docs 8 | Maint 9 | Comm 7 | Sec 7 | Comp 6 | IntegVal 8 | DupRisk 9 | InstallQ 9
- TOTAL_SCORE: 89 — VERDICT: WRAP — usable today as external unmodified service (AGPL-safe if never linked/copied); otherwise mine its ACP/executor/workflow designs.

---

## 5. ZaxbyHub/opencode-swarm

- Repository: opencode-swarm | Owner: ZaxbyHub | EXISTS: YES (451★, 47 forks, 3,981 commits, release-please automation, 6000+ tests badge)
- License: MIT — fully compatible.
- Languages: TypeScript | Runtime: Bun, loaded as an **OpenCode plugin**
- Primary purpose: Turns a single OpenCode session into an architect-led team of ~19 specialized agents (core/optional/conditional) with a gated pipeline — nothing ships without reviewer + test-engineer approval. Adds offline security scanning, scope enforcement, shell write detection.
- Architecture: plugin registering architect/explorer/coder/reviewer/test_engineer/critic/sme/docs/designer/council agents; all state under `.swarm/` (plan-ledger.jsonl as source of truth, context.md, evidence/, telemetry.jsonl, scopes/); AutomationEventBus; PR Monitor via `gh` CLI polling; sandbox runner; tree-sitter validation across 20 grammars.
- Agent model: role-specialized subagents coordinated by architect; per-agent model overrides + fallback_models; works on OpenCode Zen free tier.
- Orchestration model: gated pipeline (plan → critic gate → coder → reviewer → test_engineer → regression sweep, failures loop back with structured feedback); phase-completion + drift-verifier gates; session modes Balanced/Turbo/**Lean Turbo (parallel lanes in isolated worktrees for provably file-disjoint tasks)**/Full-Auto (deterministic policy + critic_oversight as sole quality gate, fail-closed denials, pause-on-repeat); **PRM detects repetition loops, ping-pong, expansion drift, stuck-on-test, context thrashing** with escalation levels up to hard stop.
- Task model: phased plans in append-only ledger; serial fallback when scopes overlap; resumable sessions (RESUME→EXECUTE if `.swarm/` exists).
- Memory/context model: `.swarm/plan-ledger.jsonl`, technical-decision context.md with cached SME guidance, curator summaries + drift reports, skill-usage.jsonl with relevance scoring/compliance rates; Context Budget Guard warns at 70%/critical at 90% of live model window.
- Team model: internal role roster + optional General Council (generalist/skeptic/domain-expert deliberation returning verdicts to architect).
- Process/terminal/workspace/git-worktree: Lean-Turbo parallel worktree lanes; **blocks interactive sessions** (tmux/screen/watch/Start-Process); static shell-write analysis for POSIX (bash-parser AST) **and PowerShell/cmd regex heuristics**.
- Model routing: YES — per-role provider/model strings + automatic transient-error fallback chains.
- MCP: host OpenCode supplies MCP; ships opt-in **external skill curation pipeline**: discovery → quarantine → 3-gate validation (12 prompt-injection patterns, 25 unsafe-instruction patterns, SHA-256 provenance integrity) → evaluation → promotion, disabled by default.
- A2A: no. Hooks/events: AutomationEventBus; strict-mode slop-detector + incremental-verify hooks; per-agent circuit breakers (200 tool calls, 30 min, 10× same tool, 5 consecutive errors).
- HITL: explicit autonomy ladder — auto-proceed toggle, Full-Auto routes ambiguous/high-risk actions through read-only critic_oversight, governed Skill Optimizer requires manual --confirm + expected-content-hash, external skills opt-in only.
- Persistence: `.swarm/` JSONL/markdown; scope files with TTL expiry, symlink guards (O_NOFOLLOW + realpath containment), fail-closed schema versioning. Observability: telemetry.jsonl (local), `/swarm evidence|diagnose|status`. UI: slash commands inside OpenCode. Security: SAST (68 rules/8 languages, offline), secrets scan, CycloneDX SBOM, placeholder scan, quality budgets, destructive-command blocking scoped to declared paths, ransomware/fork-bomb patterns blocked.
- Platforms: wherever OpenCode+Bun run — macOS/Linux/**Windows** (PowerShell/cmd write detection implemented; %LOCALAPPDATA%/%APPDATA% paths documented).
- Installation: `bunx opencode-swarm install` (registers plugin, writes global+project config, disables conflicting native explore/general agents); `bunx opencode-swarm update` clears plugin caches.
- Reusable components: effectively the whole plugin — guardrails, scope enforcement, shell-write detection, PRM, quality gates, critic roster, skill quarantine pipeline, file-authority matrix, circuit breakers.
- Integration value: VERY HIGH — IS an OpenCode-native orchestration layer; candidate backbone for unified agent OS. Duplication risk: VERY HIGH (10).
- Unique features: Windows-shell write detection; governed skill optimizer with hash-chained lifecycle; external-skill quarantine; PRM failure-pattern taxonomy; General Council deliberation.
- Features to reject: installer silently disables native explore/general agents (surprising side effect — audit before adopting); some schema fields documented-but-not-enforced; heavy config surface; command-name collisions mitigated by ⚠️ help warnings.
- SCORES: ArchFit 9 | OC-Fit 10 | AgentRel 10 | Docs 9 | Maint 9 | Comm 6 | Sec 9 | Comp 8 | IntegVal 10 | DupRisk 10 | InstallQ 8
- TOTAL_SCORE: 98 — VERDICT: ADOPT — MIT, OpenCode-native, actively maintained; evaluate as orchestration backbone rather than rebuilding equivalent gates.

---

## Batch C Critical Warnings

1. **LICENSE TRAP — kandev is AGPL-3.0.** Zero code may be copied or linked into MIT RaidanOpencode. Only permissible as unmodified separately-hosted external service or pure design inspiration.
2. **Windows gaps:** comet/Zeron shows no Windows support (Linux/macOS only). ai-maestro is WSL2-only (tmux). Only clideck (Win10 1809+), kandev (native Scoop), opencode-swarm (PowerShell/cmd-aware) treat Windows first-class.
3. **opencode-swarm installer side effects:** silently disables OpenCode's native explore/general agents and asserts global config — audit the diff before adopting; stale versions persist until `update` clears plugin cache.
4. **Telemetry:** kandev and clideck advertise zero-telemetry/local-only. opencode-swarm's telemetry.jsonl is local-file only. ai-maestro cloud modes and comet sync move data off-device — opt-in but verify defaults.
5. **Protocol fragmentation:** ai-maestro AMP/AID/AAP are proprietary ecosystems — lock-in. kandev standardizes on ACP (OpenCode speaks natively). Prefer ACP/native-OpenCode surfaces over AMP.
6. **Security note:** ai-maestro curl|sh installer + PM2-managed long-running dashboard warrants supply-chain review; re-implement its 34-pattern gateway injection filtering natively rather than trusting wholesale.
7. **Maintenance concentration:** opencode-swarm (single org, 131 open issues), comet (milestones incomplete) — pin versions, vendor critical pieces accordingly.
