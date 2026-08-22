# Cross-Platform Configuration Model

## Overview

RaidanOpencode uses a 5-layer configuration model to separate concerns and ensure portability across Linux, Windows, and macOS.

## Layers

### 1. PORTABLE (`~/.config/opencode/opencode.jsonc`)
Configuration that works identically across all platforms. Committed to the repository.

**Includes:**
- System tool definitions (apt, git, docker, etc.)
- Model configurations (with `apiKey: "CONFIGURED"` - replaced via env vars at runtime)
- MCP server definitions (temporal-docs, omniroute-http, omniroute-sse)
- A2A configuration
- Plugin list (oh-my-opencode-slim)
- General preferences and settings

**Example:**
```json
"models": {
  "omniroute": {
    "apiKey": "CONFIGURED",  // Injected via environment variable at runtime
    ...
  }
}
```

### 2. MACHINE-SPECIFIC (`~/.config/opencode/.machine-config.json`)
Configuration that varies by host machine. **NOT** committed to repository.

**Includes:**
- Path configurations (OS-specific directories)
- Platform-specific tool paths
- Local cache settings
- Machine-specific preferences

**Usage:**
```bash
# Load machine-specific config if it exists
if [ -f "$HOME/.config/opencode/.machine-config.json" ]; then
  # Apply machine-specific overrides
fi
```

### 3. SECRET (`~/.config/opencode/.secrets.json` or environment variables)
API keys, tokens, and credentials. **NEVER committed to repository.**

**Includes:**
- API keys for LLM providers
- Access tokens for MCP/A2A servers
- Database connection strings
- Authentication credentials

**Usage - Environment Variables:**
```bash
# Export secrets (never commit these!)
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="..."
export OPENAI_API_BASE="https://..."
```

**Usage - Secret File** (git-ignored):
```json
// ~/.config/opencode/.secrets.json - gitignored
{
  "apiKey": "sk-...",
  "accessToken": "oma_live_j_..."
}
```

### 4. OPTIONAL (`opencode.jsonc` feature flags)
Features and integrations that can be enabled/disabled without code changes.

**Includes:**
- MCP servers with `enabled: true/false`
- A2A with `enabled: true/false`
- Feature flags for experimental features

**Example:**
```json
"mcpServers": {
  "omniroute-http": {
    "type": "remote",
    "url": "http://...",
    "enabled": false  // Disable if not needed
  },
  "omniroute-sse": {
    "type": "remote", 
    "url": "http://...",
    "enabled": true   // Enable by default
  }
}
```

### 5. DEPRECATED
Old/removed features kept for backward compatibility.

**Includes:**
- Legacy configuration options
- Removed MCP servers or models
- Deprecated feature flags

**Migration path:**
- Document deprecation in AGENTS.md
- Provide migration guide
- Remove after next major version

## Configuration Precedence

When loading configuration, the following precedence applies (last wins):

1. **DEFAULT** - Built-in defaults (lowest priority)
2. **PORTABLE** - `opencode.jsonc` (committed to repo)
3. **MACHINE-SPECIFIC** - `.machine-config.json` (per host)
4. **SECRET** - Environment variables or `.secrets.json` (overrides all above)
5. **RUNTIME FLAGS** - Command-line arguments (highest priority)

## Installation Workflow

### Linux (install.sh)
```bash
# 1. Apply portable configuration
cp opencode.jsonc "$HOME/.config/opencode/opencode.jsonc"

# 2. Apply machine-specific config if it exists
if [ -f "./machine-config.json" ]; then
  cp ./machine-config.json "$HOME/.config/opencode/.machine-config.json"
fi

# 3. Export secrets from environment or .secrets file
if [ -f "$HOME/.config/opencode/.secrets.json" ]; then
  export $(grep -v '^#' "$HOME/.config/opencode/.secrets.json" | xargs)
elif [ -n "$OPENAI_API_KEY" ]; then
  # Use existing env var
  :
fi

# 4. Initialize skills and commands
# (skills/ and commands/ directories are portable)
```

### Windows (install.ps1 / install.cmd)
```powershell
# 1. Apply portable configuration
Copy-Item .\opencode.jsonc "$env:HOMEPATH\.config\opencode\opencode.jsonc"

# 2. Apply machine-specific config if it exists
if (Test-Path .\machine-config.json) {
  Copy-Item .\machine-config.json "$env:HOMEPATH\.config\opencode\.machine-config.json"
}

# 3. Load secrets
if (Test-Path "$env:HOMEPATH\.config\opencode\.secrets.json") {
  $secrets = Get-Content "$env:HOMEPATH\.config\opencode\.secrets.json" | ConvertFrom-Json
  # Apply secrets to environment
}
```

## Secret Management

### Never Commit:
- API keys (`apiKey`, `OPENAI_API_KEY`, etc.)
- Access tokens (`access_token`, `oma_live_...`)
- Database credentials
- Any secret values

### Always Use:
- Environment variables for runtime
- `.secrets.json` file (gitignored) for local development
- Secret management tools (HashiCorp Vault, AWS Secrets Manager, etc.) for production

### Migration from Embedded Secrets:
1. Remove embedded secrets from `opencode.jsonc`
2. Replace with `"CONFIGURED"` placeholder
3. Document that secrets must be provided via environment or `.secrets.json`
4. Update install scripts to load secrets from secure sources
5. Add `.secrets.json` to `.gitignore`

## Example .gitignore Entries
```gitignore
# OpenCode configuration (portable - commit this)
.opencode/opencode.jsonc

# Machine-specific configuration (NOT committed)
.opencode/.machine-config.json

# Secrets (NEVER committed)
.opencode/.secrets.json

# OS-specific artifacts
.DS_Store
Thumbs.db
.env*
```

## Example .env Template (NOT committed)
```env
# API Keys - never commit actual values!
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=your-key-here
GOOGLE_API_KEY=your-key-here

# MCP/A2A Configuration
MCP_BASE_URL=http://your-mcp-host:port
A2A_BASE_URL=http://your-a2a-host:port

# Local overrides
LOCAL_MACHINE_CONFIG=path/to/machine-config.json
```