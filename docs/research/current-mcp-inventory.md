# Current MCP Inventory

Date: 2026-08-23

## Windows host (this machine)
Config: `C:\Users\Raidan\.config\opencode\opencode.jsonc`

| Server | Type | URL/Command | Auth | Added | Risk | Notes |
|---|---|---|---|---|---|---|
| github | remote | https://api.githubcopilot.com/mcp/ | Bearer `{env:GITHUB_TOKEN}` | 2026-08-23 | LOW | Official GitHub MCP. Verified connected via `opencode mcp list`. Least-privilege scope recommended on next token rotation |

Secrets posture: token stored as User env var, referenced via `{env:GITHUB_TOKEN}` — nothing plaintext in config. Backup pre-change: `~/.raidan-opencode-backups/opencode.jsonc.20260823-095754.bak`.

## Linux host (TaizRadio — historical)
Per current-opencode-inventory.md:
| Server | Type | Notes |
|---|---|---|
| temporal-docs | remote | https://temporal.mcp.kapa.ai — docs MCP |

Plus `~/.opencode/mcp-configs/mcp-servers.json` (10.8KB) containing additional definitions not yet migrated into canonical config — flagged for inspection during `raidan migrate inspect`.

## Registry requirements derived
Every entry must carry: provenance (source URL), license, permission surface (network/filesystem/credentials), risk rating (LOW/MEDIUM/HIGH), health status, last-reviewed date. Third-party servers default to WARN until reviewed (spec §48).
