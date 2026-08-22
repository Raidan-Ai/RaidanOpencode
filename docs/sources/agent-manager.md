# Source Report: agent-manager

## Repository
- **URL**: https://github.com/YoanWai/agent-manager
- **Author/Organization**: YoanWai
- **License**: Apache License 2.0
- **Main Language**: Go
- **Runtime**: Go binary
- **Architecture**: "The fastest workflow for every AI coding agent. Live status, quick prompts, worktrees, and diff review from one tmux TUI."

## Primary Problem Solved
Provides the fastest workflow for AI coding agents with live status, quick prompts, worktree management, and diff review from one tmux TUI. Solves the problem of slow, fragmented agent workflows.

## Major Capabilities
- Live status of agents
- Quick prompts from one interface
- Git worktree management
- Diff review from TUI
- tmux TUI interface
- Support for Claude Code, Codex, OpenCode, Gemini CLI
- Go-based for performance

## UI Model
tmux TUI. Bubble Tea framework. Keyboard navigation. One interface for all agent workflow operations.

## Orchestration Model
Local workflow orchestration. Managing agents through a single TUI interface. tmux-based session management.

## Agent Model
Agent-agnostic workflow management. Supports Claude Code, Codex, OpenCode, Gemini CLI.

## Session Model
tmux session management. Sessions persist through the TUI.

## Task Model
Not a primary focus. Focus is on agent workflow operations.

## Workspace Model
Git worktree management. Worktrees created and managed through the TUI.

## Git Strategy
Git worktree management. Create, switch, and manage worktrees from the TUI.

## MCP Strategy
MCP not a primary focus. Workflow-focused.

## Skill Strategy
Not a primary focus. Workflow-focused.

## State Strategy
Agent status (live, waiting, etc.) visible through TUI.

## Persistence
tmux session persistence. Sessions survive TUI restart.

## Observability
Live status visible through TUI. Agent activity visible.

## Security Model
Local tmux focus. No cloud backend.

## Isolation Model
Isolation through tmux session boundaries.

## Windows Support
Not explicitly addressed. tmux not mandatory on Windows per the architecture rules. Windows Terminal + PowerShell equivalents would be needed.

## Linux Support
Good support. tmux native.

## macOS Support
Good support. tmux native.

## What Should Be Reused Conceptually
- Fast workflow patterns (inspiration for RaidanOpencode's agent lifecycle)
- Git worktree management (inspiration for RaidanOpencode's workspace manager)
- TUI patterns from tmux (inspiration for RaidanOpencode's TUI, but not mandatory tmux on Windows)
- Live status display (inspiration for RaidanOpencode's observability)
- Quick prompt interface (inspiration for RaidanOpencode's control-plane)

## What Should NOT Be Reused
- The complete Go implementation
- The tmux dependency (RaidanOpencode makes tmux optional on Windows)
- The specific Bubble Tea framework

## Proposed RaidanOpencode Equivalent
- **Layer 4 — Session & Workspace Manager**: Adapt the git worktree management and TUI workflow patterns
- **Layer 18 — TUI**: Adapt the TUI workflow patterns (but make tmux optional on Windows)
- **Layer 1 — Core Engine**: Adapt the event bus and lifecycle concepts

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from agent-manager, particularly its git worktree management, fast workflow patterns, and tmux TUI design. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture. The worktree management and TUI patterns are adapted with Windows compatibility."

---
*Source analyzed on 2026-08-23. License: Apache-2.0 - compatible for conceptual adoption.*