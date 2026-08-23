# Deduplication Matrix

Date: 2026-08-23
Rule: exactly ONE canonical implementation per capability. References inform; they do not ship.

---

### Agent Registry
- **Primary:** Raidan Agent Registry (`core/agents`)
- References: OpenAgentsControl markdown agents; oh-my-openagent discipline roster; kandev 21-agent breadth
- Rejected: vendoring any external agent roster wholesale
- Reason: agents must be first-class schema objects (capabilities/models/policies), not prompt blobs

### Team Engine
- **Primary:** Raidan Team Engine (`core/teams`)
- References: kandev Office mode; agent-teams-ai org hierarchy (design-only, AGPL); AI Maestro teams/war-room
- Rejected: separate team dashboards/managers (Agent Deck, Agent Manager, Squid as team systems)
- Reason: teams are data + policy, UI comes later from ONE Control Center

### Task Engine
- **Primary:** Raidan Task Engine (`core/tasks`, SQLite)
- References: 5dive DIVE queue; agx ticket pipeline; kandev kanban automation
- Rejected: Jira/Linear-style external importers as core (adapters only)
- Reason: single state machine CREATED→…→COMPLETED with failure ladder

### Workflow Engine
- **Primary:** Raidan Workflow Engine (`core/workflows`, YAML declarative)
- References: kandev portable workflow YAML; deer-flow scheduled tasks; ECC gated pipelines
- Rejected: embedding LangGraph/CrewAI runtimes
- Reason: workflows must run on OpenCode primitives, not a second runtime

### Orchestrator
- **Primary:** Raidan Orchestrator (`core/orchestration`) — complexity classifier L0–L4 + gated pipeline
- References: opencode-swarm architect-led gates; agent-orchestrator planner/worker split; deer-flow goal-evaluator; 5dive Council
- Rejected: ruflo/agentic-flow harness adoption; multiple concurrent orchestrators
- Reason: anti-Agent-Theater; one brain decides execution shape

### Capability Router (agent selection)
- **Primary:** Raidan Capability Router (`core/routing/capability.ts`)
- References: opencode-swarm role assignment; squid lane grammar
- Rejected: keyword-only routers
- Reason: capability-driven matching beats name matching

### Model Router
- **Primary:** Raidan Model Router (`core/gateway/model-router.ts`)
- References: opencode-swarm per-role models + fallback chains; agentic-flow cost/quality routing; awesome-opencode tier fingerprints
- Rejected: hard-coded model names inside agents
- Reason: agents declare needs ("reasoning", "vision"); router resolves provider/model

### Provider Router + AI Gateway
- **Primary:** Raidan Gateway (`core/gateway`)
- References: user's existing OmniRoute proxy (localhost:20128) treated as just another provider; 5dive BYO base-url
- Rejected: building a second LiteLLM/OmniRoute clone
- Reason: compose with existing local gateway; Raidan adds policy/health/cost metadata around it

### Context Engine
- **Primary:** Raidan Context Engine (`core/context`) — MVI budgets, lazy load, local-wins
- References: OpenAgentsControl context system + ContextScout algorithm (MIT, liftable); ECC contexts/
- Rejected: whole-codebase prompting; eager skill-body loading
- Reason: token efficiency is a product requirement

### Memory Engine
- **Primary:** Raidan Memory Engine (`core/memory`; filesystem → SQLite backend)
- References: deer-flow DeerMem scope/durability write-gates; 5dive provenance memory; agx checkpoint resume
- Rejected: mandatory vector DB; dump-all-history context stuffing
- Reason: local-first; ranking beats storage volume

### Skill Registry
- **Primary:** Raidan Skill Registry (`skills/` + AGENT_SKILL_REGISTRY.yaml)
- References: ECC install-state ownership manifest; omni-skills pinned-commit lockfile (pattern only — unlicensed content excluded); mattpocock never-double-install rule
- Rejected: bulk-importing 286 ECC skills or 108 awesome-opencode agents
- Reason: dedupe-first; curated > comprehensive

