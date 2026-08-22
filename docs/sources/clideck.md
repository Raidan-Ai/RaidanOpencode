# Source Report: clideck

## Repository
- **URL**: https://github.com/rustykuntz/clideck
- **Author/Organization**: rustykuntz
- **License**: MIT License
- **Main Language**: JavaScript
- **Runtime**: Node.js/JavaScript runtime
- **Architecture**: "A dashboard for running and coordinating multiple AI CLI agents at once."

## Primary Problem Solved
Provides a dashboard for running and coordinating multiple AI CLI agents at once. Solves the problem of monitoring and controlling multiple agent CLI processes from one interface.

## Major Capabilities
- Dashboard for multiple AI CLI agents
- Coordination of agent CLI processes
- Real-time agent status display
- Agent command dispatch

## UI Model
Dashboard UI. JavaScript-based. Monitoring and coordination interface.

## Orchestration Model
Agent coordination through dashboard. Dashboard displays and controls agent processes.

## Agent Model
AI CLI agents. Dashboard provides coordination interface.

## Session Model
Agent session monitoring through dashboard.

## Task Model
Not a primary focus. Focus is on agent coordination.

## Workspace Model
Not a primary focus.

## Git Strategy
Not a primary focus.

## MCP Strategy
Not a primary focus.

## Skill Strategy
Not a primary focus.

## State Strategy
Agent status visible through dashboard.

## Persistence
Dashboard state persistence.

## Observability
Agent status visible through dashboard.

## Security Model
Local dashboard. No remote exposure.

## Isolation Model
Isolation through agent process boundaries.

## Windows Support
Not explicitly addressed. JavaScript/Node.js cross-platform.

## Linux Support
Good support via Node.js.

## macOS Support
Good support via Node.js.

## What Should Be Reused Conceptually
- Dashboard for coordinating multiple agents concept (inspiration for RaidanOpencode's observability/dashboard)
- Agent coordination UI patterns (inspiration for TUI/dashboard in control plane)
- Real-time status display (inspiration for RaidanOpencode's observability)

## What Should NOT Be Reused
- The complete JavaScript implementation
- Node.js-specific dependencies
- The specific dashboard framework

## Proposed RaidanOpencode Equivalent
- **Layer 14 — Observability**: Adapt the dashboard and real-time status display concepts
- **Layer 15 — Health Monitor**: Adapt the agent status monitoring
- **Layer 18 — TUI**: Adapt dashboard UI patterns for TUI (but one canonical TUI only)

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from rustykuntz/clideck, particularly its dashboard for running and coordinating multiple AI CLI agents and real-time status display. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption.*