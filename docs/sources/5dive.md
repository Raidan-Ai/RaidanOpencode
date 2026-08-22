# Source Report: 5dive

## Repository
- **URL**: https://github.com/5dive-ai/5dive
- **Author/Organization**: 5dive-ai
- **License**: MIT License
- **Main Language**: Shell
- **Runtime**: Shell-based agent runtime
- **Architecture**: "Run a company of AI agents on a server you own"

## Primary Problem Solved
Enables running named AI agents (claude, codex, pi…) on an org chart with a shared backlog, allowing handoff between agents and phone notifications only when a human must decide. Provides persistent runtime for agent companies.

## Major Capabilities
- Named agents (claude, codex, pi, etc.)
- Org chart with shared backlog
- Handoff between agents
- Phone notifications for human decisions
- Persistent agent runtime on owned server
- MIT-licensed, self-hosted
- Zero-human-company model

## UI Model
CLI-focused. Org chart visualization in terminal. Human decision points trigger notifications.

## Orchestration Model
Hierarchical: agents on org chart with shared backlog. Handoff-based execution. Human-in-the-loop only at decision points.

## Agent Model
Named agents with specific identities (claude, codex, pi). Agents operate from a shared backlog and can hand off work.

## Session Model
Persistent agent sessions on owned server. Human notified only when a decision is required.

## Task Model
Shared backlog for all agents. Tasks are pulled from the backlog based on agent availability and org chart position.

## Workspace Model
Not explicitly focused on workspace isolation. Focus is on agent persistence and handoff.

## Git Strategy
Git integration for task tracking and handoff documentation. Worktree management not a primary focus.

## MCP Strategy
MCP support not a primary focus. Designed as self-hosted agent runtime.

## Skill Strategy
Skills are agent-specific (claude skills, codex skills). Skill selection based on agent type.

## State Strategy
State tracked through org chart and backlog. Agent status visible through dashboard.

## Persistence
Persistent agent runtime on owned server. Agents maintain state between executions.

## Observability
Basic observability through dashboard and phone notifications. Human decisions are the primary observability point.

## Security Model
Self-hosted on user's server. User controls all security. No mandatory cloud backend.

## Isolation Model
Isolation through separate agent instances on owned server. Human decides when to intervene.

## Windows Support
Not explicitly addressed. Shell-based so potentially Windows-compatible via WSL or Git Bash.

## Linux Support
Good support. Shell-based runtime.

## macOS Support
Good support. Terminal-based.

## What Should Be Reused Conceptually
- Persistent agent runtime concept (inspiration for RaidanOpencode's runtime registry)
- Org chart team structure (inspiration for RaidanOpencode's team engine)
- Handoff between agents (inspiration for agent communication primitives)
- Human-decision-only interruption model (inspiration for RaidanOpencode's approval gates)
- MIT license model (self-hosted, no mandatory cloud)

## What Should NOT Be Reused
- The complete shell-based runtime (RaidanOpencode needs cross-platform abstraction)
- Specific CLI command structures
- Phone notification system

## Proposed RaidanOpencode Equivalent
- **Layer 2 — Runtime Registry**: Adapt the persistent agent runtime concept into a cross-platform runtime supervisor
- **Layer 6 — Teams**: Adapt the org chart structure into RaidanOpencode's team/department/role system
- **Layer 12 — Guardrails**: Adapt the human-decision-only interruption model
- **Layer 1 — Core Engine**: Adapt the event bus and lifecycle concepts

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from 5dive, particularly its persistent agent runtime concept, org chart team structure, and handoff-between-agents model. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption.*