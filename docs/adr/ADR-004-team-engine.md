# ADR-004 — Team Engine as Data Model

Status: Accepted · Date: 2026-08-23

## Context
Team products researched (kandev Office mode, agent-teams kanban apps, AI Maestro orgs) couple org hierarchy to their own UI/runtime.

## Decision
Teams are pure data + policy in core: organization→department→team→agent composition; tasks reference teams; approvals route by role. NO dedicated team dashboard in v1 — Control Center renders later from same state. Role composition over permanent physical agents (spec §56).

## Consequences
+ UI-independent canonical state (spec §93)
+ Cheap to persist (SQLite tables), trivially queryable by CLI
− Team UX arrives late; acceptable because CLI covers v1 workflows
