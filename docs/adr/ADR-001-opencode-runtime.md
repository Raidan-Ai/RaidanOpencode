# ADR-001 — OpenCode as Runtime (No Fork)

Status: Accepted · Date: 2026-08-23

## Context
RaidanOpencode needs an execution substrate for agents/skills/tools. Options: fork OpenCode, wrap it, or build beside it using its extension surfaces.

## Decision
OpenCode is the runtime. RaidanOpencode is an external control plane that never forks it. Verified extension points:
- `opencode serve` REST+SSE API (sessions, messages, permissions, config, events)
- Plugins (`tool.execute.before/after`, event bus) for interception
- Native filesystem drops: agents/, commands/, skills/, plugins/, mcp config

## Consequences
+ Zero merge conflicts with upstream OpenCode evolution
+ Windows/Linux/macOS parity inherited from OpenCode itself
− Some deep behaviors (session internals) reachable only via documented APIs
− If a required capability lacks an extension point → must file upstream issue or isolate a minimal patch behind an adapter (documented per spec §3)

Verification basis: docs/research/platform-analysis-opencode-a2a.md (live-fetched docs, Aug 2026).
