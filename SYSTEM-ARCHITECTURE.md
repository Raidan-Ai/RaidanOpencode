# RaidanOpencode Architecture Summary

## Overview

RaidanOpencode is a **Unified Agent Engineering Operating System for OpenCode** that synthesizes capabilities from 21 leading open-source agent repositories into one coherent, modular system. It preserves the user's existing OpenCode installation, configuration, skills, agents, commands, MCPs, and models while adding enterprise-grade engineering capabilities.

## Core Philosophy

- **OpenCode is the execution foundation** — RaidanOpencode extends, never replaces it
- **One canonical subsystem per capability** — No duplicate orchestrators, task systems, or session managers
- **Composable adapters** — External CLIs (Claude Code, Codex, Gemini CLI, etc.) are optional adapters
- **Windows-first-class** — No Linux-only assumptions (no mandatory bash, tmux, systemd)
- **Local-first, self-hosted** — No mandatory cloud backend, no mandatory SaaS
- **Arabic + English documentation** — Professional technical Arabic, not machine-translated

## Layer Model (22 Layers)

### Layer 0 — OpenCode Compatibility
- OpenCode CLI, config, agents, commands, skills, plugins, MCP, providers, sessions
- **Primary runtime**: OpenCode remains fully operational

### Layer 1 — Core Engine
- Configuration, domain models, event bus, lifecycle, policies, identifiers, state machines
- **No UI dependency**: Pure engineering foundation

### Layer 2 — Agent Runtime Registry
- Abstracts agent runtimes behind common interface
- OpenCode first-class, other runtimes as adapters
- Supports: health_check, start, stop, restart, pause, resume, send, attach, detach, status, logs, destroy

### Layer 3 — Agent Lifecycle Manager
- Canonical lifecycle: DISCOVERED → READY → STARTING → RUNNING → WAITING → BLOCKED → REVIEW_REQUIRED → COMPLETED → FAILED → RECOVERING → STOPPED
- Owns: start, stop, restart, watchdog, heartbeat, timeout, retries, recovery, graceful shutdown, crash detection, stale session detection

### Layer 4 — Session & Workspace Manager
- Project registry, session registry, worktree creation/cleanup, branch management
- Terminal session management, environment isolation, workspace locking
- **Native mechanisms**: tmux/process groups/git worktrees (Linux/macOS), Windows Terminal/ConPTY/git worktrees (Windows), optional WSL/Docker

### Layer 5 — Task Engine
- One canonical task model with DAG support
- Statuses: BACKLOG, READY, PLANNING, IN_PROGRESS, WAITING, BLOCKED, REVIEW, FAILED, DONE, CANCELLED
- Task graph: dependencies, parent/child, parallelizable tasks, serialized tasks, gates, critical path, execution waves

### Layer 6 — Agent Teams
- Teams, departments, roles, members, lead, reviewer, specialist, workers, observers
- Communication primitives: direct message, broadcast, task handoff, request review, escalation, status report, blocker report, approval request
- **Event-driven, task-relevant, bounded, observable, rate-limited** — No continuous agent chat

### Layer 7 — Orchestrator
- **SINGLE canonical orchestrator** — the core differentiator
- Responsibilities: planning, task decomposition, agent selection, runtime selection, model selection, workspace allocation, concurrency, dependency scheduling, retry policy, failure recovery, human escalation, review routing, merge coordination
- Strategy: Analyze request → Estimate complexity → Decide mode (SOLO/DELEGATED/PARALLEL/TEAM/SWARM/REVIEW/COMPETITION/PIPELINE) → Cheapest safe mode

### Layer 8 — Model Router
- Model registry, provider registry, capability matching, latency tracking, error tracking
- Token economics, cost estimation, fallback chains, rate-limit awareness, context-window awareness
- Coding/Reasoning/Research/Vision specialization, fast/premium/local models
- **Routing score combines**: quality × task fit × context fit × latency × cost × availability × historical success rate
- **Never blindly choose most powerful model**

### Layer 9 — Context Engine
- Project context, user context, task context, agent context, team context, session context, skill context
- **Lazy loading**: Do not preload massive context unless needed
- Pipeline: context discovery → relevance scoring → context assembly → execution → context summarization
- Context budgets with relevance scoring (priority, recency, dependency, semantic similarity, task relationship)

### Layer 10 — Skill Engine
- Preserves user's current installed OpenCode skills
- Inventory, deduplication, classification, compatibility analysis, integration
- Hierarchical skill catalog: engineering/agents/orchestration/frontend/backend/database/security/devops/research/documentation/testing/product/management
- Each skill: purpose, triggers, tools, dependencies, inputs, outputs, safety constraints, examples, compatibility

### Layer 11 — MCP Management
- MCP discovery, registry, enable/disable, scoped MCP, project MCP, agent MCP, session MCP
- Health checks, MCP permissions, environment management, failure isolation
- **Capability-based access**: Never expose every MCP to every agent

