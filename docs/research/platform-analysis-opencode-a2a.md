# Platform Analysis — OpenCode Runtime + A2A Protocol

Date: 2026-08-23
Sources: live-fetched opencode.ai docs (footer "Last updated Aug 21, 2026") + a2a-protocol sources fetched same day. Facts below CONFIRMED from fetched pages unless marked UNVERIFIED.

---

## Part 1 — OpenCode Runtime

### Config locations & precedence
- Config file: `opencode.json` / `.jsonc`
  - Global: `~/.config/opencode/opencode.json`
  - Project root: `opencode.json`
  - Inline via `OPENCODE_CONFIG_CONTENT`; custom path via `OPENCODE_CONFIG` / `OPENCODE_CONFIG_DIR`
  - Org defaults via `.well-known/opencode`
  - Managed policy dirs incl. Windows `%ProgramData%\opencode`
- Files MERGE. Precedence: remote → global → custom → project → `.opencode` → inline → managed/MDM.
- Subdirectories are PLURAL in current versions: `agents/ commands/ plugins/ skills/ tools/ themes/` (singular legacy still works). TUI settings split into separate `tui.json`.

### Providers & models
- Providers under `provider.<id>`: `options{apiKey, baseURL, timeout, ...}` + `models{}` map.
- Model refs are `"provider/model-id"` strings everywhere (agents, config default model, etc.).
- Substitution supported: `{env:VAR}` and `{file:path}` — **key mechanism for keeping secrets out of committed config**.

### Extension points for an external control plane (NO fork required)
- **Headless server**: `opencode serve` (default port 4096; basic auth via `OPENCODE_SERVER_PASSWORD`) exposes OpenAPI 3.1 at `/doc`; SDK generated from it.
- **REST surface**: sessions CRUD/fork/abort/revert/summarize/diff; sync `POST /session/:id/message` + async `/prompt_async`; `/command`; `/shell`; permission answering `POST /session/:id/permissions/:permissionID {response, remember?}`; dynamic MCP add `POST /mcp`; config read + `PATCH /config` (persistence semantics UNVERIFIED); agents list; TUI-driving endpoints.
- **Event streams**: `GET /event` + `GET /global/event` (SSE; first event `server.connected`).
- **Plugins** (JS/TS in `.opencode/plugins/`, `~/.config/opencode/plugins/`, or npm via `"plugin":[]`):
  - Hooks: `tool.execute.before/after` (can veto/mutate), generic `event` bus, `shell.env`, `experimental.session.compacting`, custom Zod-schema tools.
  - Catalog includes events like `permission.asked/replied`, `session.idle/error/status`, `message.part.updated` (~30 cataloged).
- **Agents**: markdown at `.opencode/agents/*.md` + `~/.config/opencode/agents/*.md` (or JSON `"agent"` key).
  - Frontmatter: `description` (required), `mode` (primary|subagent|all), `model`, `temperature`, `steps`, `permission{}`, `hidden`, provider opts passthrough.
  - Built-ins: Build/Plan (+hidden compaction/title/summary), General/Explore/Scout.
  - `subagent_depth` default 1 (nested delegation limit — relevant to orchestrators spawning subagents that themselves spawn).
- **Skills**: `<name>/SKILL.md` in `.opencode/skills/`, `~/.config/opencode/skills/`, plus Claude-compatible `.claude/skills/` and `.agents/skills/` (both scopes honored).
  - Frontmatter ONLY: `name`, `description`, `license`, `compatibility`, `metadata`.
  - Lazy-loaded via native `skill` tool listing `<available_skills>` XML; gated by `permission.skill` globs (deny = hidden).
- **Commands**: `.opencode/commands/*.md` + global; `$ARGUMENTS`, `$1..$n`, `` !`cmd` `` shell injection, `@file` embeds; can override built-ins.

### Permissions system
- Modes: `allow | ask | deny`.
- Keys: read/edit/glob/grep/bash/task/skill/webfetch/websearch/lsp/question/doom_loop/external_directory + wildcard match vs ANY tool (e.g. `"mymcp_*"`).
- Object syntax last-match-wins; per-agent override; `--auto` mode auto-approves non-denied.
- Legacy `tools` bool map deprecated since v1.1.1.

