# Source Report: agent-deck

## Repository
- **URL**: https://github.com/asheshgoplani/agent-deck
- **Author/Organization**: asheshgoplani
- **License**: MIT License
- **Main Language**: Go
- **Runtime**: Go binary
- **Architecture**: "Terminal session manager for AI coding agents. One TUI for Claude, Gemini, OpenCode, Codex, and more."

## Primary Problem Solved
Provides one TUI (Terminal User Interface) to rule them all - a unified terminal interface for multiple AI coding agents (Claude, Gemini, OpenCode, Codex, and more). Solves the problem of managing multiple separate terminal sessions.

## Major Capabilities
- One TUI for multiple AI coding agents
- Support for Claude, Gemini, OpenCode, Codex, and more
- Terminal session management
- Agent session switching
- Unified terminal interface

## UI Model
TUI (Terminal User Interface). Bubble Tea framework. Keyboard navigation. One interface for all agents.

## Orchestration Model
Session management orchestration. Routes terminal input/output to the correct agent session.

## Agent Model
Agent-agnostic terminal interface. Routes to whatever agent is connected.

## Session Model
Terminal session management. Multiple agents can share or alternate through one TUI.

## Task Model
Not a primary focus. Focus is on session management.

## Workspace Model
Terminal session as workspace. Not Git worktree-focused.

## Git Strategy
Git integration for session context. Not a primary focus.

## MCP Strategy
MCP not a primary focus. Terminal session manager.

## Skill Strategy
Not a primary focus. Terminal routing focus.

## State Strategy
Session state management. Which agent is active, which is waiting.

## Persistence
Terminal session persistence. TUI state persisted.

## Observability
Session visibility through TUI. Which agent is active.

## Security Model
Local terminal focus. No remote exposure.

## Isolation Model
Isolation through terminal session boundaries.

## Windows Support
Not explicitly addressed. Go binary so potentially cross-platform.

## Linux Support
Good support. Go binary native.

## macOS Support
Good support. Go binary native.

## What Should Be Reused Conceptually
- One TUI for multiple agents concept (inspiration for RaidanOpencode's canonical TUI)
- Terminal session management patterns (inspiration for RaidanOpencode's session manager)
- Unified interface for multiple CLIs (inspiration for RaidanOpencode's model router)
- Agent-agnostic routing (inspiration for RaidanOpencode's runtime registry)

## What Should NOT Be Reused
- The complete Go implementation
- The Bubble Tea TUI framework (RaidanOpencode creates its own canonical TUI)
- Agent-specific integrations

## Proposed RaidanOpencode Equivalent
- **Layer 18 — TUI**: Adapt the "one TUI for multiple agents" concept into RaidanOpencode's canonical TUI (single TUI only, not multiple competing ones)
- **Layer 4 — Session & Workspace Manager**: Adapt session management patterns
- **Layer 2 — Runtime Registry**: Adapt agent-agnostic terminal routing

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from agent-deck, particularly its 'one TUI for multiple AI coding agents' concept and terminal session management patterns. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture. The canonical TUI principle (one TUI only) is directly adapted."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption.*