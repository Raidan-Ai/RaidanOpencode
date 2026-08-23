# Third-Party Notices

RaidanOpencode is an independent open-source project inspired by, and where legally appropriate adapted from, ideas and components of open-source projects. Project names, trademarks and repositories belong to their respective owners. References or integrations do not imply endorsement.

## Runtime dependencies

| Component | License | Source | Notes |
|---|---|---|---|
| commander | MIT | https://github.com/tj/commander.js | CLI framework |
| Node.js built-ins (node:test, fs, etc.) | Node license | https://nodejs.org | no extra deps |
| TypeScript (devDependency) | Apache-2.0 | https://github.com/microsoft/TypeScript | build-time only |

## Adopted at runtime (user-installed)

| Component | License | Source | Usage |
|---|---|---|---|
| ponytail (@dietrichgebert/ponytail OpenCode plugin) | MIT | https://github.com/DietrichGebert/ponytail | optional minimal-code policy layer; installed via OpenCode plugin mechanism, not vendored here |

## Concepts adapted (no code copied)

Full machine-readable provenance: [`docs/sources/source-manifest.yaml`](docs/sources/source-manifest.yaml). Summary:

- MIT sources informing architecture (patterns/designs only): OpenAgentsControl, agent-deck, opencode-swarm, deer-flow, clideck, agent-of-empires, agx, squid, comet/Zeron, ai-maestro, nimbalyst, agent-console, 5dive, ruflo, agentic-flow, awesome-opencode, ECC, mattpocock/skills, CodeAlive-AI/ai-driven-development, youdotcom-oss/agent-skills.
- Apache-2.0 sources informing design (NOTICE preserved if text derived): Untrivial-ai/agent-orchestrator, YoanWai/agent-manager.

## License-incompatible — inspiration only, ZERO bytes reused

- kdlbs/kandev (AGPL-3.0)
- 777genius/agent-teams-ai (AGPL-3.0)
- code-yeongyu/oh-my-openagent (SUL-1.0)
- devos-ing/omni-skills (no license found)

## Standards referenced

- MCP specification — https://modelcontextprotocol.io
- A2A protocol v1.0.0 (Linux Foundation) — https://a2a-protocol.org
- OpenCode documentation — https://opencode.ai/docs

## Gratitude

See [`docs/sources/THANK_YOU.md`](docs/sources/THANK_YOU.md).
