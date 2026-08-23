# ADR-006 — Context Engine with MVI

Status: Accepted · Date: 2026-08-23

## Context
Token bloat is the top failure mode of agent systems. OpenAgentsControl demonstrates MVI budgets + lazy context resolution working in production on this exact substrate (MIT).

## Decision
Context Engine assembles context per layer (system/org/project/team/agent/task) using MVI rules: small-context-first, lazy file loads, local-wins over global for project intelligence, budgets (<100 concepts/<150 guides/<80 examples per file). Ranking inputs: relevance, priority, recency, dependency, task-relation, semantic similarity, token budget. External docs via scout pattern with cache.

## Consequences
+ Direct token/cost reduction (~80% claim from OAC; we measure our own)
− Requires discipline in skill/agent authoring (budget linting added to doctor)