### Layer 12 — Approval & Guardrails
- Risk classes: LOW, MEDIUM, HIGH, CRITICAL
- LOW: read files, search code, inspect Git
- MEDIUM: edit source, install dependencies, run migrations in development
- HIGH: production deployment, public publication, credential changes, destructive commands
- CRITICAL: deleting important data, security-sensitive actions, irreversible infrastructure changes, publishing externally without authorization
- Approval gates, permission policies, action simulation, dry-run, rollback where possible, audit trail
- **Never silently weaken security**

### Layer 13 — Review Engine
- Automated tests, lint, typecheck, security scan, diff analysis, reviewer agents
- Review comments, merge readiness, review retries
- Feedback sources: CI failures, tests, review comments, build errors, merge conflicts
- Route feedback to correct session/task/agent

### Layer 14 — Observability
- Agent lifecycle, session status, task status, tool calls, errors, latency, tokens, model usage, approximate cost, retries, failures, approvals, delegations, messages, review events
- **Structured event schema**: Every significant action emits an event
- Human-readable logs, JSON logs, event stream, audit history

### Layer 15 — Health Monitor
- Process liveness, runtime responsiveness, agent idle time, stuck state, rate limits, memory, CPU, disk, session disappearance, repeated tool failure
- Configurable watchdog thresholds
- **Default: do not kill an agent merely because it is silent**
- Detect: WAITING vs STUCK before recovery

### Layer 16 — Human Control Plane
- Intervention points: approve, reject, pause, resume, reroute, reassign, retry, stop, terminate, merge, rollback, escalate
- **Human controls policy, not manually babysits every token**
- Modes: manual, supervised, balanced, autonomous

### Layer 17 — CLI
- raidan doctor, raidan status, raidan init, raidan project list, raidan project add
- raidan agent list, raidan agent start/stop/restart/logs
- raidan team list, raidan team create
- raidan task list, raidan task create, raidan task assign, raidan task run, raidan task retry
- raidan session list, raidan session attach, raidan session fork, raidan session stop
- raidan worktree list, raidan worktree create
- raidan model list, raidan model test
- raidan skill list, raidan skill audit
- raidan mcp list, raidan mcp test
- raidan health, raidan doctor, raidan events, raidan audit, raidan upgrade
- Also: raidan <natural-language-command> through OpenCode integration

### Layer 18 — TUI
- One terminal command center (keyboard navigation)
- Primary screens: Dashboard, Projects, Agents, Teams, Tasks, Sessions, Worktrees, Models, Skills, MCP, Events, Approvals, Reviews, Costs, Health, Settings
- **One canonical TUI only** — No competing TUI paradigms

### Layer 19 — Desktop / Web Control Plane (Optional)
- Optional UI management layer
- Architecture: UI → local API → control-plane → core services
- **Never place orchestration logic in the UI**
- Daemon/core remains independently usable

### Layer 20 — Persistence (planned)
- Default: SQLite with migrations
- Allow: SQLite ↔ PostgreSQL through repository interface later
- Persist: projects, agents, teams, tasks, sessions, workspaces, events, approvals, reviews, model/cost statistics, health data, configuration metadata
- **Secrets NEVER in SQLite as plaintext**: Use environment variables, OS credential stores, secure secret providers

### Layer 21 — Event Architecture (see Layer 14)
- Everything important becomes an event
- Connect: orchestrator, monitor, UI, audit, notifications

### Layer 22 — Security (see Layer 12)
- Threat modeling, API key protection, OAuth token protection, SSH key protection, Git credential protection

## Key Guiding Principles

### Architecture Synthesis Rule
Never implement one complete source project inside another. Create one canonical subsystem for each capability.

### Deduplication Rule
Before implementing any new feature, search: existing RaidanOpencode code, current OpenCode configuration, current installed skills, source capability matrix, existing package, existing command, existing subsystem. If the capability already exists: EXTEND IT. Do not create second orchestrator, second task system, second session manager, second model router, second skill system, second event bus, second health monitor, second permission engine.

### No Duplicate Core Systems
- Exactly one canonical orchestrator (Layer 7)
- Exactly one canonical task engine (Layer 5)
- Exactly one agent registry
- Exactly one team engine
- Exactly one model router
- Exactly one policy engine
- Exactly one context engine
- Exactly one observability system
- Exactly one CLI
- Optional: one control center (Layer 19)

### Cross-Platform Support
- **Windows 10+**: PowerShell, Windows Terminal, Git for Windows, ConPTY, optional WSL2
- **Linux**: Ubuntu, Debian, Fedora/RHEL, Arch. systemd/tmux/Docker-Podman optional but not mandatory in core
- **macOS**: Friendly where practical
- **No mandatory**: bash, tmux, systemd, Unix users, Unix paths
- **Platform abstraction**: Common interface + platform-specific implementation

