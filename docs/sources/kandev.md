# Source Report: kandev

## Repository
- **URL**: https://github.com/kdlbs/kandev
- **Author/Organization**: kdlbs
- **License**: GNU Affero General Public License v3.0 (AGPL-3.0)
- **Main Language**: Go
- **Runtime**: Go binary
- **Architecture**: "AI Kanban & Development Environment. Orchestrate multiple agents, review changes, open PRs. Multi-provider, self-hostable, no telemetry."

## Primary Problem Solved
AI Kanban & Development Environment. Orchestrates multiple agents, reviews changes, opens PRs. Provides a kanban-style development environment for agent orchestration.

## Major Capabilities
- Kanban-style agent orchestration
- Multi-agent review
- PR creation and management
- Multi-provider support (many AI models)
- Self-hostable
- No telemetry
- AGPL-3.0 licensed

## UI Model
Kanban board UI. Agent review interface. PR management interface.

## Orchestration Model
Kanban-style orchestration. Agents move through kanban stages. Review and PR creation built in.

## Agent Model
Agents as orchestration participants. Review and PR creation by agents.

## Session Model
Kanban board session management.

## Task Model
Kanban-style task flow. Tasks move through stages. Review and PR creation are part of the flow.

## Workspace Model
Not explicitly focused. Kanban board as workspace view.

## Git Strategy
Git integration for PR creation. Worktree management for changes.

## MCP Strategy
MCP support not a primary focus. Multi-provider model selection.

## Skill Strategy
Skill management for multi-provider agents.

## State Strategy
Kanban board state. Task status, review status visible.

## Persistence
Kanban board state persisted.

## Observability
Kanban board provides observability. Task flow, review status.

## Security Model
AGPL-3.0 license means copyleft. **LEGALLY_RESTRICTED.**

## Isolation Model
Isolation through agent separation and PR review boundaries.

## Windows Support
Not explicitly addressed.

## Linux Support
Good support via Go binary.

## macOS Support
Good support via Go binary.

## What Should Be Reused Conceptually
⚠️ **PARTIAL**: Kanban-style task tracking (inspiration for RaidanOpencode's task engine), but the AGPL license restricts code reuse.

- Kanban board task tracking concepts (can be adapted as inspiration)
- Multi-agent review workflow (can be adapted for Layer 13 - Review Engine)
- PR creation workflow (can be adapted for Git integration)

## What Should NOT Be Reused
- The complete Go codebase (LEGALLY_RESTRICTED - copyleft)
- The specific kanban UI component
- The AGPL-3.0 licensed code

## Proposed RaidanOpencode Equivalent
- **Layer 5 — Task Engine**: Adapt the kanban-style task flow concepts (statuses, waves, gates) but reimplement independently
- **Layer 13 — Review Engine**: Adapt the agent review workflow (but reimplement, not copy)
- **Layer 30 — Git Strategy**: Adapt the git integration for PR creation and worktree management

## Attribution Requirements
**LEGALLY_RESTRICTED**: "RaidanOpencode acknowledges the kandev repository for ideas about kanban-style task tracking and multi-agent review workflow. The AGPL-3.0 codebase was NOT reused due to copyleft license restrictions. Only concepts and architectural ideas were extracted. RaidanOpencode uses a MIT/Apache license model, not copyleft."

---
*Source analyzed on 2026-08-23. License: AGPL-3.0 - CONCEPTUAL IDEAS ONLY, code not reusable due to copyleft viral license.*