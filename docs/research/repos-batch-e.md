# Source Research — Batch E (oh-my-openagent + Skill Ecosystems)

Date: 2026-08-23

Scoring: 11 axes × 0–10; Duplication Risk 10 = HIGH duplication risk; TOTAL max 110.

## Summary Table

| Repo | Exists | License | Lang | Purpose(5w) | Total | Verdict |
|---|---|---|---|---|---|---|
| code-yeongyu/oh-my-openagent | YES | **SUL-1.0 (NOT MIT-compat)** | TS/Bun | Multi-harness agent OS plugin | 86 | INSPIRE |
| affaan-m/ECC | YES | MIT | Shell/TS/Py | Harness optimization skill system | 96 | ADAPT |
| mattpocock/skills | YES | MIT | Markdown | Engineering discipline skills | 96 | ADOPT |
| devos-ing/omni-skills | YES | **UNKNOWN (no LICENSE)** | TS/Bun | Workflow bundle skill bank | 66 | INSPIRE |
| weisser-dev/awesome-opencode | YES | MIT | JS/Node | OpenCode project scaffolder | 75 | ADAPT |
| youdotcom-oss/agent-skills | YES | MIT | TS/Bun/Py | You.com web-search skills | 74 | WRAP |
| CodeAlive-AI/ai-driven-development | YES | MIT | MD/Go/Py | Cross-agent practices + safety | 83 | ADOPT |

Critical warnings:
1. oh-my-openagent license verified from raw LICENSE.md = Sustainable Use License v1.0: internal/non-commercial use only, non-sublicensable redistribution. Zero bytes may enter an MIT project — ideas only.
2. omni-skills has no detectable license → all-rights-reserved; copy its *patterns* (workflow.json + pinned-commit lockfile + ownership-aware reinstall), never its content.
3. ECC (286 skills) & awesome-opencode (108 agents, same VoltAgent lineage) overlap heavily with each other — dedupe before import.
4. Footguns not to inherit: oh-my-openagent telemetry ON by default + one-flag autonomous-permissions mode; awesome-opencode `--skipSSL` disables TLS.
5. Install stacking hazard: ECC & mattpocock both document plugin+manual double-install duplicating everything; adopt ECC's install-state ownership-manifest pattern as the fix.

---

## 1. code-yeongyu/oh-my-openagent

- EXISTS: YES (branch `dev`). License: SUL-1.0 (verified). Lang/Runtime: TypeScript on Bun; npm `oh-my-openagent`/`oh-my-opencode`.
- Purpose: Opinionated multi-agent "agent OS" plugin for OpenCode (Ultimate), Codex CLI (Light), standalone Senpi; 11 discipline agents, 54+ hooks, Team Mode, ultrawork loop.
- Structure: monorepo; skills at `.opencode/skills/*/SKILL.md` — native OpenCode format.
- Install: `bunx oh-my-openagent install` TUI; legacy config migrated once w/ warning; documented uninstall; no general dedup.
- OpenCode fit: NATIVE (the reference ecosystem); also Claude-Code-compatible surfaces.
- High-value concepts: Hashline LINE#ID anchored edits (opt-in; claimed 6.7%→68.3% edit success); category→model routing; Team Mode tmux + team tools; hyperplan/security-research; skill-embedded MCPs; /init-deep hierarchical AGENTS.md; IntentGate; Todo Enforcer; Doctor.
- Security: MIXED — PostHog telemetry default-ON (opt-out flags); one-flag Codex autonomous full-permissions mode; hooks execute shell; strong legal docs otherwise.
- Community: 68.3k★ / 13,696 commits / active Discord / multi-harness ROADMAP refactor.
- Scores: ArchFit 7 | OC-Fit 9 | AgentRel 8 | Docs 9 | Maint 10 | Comm 10 | Sec 5 | Compos 6 | IntegVal 6 | DupRisk 8 | InstallQ 8 → **86**
- VERDICT: INSPIRE — license forbids reuse; reimplement concepts independently.

## 2. affaan-m/ECC

