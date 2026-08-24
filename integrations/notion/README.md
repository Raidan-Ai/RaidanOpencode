# Notion Integration — Thinking & Governance Connector

> **Status:** `scaffolded` · **Transport:** MCP-first (+ REST bootstrap) · **Added:** 2026-08-24

## What this is

Notion is RaidanOpencode's **thinking system**: strategy, research, architecture decisions,
governance and curated knowledge. It is **not** a runtime database, event log, or secret store.

Ownership boundaries (enforced by design):

| System | Owns |
|---|---|
| Git | source code, schemas, installers, versioned docs |
| Raidan kernel | live task/session/runtime state, events, telemetry |
| **Notion** | vision, objectives, requirements, research, ADRs, risks, knowledge |

## Why MCP-first (decision record)

Notion connects as a **tool/resource provider** through MCP (`agent ↔ tools`).
A2A (`agent ↔ agent`) is deliberately **not** used for Notion — mixing the two would create a
duplicate protocol surface. See `docs/research/deduplication.md` policy.

- Runtime agents access Notion via the official `@notionhq/notion-mcp-server`.
- Workspace bootstrap uses a small idempotent script against the Notion REST API.

## Setup (Windows)

```powershell
# 1. Set the token for THIS SESSION ONLY (never commit, never hardcode)
$env:NOTION_API_TOKEN = "<your Notion integration token>"

# 2. Bootstrap the "Opencode" project (idempotent — safe to re-run)
pwsh integrations/notion/scripts/bootstrap-notion.ps1

# 3. Rotate/revoke the token afterwards if it ever left your machine (chat, email, tickets)
```

## Setup (Linux / macOS / WSL)

```bash
export NOTION_API_TOKEN="<your Notion integration token>"
./integrations/notion/scripts/bootstrap-notion.sh
```

Requires: `curl`, `jq`.

## Connect OpenCode to Notion (MCP)

Merge the snippet from [`mcp/opencode-mcp-notion.example.json`](mcp/opencode-mcp-notion.example.json)
into your `opencode.json(c)` `mcp` section.

The server reads credentials from the `OPENAPI_MCP_HEADERS` environment variable:

```powershell
# User-level env var (persists). Contains NO plaintext token in any repo file.
[Environment]::SetEnvironmentVariable("OPENAPI_MCP_HEADERS", '
  {"Authorization": "Bearer <TOKEN>", "Notion-Version": "2022-06-28", "Content-Type": "application/json"}
', "User")
```

> Note: whether OpenCode interpolates `${VAR}` inside config strings is version-dependent.
> The safe path is setting `OPENAPI_MCP_HEADERS` in your user environment and omitting the
> `environment` block from the config snippet.

## What gets created (idempotent)

Root page **Opencode** plus 15 governed databases:
`Projects, Objectives, Requirements, Epics, Milestones, Tasks, Decisions (ADR), Risks,
Sources, Research Questions, Capabilities, Agents, Skills, Workflows, Knowledge`
— seeded with the Opencode project record, ADR-001…007 and the ten founding research questions.

Re-running never duplicates pages, databases or rows (title-based lookup before every create).
Generated IDs land in `generated/notion-ids.json` (**gitignored**).

## Security rules (non-negotiable)

1. Tokens live **only** in environment variables. Never in files, logs, or Git.
2. The scripts never print the token and never write it to disk.
3. Rotate any token that transited chat/email/tickets. Notion → Settings → Connections.
4. Least privilege: the integration should only access pages explicitly shared with it.

## Roadmap (not implemented yet — do not assume otherwise)

- Relations between databases (v1)
- `raidan notion status / sync / doctor` CLI commands
- Bidirectional sync engine with conflict records
- Event summarization (aggregated writes, never per-event spam)
