# Source Report: OpenAgentsControl

## Repository
- **URL**: https://github.com/darrenhinde/OpenAgentsControl
- **Author/Organization**: darrenhinde
- **License**: MIT License
- **Main Language**: TypeScript
- **Runtime**: Node.js/TypeScript runtime
- **Architecture**: Multi-language framework (TypeScript, Python, Go, Rust) built for OpenCode

## Primary Problem Solved
Provides a plan-first development workflow with approval-based execution for AI agents. Solves the problem of unstructured agent execution by requiring explicit planning and validation before code changes.

## Major Capabilities
- Plan-first development workflow
- Approval-based execution gates
- Multi-language support (TypeScript, Python, Go, Rust)
- Automatic testing, code review, and validation
- Context-driven engineering
- Pattern-based development
- Editable agents
- Minimal Viable Information (MVI) context strategy
- Team-shared project patterns

## UI Model
CLI-focused with programmatic API. No native UI; integrated via OpenCode hooks and commands.

## Orchestration Model
Plan → Approve → Execute pattern. The orchestrator creates a plan, requires approval, then executes. Anti-hallucination enforcement built into the workflow.

## Agent Model
Agents are plan-driven with explicit approval gates between planning and execution. Agents cannot proceed without validation of their planned actions.

## Session Model
Session management tied to OpenCode session lifecycle. Plan approval acts as a session gate.

## Task Model
Tasks are decomposed into explicit plans with validation checkpoints. Each plan step must be approved before progression.

## Workspace Model
Workspace management through OpenCode's existing mechanisms. Focus is on workflow discipline rather than workspace isolation.

## Git Strategy
Git integration for plan tracking and version control. Supports review of planned changes before execution.

## MCP Strategy
MCP integration points for model context protocol. Designed to work with OpenCode's MCP system.

## Skill Strategy
Skills are integrated as plan validation extensions. Each skill can hook into the approval flow.

## State Strategy
State is managed through the plan approval cycle. DISCOVERED → READY → STARTING → RUNNING → WAITING → BLOCKED → REVIEW_REQUIRED → COMPLETED → FAILED → RECOVERING → STOPPED pattern aligns with RaidanOpencode's canonical lifecycle.

## Persistence
Persistence through OpenCode's session and plan storage. Plans and approvals are persisted between sessions.

## Observability
Logs, events, and audit trails for plan creation, approval, and execution. Full observability of the plan lifecycle.

## Security Model
Approval gates provide security. Every execution step requires explicit approval, preventing unauthorized actions.

## Isolation Model
Isolation through approval gates rather than process isolation. The plan approval acts as a security boundary.

## Windows Support
Not explicitly documented; TypeScript-based so likely cross-platform where Node.js runs.

## Linux Support
Good support via Node.js and TypeScript.

## macOS Support
Good support via Node.js and TypeScript.

## What Should Be Reused Conceptually
- Plan-first development workflow (DISCOVERED → READY → STARTING → ... lifecycle)
- Approval gate architecture (model for RaidanOpencode's guardrails layer)
- ContextScout-style pattern-based development
- MVI (Minimal Viable Information) context strategy
- Editable agents concept
- Team-shared project patterns

## What Should NOT Be Reused
- The complete orchestration engine (RaidanOpencode has its own canonical orchestrator)
- Multi-language runtime support (RaidanOpencode abstracts this differently)
- Specific language implementations

## Proposed RaidanOpencode Equivalent
- **Layer 12 — Guardrails**: Adapt the approval gate architecture into RaidanOpencode's risk class system (LOW/MEDIUM/HIGH/CRITICAL)
- **Layer 9 — Context Engine**: Adapt the MVI context strategy and pattern-based development
- **Layer 10 — Skills**: Adapt the skill integration hooks
- **Layer 1 — Core Engine**: Adapt the event bus and lifecycle state machine

## Attribution Requirements
"RaidanOpencode was inspired by architectural ideas and public documentation from OpenAgentsControl, particularly its plan-first development workflow, approval-based execution gates, and MVI context strategy. Code was not reused; concepts were adapted into the RaidanOpencode canonical architecture."

---
*Source analyzed on 2026-08-23. License: MIT - compatible for conceptual adoption.*