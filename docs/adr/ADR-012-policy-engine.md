# ADR-012 - Policy Engine
Status: Accepted · Date: 2026-08-23
Single choke point: intercept OpenCode permission.asked events / REST permission endpoints; verdicts from domain policies (filesystem/shell/network/git/deployment/secrets/MCP/A2A/delegation/model/cost/resources) x modes (manual/supervised/balanced/autonomous). Native OpenCode permissions remain base layer - we augment (§61). Guardrails adopted: opencode-swarm circuit breakers + scope enforcement, bash-guard ask-not-deny AST design.
Consequences: + one place to audit every gate decision; - plugin hook latency on hot paths (kept async where safe).
