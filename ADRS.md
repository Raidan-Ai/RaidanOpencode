# RaidanOpencode Architecture Decision Records (ADRs)

## ADR-001: OpenCode as Primary Runtime
**Status**: Accepted  
**Context**: The user's existing OpenCode installation must be preserved and respected. RaidanOpencode extends rather than replaces OpenCode.  
**Decision**: OpenCode is Layer 0 (OpenCode Compatibility). All operations default to OpenCode as the primary runtime. RaidanOpencode provides integration layers (skills, commands, MCP, plugins) that wrap OpenCode rather than fork it.  
**Consequences**: User's existing OpenCode configuration, agents, skills, commands, and models remain intact and functional. RaidanOpencode adds capabilities on top without disruption.

## ADR-002: Single Canonical Orchestrator
**Status**: Accepted  
**Context**: Multiple source repositories have orchestration engines (agent-orchestrator, 5dive, opencode-swarm, etc.). The Architecture Synthesis Rule explicitly forbids embedding one complete source project inside another.  
**Decision**: Exactly one canonical orchestrator (Layer 7). All task decomposition, agent selection, runtime selection, and model selection route through this single layer.  
**Consequences**: Simplified architecture, no orchestration conflicts, deterministic state transitions. Users occasionally ask "why not use X orchestrator for Y task" — answer: one canonical layer, use delegation/subsystems instead.

## ADR-003: Hierarchical Skill Catalog (Not Flat)
**Status**: Accepted  
**Context**: Source repositories have varying skill systems (flat, hierarchical, or no explicit system). The user's current OpenCode skills are authoritative and must be preserved.  
**Decision**: Build a hierarchical skill catalog under `packages/skills/` with categories: engineering/agents/orchestration/frontend/backend/database/security/devops/research/documentation/testing/product/management. Each skill includes: purpose, triggers, tools, dependencies, inputs, outputs, safety constraints, examples, compatibility.  
**Consequences**: Preserves user's existing skills, enables deduplication and compatibility analysis, supports incremental migration.

## ADR-004: Context Budgets With Relevance Scoring
**Status**: Accepted  
**Context**: Source repositories have context management systems ranging from raw history dump to sophisticated relevance filtering. Runaway context is a common failure mode in agent systems.  
**Decision**: Implement context discovery → relevance scoring → context assembly → execution → context summarization pipeline. Use lazy loading. Prefer summarized state over raw history. Implement context budgets with scoring (priority, recency, dependency, semantic similarity, task relationship).  
**Consequences**: Prevents runaway context, improves token efficiency, preserves important context across long-running tasks.

## ADR-005: Task Graph With DAG and Execution Waves
**Status**: Accepted  
**Context**: Source repositories have task systems ranging from simple linear queues to complex DAGs. A good task model must support both simple and parallel execution.  
**Decision**: One canonical task model with DAG support: dependencies, parent/child, parallelizable tasks, serialized tasks, gates, critical path, execution waves. Statuses: BACKLOG, READY, PLANNING, IN_PROGRESS, WAITING, BLOCKED, REVIEW, FAILED, DONE, CANCELLED.  
**Consequences**: Supports simple one-agent tasks and complex multi-agent workflows. Execution waves enable parallelization where tasks are genuinely independent.

## ADR-006: Risk-Classed Approval Gates (Not Binary Approve/Reject)
**Status**: Accepted  
**Context**: Source repositories have varying approval mechanisms (binary approve/reject, continuous approval, or no approval). A nuanced approach is needed for productivity + safety.  
**Decision**: Four risk classes: LOW (read files, search code, inspect Git), MEDIUM (edit source, install dependencies, run migrations in development), HIGH (production deployment, public publication, credential changes, destructive commands), CRITICAL (deleting important data, security-sensitive actions, irreversible infrastructure changes, publishing externally without authorization). Approval gates evaluate against risk class, not just "approve/reject".  
**Consequences**: Faster approval for LOW/MEDIUM actions, proper escalation for HIGH/CRITICAL, audit trail for all actions.

## ADR-007: Platform Abstraction (No Linux-Only Assumptions)
**Status**: Accepted  
**Context**: Source repositories often make Linux-only assumptions (bash, tmux, systemd, Unix paths). The user's environment may be Windows, WSL, or Linux.  
**Decision**: Windows is a first-class target. No mandatory bash, tmux, systemd, or Unix paths. Provide equivalent abstractions: Windows Terminal + PowerShell + ConPTY, Git for Windows, optional WSL2. Linux support (systemd/tmux/Docker) but keep core portable. macOS-friendly where practical.  
**Consequences**: RaidanOpencode works on Windows, Linux, and macOS without platform-specific forks. Core runtime has no #ifdef-style platform branches for basic operations.

