# RaidanOpencode

> **Unified AI Agent Engineering Operating System for OpenCode**
> One orchestrator · one task engine · one policy engine · one gateway — around the OpenCode you already run.

[![CI](https://github.com/Raidan-Ai/RaidanOpencode/actions/workflows/ci.yml/badge.svg)](https://github.com/Raidan-Ai/RaidanOpencode/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20WSL-lightgrey)

---

## What it is

RaidanOpencode turns an existing [OpenCode](https://opencode.ai) installation into a governed agent engineering platform: canonical registries for agents/tasks/skills/MCP, capability-based model routing, a policy choke-point over every destructive action, and an observability ledger — **without forking OpenCode** and without replacing anything you already configured.

It exists because the ecosystem offers 20+ overlapping orchestrators/dashboards/harnesses, most of which are POSIX-bound or license-incompatible. RaidanOpencode keeps ONE of each subsystem (see [`docs/research/deduplication.md`](docs/research/deduplication.md)) and runs Windows-first.

## Core principles

```
Research → Architecture → Dedup → Implement      OpenCode IS the runtime; we are its control plane
Preserve user config & skills                    Idempotent install · backup before change · dry-run default
Local-first (no mandatory cloud)                 Telemetry OFF by default
Windows / Linux / WSL parity                     Secrets via {env:}/{file:} refs — never in files
```

## Architecture (v0.3)

```
OpenCode Runtime ◄──── serve-API + plugins + native dirs ────► Raidan Control Plane
                                                                 │
        ┌──────────────┬──────────────┬─────────────┬────────────┼──────────────┐
   Agent Registry  Task Engine   Skill Registry  Policy     Event Bus     Config
   (75 loaded*)    (lifecycle+   (1544 scanned*, (4 modes,  (JSONL       Manager
                   deps+retry)    dup detection)  ASK/DENY)  ledger)      ({env:} refs)
                                                                 │
                                              Observability ledger · Migration engine
```
<sub>*counts from the author's live machine — yours will differ</sub>

## Quick start

```powershell
# Windows (from repo checkout)
npm install
npm test          # 9/9 tests
node dist\src\cli\index.js doctor
node dist\src\cli\index.js status
```

```bash
# Linux/macOS
npm install && npm test && node dist/src/cli/index.js doctor
```

## CLI

| Command | What it does |
|---|---|
| `raidan doctor` | PASS/WARN/FAIL across node/git/opencode-config/skills |
| `raidan status` | agents/skills/tasks/policy-mode snapshot |
| `raidan config show` | merged config with secrets redacted (key-name AND value-pattern) |
| `raidan agent list` / `inspect <id>` | registry over your OpenCode agents |
| `raidan skill duplicates` | cross-scope duplicate detection |
| `raidan task create/list` | canonical task lifecycle (deps enforced) |
| `raidan policy check <domain> <action>` | verdict preview: ALLOW/ASK/DENY by mode |
| `raidan migrate backup` | timestamped OpenCode config backup outside any repo |

Full roadmap (`init` wizard, model router, A2A adapter, runtime supervisor): [`docs/adr`](docs/adr) · [`agent-engineering-manifest.yaml`](agent-engineering-manifest.yaml).

## Security posture

- Every gate decision auditable; destructive patterns DENY even in autonomous mode.
- `config show` redacts `sk-`/`ghp_`/AWS-style values wherever they hide — including misleading field names.
- CI scans tracked sources for token patterns on every push.
- See [SECURITY.md](SECURITY.md). Found something? Please report privately.

## Documentation

English: [`docs/en`](docs/en) · العربية: [`docs/ar`](docs/ar) · Research: [`docs/research`](docs/research) (21 source repos analyzed) · Decisions: [`docs/adr`](docs/adr) (ADR-001…020) · Integrations: [`docs/integrations`](docs/integrations) · Provenance: [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) + [`docs/sources/source-manifest.yaml`](docs/sources/source-manifest.yaml)

## Status

Phase 2–4 of 13 complete (research ✓ architecture ✓ core foundation ✓ engines: context/memory/teams/orchestrator ✓). Next: runtime supervisor, notifications, observability ledger queries, A2A adapter. Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Author

**Raidan Ameen** — [raidan.bio](https://raidan.bio/) · [GitHub @Raidan-Ai](https://github.com/Raidan-Ai) · [LinkedIn](https://www.linkedin.com/in/raidan-ameen/) · [Hugging Face RaidanPro](https://huggingface.co/RaidanPro) · [Yemen-JPT](https://huggingface.co/Yemen-JPT)

## License & attribution

MIT — see [LICENSE](LICENSE). RaidanOpencode is an independent project inspired by open-source work; trademarks belong to their owners; references imply no endorsement. Full credits: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [`docs/sources/THANK_YOU.md`](docs/sources/THANK_YOU.md).
