# Source Research — Batch D

Date: 2026-08-23

## Summary Table

| Repo | Exists | License | Lang | Purpose(5 words) | Total | Verdict |
|---|---|---|---|---|---|---|
| nimbalyst/nimbalyst | ✅ | MIT | TS/Electron + Swift | Visual workspace for coding agents | 77 | ADAPT |
| DietrichGebert/ponytail | ✅ | MIT | Markdown + JS hooks | Minimal-code discipline ruleset, 20 hosts | 91 | ADOPT |
| ruvnet/agentic-flow | ✅ | MIT | TypeScript/Node | Self-learning agents, LLM cost router | 64 | INSPIRE |
| bytedance/deer-flow | ✅ | MIT | Python + Next.js | Super agent harness, research/code/create | 79 | ADAPT |
| ruvnet/ruflo | ✅ | MIT | TypeScript + Rust | Agent meta-harness, swarms, federation | 86 | REIMPLEMENT |

Critical warnings: ruflo/agentic-flow share author with overlapping features (ruflo 68.9k★ supersedes agentic-flow 797★); benchmark claims unaudited. deer-flow Windows support dev-only via Git Bash. ponytail ships a native OpenCode plugin — immediate zero-risk adopt.

---

## 1. nimbalyst/nimbalyst

- Repository: nimbalyst | Owner: nimbalyst | EXISTS? YES
- License: MIT (LICENSE + LICENSING.md; the Cloudflare sync server is separate non-MIT)
- Compatibility: Fully compatible
- Language(s): TypeScript (Electron, React, Lexical, Monaco, Excalidraw), Swift (iOS SwiftUI); Runtime: Electron desktop + Node/npm workspaces; iOS/Android companion apps
- Primary purpose: Open-source visual workspace/desktop IDE for running parallel coding-agent sessions (Codex, Claude Code, OpenCode alpha, Copilot alpha). Adds WYSIWYG collaboration on markdown/mockups/diagrams, kanban task tracking, and mobile control of agent sessions.
- Architecture summary: Electron monorepo (packages/electron, runtime, collab-protocol, extension-sdk, extensions, ios); local-first storage in plain markdown/files/git; optional hosted sync over defined wire protocol.
- Agent model: Drives external coding agents as managed sessions; implements no agents itself.
- Orchestration model: Session-level parallelism + Kanban; human approves red/green WYSIWYG diffs; no autonomous swarm logic.
- Task model: Built-in task tracker co-edited by humans and agents; linked to sessions/files.
- Memory/context model: Files/markdown on disk are the context store; session search/resume; no vector memory.
- Team model: One human + many agent sessions; mobile app for remote Q&A/approval (push notifications, voice reply).
- Process/terminal/workspace/git-worktree: Embedded ghostty terminal; git state management, AI commit messages, worktrees and workstreams first-class.
- Model routing: No. MCP: topic-tagged; agents bring their own. A2A: No.
- Hooks/events: PostHog analytics + agent notification/push events. HITL: Core design — approve/reject every agent change as a diff; low autonomy by default.
- Persistence: Local files/git; optional wss://sync.nimbalyst.com. Observability: PostHog anonymous analytics (event list published, opt-out). UI: Full desktop GUI + mobile. Security: local-first, no-PII telemetry policy; relies on underlying agents' permission systems.
- Platform support: macOS arm64/x64 (.dmg), Windows 10+ (.exe), Linux (AppImage), iOS/Android — explicit release downloads.
- Installation: Download installers, or build from source. Configuration: In-app settings; .env.example provided.
- Reusable components: EditorHost extension contract + extension-sdk; session↔file linking; kanban task model; worktree workflows; mobile approval flow.
- Integration value: Candidate GUI/control plane over OpenCode sessions (alpha support already); best-in-class HITL approval UX patterns.
- Duplication risk: Moderate (5).
- Unique features: Visual WYSIWYG agent-collaboration editors; mobile push-approval; native OpenCode (alpha) support.
- Features to reject: Hosted sync-server dependency for core use; PostHog telemetry (keep disabled).
- SCORES: ArchFit 7, OC-Fit 9, AgentRel 7, Docs 7, Maint 7, Comm 6, Sec 6, Comp 7, IntegVal 8, DupRisk 5, InstallQ 8
- TOTAL_SCORE: 77 — VERDICT: ADAPT — mine its session/task/worktree/mobile-approval UX and extension-SDK design; optionally wrap as the OS's GUI front-end.

---

## 2. DietrichGebert/ponytail