## ADR-008: Agent Memory Scopes (Not One Giant Memory)
**Status**: Accepted  
**Context**: Some source repositories build one giant memory system; others have no memory abstraction. Both approaches have drawbacks.  
**Decision**: Use scopes: Global, User, Project, Team, Agent, Task, Session. Use separate stores/interfaces for: working memory, episodic memory, semantic memory, artifacts, summaries. Avoid unnecessary vector databases. Use semantic/vector storage only when a clear retrieval problem exists.  
**Consequences**: Modular memory, avoids unnecessary complexity, supports clear provenance tracking, prevents memory bloat.

## ADR-009: Model Router Scoring (Multifactorial, Not "Most Powerful")
**Status**: Accepted  
**Context**: Some systems blindly choose the most powerful model; others have no routing at all. Both are suboptimal.  
**Decision**: Routing score combines: quality × task fit × context fit × latency × cost × availability × historical success rate. Never blindly choose the most powerful model. Select cheapest safe mode that satisfies the task.  
**Consequences**: Cost-aware, latency-aware, availability-aware model selection. Prevents wasteful use of premium models for trivial tasks.

## ADR-010: One Canonical TUI (Not Multiple Competing TUIs)
**Status**: Accepted  
**Context**: Source repositories have separate TUIs (agent-deck, agent-console, agent-manager, etc.). Maintaining multiple TUIs creates fragmentation.  
**Decision**: One canonical TUI only (Layer 18). Primary screens: Dashboard, Projects, Agents, Teams, Tasks, Sessions, Worktrees, Models, Skills, MCP, Events, Approvals, Reviews, Costs, Health, Settings. Keyboard navigation only.  
**Consequences**: Consistent UI, single codebase for terminal interactions, no duplicate TUI logic. Users learn one interface.

## ADR-011: Optional Desktop/Web Control Plane
**Status**: Accepted  
**Context**: Some source repositories have full desktop/web interfaces; others are CLI-only.  
**Decision**: Layer 19 is optional. UI → local API → control-plane → core services. Never place orchestration logic in the UI. The daemon/core must remain independently usable without the desktop/web layer.  
**Consequences**: Users with only OpenCode + CLI get full functionality. Desktop/web is a management add-on, not a requirement.

## ADR-012: SQLite Default Persistence With Migration Path
**Status**: Accepted  
**Context**: Some repositories use PostgreSQL, Redis, or no persistence. PostgreSQL for fashion is discouraged; SQLite is practical and extendable.  
**Decision**: Default local-first persistence through SQLite with migrations. Architecture allows SQLite ↔ PostgreSQL through a repository interface later. Do not introduce PostgreSQL merely for architectural fashion.  
**Consequences**: Lightweight default, easy setup, migration path to PostgreSQL when scale requires it. No mandatory external database.

## ADR-013: Event-Sourced Architecture (Every Important Action Is an Event)
**Status**: Accepted  
**Context**: Some repositories have observability; others have no event system. Tight coupling between subsystems is a common anti-pattern.  
**Decision**: Create structured event schema. Every significant action emits an event: agent.created, agent.started, agent.running, agent.waiting, agent.blocked, agent.failed, agent.restarted, session.created, session.started, session.finished, task.created, task.assigned, task.started, task.blocked, task.completed, task.failed, tool.started, tool.completed, tool.failed, approval.requested, approval.approved, approval.rejected, model.selected, model.failed, model.fallback, review.started, review.completed, review.failed. Use events to connect: orchestrator, monitor, UI, audit, notifications rather than tightly coupling subsystems.  
**Consequences**: Loose coupling, audit trail, event stream for UI/monitoring, deterministic state recovery.

## ADR-014: Migration Safety (Backup Before Modification)
**Status**: Accepted  
**Context**: Changing the user's environment requires extreme care. Previous experiences with agent tools destroying user configuration must be avoided.  
**Decision**: Create complete immutable snapshot before modification. Store discovery results under docs/migration/current-opencode-installation.md and runtime/discovery/. Never overwrite user configuration automatically. Use backup/migration/compatibility/additive configuration rather than destructive replacement. Migration engine presents plan with: what will change, what will be added, what will be modified, what will be preserved, what will be removed. Default: dry-run. Actual migration requires explicit confirmation.  
**Consequences**: User trust preserved, rollback supported, no accidental data loss.

