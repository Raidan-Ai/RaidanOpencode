# Legal & Licensing

RaidanOpencode's legal posture in one page. Full detail lives in the files referenced below.

## Project license

- [`LICENSE`](../../LICENSE) — MIT, © Raidan Ameen
- [`NOTICE`](../../NOTICE) — project attribution notice
- [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md) — third-party notices

## Source provenance

Every repository researched or consumed is recorded twice:

| File | Purpose |
|------|---------|
| [`docs/sources/source-manifest.yaml`](../sources/source-manifest.yaml) | Human-readable provenance database (spec §136) |
| [`sources.lock.json`](../../sources.lock.json) | Machine-readable pin (27 sources) |

Integration taxonomy: `INSPIRED | ADAPTED | WRAPPED | REIMPLEMENTED | INTEGRATED | REJECTED`.
`code_copied` is `false` for **every** source — zero bytes of third-party code enter this repository.

## Restricted licenses — ZERO reuse policy

| License | Sources | Policy |
|---------|---------|--------|
| AGPL-3.0 | kandev, agent-teams-ai | Concept-only inspiration; independent implementation |
| SUL-1.0 | oh-my-openagent | Concept notes only |
| UNKNOWN | omni-skills | Mechanics reimplemented from description only |

Apache-2.0 sources (`agent-orchestrator`, `YoanWai/agent-manager`): NOTICE preservation required if any text is ever derived.

## Open-source gratitude

[`docs/sources/THANK_YOU.md`](../sources/THANK_YOU.md) — explicit thanks to every project that made this work possible.

## Rules for contributors

1. Never vendor third-party code without updating both provenance files and passing license review.
2. Any dependency added must answer the Dependency Budget questions (ARCHITECTURE.md §73).
3. License scan runs in CI before every release; a new restricted-license entry blocks merge.
4. When in doubt: reimplement from documented concepts, attribute generously, copy nothing.
