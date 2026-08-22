# Source Report: agx

## Repository
- **URL**: https://github.com/ramarlina/agx
- **Author/Organization**: ramarlina
- **License**: No license specified (public repository, no license file in metadata)
- **Main Language**: TypeScript
- **Runtime**: TypeScript/Node.js runtime
- **Architecture**: "Run AI coding agents as a persistent team with objectives, memory, and coordinated work. The same agents built this tool — 167+ merged PRs, 93% clean."

## Primary Problem Solved
Run AI coding agents as a persistent team with objectives, memory, and coordinated work. Provides a team-based agent execution model with memory and coordination.

## Major Capabilities
- Persistent team execution
- Objectives management
- Memory system for agents
- Coordination between agents
- 167+ merged PRs, 93% clean

## UI Model
Not detailed in metadata. TypeScript-based. Likely CLI or TUI.

## Orchestration Model
Team-based orchestration. Agents work as a persistent team with objectives and coordination.

## Agent Model
Agents as team members with shared objectives and memory.

## Session Model
Persistent team sessions. Memory persists across sessions.

## Task Model
Objective-based task management. Tasks tied to team objectives.

## Workspace Model
Not explicitly detailed. Team-based workspace.

## Git Strategy
Not explicitly detailed. Git integration expected for code changes.

## MCP Strategy
MCP not a primary focus.

## Skill Strategy
Skill management for team agents.

## State Strategy
Team state and agent status tracking.

## Persistence
Persistent team execution with memory.

## Observability
Team performance and agent status visibility.

## Security Model
Team-based security. Objectives and coordination provide some security.

## Isolation Model
Team isolation with shared objectives.

## Windows Support
Not explicitly addressed. TypeScript/Node.js cross-platform.

## Linux Support
Good support via Node.js.

## macOS Support
Good support via Node.js.

## What Should Be Reused Conceptually
- Persistent team execution concept (inspiration for RaidanOpencode's team engine)
- Objectives management (inspiration for RaidanOpencode's task engine)
- Memory system for agents (inspiration for RaidanOpencode's agent memory, but scoped)
- Coordination between agents (inspiration for communication primitives)

## What Should NOT Be Reused
- The complete TypeScript implementation
- Specific memory implementation details
- Team coordination algorithm

## Proposed RaidanOpencode Equivalent
- **Layer 6 — Teams**: Adapt the persistent team execution and objectives management
- **Layer 5 — Task Engine**: Adapt the objective-based task management
- **Layer 29 — Agent Memory**: Adapt the memory system concept (but scoped: Global/User/Project/Team/Agent/Task/Session)
- **Layer 2 — Runtime Registry**: Adapt the persistent runtime concept

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from agx, particularly its persistent team execution model, objectives management, and agent memory system. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture."

---
*Source analyzed on 2026-08-23. License: No specific license - CONCEPTUAL IDEAS ONLY. Repository has no formal license declaration. Ideas extracted with attribution.*