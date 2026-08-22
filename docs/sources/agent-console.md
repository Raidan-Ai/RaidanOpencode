# Source Report: agent-console

## Repository
- **URL**: https://github.com/buhuipao/agent-console
- **Author/Organization**: buhuipao
- **License**: Apache License 2.0
- **Main Language**: Rust
- **Runtime**: Rust binary
- **Architecture**: "A local terminal control plane for Codex and Claude Code sessions"

## Primary Problem Solved
Provides a local terminal control plane for discovering, monitoring, resuming, and working beside persistent workspace shells. Solves the problem of scattered, ephemeral AI coding sessions.

## Major Capabilities
- Local terminal control plane
- Discover persistent workspace shells
- Monitor session status
- Resume interrupted sessions
- Workspace shell management
- Support for Codex and Claude Code
- Rust-based for performance

## UI Model
Terminal UI (TUI). Designed for terminal use. Keyboard navigation.

## Orchestration Model
Local control plane. Managing sessions on the local machine. No remote orchestration.

## Agent Model
Manages Codex and Claude Code agents as sessions. Focus on session lifecycle rather than agent capabilities.

## Session Model
Persistent workspace shells. Sessions can be discovered, monitored, and resumed. Core value proposition.

## Task Model
Not a primary focus. Focus is on session management.

## Workspace Model
Workspace shell management. Persistent terminals that survive disconnects.

## Git Strategy
Git integration for session context. Worktree management not a primary focus.

## MCP Strategy
MCP not a primary focus. Local terminal control plane.

## Skill Strategy
Not a primary focus. Session management focus.

## State Strategy
Session state (active, inactive, interrupted). Can be resumed.

## Persistence
Persistent workspace shells. Sessions survive process disconnects.

## Observability
Session status monitoring. Who's active, who's waiting, who's interrupted.

## Security Model
Local-only. No cloud backend. User controls all security.

## Isolation Model
Isolation through terminal session boundaries. Each session is isolated.

## Windows Support
Not explicitly addressed. Rust binary so potentially cross-compilable.

## Linux Support
Good support. Rust binary native.

## macOS Support
Good support. Rust binary native.

## What Should Be Reused Conceptually
- Local terminal control plane concept (inspiration for RaidanOpencode's workspace/session manager)
- TUI (terminal user interface) patterns (inspiration for RaidanOpencode's TUI)
- Session persistence and resume (inspiration for RaidanOpencode's session manager)
- Discover/monitor/resume pattern (inspiration for RaidanOpencode's session registry)

## What Should NOT Be Reused
- The complete Rust implementation
- The specific TUI framework (Bubble Tea)
- The Codex/Codex Code specific integrations

## Proposed RaidanOpencode Equivalent
- **Layer 4 — Session & Workspace Manager**: Adapt the local terminal control plane and session persistence patterns
- **Layer 18 — TUI**: Adapt the TUI patterns (but create one canonical TUI, not multiple)
- **Layer 1 — Core Engine**: Adapt the event bus and lifecycle concepts

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from agent-console, particularly its local terminal control plane, session persistence and resume patterns, and TUI design. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture."

---
*Source analyzed on 2026-08-23. License: Apache-2.0 - compatible for conceptual adoption.*