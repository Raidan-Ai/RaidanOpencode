# Current OpenCode Installation Inventory

**Date:** 2026-08-22
**Machine:** Linux TaizRadio 7.0.0-29-generic (Ubuntu 24.04)
**OpenCode Version:** Detected via configs

---

## Configuration Files

### Global Config: `~/.config/opencode/opencode.jsonc`
- **Models:** OmniRoute provider with 40+ model aliases (auto/*, pro/*, best/*)
- **MCP Servers:** 1 server (temporal-docs at https://temporal.mcp.kapa.ai)
- **Plugins:** oh-my-opencode-slim
- **Custom Tools:** 48 system shell tools (apt, bash, curl, docker, git, node, npm, python3, etc.)

### Project Config: `~/.opencode/opencode.json`
- **Default Model:** anthropic/claude-sonnet-4-5
- **Small Model:** anthropic/claude-haiku-4-5
- **Default Agent:** build
- **Instructions:** 10 files including AGENTS.md, CONTRIBUTING.md, and 8 skill files
- **Plugin Path:** ./plugins
- **Skills Path:** ../skills

---

## Agents (34 agents defined in `~/.opencode/opencode.json`)

| Agent | Mode | Model | Tools | Description |
|-------|------|-------|-------|-------------|
| build | primary | claude-sonnet-4-5 | write, edit, bash, read, changed-files | Primary coding agent |
| planner | subagent | claude-opus-4-5 | read, bash | Expert planning specialist |
| architect | subagent | claude-opus-4-5 | read, bash | Software architecture specialist |
| code-reviewer | subagent | claude-opus-4-5 | read, bash | Expert code review specialist |
| security-reviewer | subagent | claude-opus-4-5 | read, bash, write, edit | Security vulnerability detection |
| tdd-guide | subagent | claude-opus-4-5 | read, write, edit, bash | TDD specialist |
| build-error-resolver | subagent | claude-opus-4-5 | read, write, edit, bash | Build/TypeScript error resolution |
| e2e-runner | subagent | claude-opus-4-5 | read, write, edit, bash | Playwright E2E testing |
| doc-updater | subagent | claude-opus-4-5 | read, write, edit, bash | Documentation specialist |
| refactor-cleaner | subagent | claude-opus-4-5 | read, write, edit, bash | Dead code cleanup |
| go-reviewer | subagent | claude-opus-4-5 | read, bash | Go code reviewer |
| go-build-resolver | subagent | claude-opus-4-5 | read, write, edit, bash | Go build error resolution |
| database-reviewer | subagent | claude-opus-4-5 | read, write, edit, bash | PostgreSQL specialist |
| cpp-reviewer | subagent | claude-opus-4-5 | read, bash | C++ code reviewer |
| cpp-build-resolver | subagent | claude-opus-4-5 | read, write, edit, bash | C++ build resolution |
| docs-lookup | subagent | claude-sonnet-4-5 | read, bash | Context7 documentation lookup |
| harness-optimizer | subagent | claude-sonnet-4-5 | read, bash, edit | Agent harness optimization |
| java-reviewer | subagent | claude-opus-4-5 | read, bash | Java/Spring Boot reviewer |
| java-build-resolver | subagent | claude-opus-4-5 | read, write, edit, bash | Java build resolution |
| kotlin-reviewer | subagent | claude-opus-4-5 | read, bash | Kotlin/Android reviewer |
| kotlin-build-resolver | subagent | claude-opus-4-5 | read, write, edit, bash | Kotlin build resolution |
| loop-operator | subagent | claude-sonnet-4-5 | read, bash, edit | Autonomous loop operator |
| php-reviewer | subagent | claude-opus-4-5 | read, bash | PHP code reviewer |
| python-reviewer | subagent | claude-opus-4-5 | read, bash | Python code reviewer |
| rust-reviewer | subagent | claude-opus-4-5 | read, bash | Rust code reviewer |
| rust-build-resolver | subagent | claude-opus-4-5 | read, write, edit, bash | Rust build resolution |

**Agent Definition Files in `~/.config/opencode/agent/`:** 49 files including specialized agents for swarm architecture, presshouse, radio, yemenjpt, etc.

---

## Commands (36 commands defined)

| Command | Agent | Subtask | Description |
|---------|-------|---------|-------------|
| plan | planner | yes | Create implementation plan |
| tdd | tdd-guide | yes | Enforce TDD workflow |
| code-review | code-reviewer | yes | Review code quality |
| security | security-reviewer | yes | Security review |
| build-fix | build-error-resolver | yes | Fix build errors |
| e2e | e2e-runner | yes | Playwright E2E tests |
| refactor-clean | refactor-cleaner | yes | Remove dead code |
| orchestrate | planner | yes | Orchestrate multiple agents |
| learn | - | no | Extract patterns |
| checkpoint | - | no | Save verification state |
| verify | - | no | Run verification loop |
| eval | - | no | Run evaluation |
| update-docs | doc-updater | yes | Update documentation |
| update-codemaps | doc-updater | yes | Update codemaps |
| test-coverage | tdd-guide | yes | Analyze test coverage |
| setup-pm | - | no | Configure package manager |
| go-review | go-reviewer | yes | Go code review |
| go-test | tdd-guide | yes | Go TDD workflow |
| go-build | go-build-resolver | yes | Fix Go build errors |
| skill-create | - | no | Generate skills from git |
| instinct-status | - | no | View learned instincts |
| instinct-import | - | no | Import instincts |
| instinct-export | - | no | Export instincts |
| evolve | - | no | Cluster instincts into skills |
| promote | - | no | Promote instincts to global |
| projects | - | no | List known projects |

---

## Skills

### Global Skills (`~/.config/opencode/skills/`): **1,565 skills**
### Project Skills (`~/.opencode/skills/`): **212 skills**

**Major Skill Categories Observed:**
- Agent Engineering (agent-*, agentic-*, a2a-*)
- Testing (ab-test-*, playwright-*, e2e-*, selenium-*)
- Azure (azure-*, gke-*)
- Cloud (cloudflare-*, aws-*, google-cloud-*)
- AI/ML (ml-*, fine-tuning, rag-*, llm-*)
- Database (postgres-*, mysql-*, sqlite-*, vector-*)
- DevOps (docker-*, kubernetes-*, terraform-*, ci-cd-*)
- Security (security-*, penetration-*, threat-*, vulnerability-*)
- Frontend (react-*, nextjs-*, vue-*, angular-*, motion-*)
- Backend (fastapi-*, nestjs-*, springboot-*, dotnet-*)
- Languages (rust-*, go-*, kotlin-*, python-*, typescript-*, csharp-*)
- Research (literature-*, deep-research, web-scraping)
- Documentation (code-documentation, technical-writing)
- MCP (mcp-*, building-mcp-servers)

---

## MCP Configuration

**File:** `~/.opencode/mcp-configs/mcp-servers.json` (10,852 bytes)

**Servers configured in project config:** temporal-docs (remote)

---

## Plugins

**Directory:** `~/.opencode/plugins/`
- `ecc-hooks.ts` (21,460 bytes)
- `graphify.js` (1,402 bytes)
- `index.ts` (381 bytes)
- `lib/` directory

---

## Hooks

**Files:**
- `hooks.json` (41,204 bytes)
- `codex-hooks.json` (1,613 bytes)
- `memory-persistence/` directory
- `README.md` (10,847 bytes)

---

## Environment

- **OS:** Linux Ubuntu 24.04
- **Node.js:** v26.6.0
- **npm:** 11.18.0
- **Bun:** 1.3.14
- **Git:** 2.43.0
- **Python:** python3 available (not python)
- **Docker:** Not installed
- **WSL:** Not applicable (native Linux)

---

## Key Directories

| Path | Purpose |
|------|---------|
| `~/.config/opencode/` | Global OpenCode config |
| `~/.opencode/` | Project-level OpenCode config |
| `~/.config/opencode/skills/` | Global skills (1,565) |
| `~/.opencode/skills/` | Project skills (212) |
| `~/.config/opencode/agent/` | Agent definition files |
| `~/.config/opencode/command/` | Command definition files |
| `~/.opencode/mcp-configs/` | MCP server configs |
| `~/.opencode/plugins/` | Plugins |
| `~/.opencode/hooks/` | Hook configurations |

---

## Backup Directories

- `~/.config/opencode/backup/`
- `~/.config/opencode/backups/`

---

## Notable Files

- `~/.config/opencode/AGENTS.md` - Agent documentation
- `~/.config/opencode/opencode.zip` - 24MB archive (likely backup)
- `~/.config/opencode/opencode-model-fallback.log` - 2.2MB model fallback log
- `~/.opencode/MIGRATION.md` - Migration documentation
- `~/.opencode/the-security-guide.md` - Security guide
- `~/.opencode/SWARM_ARCHITECTURE.md.bak` - Swarm architecture backup