- Repository: ponytail | Owner: DietrichGebert | EXISTS? YES
- License: MIT ("The shortest license that works")
- Compatibility: Fully compatible
- Language(s): Markdown (canonical ruleset + 6 skills), JavaScript/Node (two tiny lifecycle hooks), Python (benchmarks/tests)
- Primary purpose: Prompt-engineering ruleset ("the laziest senior dev") making coding agents write minimal code via a 7-rung YAGNI ladder (skip → reuse → stdlib → platform → dependency → one line → minimum). Distributed as portable skills/plugins/rules for ~20 agent hosts.
- Architecture summary: Pure content distribution — AGENTS.md canonical rules + skills/ + hooks/ + per-host adapters (.opencode, .claude-plugin, .codex-plugin, .cursor/rules, gemini-extension.json, ponytail-mcp).
- Agent model: None of its own; shapes host agents incl. subagent rule injection scoped by PONYTAIL_SUBAGENT_MATCHER regex.
- Orchestration model: None. Task model: None (host's). Memory/context: Mode flag + optional config (%APPDATA%\ponytail\config.json on Windows); ruleset injected every turn.
- Process/terminal/workspace: None of its own. Model routing: No.
- MCP: Ships ponytail-mcp variant; primary mechanism hooks/skills. A2A: No.
- Hooks/events: Yes — prompt-submit activation + pre-tool-use injection; OpenCode plugin injects ruleset every turn at active level.
- HITL: lite/full/ultra/off intensity under human control; /ponytail-review and /ponytail-audit return delete-lists for human action.
- Persistence: Minimal state (mode flag, config JSON). Observability: /ponytail-gain scoreboard. UI: Slash commands only. Security: never cuts validation/error-handling/security/a11y; no network calls; clean uninstall script.
- Platform support: Windows/macOS/Linux — %APPDATA% path documented; Node-on-PATH caveat noted.
- Installation method: **OpenCode: `{ "plugin": ["@dietrichgebert/ponytail"] }` in opencode.json** (or local .mjs checkout path); marketplace one-liners for other hosts; rules-file copy fallback.
- Configuration: Zero-config default; optional PONYTAIL_DEFAULT_MODE env var or config.json defaultMode.
- Reusable components: The 7-rung ladder text; mode-levels pattern; subagent-injection matcher pattern; rigorous agentic benchmark methodology (git-diff LOC/token/cost/time, n=4).
- Integration value: Immediate drop-in quality gate for every agent in the OS; near-zero maintenance surface.
- Duplication risk: Low (3).
- Unique features: Measured −54% LOC / −20% cost / −27% time vs fair agentic baseline while holding a 100% safety tier; 20-host portability matrix.
- Features to reject: Nothing material.
- SCORES: ArchFit 8, OC-Fit 10, AgentRel 8, Docs 9, Maint 8, Comm 10, Sec 8, Comp 9, IntegVal 9, DupRisk 3, InstallQ 9
- TOTAL_SCORE: 91 — VERDICT: ADOPT — install as-is via native OpenCode plugin; canonical minimal-code policy layer for the whole OS.

---

## 3. ruvnet/agentic-flow

- Repository: agentic-flow | Owner: ruvnet | EXISTS? YES
- License: MIT. Compatible.
- Language(s): TypeScript 5.9 (Node 18+), Rust crate (QUIC transport), WASM components; Runtime: Node.js
- Primary purpose: Claude Code/Agent SDK overlay adding 66 "self-learning" agents, 213 MCP tools, and an LLM router for switching to cheaper models.
- Architecture summary: Monorepo (src, packages, crates, reasoningbank, agentdb); `init` scaffolds .claude/ (settings.json hooks, agents/, commands/, skills/, statusline.sh, CLAUDE.md) plus MCP registration.
- Agent model: 66+ predefined specialists with claimed ReasoningBank self-learning (pattern store/search with reward scores).
- Orchestration model: swarm_init/agent_spawn/task_orchestrate MCP tools; mesh/hierarchical/ring/star topologies; attention-based consensus claims.
- Task model: task_orchestrate + keyword-triggered background workers.
- Memory/context model: AgentDB (SQLite+WASM vector/graph, HNSW) + ReasoningBank; SONA micro-LoRA claims.
- Process/terminal/workspace: None of its own — delegates to Claude Code; Jujutsu VCS experiments.
- Model routing: YES — LLM router selects Sonnet-vs-Haiku by quality score/budget (claims 60% savings).
- MCP: Yes — 213 tools. A2A: No. Hooks: PreToolUse/PostToolUse/SessionStart/UserPromptSubmit + learning hooks.
- HITL: Generated permission allowlists; worker autonomy; no explicit approval tiers.
- Persistence: agentdb.db artifacts (build artifacts committed to repo — hygiene smell). Observability: metrics hook, token_usage/benchmark tools. UI: CLI + statusline. Security: "quantum-resistant" framing is marketing; benchmarks unaudited.
- Platform support: Node cross-platform implied; POSIX-leaning scripts; no explicit Windows caveats.
- Installation: `npx agentic-flow init` — heavily mutates target workspace. Configuration: .claude/settings.json env/hooks/mcpServers.
- Reusable components: LLM-router cost/quality design; hook-driven route→learn→metrics loop; ReasoningBank concept; statusline script.
- Integration value: Conceptual only — OpenCode already has agents/hooks/MCP natively.
- Duplication risk: High (7) — overlaps ruflo (same author) and duplicates our OS's native layers.
- Unique features: SONA micro-LoRA claims; QUIC crate; Agent Booster WASM editor claim.
- Features to reject: Wholesale adoption; unverifiable benchmark claims; committed build artifacts.
- SCORES: ArchFit 6, OC-Fit 4, AgentRel 7, Docs 6, Maint 6, Comm 5, Sec 5, Comp 6, IntegVal 6, DupRisk 7, InstallQ 6
- TOTAL_SCORE: 64 — VERDICT: INSPIRE — mine the routing/self-learning-hook ideas; skip the dependency (superseded by sibling ruflo).

---

## 4. bytedance/deer-flow

- Repository: deer-flow | Owner: bytedance | EXISTS? YES
- License: MIT. Fully compatible.
- Language(s): Python 3.12+ (LangChain/LangGraph backend, FastAPI Gateway), TypeScript/Next.js frontend; Runtime: uv-managed Python + Node
- Primary purpose: Open-source "super agent harness" that plans, researches, codes, and creates via sub-agents, sandboxes, memory, and extensible SKILL.md skills. v2.0 ground-up rewrite targeting minutes-to-hours long-horizon tasks.
- Architecture summary: FastAPI Gateway embedding LangGraph runtime + Next.js Web UI (:2026) behind nginx; optional Textual TUI; sqlite/postgres checkpoints; Redis stream bridge for multi-worker.
- Agent model: Lead agent + on-demand sub-agents (isolated context/tools/termination, max_concurrent_subagents cap, structured results, lead verifies/synthesizes).
- Orchestration model: LangGraph graphs; execution modes flash/standard/pro/ultra; /goal completion-condition loop with typed blockers and capped hidden continuations (default 8).
- Task model: Thread/run model with checkpoints; scheduled-tasks MVP (once/cron, pause/resume/history); durable background MCP tasks with leases, retry/backoff, dead-lettering.
- Memory/context model: DeerMem default (memory.json + per-agent fact Markdown + SQLite FTS5/BM25, scope/durability/authority write gates, hybrid eviction); opt-in mem0/honcho backends; /compact manual summarization; aggressive context engineering.
- Team model: Per-thread authenticated users; admin/operator roles; IM-channel message gateway.
- Process/terminal/workspace/git-worktree: Per-task sandbox filesystem; sandbox providers Local/Docker/K8s/E2B cloud; host bash disabled by default; Playwright browser control with SSRF screening. No git-worktree.
- Model routing: YES — config.yaml multi-provider (OpenAI/Anthropic/OpenRouter/vLLM/OAuth CLIs/ACP agents), per-role model selection, thinking-mode toggles.
- MCP: Yes — stdio allowlist + HTTP/SSE (OAuth flows), tool-name prefixing, per-tool timeouts, interceptors, durable background tasks. A2A: No formal (ACP adapters only).
- Hooks/events: Extension manager contributes middleware/lifecycle hooks/observers/services/routers via entry points.
- HITL: ask_clarification structured cards; explicit confirmation gates for irreversible actions; pluggable RBAC; autonomy scaled via execution modes.
- Persistence: Unified sqlite/postgres. Observability: LangSmith/Langfuse/Monocle tracing; run delivery receipts; support-bundle diagnostics. UI: Web + Textual TUI (--print/--json headless). Security: loopback-only default; two-phase SkillScan (deterministic + LLM); stdio allowlist; CORS/CSRF controls.
- Platform support: Linux+Docker recommended; macOS/Windows dev-only — Windows requires Git Bash (cmd/PowerShell unsupported; WSL not guaranteed).
- Installation: Clone + `make setup` wizard, `make doctor`, Docker or local. Configuration: Layered config.yaml + .env + extensions_config.json.
- Reusable components: Goal-evaluator pattern; scheduled-task runner; memory fact-scope write gates; SkillScan scanner; sandbox-provider abstraction; sub-agent caps/isolation policy; MCP background-task leasing.
- Integration value: Richest pattern source in this batch; concepts port cleanly despite the Python stack.
- Duplication risk: Moderate (5).
- Unique features: E2B cloud-sandbox lease management; managed integrations; conversation branching/regeneration from checkpoints; deep tracing story.
- Features to reject: Adopting the full server stack for a CLI-first OS; vendor upsells.
- SCORES: ArchFit 7, OC-Fit 4, AgentRel 8, Docs 9, Maint 9, Comm 9, Sec 7, Comp 7, IntegVal 7, DupRisk 5, InstallQ 7
- TOTAL_SCORE: 79 — VERDICT: ADAPT — port goal-evaluator, scheduler, memory write-gates, SkillScan, sandbox-provider patterns onto OpenCode primitives.

---

## 5. ruvnet/ruflo

- Repository: ruflo (formerly claude-flow) | Owner: ruvnet | EXISTS? YES
- License: MIT. Fully compatible.
- Language(s): TypeScript (primary), Rust engine crates; Runtime: Node.js + native Rust/WASM components
- Primary purpose: "Agent meta-harness" wrapping Claude Code/Codex/Hermes with 100+ agents, swarm coordination, self-learning memory, and cross-machine federation. Positions itself as the execution layer around coding agents.
- Architecture summary: CLI + MCP server + daemon; Router→Swarm→Agents→Memory→Providers pipeline; 27 hooks; 35-plugin marketplace; AgentDB (HNSW) + RuVector GPU search; Web UI (flo.ruv.io) and GOAP planner UI (goal.ruv.io).
- Agent model: 98–100+ specialized agents; dynamic cognitive patterns; auto-spawn by file type.
- Orchestration model: Swarm topologies (hierarchical/mesh/adaptive); queen-led with Raft/Byzantine/Gossip consensus; 12 keyword-triggered background workers; autopilot loops; workflow templates.
- Task model: Task orchestration across ~210–314 MCP tools; GOAP planner decomposes plain-English goals into precondition/action trees with adaptive replanning.
- Memory/context model: AgentDB vector memory (audited 1.9x–4.7x vs brute force, recall@10 ≈0.99); SONA self-learning; ReasoningBank trajectories; RVF session save/restore; knowledge-graph plugin.
- Team model: Multi-player swarms; Federation = zero-trust cross-machine communication (mTLS + ed25519 identity, 14-type PII pipeline BLOCK/REDACT/HASH/PASS, behavioral trust scoring with instant downgrade, HIPAA/SOC2/GDPR audit modes, opt-in WireGuard mesh).
- Process/terminal/workspace/git-worktree: Daemon + background workers; jujutsu plugin; VCS angle Jujutsu-flavored rather than git-worktree-centric.
- Model routing: YES — 5 providers with failover and smart routing (claims 89% accuracy).
- MCP: Yes — up to 314 tools. A2A: No formal (own federation protocol instead). Hooks: 27 incl. learning hooks.
- HITL: Lite/full install paths; MetaHarness pre-ship audits; otherwise high autonomy (autopilot) — approval gates not central.
- Persistence: AgentDB/RVF files; MongoDB for Web UI. Observability: structured logs/traces/metrics plugin, cost-tracker budgets/alerts, `ruflo verify` cryptographic witness.
- UI/CLI: Rich CLI (26 commands), Web UI beta; no dedicated TUI. Security: AIDefence (prompt-injection blocking, PII detection), CVE remediation, socket isolation, signed verification.
- Platform support: Native Windows PowerShell/cmd explicitly supported for `npx ruflo init wizard`; macOS/Linux/WSL covered; benchmarks darwin-arm64 + linux-x64.
- Installation: `npx ruflo@latest init` wizard or `npm i -g ruflo`; Claude Code plugin path. Configuration: .claude/, .claude-flow/, CLAUDE.md scaffold; install profiles.
- Reusable components: Federation trust model + PII-gate pipeline; plugin-marketplace structure; MetaHarness readiness grading + `ruflo eject`; cost-tracker; GOAP planner concept; verify/witness signing.
- Integration value: Highest concept density in the batch; several subsystems map 1:1 onto agent-OS needs.
- Duplication risk: VERY HIGH (9) — reimplements nearly everything an OpenCode-based OS would.
- Unique features: Agent federation across trust boundaries; behavioral trust scoring; cryptographic install verification; SOTA benchmark matrix.
- Features to reject: Wholesale adoption (Claude/Codex-centric; fights OpenCode natives); neural-trader/IoT/domain plugins out of scope.
- SCORES: ArchFit 8, OC-Fit 5, AgentRel 9, Docs 7, Maint 8, Comm 9, Sec 7, Comp 8, IntegVal 8, DupRisk 9, InstallQ 8
- TOTAL_SCORE: 86 — VERDICT: REIMPLEMENT — rebuild federation/trust-scoring, plugin-marketplace, and MetaHarness-audit concepts natively on OpenCode; do not adopt the harness itself.
