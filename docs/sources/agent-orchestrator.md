# Source Report: agent-orchestrator

## Repository
- **URL**: https://github.com/Untrivial-ai/agent-orchestrator
- **Author/Organization**: Untrivial-ai
- **License**: Apache License 2.0
- **Main Language**: TypeScript
- **Runtime**: TypeScript/Node.js runtime
- **Architecture**: "Agent IDE that enables you to manage fleets of coding agents. It comes with an agentic orchestrator that plans tasks, spawns agents, and autonomously handles CI fixes, merge conflicts, and code reviews."

## Primary Problem Solved
Provides an agent IDE with a full orchestration engine that plans tasks, spawns agents, and autonomously handles CI fixes, merge conflicts, and code reviews. Solves the problem of managing large numbers of agents and their coordination.

## Major Capabilities
- Agent fleet management
- Task planning and decomposition
- Agent spawning and lifecycle management
- Autonomous CI fixes
- Merge conflict resolution
- Code review automation
- 9844 stars - major project

## UI Model
IDE-style interface. Agent console, task browser, code editor integration. Rich desktop application UI.

## Orchestration Model
Full orchestration engine. Plans tasks, spawns agents, handles CI/merge/code review autonomously. This is the "another orchestrator" case that the rules warn against.

## Agent Model
Coding agents with specific capabilities. Can be spawned, managed, and dispatched to tasks.

## Session Model
Agent session management within the IDE. Sessions tracked and managed.

## Task Model
Task planning and decomposition. Complex task graph support.

## Workspace Model
Workspace management for agent coding. Git integration.

## Git Strategy
Git integration for CI fixes, merge conflicts, and code reviews. Worktree management.

## MCP Strategy
MCP integration for model context. Supports model context protocol.

## Skill Strategy
Skill management for agents. Skill registry and loading.

## State State
Agent status, task status, workflow state tracking.

## Persistence
Persistence of agent states, task states, workflow history.

## Observability
Full observability of agent fleet, task progress, CI/CD pipeline status.

## Security Model
Approval gates for destructive actions. Security-focused design.

## Isolation Model
Workspace isolation per agent. Git worktree isolation.

## Windows Support
Not explicitly addressed.

## Linux Support
Good support.

## macOS Support
Good support.

## What Should Be Reused Conceptually
⚠️ **REJECT**: This repository represents "embed Agent Orchestrator as another orchestrator" - the Architecture Synthesis Rule explicitly says "DO NOT embed Agent Orchestrator as another orchestrator"

The RaidanOpencode architecture has exactly ONE canonical orchestrator (Layer 7). Adding another orchestration engine from this repository would violate the core architecture principle.

## What Should NOT Be Reused
- The complete TypeScript orchestration engine
- The IDE-specific UI components
- The merge conflict resolution algorithm
- The CI/CD automation workflow

## Proposed RaidanOpencode Equivalent
**N/A - This repository's core capability (orchestration) is REJECTED as a duplicate orchestrator. Concepts that can be adapted:**

- Task planning ideas (but reimplemented in RaidanOpencode's orchestrator)
- Code review concepts (adapted to Layer 13 - Review Engine)
- Merge coordination ideas (adapted to Layer 13 - Review Engine with merge readiness)
- CI fix patterns (adapted to Layer 13 - Review Engine feedback loops)

## Attribution Requirements
**REJECT/DUPLICATE**: "RaidanOpencode does not embed or reuse the agent-orchestrator codebase. The RaidanOpencode canonical orchestrator (Layer 7) is the single orchestration engine. Concepts such as task planning, code review, and merge coordination are reimplemented independently within the RaidanOpencode architecture to avoid orchestration duplication."

---
*Source analyzed on 2026-08-23. License: Apache-2.0 - ORCHESTRATION ENGINE REJECTED per architecture synthesis rule. Only conceptual ideas (task planning, code review) can be referenced as inspiration, not code or architecture.*