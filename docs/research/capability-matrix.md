# Capability Matrix

Date: 2026-08-23
Sources: docs/research/repos-batch-{a,b,c,d,e}.md, platform-analysis-opencode-a2a.md
Ontology per master spec §8. Decision column = what RaidanOpencode builds/adopts for this capability.

| # | Capability | Demonstrated By | RaidanOpencode Decision |
|---|---|---|---|
| 1 | Agent Architecture | OpenAgentsControl (markdown agents), oh-my-openagent, kandev | Markdown agent definitions in native OpenCode `agents/` dirs + YAML contract layer |
| 2 | Agent Lifecycle | 5dive (supervision), deer-flow (thread/checkpoint), agx | DISCOVER→…→LEARN lifecycle encoded in Task Engine states |
| 3 | Agent Identity | ai-maestro (AID), ruflo federation (ed25519) | Local identity = agent id + workspace binding; cryptographic identity DEFERRED (post-v1) |
| 4 | Agent State | comet (CRDT session doc), agx (SQLite checkpoints) | `.raidan/state` JSONL ledger + SQLite; no CRDT in v1 |
| 5 | Agent Orchestration | opencode-swarm (gated pipeline), agent-orchestrator (planner/worker), deer-flow | ONE Raidan Orchestrator: complexity classifier L0–L4 routing to gated pipeline / planner-specialist / team |
| 6 | Agent Routing | opencode-swarm (role→model), squid (@topic@agent lanes), 5dive | Capability Router: role+task-type+complexity → agent selection |
| 7 | Agent Delegation | OpenCode subagent_depth, ECC orch pipelines | Native OpenCode subagents; depth policy enforced via Policy Engine |
| 8 | Agent Handoffs | agent-deck (conductor parent linkage), 5dive (maker→verifier) | Task Engine handoff primitive w/ context bundle transfer |
| 9 | Agent Planning | deer-flow (/goal evaluator), ruflo GOAP, agent-orchestrator | Plan phase inside Orchestrator; goal-evaluator loop adopted conceptually from deer-flow |
| 10 | Agent Workers | agent-orchestrator (worker=task+agent+workspace), kandev | Worker = task + agent + isolated workspace triple |
| 11 | Agent Supervisors | agent-deck Conductor, 5dive systemd supervision | Runtime Supervisor (cross-platform process backend) + supervisor-agent pattern for long runs |
| 12 | Agent Swarms | opencode-swarm (19 roles), ruflo topologies, agentic-flow | Swarm ONLY for L3/L4 parallelizable work; Lean-Turbo file-disjoint lane rule adopted |
| 13 | Agent Teams | kandev Office mode, agent-teams-ai org hierarchy, AI Maestro teams | ONE Team Engine: org→dept→team→agent composition model |
| 14 | Agent Communication | ai-maestro AMP, clideck ask-protocol, OpenCode task tool | Internal: Raidan message bus (event-backed). External interop: A2A only |
| 15 | Agent Memory | 5dive provenance memory, deer-flow DeerMem write-gates, agx checkpoints | Memory Engine w/ relevance/recency/importance ranking; scope write-gates adopted |
| 16 | Context Engineering | OpenAgentsControl MVI budgets, ContextScout resolution, ECC | Context Engine w/ MVI budgets (<100 concepts/file), lazy loading, local-wins |
| 17 | Tool Use / Calling | OpenCode native tools, ECC | Defer to OpenCode natives |
| 18 | MCP | OpenCode native MCP config, agent-deck socket pool, kandev dual-direction | MCP Registry governing native OpenCode MCP entries (provenance, risk rating, health) |
| 19 | A2A | None in ecosystem (all use proprietary/ACP) | First-class A2A v1.0.0 HTTP+JSON adapter bridging sessions↔tasks |
| 20 | ACP | AoE structured view, kandev executors | Optional adapter post-v1 (OpenCode speaks ACP natively for editors) |
| 21 | Model Routing | opencode-swarm per-role models, 5dive tiers, awesome-opencode tier mapping | Model Router: capability matrix (coding/reasoning/fast/vision/tool…) → primary/fallback/emergency chains |
| 22 | Provider Routing | 5dive BYO base-url, agentic-flow router, OpenCode provider config | Provider Router over normalized catalog; OpenAI-compatible adapter class covers majority |
| 23 | AI Gateway | agentic-flow cost router, OmniRoute (user already runs one locally) | Thin gateway: health/quota/cost-aware selection in front of provider adapters |
| 24 | Task Management | 5dive SQLite queue, agx tickets, kandev kanban, ECC task-manager | ONE Task Engine (Goal/Epic/Task/Subtask, dependency graph, gates) on SQLite |
| 25 | Workflow Management | deer-flow scheduled tasks, kandev workflow YAML, ECC pipelines | Workflow Engine: declarative YAML workflows, step-level agent/model assignment |
| 26 | RAG | deer-flow retrieval, ECC rag skills | Post-v1 module; standard pipeline per spec §29 |
| 27 | Knowledge / Vector Search | ruflo AgentDB HNSW, deer-flow FTS5 | LanceDB default (embedded); abstraction allows swap |
| 28 | Voice / Multimodal | Out of scope of researched repos mostly | Adapter slots reserved, no v1 implementation |
| 29 | Security | opencode-swarm SAST/scope/shell-detection, bash-guard AST, ECC AgentShield, 5dive isolation tiers | Policy Engine + guardrail pack: scope enforcement, shell-write detection (POSIX AST + PS/cmd heuristics), secret scan, skill quarantine |
| 30 | Prompt-Injection Defense | ai-maestro gateway filter (34 patterns), opencode-swarm skill validation, youdotcom evidence-not-instructions | Injection pattern filter at connector/MCP/A2A ingress; untrusted-content-as-evidence rule |
| 31 | Evaluation | OpenAgentsControl evals/, ECC verification loops, deer-flow tracing | Eval Engine: golden datasets, trajectory eval, regression suite; run replay from observability ledger |
| 32 | Observability | comet journals, ruflo cost-tracker, squid per-prompt cost, OpenCode events | Observability Engine: JSONL run ledger (run_id, tokens, cost, tool calls); OTel exporter optional |
| 33 | Reliability / Circuit Breakers | opencode-swarm circuit breakers (200 calls/30min/10×same-tool) | Adopted thresholds into Policy Engine resource governance |
| 34 | Sandboxing | 5dive unix-user tiers, kandev Docker/SSH executors, AoE containers, deer-flow sandbox providers | Executor abstraction: local / docker (when present) / ssh; Windows-native first, no mandatory container |
| 35 | Process Supervision | 5dive systemd, PM2 (ai-maestro), comet daemon | Runtime Supervisor backends: windows-service / native-process / systemd / docker |
| 36 | Git/Worktrees | agent-deck best-in-class lifecycle, kandev multi-repo worktrees, opencode-swarm Lean-Turbo lanes | Worktree manager: branch-per-task, setup/teardown hooks, .worktreeinclude semantics |
| 37 | Notifications | agent-deck bridges (Telegram/Slack), 5dive Telegram gates, ntfy watchers | Notification Engine: terminal/desktop/Telegram/webhook; approval requests route through Policy Engine |
| 38 | Deployment | kandev cloud executor, ai-maestro Terraform modes, ECC | Deployment Registry: ssh/docker/vercel/cloudflare targets; production deploy requires explicit authorization |
| 39 | Connectors | agent-deck bridges, kandev integrations (GitHub/Jira/Linear/Slack) | Connector Registry w/ progressive-disclosure setup + least-privilege defaults |
| 40 | Publishing | ECC release skills, GitHub Actions | build/release/deploy/publish/announce separated |
| 41 | Governance / Audit | 5dive trace, opencode-swarm plan-ledger, ruflo verify signing | Append-only audit ledger; every gate decision recorded who/what/when/why |
| 42 | Cost Tracking | squid per-prompt attribution, agent-teams budgets/hard-caps, ruflo cost-tracker | Token/cost accounting per run/task/agent/team; budget alerts + optional hard caps |
| 43 | Human-in-the-loop | OAC always-approve, 5dive gates w/ veto, agx human-gate layer, nimbalyst mobile approval | Approval System: policy modes manual/supervised/balanced/autonomous; gates on destructive ops |
| 44 | Skill Distribution & Dedup | ECC ownership manifest, omni-skills lockfile, mattpocock never-double-install | Skill Registry: ownership manifest + pinned-source lockfile + idempotent install |
| 45 | Minimal-Code Discipline | ponytail 7-rung YAGNI ladder | Adopted as OS-wide policy skill via its native OpenCode plugin |
