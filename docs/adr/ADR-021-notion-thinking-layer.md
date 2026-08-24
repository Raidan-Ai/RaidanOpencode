# ADR-021 — Notion as Thinking / Governance Layer

**Status:** Accepted
**Date:** 2026-08-24
**Related:** ADR-010 (MCP Registry), ADR-011 (A2A Layer), ADR-016 (Connector Registry)

## Context

RaidanOpencode needs a durable home for strategy, research, architecture reasoning,
decisions and curated knowledge that is distinct from:

- Git (source of truth for code)
- the Raidan kernel (source of truth for runtime state)

Without an explicit boundary, project knowledge fragments across chat history,
local files and issue trackers, and governance decisions become unauditable.

## Decision

Adopt **Notion** as the thinking/governance layer, connected **MCP-first**:

1. Runtime agents access Notion through the official `@notionhq/notion-mcp-server`
   (agent ↔ tools/resources). Notion is NOT wired through A2A — A2A remains
   reserved exclusively for agent ↔ agent interoperability (per ADR-011).
2. Workspace layout is governed by `integrations/notion/schema/notion-schema.yaml`
   (root page `Opencode` + 15 canonical databases), provisioned by an idempotent
   bootstrap script (title-lookup before every create; safe to re-run).
3. Authentication uses environment variables only (`NOTION_API_TOKEN`,
   `OPENAPI_MCP_HEADERS`). No secret may enter Git, logs, or generated docs.
4. Database relations are deferred to v1 until a schema manager exists — v0
   deliberately ships without them to avoid overreach.

## Consequences

- Ownership boundaries are explicit: Notion never becomes a runtime database,
  event log, or secret store.
- Bootstrap is reproducible and reversible (generated ID map is gitignored).
- `raidan notion status|sync|doctor` CLI commands remain future work.
