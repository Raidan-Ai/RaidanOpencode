# Source Report: nimbalyst

## Repository
- **URL**: https://github.com/nimbalyst/nimbalyst
- **Author/Organization**: nimbalyst
- **License**: MIT License
- **Main Language**: TypeScript
- **Runtime**: TypeScript/Node.js runtime
- **Architecture**: "Nimbalyst - The open-source visual workspace for Claude Code, Codex, and OpenCode. Run multiple coding agents in parallel, edit their work visually in markdown, mockups, and diagrams, and track tasks. Free, MIT-licensed desktop app for macOS, Windows, Linux, with mobile companion for iOS and Android."

## Primary Problem Solved
Provides a visual workspace for multiple coding agents. Enables running multiple coding agents in parallel, visual editing of their work in markdown, mockups, and diagrams, and task tracking. MIT-licensed desktop app cross-platform.

## Major Capabilities
- Visual workspace for multiple agents in parallel
- Markdown, mockups, and diagrams editing
- Task tracking
- Desktop app (macOS, Windows, Linux)
- Mobile companion (iOS, Android)
- MIT-licensed, cross-platform

## UI Model
Visual desktop workspace. Markdown editor, diagram editor, task tracker. Desktop app with mobile companion.

## Orchestration Model
Parallel agent execution with visual workspace. Multiple agents run in parallel, work edited visually.

## Agent Model
Agents as parallel workers in the visual workspace. Visual editing of their output.

## Session Model
Visual workspace session management. Persistent across restarts.

## Task Model
Task tracking within the visual workspace.

## Workspace Model
Visual workspace for agent output. Markdown, diagrams, mockups.

## Git Strategy
Git integration for task tracking and work persistence.

## MCP Strategy
MCP not a primary focus.

## Skill Strategy
Not a primary focus.

## State State
Agent status, workspace state, task status.

## Persistence
Visual workspace persistence. Desktop app state.

## Observability
Visual workspace observability. Agent status, task progress.

## Security Model
Desktop app security. MIT-licensed, self-contained.

## Isolation Model
Per-agent workspace isolation within the visual canvas.

## Windows Support
First-class support. Windows desktop app.

## Linux Support
Good support. Linux desktop app.

## macOS Support
Good support. macOS desktop app.

## What Should Be Reused Conceptually
- Visual workspace for parallel agents concept (inspiration for RaidanOpencode's optional desktop control plane)
- Parallel agent execution ideas (inspiration for Layer 28 - Multi-Agent Execution Policy)
- Task tracking visual patterns (inspiration for Task Engine UI)
- Cross-platform desktop app model (aligns with RaidanOpencode's Windows/Linux/macOS support)

## What Should NOT Be Reused
- The complete TypeScript/React implementation
- The specific visual editing frameworks (markdown/diagram editors are commodity)
- The desktop app distribution model

## Proposed RaidanOpencode Equivalent
- **Layer 19 — Desktop / Web Control Plane**: Adapt the visual workspace concept into the optional desktop/web control plane (optional layer)
- **Layer 28 — Multi-Agent Execution Policy**: Adapt the parallel execution policy and constraints
- **Layer 2 — Runtime Registry**: Adapt the parallel agent execution concepts
- **Layer 18 — TUI**: Adapt non-visual TUI patterns (the desktop app is separate from TUI)

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from nimbalyst/nimbalyst, particularly its visual workspace for parallel coding agents, cross-platform desktop app, and task tracking patterns. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption.*