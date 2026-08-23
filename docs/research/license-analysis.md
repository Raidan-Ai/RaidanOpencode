# License Analysis

Date: 2026-08-23
Project license: MIT. Rule: permissive-compatible sources may donate code WITH notice preservation; copyleft/custom/unlicensed sources are inspiration-only — ZERO bytes copied.

## Source repositories

| Repository | License | MIT-compatible | Verdict impact |
|---|---|---|---|
| darrenhinde/OpenAgentsControl | MIT | YES | ADAPT — markdown assets liftable w/ attribution |
| asheshgoplani/agent-deck | MIT | YES | ADAPT — patterns/design; Go code not reused (different stack) |
| 5dive-ai/5dive | MIT | YES | REIMPLEMENT (concepts only; Linux-specific code useless here) |
| 777genius/agent-teams-ai | **AGPL-3.0** | **NO** | INSPIRE — design-level only; no code/config/assets |
| buhuipao/agent-console | MIT OR Apache-2.0 | YES | INSPIRE — UX contracts only (Rust unused) |
| YoanWai/agent-manager | Apache-2.0 | YES* | INSPIRE — *preserve NOTICE if ever redistributing derived text |
| agent-of-empires/agent-of-empires | MIT | YES | ADAPT — protocol/plugin/sandbox patterns |
| Untrivial-ai/agent-orchestrator | Apache-2.0 | YES* | ADAPT — architecture docs as blueprint; NOTICE if derived |
| agent-squid/squid | MIT | YES | INSPIRE — ideas only (tiny community) |
| ramarlina/agx | MIT | YES | INSPIRE — human-gate/checkpoint patterns |
| rustykuntz/clideck | MIT | YES | ADAPT — bridge/status-detection patterns |
| 23blocks-OS/ai-maestro | MIT | YES | INSPIRE — injection-filter pattern list re-implemented natively |
| zeronsh/comet (Zeron) | MIT | YES | INSPIRE — CRDT ledger/scope-separation concepts |
| kdlbs/kandev | **AGPL-3.0** | **NO** | WRAP-at-most — never link/copy; unmodified external service only |
| ZaxbyHub/opencode-swarm | MIT | YES | ADOPT — candidate backbone; audit installer side-effects first |
| nimbalyst/nimbalyst | MIT | YES | ADAPT — UX/SDK patterns (sync server excluded — non-MIT) |
| DietrichGebert/ponytail | MIT | YES | ADOPT — install as-is via native OpenCode plugin |
| ruvnet/agentic-flow | MIT | YES | INSPIRE — superseded by ruflo |
| bytedance/deer-flow | MIT | YES | ADAPT — goal-evaluator/memory-gates/skill-scan patterns |
| ruvnet/ruflo | MIT | YES | REIMPLEMENT — federation/trust concepts rebuilt natively |
| code-yeongyu/oh-my-openagent | **SUL-1.0** | **NO** | INSPIRE — zero reuse permitted |

## Skill ecosystems

| Repository | License | Compatible | Action |
|---|---|---|---|
| affaan-m/ECC | MIT | YES | ADAPT selected skills + installer manifest pattern |
| mattpocock/skills | MIT | YES | ADOPT selected SKILL.md assets w/ attribution |
| devos-ing/omni-skills | **NONE FOUND** | **NO** | Pattern study only (lockfile/ownership mechanics) |
| weisser-dev/awesome-opencode | MIT | YES | ADAPT templates/model-tier mapping |
| youdotcom-oss/agent-skills | MIT | YES | WRAP as optional search connector |
| CodeAlive-AI/ai-driven-development | MIT | YES | ADOPT selected skills + bash-guard design |

## Platform dependencies

| Component | License | Note |
|---|---|---|
| OpenCode (runtime) | UNVERIFIED at research time — confirm before any code vendoring (we don't vendor; we invoke/configure) | Interact via CLI/API/config only |
| A2A protocol spec | Apache-2.0 (LF project) | Spec conformance ≠ code copy |
| MCP specification | MIT | Reference only |
| ponytail plugin (npm @dietrichgebert/ponytail) | MIT | Runtime dependency, listed in THIRD_PARTY_NOTICES |

## Compliance rules for this repo
1. Every third-party file copied → entry in `THIRD_PARTY_NOTICES.md` + `source-manifest.yaml` with exact commit hash.
2. AGPL/SUL/unlicensed projects: documentation may cite facts and URLs; no code, config snippets, prompts, or asset bytes.
3. Apache-2.0 derived material carries upstream NOTICE text forward.
4. When compatibility is uncertain → clean-room reimplement and record decision.
5. This document + `docs/sources/source-manifest.yaml` are reviewed at every release.
