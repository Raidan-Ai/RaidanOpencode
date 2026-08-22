# RaidanOpencode MCP Inventory

## Current OpenCode MCP Status

### Discovery Result
**No MCP servers are currently configured** in the OpenCode installation.

```
┌  MCP Servers
│
▲  No MCP servers configured
│
└  Add servers with: opencode mcp add
```

### MCP Configuration File
- **Location**: Not applicable (no MCP servers configured)
- **Credentials**: `/home/ecs-user/.local/share/opencode/auth.json` (0 credentials)
- **Database**: `/home/ecs-user/.local/share/opencode/opencode.db` (SQLite, no MCP entries)

### MCP Detection Results
- **MCP servers discovered**: 0
- **MCP types**: None
- **MCP permissions**: Not applicable
- **MCP health**: Not applicable (no servers)

## RaidanOpencode MCP Management Architecture

### Layer 11 — MCP Management

#### MCP Discovery
- Automatic discovery of MCP servers through:
  - Configuration file scanning
  - Environment variable detection (`MCP_SERVER_URL`, `MCP_AUTH_TOKEN`)
  - Command-line interface (`opencode mcp list`, `opencode mcp add`)
  - Network service discovery (DNS-SD, mDNS for `opencode.local`)
- **Result**: 0 MCP servers discovered in current environment

#### MCP Registry
- Central registry of all MCP servers with metadata:
  - Server URL and endpoint
  - Authentication method and credentials (redacted, never in logs)
  - Capabilities (tools, resources, prompts supported)
  - Health status (last check, success rate, error rate)
  - Rate limit information
  - Context window size
  - Cost per token (input/output)
  - Provider name and model
- **Current state**: Empty registry (no servers registered)

#### Enable/Disable
- Per-agent MCP enablement: Only agents that need a specific MCP have access
- Project-level MCP scoping: MCP available only within specific projects
- Agent-level MCP scoping: Specific MCP available only to specific agents
- **Never expose every MCP to every agent**: Capability-based access control

#### Scoped MCP
- **Project MCP**: Available only within a specific project directory
- **Agent MCP**: Available only to specific agents or agent tiers
- **Session MCP**: Available only within a specific session context
- **Team MCP**: Available only to agents within a team/department

#### Health Checks
- Periodic health check of all registered MCP servers
- Metrics tracked:
  - Success rate (last 100 calls)
  - Average latency (p95, p99)
  - Error rate by error type
  - Rate limit triggers
  - Context window usage
  - Cost accumulation
  - Last successful response
  - Last failure timestamp
- **Unhealthy MCP**: Marked as disabled automatically, human notification

#### MCP Permissions
- Capability-based access: MCP tools only available to agents with required permissions
- Scoped access: MCP tools only available in specific contexts
- Permission inheritance: Through agent tiers and team memberships
- **Never grant blanket access**: Every MCP tool call evaluated against policy (Layer 12)

#### Environment Management
- MCP connection strings never stored in plaintext
- Use environment variables for sensitive values
- OS credential stores for persistent credentials
- Secure secret providers where appropriate
- **Secrets redaction**: Any MCP-related secrets redacted from logs and events

#### Failure Isolation
- Failed MCP server automatically marked unavailable
- Circuit breaker pattern: prevent cascading failures
- Automatic retry with exponential backoff on transient failures
- Human notification on persistent failures
- Fallback to next available MCP or local execution

### MCP Inventory Summary

| Metric | Value |
|--------|-------|
| Total MCP servers configured | 0 |
| MCP servers discovered | 0 |
| MCP types supported | 0 (none configured) |
| MCP agents with access | 0 (none configured) |
| Health checks performed | 0 (no servers) |
| Rate limits configured | 0 (none configured) |
| Cost tracking active | 0 (none configured) |

### Migration Plan for MCP

#### Phase 0: Current State
- 0 MCP servers configured
- No MCP integration active
- User's OpenCode installation has no MCP dependencies

#### Phase 1: Import (Planned)
- Discover any externally configured MCP servers
- Document existing MCP connections
- Create MCP inventory: docs/migration/mcp-inventory.md

#### Phase 2: Validate (Planned)
- Verify no MCP dependencies in current OpenCode setup
- Confirm RaidanOpencode works without MCP
- Test MCP-optional mode

#### Phase 3: Enable (Planned)
- Configure MCP servers as needed (optional, not required)
- Test MCP integration with RaidanOpencode
- Enable capability-based access control

#### Phase 4: Observe (Planned)
- Monitor MCP health and performance
- Track cost and usage statistics
- Optimize MCP routing and selection

#### Phase 5: Optimize (Planned)
- Tune MCP routing based on task type
- Balance between local execution and MCP offloading
- Configure fallback chains for MCP failures

### MCP Integration Commands (Planned)
- `raidan mcp list` — List configured MCP servers
- `raidan mcp test` — Test MCP server connectivity and health
- `raidan mcp enable` — Enable MCP for specific agent/project
- `raidan mcp disable` — Disable MCP for specific agent/project
- `raidan mcp health` — Check MCP server health status

### Key Principles
1. **MCP is optional**: RaidanOpencode works fully without any MCP servers
2. **Capability-based access**: MCP tools only available to authorized agents
3. **Secrets protection**: No MCP secrets in logs, events, or diagnostics
4. **Failure isolation**: Failed MCP doesn't disable entire system
5. **Gradual adoption**: MCP can be added/removed without core changes

---
*MCP inventory generated on 2026-08-23. Current OpenCode installation has 0 MCP servers configured. RaidanOpencode works fully without MCP. MCP management is additive and optional.*