# Source Report: agent-of-empires

## Repository
- **URL**: https://github.com/agent-of-empires/agent-of-empires
- **Author/Organization**: agent-of-empires
- **License**: MIT License
- **Main Language**: Rust
- **Runtime**: Rust binary
- **Architecture**: "Manage multiple Claude Code, OpenCode agents from either TUI or Web for easy access on mobile. Also supports Mistral Vibe, Codex CLI, Gemini CLI, Pi.dev, Copilot CLI, Factory Droid Coding."

## Primary Problem Solved
Provides a unified management interface (TUI or Web) for multiple AI coding agents. Solves the problem of managing disparate agent interfaces by providing one unified access point.

## Major Capabilities
- TUI or Web interface for agent management
- Manage multiple Claude Code, OpenCode agents
- Support for Mistral Vibe, Codex CLI, Gemini CLI, Pi.dev, Copilot CLI, Factory Droid Coding
- Mobile-friendly access
- Agent health monitoring
- Session management

## UI Model
TUI (terminal) or Web interface. Both provide agent management capabilities. Mobile-optimized web access.

## Orchestration Model
Unified management plane. Routes requests to appropriate agents. No multi-agent coordination orchestration - focused on individual agent access.

## Agent Model
Individual agent management. Each agent is managed independently through the unified interface.

## Session Model
Agent session management. TUI or Web provides access to agent sessions.

## Task Model
Not a primary focus. Focus is on agent access and management.

## Workspace Model
Not a primary focus. Focus is on agent access.

## Git Strategy
Git integration for agent commands. Not a primary focus.

## MCP Strategy
MCP not a primary focus. Agent management focus.

## Skill Strategy
Not a primary focus. Agent access focus.

## State Strategy
Agent health and status visible through TUI or Web.

## Persistence
Session persistence through TUI or Web interface.

## Observability
Agent health monitoring through TUI/Web. Status visible.

## Security Model
TUI/Web access control. User manages security.

## Isolation Model
Isolation through separate agent sessions.

## Windows Support
Not explicitly addressed. Rust binary so potentially cross-compilable.

## Linux Support
Good support. Rust binary native.

## macOS Support
Good support. Rust binary native.

## What Should Be Reused Conceptually
- Unified management interface concept (inspiration for RaidanOpencode's control plane)
- TUI + Web dual interface pattern (inspiration for RaidanOpencode's optional desktop/web control plane)
- Agent health monitoring (inspiration for RaidanOpencode's health monitor)
- Multi-agent access management (inspiration for RaidanOpencode's agent registry)

## What Should NOT Be Reused
- The complete Rust implementation
- The specific TUI/Web frameworks
- The mobile-specific optimizations

## Proposed RaidanOpencode Equivalent
- **Layer 16 — Human Control Plane**: Adapt the TUI/Web dual interface for human intervention
- **Layer 15 — Health Monitor**: Adapt the agent health monitoring concepts
- **Layer 0 — OpenCode Compatibility**: Adapt the multi-agent access pattern
- **Layer 18 — TUI**: Adapt TUI concepts (but create one canonical TUI)

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from agent-of-empires, particularly its unified TUI/Web agent management interface, agent health monitoring, and multi-agent access patterns. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption.*