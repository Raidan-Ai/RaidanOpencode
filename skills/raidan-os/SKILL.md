---
name: raidan-os
description: Drive the RaidanOpencode control plane (raidan CLI) from an OpenCode session — check environment health, create/track tasks with dependency-safe lifecycle, preview policy verdicts before risky actions, route models by capability need, and back up or roll back OpenCode config changes. Use when the user asks to check raidan status, run doctor, manage raidan tasks, check policy permissions, migrate/back up config, or asks what the raidan CLI can do.
license: MIT
compatibility: Requires the raidan CLI built from https://github.com/Raidan-Ai/RaidanOpencode (node dist/src/cli/index.js or global `raidan` bin).
---

# RaidanOpencode Control Plane

You are inside OpenCode; `raidan` is the governance layer AROUND this session. Never bypass it for destructive work.

## Core rules
1. Before any irreversible action, preview the verdict: `raidan policy check <domain> <action>` — domains: filesystem, shell, network, git, deployment, secrets, mcp, a2a, model-usage, cost.
2. DENY is final. ASK means: present the action to the human and wait. ALLOW still requires your own tool-permission compliance.
3. Tasks: use `raidan task create "<title>" --complexity L0|L1|L2|L3|L4`. L0-L1 = just do it directly; L2+ = decompose into subtasks first. Dependencies are enforced by the engine — do not fake ordering.
4. Config changes: always `raidan migrate backup` first; rollback only removes files raidan itself installed.

## Command map
- Health snapshot: `raidan doctor` then `raidan status`
- Config inspection (secrets auto-redacted): `raidan config show`
- Agents/skills inventory: `raidan agent list`, `raidan skill duplicates`
- Model routing: `raidan model route --need coding --need tool-calling --prefer cost`
- Migration: `raidan migrate inspect|plan|apply|rollback`

## Escalation
If a needed capability is missing (no command above fits), report the gap instead of improvising around the control plane.
