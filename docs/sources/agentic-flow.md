# Source Report: agentic-flow

## Repository
- **URL**: https://github.com/ruvnet/agentic-flow
- **Author/Organization**: ruvnet
- **License**: No license specified in metadata
- **Main Language**: TypeScript
- **Runtime**: TypeScript/Node.js runtime
- **Architecture**: "Easily switch between alternative low-cost AI models in Claude Code/Agent SDK. For those comfortable using Claude agents and commands, it lets you take what you've created and deploy fully hosted agents for real business purposes. Use Claude Code to get the agent working, then deploy it in your favorite cloud."

## Primary Problem Solved
Switch between alternative low-cost AI models in Claude Code/Agent SDK. Enables taking working agents and deploying them for real business purposes. Deploy in favorite cloud.

## Major Capabilities
- Model switching between low-cost alternatives
- Claude Code/Agent SDK integration
- Business deployment of agents
- Cloud deployment flexibility

## UI Model
Not heavily detailed. TypeScript-based. Likely CLI or simple interface.

## Orchestration Model
Model switching orchestration. Switch between alternative models.

## Agent Model
Claude agents and commands. Model switching focus.

## Session Model
Not a primary focus.

## Task Model
Not a primary focus.

## Workspace Model
Not a primary focus.

## Git Strategy
Not a primary focus.

## MCP Strategy
Not a primary focus.

## Skill Strategy
Not a primary focus.

## State Strategy
Not a primary focus.

## Persistence
Not a primary focus.

## Observability
Not a primary focus.

## Security Model
Not a primary focus.

## Isolation Model
Not a primary focus.

## Windows Support
Not explicitly addressed.

## Linux Support
Good support.

## macOS Support
Good support.

## What Should Be Reused Conceptually
⚠️ **INSPIRE**: Model switching between low-cost alternatives. This is a model routing concept, not an full orchestration system.

- Model fallback chains (inspiration for RaidanOpencode's model failover)
- Provider switching concepts (inspiration for model router capability matching)
- Low-cost model awareness (inspiration for model router cost tracking)

## What Should NOT Be Reused
- The complete TypeScript implementation
- The Claude Code/Agent SDK specific integrations
- The business deployment workflow

## Proposed RaidanOpencode Equivalent
- **Layer 8 — Model Router**: Adapt the model fallback and provider switching concepts into the canonical model router
- **Layer 37 — Model Failover**: Adapt the model failure → retry → alternate model → alternate provider → human escalation pattern

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from ruvnet/agentic-flow, particularly its model switching between low-cost alternatives and the model fallback chain pattern. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture. The model failover chain (primary → fallback → emergency → human) is original implementation inspired by but not copying agentic-flow."

---
*Source analyzed on 2026-08-23. License: No license specified - CONCEPTUAL IDEAS ONLY. Model routing ideas adapted with attribution.*