# Source Report: ai-maestro

## Repository
- **URL**: https://github.com/23blocks-OS/ai-maestro
- **Author/Organization**: 23blocks-OS
- **License**: MIT License
- **Main Language**: TypeScript
- **Runtime**: TypeScript/Node.js runtime
- **Architecture**: "AI Agent Orchestrator with Skills System - Give AI Agents superpowers: memory search, code graph queries, agent-to-agent messaging. Manage Claude, Codex or any AI Agent from one dashboard. Move Agents between computers and locations"

## Primary Problem Solver
Provides an AI Agent Orchestrator with a skills system. Gives AI agents superpowers: memory search, code graph queries, agent-to-agent messaging. Manage agents from one dashboard and move between computers and locations.

## Major Capabilities
- AI Agent Orchestration
- Skills system (memory search, code graph queries)
- Agent-to-agent messaging
- One dashboard for all agents
- Move agents between computers and locations
- 754 stars, TypeScript-based

## UI Model
Dashboard UI. TypeScript/React-based. One dashboard for all agents.

## Orchestration Model
Agent orchestration from one dashboard. Manage multiple agents from single interface.

## Agent Model
AI agents with skills. Skills provide enhanced capabilities (memory, code graph, messaging).

## Session Model
Agent session management through dashboard. Move between computers.

## Task Model
Not a primary focus. Orchestration and skills focus.

## Workspace Model
Not a primary focus. Dashboard-focused.

## Git Strategy
Git integration for agent management. Move between computers.

## MCP Strategy
MCP integration not a primary focus.

## Skill Strategy
Explicit skills system. Memory search, code graph queries, agent-to-agent messaging.

## State State
Agent status, skill availability, orchestration state.

## Persistence
Persistence of skills, agent states, dashboard configuration.

## Observability
Dashboard observability. Agent status, skill availability.

## Security Model
Dashboard access control. User manages security.

## Isolation Model
Per-agent isolation through dashboard management.

## Windows Support
Not explicitly addressed. TypeScript/Node.js cross-platform.

## Linux Support
Good support via Node.js.

## macOS Support
Good support via Node.js.

## What Should Be Reused Conceptually
- Skills system concept (inspiration for RaidanOpencode's skill engine, but reimplemented hierarchically)
- Agent-to-agent messaging (inspiration for Layer 12 communication primitives)
- One dashboard concept (inspiration for RaidanOpencode's optional control plane)
- Code graph query ideas (inspiration for context engine)

## What Should NOT Be Reused
- The complete TypeScript implementation
- The dashboard UI framework
- Specific code graph implementation details

## Proposed RaidanOpencode Equivalent
- **Layer 10 — Skills**: Adapt the skills system concept into the hierarchical skill catalog (but reimplement, not copy)
- **Layer 7 — Orchestrator**: Adapt the orchestration concepts (but RaidanOpencode has its own canonical orchestrator)
- **Layer 9 — Context Engine**: Adapt the code graph query and memory search ideas
- **Layer 2 — Runtime Registry**: Adapt the agent management concepts

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from 23blocks-OS/ai-maestro, particularly its skills system (memory search, code graph queries, agent-to-agent messaging) and the one-dashboard concept. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture. The hierarchical skill catalog is original implementation inspired by but not copying the skills system."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption. Skills system adapted conceptually only.*