- EXISTS: YES. License: MIT ("MIT-licensed forever"; Pro GitHub App separate). Lang: Shell/TS/Python + Markdown bulk; Node CLI `scripts/ecc.js`.
- Purpose: Agent-harness performance optimization system: plan→test→implement→review→verify→remember→improve as 68 agents, 286 skills, 94 command shims, hooks/rules/memory across 15+ harnesses.
- Structure: `skills/` + `.agents/skills/`, `agents/`, `commands/`, `rules/{common,lang}`, `hooks/`, `contexts/`, `manifests/`, per-harness dot-dirs incl. `.opencode/`.
- Install/dedup: Claude `/plugin install ecc@ecc`; Codex marketplace; `install.sh --profile {minimal|core|full} --target opencode`. Anti-stacking doctrine; install-state ownership manifest preserves user files w/ conflict warnings; doctor/repair/uninstall --dry-run.
- High-value: gated orch pipelines (Research-Plan-TDD-Review-Commit), AgentShield config scanner, continuous-learning-v2 instincts, unified-memory vault, cost tracking, honest platform-parity matrix.
- Security: GOOD — SECURITY.md, gitleaks, anti-mirror warning; residual: large shell-hook surface, Pro upsell density.
- Community: 242k★ / 36.7k forks / weekly releases / sponsors / Discord / 12-language docs.
- Scores: 9|8|9|9|9|10|7|8|9|9|9 → **96**
- VERDICT: ADAPT — cherry-pick skills/rule packs + adopt installer state-manifest patterns; wholesale adoption duplicates/bloats.

## 3. mattpocock/skills

- EXISTS: YES. License: MIT. Lang: Markdown + minimal Node tooling; changesets.
- Purpose: ~20 engineering-discipline SKILL.md assets fixing misalignment (grilling), verbosity (CONTEXT.md shared language), feedback gaps (TDD/debugging), entropy (deep modules).
- Structure: `skills/engineering|productivity/<name>/SKILL.md`; user-invoked vs model-invoked taxonomy (orchestrators may call primitives, never vice versa); own ADRs.
- Install: marketplace OR `npx skills@latest add mattpocock/skills` (editable copies + update cmd); explicit "never both" duplication warning.
- OpenCode fit: FULL (plain SKILL.md; skills.sh targets OpenCode).
- High-value: grilling/grill-me, grill-with-docs (+ubiquitous language+ADRs), tdd, diagnosing-bugs loop, two-axis parallel-subagent code-review, wayfinder decision-ticket maps, improve-codebase-architecture survey, writing-for-agents, handoff.
- Security: EXCELLENT — markdown-only, nothing executes.
- Community: 232.6k★ / 60k newsletter.
- Scores: 9|9|9|9|8|10|9|10|9|6|8 → **96**
- VERDICT: ADOPT — drop-in catalog candidates with attribution; adopt its invocation-taxonomy too.

## 4. devos-ing/omni-skills

- EXISTS: YES. License: UNKNOWN (no LICENSE surfaced) → treat as all-rights-reserved. Lang/Runtime: TypeScript on Bun; `npx omniskill@latest`.
- Purpose: Workflow bundles packaging whole AI teams as one entry skill ($startup-goal → CEO/CTO/PM/QA roles) through approval-gated pipeline with Verified/Inferred/Assumed Evidence Ledgers.
- Structure: `examples/teams|workflows/*` each = workflow.json + optional workflow.lock.json + README + skills/<entry>/SKILL.md.
- Install/dedup: schema-0.2 lock pins externals to exact 40-char commits (temp checkout verify → copy); ownership-based reinstall skips mixed-ownership targets; validate/deps/remove commands.
- OpenCode fit: PARTIAL — writes standard SKILL.md trees via `--agents …,opencode`.
- Security: cautious-by-design (pinned SHAs, explicit opt-in naming model/fs/write-boundary); unknown license = main risk.
- Community: small — 152★ / 163 commits.
- Scores: 7|6|7|8|5|3|6|8|4|5|7 → **66**
- VERDICT: INSPIRE — replicate lockfile+ownership pattern in own MIT implementation; no content reuse.

## 5. weisser-dev/awesome-opencode

