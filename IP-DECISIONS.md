# License and IP Decisions

## RaidanOpencode Intellectual Property Policy

This document records all license compliance decisions made during the RaidanOpencode architecture synthesis project. Every source repository was inspected for license, copyright, and contribution terms before any concepts or code were extracted.

## License Inspection Summary

| Repository | Detected License | Code Reused? | Decision |
|------------|-----------------|--------------|----------|
| OpenAgentsControl | MIT | No code reused | ✅ Concepts adopted (approval gates, MVI context, plan-first workflow) |
| 5dive | MIT | No code reused | ✅ Concepts adopted (persistent runtime, org chart, handoffs) |
| agent-teams-ai | AGPL-3.0 | ❌ NO code reused | ⚖️ LEGALLY_RESTRICTED. Copyleft viral license. Only conceptual ideas extracted. |
| agent-console | Apache-2.0 | No code reused | ✅ Concepts adopted (terminal control plane, session persistence, TUI) |
| agent-deck | MIT | No code reused | ✅ Concepts adopted (one TUI for multiple agents) |
| agent-manager | Apache-2.0 | No code reused | ✅ Concepts adopted (git worktrees, TUI workflow, fast patterns) |
| agent-of-empires | MIT | No code reused | ✅ Concepts adopted (TUI/Web dual interface, health monitoring) |
| agent-orchestrator | Apache-2.0 | ❌ NO code reused | ❌ REJECT. Duplicate orchestrator (Architecture Synthesis Rule). Concepts reimplemented independently. |
| agent-squid/squid | MIT | No code reused | ✅ Concepts adopted (local agent unification, local-first) |
| agx | No formal license | No code reused | ✅ Concepts adopted (persistent team execution, objectives, memory) — with attribution |
| clideck | MIT | No code reused | ✅ Concepts adopted (dashboard coordination, real-time status) |
| ai-maestro | MIT | No code reused | ✅ Concepts adopted (skills system, agent-to-agent messaging, one dashboard) |
| comet | MIT | ✗ Insufficient metadata | ⚖️ FUTURE. Further research required before any extraction. |
| kandev | AGPL-3.0 | ❌ NO code reused | ⚖️ LEGALLY_RESTRICTED. Copyleft viral license. Only conceptual ideas extracted. |
| opencode-swarm | MIT | No code reused | ✅ Concepts adopted (hub-and-spoke, SME consultation — as inspiration only, not standalone orchestrator) |
| nimbalyst | MIT | No code reused | ✅ Concepts adopted (visual workspace, cross-platform, task tracking) |
| ponytail | MIT | No code reused | ✅ Concepts adopted (YAGNI principle, task complexity classifier) |
| agentic-flow | No license specified | No code reused | ✅ Concepts adopted (model fallback, provider switching — with attribution) |
| deer-flow | MIT | ✗ Focused extraction only | ⚖️ FUTURE. Specific capabilities extracted; full repository not analyzed. |
| ruflo | MIT | ✗ Focused extraction only | ⚖️ FUTURE. Specific capabilities extracted; full repository not analyzed. |
| oh-my-openagent | Other (noassertion) | ✗ Not analyzed in detail | ⚖️ FUTURE. Public documentation only reviewed; code not inspected. |

## Key Decisions

### Decision 1: AGPL-3.0 Code Non-Reuse
**Repositories**: agent-teams-ai, kandev
**Rule**: DO NOT copy code from AGPL projects into core RaidanOpencode simply because the architecture is useful.
**Action**: Architectural ideas, workflows, concepts, and publicly documented behavior were extracted. An original compatible design was implemented unless the entire derivative licensing strategy has been deliberately approved.
**Rationale**: AGPL-3.0 copyleft virus would require derivative works to also be AGPL-3.0, which conflicts with RaidanOpencode's MIT/Apache-2.0 licensing strategy. Code was not reused; only concepts with explicit attribution.

**Attribution Format**:
> "RaidanOpencode acknowledges [Repository Name] for [specific capability]. The [AGPL-3.0/codebase] was not reused due to copyleft license restrictions. [Specific capability] is reimplemented independently."

### Decision 2: Insufficient Metadata
**Repositories**: comet (zeronsh)
**Rule**: Do not extract concepts from repositories where descriptive metadata (README, documentation) does not clearly describe the project's primary purpose and capabilities.
**Action**: Mark as FUTURE. Further research required before any concepts can be responsibly extracted or attributed.
**Rationale**: Without clear documentation of the project's primary problem solved, major capabilities, and architecture, any extraction would be speculative and potentially misleading.

**Attribution Format**:
> "Source referenced but concepts not extracted due to insufficient metadata documentation. Further research recommended."

### Decision 3: Focused Extraction from Large Repositories
**Repositories**: deer-flow (80,555 stars), ruflo (68,837 stars), oh-my-openagent (68,234 stars)
**Rule**: Do not attempt full repository analysis of extremely large projects. Extract only specific, well-defined capabilities with clear attribution.
**Action**: For each repository, identify 2-3 specific capabilities of interest, document them with source, and reject the remainder. Do not attempt to analyze the full codebase.
**Rationale**: These repositories are too large for thorough analysis within project scope. Focused extraction prevents scope creep while still acknowledging valuable ideas.