### MCP support (native)
```json
"mcp": {
  "<name>": {
    "type": "local",  "command": ["…"], "environment": {}
  } | {
    "type": "remote", "url": "https://…",
    "headers": {}, "oauth": {}
  }
}
```
- OAuth auto-negotiated (RFC 7591 Dynamic Client Registration); tokens stored in `~/.local/share/opencode/mcp-auth.json`.
- CLI management: `opencode mcp auth|list|logout|debug`.

### Implications for RaidanOpencode architecture
1. Control plane can be a pure external process speaking REST+SSE to `opencode serve` — zero fork.
2. Approval gates: intercept `permission.asked` events or poll permission endpoints; answer programmatically per Policy Engine verdict.
3. Secrets belong in env/file references (`{env:VAR}`, `{file:path}`) — never literals in committed config.
4. Skill/agent/command distribution = filesystem drops into plural dirs; migration engine only needs merge-safe writers + ownership manifest.
5. Nested orchestration depth is bounded (`subagent_depth` default 1) — deep swarms must flatten delegation or raise depth explicitly per policy.

UNVERIFIED items: PATCH /config persistence semantics; exact SSE payload schemas (in repo `types.gen.ts`); multi-session concurrency limits; A2A SDK maturity below.

---

## Part 2 — A2A Protocol (Agent2Agent)

### Status
- **v1.0.0 released** — first stable production version (previous: 0.3.0, 0.2.6, 0.1.0).
- Google-originated, donated to Linux Foundation. TSC includes AWS, Cisco, Google, IBM, Microsoft, Salesforce, SAP, ServiceNow.
- Normative source: `spec/a2a.proto`. Sites: a2a-protocol.org, github `a2aproject/A2A` (legacy google/A2A redirects).

### Bindings & operations
- Transports: JSON-RPC 2.0, gRPC, HTTP+JSON/REST (equivalence guaranteed).
- Ops: SendMessage, SendStreamingMessage(SSE), GetTask, ListTasks(cursor pagination), CancelTask, SubscribeToTask(SSE), 4× push-notification-config ops, GetExtendedAgentCard.

### AgentCard v1.0 highlights
- `supportedInterfaces[]{url, protocolBinding(JSONRPC|GRPC|HTTP+JSON), tenant?, protocolVersion}`
- `skills{id,name,desc,tags,inputModes,outputModes,securityRequirements}`
- `capabilities.extendedAgentCard`; JWS signature over RFC 8785-canonicalized JSON; mTLS schemes added.

### Auth
- OAuth2/OIDC; Device Code flow added; implicit/password flows removed; `pkce_required` on authorization-code flow.
- Per-skill `securityRequirements`; push-notif auth via AuthenticationInfo{scheme(Bearer…), credentials}.
- HTTPS required in production.

### Headers & errors
- `A2A-Version` (Major.Minor; empty ⇒ 0.3 assumed; mismatch ⇒ VersionNotSupportedError -32009), `A2A-Extensions`.
- Errors now `google.rpc.Status` + `ErrorInfo{reason, domain:"a2a-protocol.org"}` (replaced RFC 9457).

### Interop path (analysis)
- A2A taskId ↔ OpenCode sessionId mapping.
- SendMessage → `POST /session/:id/message` (/prompt_async for streaming).
- Bridge OpenCode SSE (`/event`) → A2A SSE (SendStreamingMessage/SubscribeToTask).
- Resolve permission prompts via OpenCode permissions REST endpoint or plugin hook — maps to A2A auth-required task states.
- Publish control-plane capabilities as Agent Card skills; no fork required.
- SDK maturity for v1.0 bindings: UNVERIFIED at research time — implement against proto/HTTP+JSON directly if SDKs lag.

---

## Decision-relevant summary
1. Build control plane OUTSIDE OpenCode against serve-API + plugins; never fork.
2. All secrets via `{env:}` / `{file:}` references; managed-policy dir available on Windows (`%ProgramData%\opencode`).
3. Skills/agents/commands are plain files in plural dirs — distribution and migration are file operations with merge precedence.
4. Permission interception is the single choke point for the Policy Engine.
5. A2A v1.0.0 is stable; implement HTTP+JSON binding first; map tasks↔sessions, bridge SSE, publish Agent Card.