## ADR-015: Arabic Documentation First-Class (Not Machine-Translated)
**Status**: Accepted  
**Context**: Some projects have English-only documentation; machine-translated Arabic is often garbage.  
**Decision**: Write docs/ar/ with professional technical Arabic. Required: README.ar.md, ARCHITECTURE.ar.md, GETTING-STARTED.ar.md, INSTALL-WINDOWS.ar.md, INSTALL-LINUX.ar.md, OPENCODE-INTEGRATION.ar.md, AGENTS.ar.md, TEAMS.ar.md, ORCHESTRATION.ar.md, MODEL-ROUTING.ar.md, SKILLS.ar.md, MCP.ar.md, SECURITY.ar.md, TROUBLESHOOTING.ar.md, ADMINISTRATION.ar.md, SOURCE-ATTRIBUTION.ar.md. Arabic must not merely duplicate English mechanically; adapt terminology for Arabic technical readers. Use English technical terms in parentheses when useful.  
**Consequences**: Arabic-speaking users have high-quality documentation. English and Arabic docs coexist in docs/en/ and docs/ar/.

## ADR-016: No AGPL Code Embedding
**Status**: Accepted  
**Context**: Several source repositories use AGPL-3.0 (agent-teams-ai, kandev). Copyleft viral licenses cannot be embedded into a MIT/Apache-licensed project without source code contamination.  
**Decision**: DO NOT copy code from AGPL projects into core RaidanOpencode. For AGPL projects, extract: architectural ideas, workflows, concepts, publicly documented behavior. Implement an original compatible design unless the entire derivative licensing strategy has been deliberately approved. Create docs/legal/IP-DECISIONS.md.  
**Consequences**: License safety guaranteed. Concepts adapted with attribution; code never reused from AGPL-licensed projects.

## ADR-017: Composable Adapters Over Vendor Lock-In
**Status**: Accepted  
**Context**: Some projects hardcode specific CLIs (Claude Code, Codex) as dependencies.  
**Decision**: External CLIs (Claude Code, Codex, Gemini CLI, Aider, Cursor, Kimi, Qwen, etc.) must be treated as optional adapters rather than hard dependencies. RaidanOpencode core has no hard dependency on any external CLI. Integration via skills and MCP where appropriate.  
**Consequences**: RaidanOpencode works without any external CLIs. Users with only OpenCode have a fully functional system. Adapters can be added/removed without core changes.

## ADR-018: Bounded Retry Policies (Not Endless Retry)
**Status**: Accepted  
**Context**: Some agent systems retry indefinitely on failure, causing resource waste and hidden behavior.  
**Decision**: Use bounded retry policies with configurable thresholds. Do not endlessly retry. Each failure becomes: event + diagnostic + recovery attempt if safe + escalation if unsafe + human-visible explanation.  
**Consequences**: Controlled failure handling, resource protection, clear diagnostics, human-visible explanations.

## ADR-019: Safe Automation Over Uncontrolled Autonomy
**Status**: Accepted  
**Context**: Some projects prioritize autonomy; others prioritize manual control. A balance is needed.  
**Decision**: Prefer safe automation over uncontrolled autonomy. Five human control modes: manual (every destructive action requires approval), supervised (agent executes normal actions but asks before HIGH/CRITICAL), balanced (routine work autonomous, risky actions require approval), autonomous (agent operates within configured policies). The orchestrator asks internally: "Can this be completed safely by the current agent?" If yes: DO IT DIRECTLY. If not: delegate.  
**Consequences**: Productive automation within safety boundaries. Human maintains policy control.

## ADR-020: Context Failure Protection (Budgets + Summarization)
**Status**: Accepted  
**Context**: Runaway context, duplicate context, massive logs in prompts, repeated tool output, agent-to-agent spam, and irrelevant skill loading are failure modes.  
**Decision**: Implement context budgets. Prevent: runaway context, duplicate context, massive logs injected into prompts, repeated tool output, agent-to-agent spam, irrelevant skill loading. Prefer summarized state over raw history. Use context discovery → relevance scoring → context assembly → execution → context summarization pipeline.  
**Consequences**: Predictable prompt sizes, reduced token waste, improved focus on relevant context, prevention of agent chatter loops.

---
*ADR documents generated on 2026-08-23. 20 ADRs covering critical architecture decisions for RaidanOpencode.*