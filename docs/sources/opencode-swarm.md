# Source Report: opencode-swarm

## Repository
- **URL**: https://github.com/ZaxbyHub/opencode-swarm
- **Author/Organization**: ZaxbyHub
- **License**: MIT License
- **Main Language**: TypeScript
- **Runtime**: TypeScript/Node.js runtime
- **Architecture**: "Architect-centric agentic swarm plugin for OpenCode. Hub-and-spoke orchestration with SME consultation, code generation, and QA review."

## Primary Problem Solved
Architect-centric agentic swarm plugin for OpenCode. Provides hub-and-spoke orchestration with SME (Subject Matter Expert) consultation, code generation, and QA review. Designed as a plugin for OpenCode.

## Major Capabilities
- Agentic swarm orchestration
- Hub-and-spoke architecture
- SME (Subject Matter Expert) consultation
- Code generation
- QA review
- OpenCode plugin

## UI Model
Plugin interface for OpenCode. Likely CLI or integrated OpenCode UI.

## Orchestration Model
Hub-and-spoke orchestration. Central hub coordinates with SMEs and agents. Swarm execution through hub.

## Agent Model
Agents as spokes in the hub-and-spoke model. SMEs provide expert consultation.

## Session Model
Plugin session management within OpenCode.

## Task Model
Task generation and review through the swarm.

## Workspace Model
Workspace management through OpenCode plugin.

## Git Strategy
Git integration for code generation and QA review.

## MCP Strategy
MCP integration through OpenCode plugin.

## Skill Strategy
Skill management through OpenCode plugin.

## State State
Swarm state, agent status, orchestration state.

## Persistence
Persistence of swarm state, agent states, plugin configuration.

## Observability
Swarm observability. Agent status, orchestration state.

## Security Model
Plugin security through OpenCode's permission system.

## Isolation Model
Per-agent isolation through hub-and-spoke model.

## Windows Support
Not explicitly addressed. TypeScript/Node.js cross-platform.

## Linux Support
Good support via Node.js.

## macOS Support
Good support via Node.js.

## What Should Be Reused Conceptually
⚠️ **INSPIRE**: Hub-and-spoke orchestration model. This is an OpenCode plugin, not a standalone orchestrator. The hub-and-spoke model can inspire RaidanOpencode's agent selection and runtime selection, but should NOT be implemented as a separate orchestration engine.

- Hub-and-spoke agent selection (inspiration for RaidanOpencode's model router and agent selection)
- SME consultation concept (inspiration for delegation and review routing)
- Code generation patterns (inspiration for agent tool use)
- QA review concepts (inspiration for Layer 13 - Review Engine)

## What Should NOT Be Reused
- The complete TypeScript plugin code
- The OpenCode plugin framework specifics
- The hub-and-spoke as a standalone orchestration engine (would duplicate Layer 7)

## Proposed RaidanOpencode Equivalent
- **Layer 8 — Model Router**: Adapt the hub-and-spoke model for model selection (but RaidanOpencode has its own model router)
- **Layer 7 — Orchestrator**: The hub-and-spoke concept informs agent selection but RaidanOpencode's orchestrator is the single canonical layer
- **Layer 6 — Teams**: Adapt the hub-and-spoke for team orchestration
- **Layer 2 — Runtime Registry**: Adapt the hub-and-spoke for runtime selection

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from ZaxbyHub/opencode-swarm, particularly its hub-and-spoke orchestration model and SME consultation concept for agent selection. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture. The hub-and-spoke model informs but does not replace RaidanOpencode's canonical orchestrator (Layer 7)."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption. Hub-and-spoke model adapted as inspiration only, not as standalone orchestrator.*