- EXISTS: YES. License: MIT. Lang/Runtime: JavaScript Node CLI (~1800-line setup.js) generating native artifacts.
- Purpose: Interactive OpenCode project scaffolder: language detection → agent/skill/MCP/model selection → generates .opencode/, opencode.json, AGENTS.md; optional Docker sandbox launch.
- Structure: `templates/agents/*.md` (108, ten categories), `templates/skills/*/SKILL.md` (15), 5 config presets, `cli-tool/` npm pkg.
- Install/dedup: `npx @weisser-dev/awesome-opencode`; re-run state via `.opencode/advanced.json`; state-remembrance only, no foreign-file conflict resolution.
- OpenCode fit: PERFECT — outputs ARE native format (agents w/ permissions frontmatter, SKILL.md skills).
- High-value: 26+ model fingerprints incl. custom Bedrock/Azure names → Frontier/Strong/Fast tier mapping; curated MCP list + live registry search; 20-image Docker sandbox matrix w/ corporate proxy support; per-class step limits.
- Security: CAUTION — `--skipSSL` TLS-off footgun; Docker isolation positive; templates inert.
- Community: WEAK — 28★ / single maintainer.
- Scores: 8|10|8|8|4|2|6|7|8|7|7 → **75**
- VERDICT: ADAPT — harvest MIT templates/presets + model-tier mapping; skip its CLI and skipSSL path.

## 6. youdotcom-oss/agent-skills

- EXISTS: YES. License: MIT. Lang/Runtime: TS Bun workspace + Python hermes pkg; remote You.com MCP endpoints.
- Purpose: Official You.com web search/extraction/cited-research/finance/integration-discovery skills routed to lightest surface (MCP default, scripts/API fallback).
- Structure: single canonical `skills/` reused by thin manifests (.claude/.cursor/.codex/.plugin) + packages/{opencode,openclaw,pi,hermes}; evals/; validate gate.
- Install: `npx skills add youdotcom-oss/agent-skills [--skill X]`; OpenCode plugin published; auth tiers: keyless free profile → YDC_API_KEY Bearer → OAuth guidance.
- OpenCode fit: STRONG (dedicated published plugin package; standard SKILL.md).
- High-value: you-discover meta-skill; zero-duplication shared-skills/thin-manifest packaging across 9 surfaces; untrusted-evidence safety model.
- Security: GOOD — external content treated as evidence-not-instructions; env-var keys only.
- Community: modest — 61★; corporate-backed.
- Scores: 8|9|6|8|6|3|8|8|7|3|8 → **74**
- VERDICT: WRAP — optional provider behind our abstraction (value gated on API key); imitate its packaging layout.

## 7. CodeAlive-AI/ai-driven-development

- EXISTS: YES. License: MIT. Lang: Markdown (23 skills) + Go bash-guard binary + stdlib Python scripts.
- Purpose: Umbrella cross-agent practices collection (consolidated from 9 repos): agent self-management meta-skills, engineering protocols, research utilities, OS-health skills, bash-guard safety hook.
- Structure: canonical `skills/<name>/{SKILL.md,README.md,references,scripts}`; `hooks/balanced-safety-hooks/`; `.claude-plugin/marketplace.json` with `source:"./"` so ONE tree serves npx-skills AND marketplace — no symlinks/duplication.
- Install: `npx skills add … [--skill X]` or marketplace plugin; hook ships separately (curl|sh pinned raw URL, prebuilt binaries); semver bumps of both manifests mandated.
- OpenCode fit: HIGH — agentskills.io standard; settings/mcp/hooks-management skills manage OpenCode JSON/JSONC directly.
- High-value: mcp-management (one command, 10+ agents' JSON/YAML/TOML); skills-management SkillOpt loop (held-out validation gate); plan-mode approval gate; bug-fix-protocol "two failures" doctrine; investigating-repository-history cited notes; maintaining-windows-health (rare Windows coverage); bash-guard (real AST via mvdan/sh, catastrophic-path matrix, ask-NOT-deny because deny is bypassed by rephrasing).
- Security: STRONG — high-signal/low-friction hook design; token-hygiene skill; only risk = curl|sh installer.
- Community: moderate — 127★ / 186 commits; recent consolidation shows curation.
- Scores: 9|9|9|8|6|3|9|9|9|4|8 → **83**
- VERDICT: ADOPT — integrate skills individually; port bash-guard's AST+ask-not-deny design.
