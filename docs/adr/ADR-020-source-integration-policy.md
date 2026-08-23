# ADR-020 — Source Integration Policy

Status: Accepted · Date: 2026-08-23

## Context
21 source repos + 6 skill ecosystems evaluated. License spread: MIT×17, Apache-2.0×2, AGPL-3.0×2, SUL-1.0×1, unknown×1 (+OpenCode license UNVERIFIED).

## Decision
Integration ladder (spec §7) applied per-source, recorded in docs/research/integration-map.md + source-manifest.yaml:
- ADOPT only for MIT assets usable as-is (ponytail plugin, selected SKILL.md files w/ attribution headers, opencode-swarm pending installer-side-effect audit)
- ADAPT for patterns/code-ported-with-attribution from MIT/Apache sources
- WRAP only as unmodified external services (kandev candidate)
- REIMPLEMENT for concepts locked behind incompatible licenses or wrong platforms (AGPL UIs, 5dive systemd internals, ruflo federation)
- INSPIRE for design notes only (AGPL/SUL/unlicensed sources: agent-teams-ai, kandev code paths, oh-my-openagent, omni-skills content)
Hard rules: no bytes from AGPL/SUL/no-license sources; Apache NOTICE preserved; every copied file gets THIRD_PARTY_NOTICES entry + pinned hash; uncertain compatibility → clean-room.

## Consequences
+ Defensible provenance; safe MIT release
+ Legal page states independence & non-endorsement (spec §102)
− Some attractive implementations (kandev executors, agent-teams UX) must be rebuilt — cost accepted deliberately