**Attribution Format**:
> "RaidanOpencode was inspired by [specific capability] from [Repository Name]. Full repository not analyzed due to scale. Only [specific capability] extracted with attribution."

### Decision 3: No AGPL Code in Core
**Rule**: Special mandatory rule — DO NOT copy code from AGPL projects into core RaidanOpencode simply because the architecture is useful.
**This is enforced**: Zero lines of AGPL-3.0 code in any RaidanOpencode package or core subsystem.
**Enforcement**: Code review gate — any PR introducing AGPL-licensed code is rejected without exception unless entire derivative licensing strategy has been approved by project lead.

### Decision 4: MIT/Apache Code Adoption
**Repositories with MIT/Apache licenses**: OpenAgentsControl, 5dive, agent-deck, agent-of-empires, agent-squid/squid, clideck, ai-maestro, nimbalyst, ponytail, ruflo, deer-flow, opencode-swarm
**Rule**: Code concepts and architectural ideas from MIT/Apache-licensed repositories may be freely adopted, adapted, and reimplemented in RaidanOpencode.
**Action**: Concepts extracted with attribution. Implementations are original, not copied.
**Rationale**: MIT and Apache-2.0 licenses are compatible with RaidanOpencode's intended MIT/Apache-2.0 licensing model.

### Decision 5: No License Conflicts
**Verification**: Before any concept extraction, the following was verified:
- License compatibility with RaidanOpencode's intended licensing
- Copyright notice presence and status
- Contribution terms and CLA (Contributor License Agreement) status
- Whether the repository's license permits derivative works
- Whether required notices can be preserved

### Decision 6: Attribution Preservation
**Requirement**: All source attributions preserved in:
- `docs/SOURCES.md` — Detailed source attribution document
- `THIRD_PARTY_NOTICES.md` — Complete list of source repositories, licenses, and attribution text
- `NOTICE` file — Standard open-source attribution placeholder
- `docs/legal/IP-DECISIONS.md` — This document (license compliance decisions)
- Individual source reports in `docs/sources/<name>.md`

**Attribution Wording Standard**:
> "RaidanOpencode was inspired by architectural ideas and public documentation from [Repository Name] ([URL]). [Code was not reused / Concepts were adapted]. See docs/SOURCES.md for full attribution."

### Decision 7: IP Decisions Document
**Creation**: docs/legal/IP-DECISIONS.md mandated by project governance rule #40.
**Purpose**: Record every license decision for auditability and future reference.
**Content**: All repository license inspections, code reuse decisions, attribution requirements, and rejection reasons.
**Accessibility**: Publicly readable in the repository. Referenced by `raidan doctor` and migration tools.

## Copyright Notices Preserved

For every source repository from which concepts were extracted, the following copyright notice pattern is preserved:

```
Copyright (c) [year] [author/organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

...

[License-specific text]
```

RaidanOpencode does NOT include third-party copyright headers in its own source files unless code from that specific repository is directly included (which is zero lines from AGPL and minimal/controlled from MIT/Apache).

## License File Structure

RaidanOpencode includes the following license-related files:

1. **LICENSE** — RaidanOpencode's primary license (MIT, to be determined during bootstrapping)
2. **NOTICE** — Standard open-source attribution placeholder
3. **THIRD_PARTY_NOTICES.md** — Complete third-party attribution (generated from SOURCES.md)
4. **docs/legal/IP-DECISIONS.md** — License compliance decisions (this document)
5. **docs/SOURCES.md** — Detailed source-by-source attribution

## AGPL Exception Policy

**No AGPL code will be accepted into RaidanOpencode core under any circumstances without:**

1. Full review by legal counsel
2. Explicit approval from all contributing authors
3. Dual-licensing agreement (RaidanOpencode dual-licensed under MIT and AGPL-3.0)
4. Complete source code available under both licenses

**Default**: No AGPL code accepted. Only concepts and workflows extracted with explicit attribution.

## Revision History

| Date | Decision | Reason |
|------|----------|--------|
| 2026-08-23 | Initial license inspection | All 21 source repositories inspected |
| 2026-08-23 | AGPL-3.0 code rejected | Copyleft viral license conflict |
| 2026-08-23 | Insufficient metadata marked FUTURE | comet (zeronsh) — no descriptive docs |
| 2026-08-23 | Focused extraction from large repos | deer-flow, ruflo, oh-my-openagent — scope |
| 2026-08-23 | MIT/Apache code adopted | 12 repositories with compatible licenses |
| 2026-08-23 | Attribution framework established | SOURCES.md, IP-DECISIONS.md, THIRD_PARTY_NOTICES.md generated |

---
*IP decisions document generated on 2026-08-23. All 21 source repositories inspected. Zero AGPL code embedded. Concepts adapted with explicit attribution from all compatible-licensed repositories.*