### Migration Policy
- Do not force immediate migration
- Provide legacy-compatible mode AND RaidanOpencode-native mode
- Users may gradually migrate
- First release supports: DISCOVER → IMPORT → VALIDATE → ENABLE → OBSERVE → OPTIMIZE
- Backup before modification, rollback support

### Security-First Defaults
- Protect: API keys, OAuth tokens, SSH keys, Git credentials, cloud credentials, environment files, OpenCode credentials, MCP secrets
- **Never expose secrets in**: logs, events, agent messages, task descriptions, screenshots, diagnostics
- Redaction, path validation, workspace boundaries, command policy, permission checks, audit logging, secure defaults
- **Telemetry OFF by default**: Explicit opt-in, documented, disableable

### Productivity Principle
Optimize for: less cognitive overhead, less terminal switching, less duplication, less waiting, less manual coordination, less context waste, less token waste
Optimize for: clear state, fast recovery, predictable automation, parallel work, safe autonomy, high-quality output

## Repository Synthesis

RaidanOpencode integrates concepts from these 21 repositories (selected, not copied):

| Repository | Key Contribution Adapted |
|------------|-------------------------|
| OpenAgentsControl | Approval gates, MVI context, plan-first workflow |
| 5dive | Persistent runtime, org chart, handoffs |
| agent-console | Local terminal control plane, TUI patterns, session persistence |
| agent-deck | One TUI for multiple agents |
| agent-manager | Git worktree management, fast workflow, TUI patterns |
| agent-of-empires | TUI/Web dual interface, agent health monitoring |
| agent-squid/squid | Local agent unification, local-first philosophy |
| agx | Persistent team execution, objectives, memory |
| clideck | Dashboard coordination, real-time status |
| ai-maestro | Skills system concept, agent-to-agent messaging |
| nimbalyst | Visual workspace for parallel agents, cross-platform |
| ponytail | YAGNI principle, task complexity classifier |
| agentic-flow | Model fallback chains, provider switching |
| opencode-swarm | Hub-and-spoke model (as inspiration only, not duplicated) |
| kandev | Kanban task tracking (concepts, code rejected AGPL) |
| ruflo | Multi-player swarms, adaptive memory (concepts scaled down) |
| deer-flow | Long-horizon super-agent harness (focused extraction) |
| oh-my-openagent | Agent harness patterns (focused extraction) |
| 777genius/agent-teams-ai | Multi-agent team communication (concepts, AGPL code rejected) |
| Untrivial-ai/agent-orchestrator | ⚠️ REJECTED: Duplicate orchestrator (Raidan has one canonical) |
| zeronsh/comet | ⚠️ INSUFFICIENT METAData: Future research needed |
| DietrichGebert/ponytail | YAGNI principle, code efficiency philosophy |

## Integration Pattern

```
OpenCode (primary runtime)
    │
    ▼
RaidanOpencode (engineering control plane)
    │
    ├──► Layer 1 Core Engine
    ├──► Layer 2 Runtime Registry
    ├──► Layer 3 Lifecycle Manager
    ├──► Layer 4 Session/Workspace
    ├──► Layer 5 Task Engine
    ├──► Layer 6 Teams
    ├──► Layer 7 Orchestrator (SINGLE)
    ├──► Layer 8 Model Router
    ├──► Layer 9 Context Engine
    ├──► Layer 10 Skill Engine (preserves user skills)
    ├──► Layer 11 MCP Management
    ├──► Layer 12 Guardrails (approval gates)
    ├──► Layer 13 Review Engine
    ├──► Layer 14 Observability
    ├──► Layer 15 Health Monitor
    ├──► Layer 16 Human Control Plane
    ├──► Layer 17 CLI
    ├──► Layer 18 TUI (one canonical)
    └──► Layer 19 Desktop/Web (optional)
         │
         ▼
    External CLIs: Claude Code, Codex, Gemini CLI, Aider, Cursor, Kimi, Qwen (optional adapters)
```

## Verification Before Completion

Before declaring the project complete, verify:

- ✅ No duplicate core systems
- ✅ No abandoned experimental packages
- ✅ No copied AGPL source accidentally embedded
- ✅ All required attribution present
- ✅ Current OpenCode configuration preserved
- ✅ Existing skills preserved
- ✅ Duplicate skills identified and resolved
- ✅ Windows install works
- ✅ Linux install works
- ✅ OpenCode-only setup works
- ✅ One-agent mode works
- ✅ Multi-agent mode works
- ✅ Team mode works
- ✅ Worktree mode works
- ✅ Model fallback works
- ✅ Approval works
- ✅ Recovery works
- ✅ Logs work
- ✅ Audit works
- ✅ Uninstall works
- ✅ Upgrade works
- ✅ Documentation works
- ✅ Tests pass
- ✅ `raidan doctor` produces valid report

Generate: docs/DOCTOR-REPORT.md

---
*Architecture summary generated on 2026-08-23. Based on analysis of 21 source repositories and current OpenCode environment.*