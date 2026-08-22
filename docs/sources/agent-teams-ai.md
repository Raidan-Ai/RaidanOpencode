# Source Report: agent-teams-ai

## Repository
- **URL**: https://github.com/777genius/agent-teams-ai
- **Author/Organization**: 777genius
- **License**: GNU Affero General Public License v3.0 (AGPL-3.0)
- **Main Language**: TypeScript
- **Runtime**: TypeScript/Node.js runtime
- **Architecture**: "You're the boss, agents are your team"

## Primary Problem Solved
Enables building AI companies with multiple teams where agents handle tasks independently, message each other, and review each other's work. Operator watches a kanban board and gives high-level commands.

## Major Capabilities
- Multi-agent team management
- Agent-to-agent messaging
- Autonomous task handling
- Kanban board view
- Code review between agents
- Support for 200+ models and 75+ LLM providers
- Claude, Codex, Cursor, Grok, GitHub Copilot/Kiro/Z.AI/Kimi integration

## UI Model
Kanban board UI. Agent messaging interface. High-level command interface for "the boss."

## Orchestration Model
Decentralized: agents handle tasks on their own, message each other, review work. The "boss" gives high-level commands and watches the kanban board.

## Agent Model
Agents are team members with roles. They can communicate with each other, hand off tasks, and review work. Multiple models supported (200+).

## Session Model
Session management through the kanban board. Task state visible across agents.

## Task Model
Kanban-style task flow. Tasks move through stages. Review and approval built into the workflow.

## Workspace Model
Not explicitly focused on workspace isolation. Focus is on agent coordination and task flow.

## Git Strategy
Git integration for PR creation and code review. Agents can open PRs for their changes.

## MCP Strategy
MCP server integration. Supports MCP server for model context protocol.

## Skill Strategy
Skills are model/provider specific. Supports 200+ models and 75+ LLM providers.

## State Strategy
State tracked through kanban board. Task status visible to "the boss."

## Persistence
Persistence through the application's state management. Kanban board state persisted.

## Observability
Kanban board provides observability. Task status, agent activity visible.

## Security Model
AGPL-3.0 license means copyleft. Any modified version must also be AGPL. **This is a LEGALLY_RESTRICTED capability.**

## Isolation Model
Isolation through agent separation and task boundaries. Review between agents provides some isolation.

## Windows Support
Not explicitly addressed.

## Linux Support
Good support via Node.js.

## macOS Support
Good support via Node.js.

## What Should Be Reused Conceptually
- Multi-agent team management concepts (inspiration for RaidanOpencode's team engine)
- Agent-to-agent communication primitives (message, broadcast, handoff)
- Kanban board task tracking (inspiration for RaidanOpencode's task engine)
- Review between agents (inspiration for RaidanOpencode's review engine)

## What Should NOT Be Reused
- The complete AGPL-3.0 codebase (LEGALLY_RESTRICTED - copyleft viral license)
- The specific TypeScript implementation details
- The kanban board UI component

## Proposed RaidanOpencode Equivalent
- **Layer 6 — Teams**: Adapt the multi-agent team management and communication primitives
- **Layer 5 — Task Engine**: Adapt the kanban-style task flow and review workflow
- **Layer 13 — Review Engine**: Adapt the agent review workflow
- **Layer 12 — Guardrails**: Adapt the concept of bounded communication

## Attribution Requirements
**LEGALLY_RESTRICTED**: "RaidanOpencode acknowledges the agent-teams-ai repository for ideas about multi-agent team communication and kanban task tracking. The AGPL-3.0 codebase was NOT reused; only concepts and architectural ideas were extracted. RaidanOpencode uses a MIT/Apache license model, not copyleft."

---
*Source analyzed on 2026-08-23. License: AGPL-3.0 - CONCEPTUAL IDEAS ONLY, code not reusable due to copyleft viral license.*