### MCP Registry
- **Primary:** Raidan MCP Registry (`integrations/mcp`) governing native OpenCode `"mcp"` config
- References: agent-deck MCP Manager + socket pool (concept); user's existing github remote MCP
- Rejected: second MCP client implementation
- Reason: OpenCode IS the MCP client; Raidan adds governance (provenance, risk rating, health)

### A2A Adapter
- **Primary:** Raidan A2A adapter (`integrations/a2a`) — v1.0.0 HTTP+JSON binding
- References: none in ecosystem (everyone uses proprietary protocols or ACP)
- Rejected: AMP/AID/AAP (proprietary lock-in), collapsing A2A into MCP
- Reason: standards-based external interop; MCP stays tool-plane, A2A stays agent-plane

### Policy Engine
- **Primary:** Raidan Policy Engine (`core/policies`)
- References: OpenCode permission system (native choke point); opencode-swarm authority.rules + circuit breakers; bash-guard ask-not-deny; 5dive isolation tiers
- Rejected: replacing native OpenCode permissions
- Reason: augment, don't duplicate — intercept permission.asked events

### Runtime Supervisor
- **Primary:** Raidan Runtime Supervisor (`core/runtime`) w/ backend SPI
- Backends: windows-native, linux-native, systemd (optional), docker (optional), wsl (bridge)
- References: 5dive systemd model; comet daemon watchdogs; agent-deck tmux hosting
- Rejected: systemd/tmux as hard dependencies
- Reason: Windows-first portability mandate

### Event Bus
- **Primary:** In-process typed event bus persisted to JSONL (`core/events`)
- References: opencode-swarm AutomationEventBus; OpenCode SSE `/event` stream
- Rejected: Kafka/RabbitMQ/Redis until scale demands
- Reason: zero-infra local operation

### Notification Engine
- **Primary:** Raidan Notification Engine (`core/notifications`)
- Providers: terminal, desktop, webhook, Telegram (opt-in, policy-gated)
- References: agent-deck bridge.py; 5dive tap-to-answer gates
- Rejected: giving chat channels shell authority
- Reason: notifications are read-mostly; approvals flow through Policy Engine

### Observability Engine
- **Primary:** Raidan Observability (`core/observability`) — run ledger JSONL + cost accounting
- References: squid per-prompt cost attribution; comet replayable journals; ruflo cost-tracker
- Rejected: mandatory OTel collector; logging secrets/prompts verbatim by default
- Reason: privacy + simplicity; OTel = optional export

### Evaluation Engine
- **Primary:** Raidan Eval Engine (`core/evaluation`)
- References: OpenAgentsControl evals dir; ECC verify loops; deer-flow tracing hooks
- Rejected: LLM-judge-only quality gates
- Reason: deterministic checks first, judges second

### Migration Engine
- **Primary:** Raidan Migration Engine (`apps/cli/migrate`) — inspect/plan/backup/apply/verify/rollback, dry-run default
- References: ECC doctor/repair/uninstall --dry-run; opencode-swarm update cache-clearing lessons
- Rejected: silent config rewrites
- Reason: preserve-user-state doctrine

### Configuration Manager
- **Primary:** Raidan Config Manager (`core/config`) — layered raidan.config.yaml + env refs
- References: OpenCode merge precedence (verified); agent-deck precedence chain
- Rejected: secrets in YAML literals ({env:}/{file:} references only)
- Reason: verified OpenCode behavior is the substrate we extend

### Setup Wizard
- **Primary:** `raidan init` interactive wizard (`apps/cli/setup`)
- References: deer-flow make setup wizard; agx init; ECC profiles
- Rejected: 100-option mega-prompts (progressive disclosure instead)
- Reason: onboarding friction kills adoption

### CLI
- **Primary:** `raidan` CLI (`apps/cli`)
- References: command surface per master spec §70
- Rejected: GUI-first operation; multiple CLIs
- Reason: CLI is the stable contract; Control Center reads same state

### Control Center
- **Primary:** Single web dashboard (`apps/control-center`, scaffold in v1)
- References: agent-orchestrator fact-derived kanban (concept); nimbalyst extension SDK; kandev SPA
- Rejected: Electron monolith; multiple dashboards
- Reason: state lives in core; UI is a view
