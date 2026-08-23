# ADR-002 — Single Orchestrator

Status: Accepted · Date: 2026-08-23

## Context
Research found ≥8 competing orchestrators (swarm plugins, planner/worker IDEs, conductors, graph harnesses). Adopting any one wholesale either duplicates OpenCode natives or imports platform constraints (tmux/systemd/Electron).

## Decision
ONE Raidan Orchestrator implementing the complexity ladder:
L0/L1 direct/planner-executor → plain session · L2 gated pipeline (swarm-style gates) · L3 team + Lean-Turbo lanes + Council gate · L4 daemon-supervised multi-session orchestration via serve-API.
The classifier is the only component that selects a lane. opencode-swarm is evaluated as backbone for L2/L3 gate mechanics (MIT), reimplemented/wrapped under our policy engine.

## Consequences
+ No agent theater; proportional machinery
+ Windows-native at every rung (no tmux/systemd)
− We own gate-quality long-term instead of inheriting it
Rejected alternatives and rationale: architecture-comparison.md.
