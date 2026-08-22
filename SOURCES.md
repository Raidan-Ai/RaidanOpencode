# Source Attribution

## RaidanOpencode Source Credits

This project synthesizes engineering capabilities from 21 leading open-source repositories in the AI agent engineering space. The following projects and authors are explicitly acknowledged for their architectural ideas, workflows, concepts, and publicly documented behavior that informed the RaidanOpencode design.

### Acknowledgments

**1. OpenAgentsControl** (https://github.com/darrenhinde/OpenAgentsControl)
- **Author/Organization**: darrenhinde
- **License**: MIT
- **Ideas Adopted**:
  - Plan-first development workflow (Plan → Approve → Execute)
  - Approval-based execution gates architecture
  - MVI (Minimal Viable Information) context strategy
  - Pattern-based development methodology
  - Editable agents concept
  - Team-shared project patterns
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 3, 9, 10, 12).
- **Date Reviewed**: 2026-08-23

**2. 5dive** (https://github.com/5dive-ai/5dive)
- **Author/Organization**: 5dive-ai
- **License**: MIT
- **Ideas Adopted**:
  - Persistent agent runtime concept (server-owned, not cloud-dependent)
  - Org chart team structure (departments/roles/members)
  - Handoff between agents pattern
  - Human-decision-only interruption model
  - Self-hosted, no mandatory cloud backend philosophy
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 2, 6, 12, 26).
- **Date Reviewed**: 2026-08-23

**3. agent-teams-ai** (https://github.com/777genius/agent-teams-ai)
- **Author/Organization**: 777genius
- **License**: AGPL-3.0 (GNU Affero General Public License)
- **Ideas Adopted** (CONCEPTS ONLY, code NOT reusable):
  - Multi-agent team management concepts
  - Agent-to-agent communication primitives (message, broadcast, handoff)
  - Kanban-style task tracking and review workflow
  - Agent review between team members
- **Code Reused**: NO code reused. AGPL-3.0 copyleft license makes code non-reusable in MIT/Apache-licensed project. Only conceptual ideas extracted with explicit attribution.
- **Date Reviewed**: 2026-08-23
- **Attribution Note**: "RaidanOpencode acknowledges agent-teams-ai for multi-agent team communication and kanban task tracking concepts. The AGPL-3.0 codebase was not reused due to copyleft license restrictions."

**4. agent-console** (https://github.com/buhuipao/agent-console)
- **Author/Organization**: buhuipao
- **License**: Apache-2.0
- **Ideas Adopted**:
  - Local terminal control plane
  - Session persistence and resume patterns
  - TUI (Terminal User Interface) design patterns
  - Discover/monitor/resume session workflow
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 4, 18, 1).
- **Date Reviewed**: 2026-08-23

**5. agent-deck** (https://github.com/asheshgoplani/agent-deck)
- **Author/Organization**: asheshgoplani
- **License**: MIT
- **Ideas Adopted**:
  - "One TUI for multiple AI coding agents" concept
  - Terminal session management patterns
  - Unified interface for multiple CLIs/agents
  - Agent-agnostic terminal routing
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layer 18 TUI, Layer 2 Runtime Registry).
- **Date Reviewed**: 2026-08-23

**6. agent-manager** (https://github.com/YoanWai/agent-manager)
- **Author/Organization**: YoanWai
- **License**: Apache-2.0
- **Ideas Adopted**:
  - Git worktree management workflow
  - Fast agent workflow patterns
  - tmux TUI interface patterns (adapted: optional on Windows)
  - Live status display concepts
  - Quick prompt interface patterns
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 4, 18, 1, 16).
- **Date Reviewed**: 2026-08-23

**7. agent-of-empires** (https://github.com/agent-of-empires/agent-of-empires)
- **Author/Organization**: agent-of-empires
- **License**: MIT
- **Ideas Adopted**:
  - Unified TUI/Web dual interface for agent management
  - Agent health monitoring concepts
  - Multi-agent access management patterns
  - TUI + Web interface for human control plane
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 16, 15, 0).
- **Date Reviewed**: 2026-08-23

**8. agent-orchestrator** (https://github.com/Untrivial-ai/agent-orchestrator)
- **Author/Organization**: Untrivial-ai
- **License**: Apache-2.0
- **Ideas Adopted** (CONCEPTS ONLY):
  - Task planning and decomposition ideas (reimplemented in RaidanOpencode Layer 5)
  - Code review concepts (adapted to Layer 13)
  - Merge coordination ideas (adapted to Layer 13 merge readiness)
  - CI fix feedback loop patterns (adapted to Layer 13 review events)
- **Code Reused**: NO code reused. Architecture Synthesis Rule explicitly states: "DO NOT embed Agent Orchestrator as another orchestrator." RaidanOpencode has exactly one canonical orchestrator (Layer 7). Concepts reimplemented independently.
- **Date Reviewed**: 2026-08-23
- **Attribution Note**: "RaidanOpencode does not embed the agent-orchestrator codebase. The canonical orchestrator (Layer 7) is original implementation. Task planning, code review, and merge coordination concepts are reimplemented independently with inspiration from but not copying agent-orchestrator."

**9. agent-squid/squid** (https://github.com/agent-squid/squid)
- **Author/Organization**: agent-squid
- **License**: MIT
- **Ideas Adopted**:
  - Local agent unification concept
  - Simple agent coordination primitives
  - Local-first philosophy (aligns with RaidanOpencode self-hosted-first principle)
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 2, 26).
- **Date Reviewed**: 2026-08-23

**10. agx** (https://github.com/ramarlina/agx)
- **Author/Organization**: ramarlina
- **License**: No formal license specified (public repository)
- **Ideas Adopted**:
  - Persistent team execution model
  - Objectives management for agent teams
  - Agent memory system (scoped: Global/User/Project/Team/Agent/Task/Session)
  - Coordination between agents
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 6, 29, 2).
- **Date Reviewed**: 2026-08-23

**11. clideck** (https://github.com/rustykuntz/clideck)
- **Author/Organization**: rustykuntz
- **License**: MIT
- **Ideas Adopted**:
  - Dashboard for coordinating multiple AI CLI agents
  - Real-time status display patterns
  - Agent coordination UI patterns
  - Dashboard → observability pipeline
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 14, 18).
- **Date Reviewed**: 2026-08-23

**12. ai-maestro** (https://github.com/23blocks-OS/ai-maestro)
- **Author/Organization**: 23blocks-OS
- **License**: MIT
- **Ideas Adopted**:
  - Skills system concept (memory search, code graph queries, agent-to-agent messaging)
  - One-dashboard concept (inspiration for optional control plane)
  - Code graph query ideas (inspiration for context engine)
  - Agent-to-agent messaging patterns
- **Code Reused**: No code directly reused. Skills system reimplemented as hierarchical catalog (Layer 10), not copied. Concepts adapted with attribution.
- **Date Reviewed**: 2026-08-23

**13. comet** (https://github.com/zeronsh/comet)
- **Author/Organization**: zeronsh
- **License**: MIT
- **Ideas Adopted**: 
- **Code Reused**: 
- **Date Reviewed**: 2026-08-23
- **Attribution Note**: "Source referenced but concepts not extracted due to insufficient metadata documentation at time of review. Further research recommended."

**14. kandev** (https://github.com/kdlbs/kandev)
- **Author/Organization**: kdlbs
- **License**: AGPL-3.0 (GNU Affero General Public License)
- **Ideas Adopted** (CONCEPTS ONLY, code NOT reusable):
  - Kanban-style task tracking concepts (statuses, waves, gates)
  - Multi-agent review workflow
  - PR creation workflow and git integration
- **Code Reused**: NO code reused. AGPL-3.0 copyleft license makes code non-reusable. Only conceptual ideas extracted with explicit attribution.
- **Date Reviewed**: 2026-08-23
- **Attribution Note**: "RaidanOpencode acknowledges kandev for kanban-style task tracking and multi-agent review workflow concepts. The AGPL-3.0 codebase was not reused due to copyleft license restrictions. Task engine statuses, waves, and gates are reimplemented independently."

**15. opencode-swarm** (https://github.com/ZaxbyHub/opencode-swarm)
- **Author/Organization**: ZaxbyHub
- **License**: MIT
- **Ideas Adopted**:
  - Hub-and-spoke orchestration model (informs but does not replace Layer 7)
  - SME (Subject Matter Expert) consultation concept (informs delegation and review routing)
  - Code generation patterns (inform agent tool use)
  - QA review concepts (inform Layer 13 Review Engine)
- **Code Reused**: No code directly reused. Hub-and-spoke model adapted as inspiration for model router and agent selection, but RaidanOpencode's canonical orchestrator (Layer 7) is the single orchestration layer.
- **Date Reviewed**: 2026-08-23

**16. nimbalyst** (https://github.com/nimbalyst/nimbalyst)
- **Author/Organization**: nimbalyst
- **License**: MIT
- **Ideas Adopted**:
  - Visual workspace for parallel coding agents
  - Cross-platform desktop app model (Windows + Linux + macOS)
  - Task tracking visual patterns
  - MIT-licensed, self-contained desktop approach
- **Code Reused**: No code directly reused. Concepts adapted into RaidanOpencode canonical architecture (Layers 19, 28, 26).
- **Date Reviewed**: 2026-08-23

**17. ponytail** (https://github.com/DietrichGebert/ponytail)
- **Author/Organization**: DietrichGebert
- **License**: MIT
- **Ideas Adopted**:
  - YAGNI principle for AI coding ("best code is code you never wrote")
  - Task complexity classifier (L0-L4 levels inspired)
  - Prompt engineering efficiency for cost optimization
- **Code Reused**: No code directly reused. YAGNI principle adapted into RaidanOpencode's task complexity classifier (Layer 5). Prompt engineering insights adapted into model router cost tracking (Layer 8).
- **Date Reviewed**: 2026-08-23

**18. agentic-flow** (https://github.com/ruvnet/agentic-flow)
- **Author/Organization**: ruvnet
- **License**: No license specified in metadata
- **Ideas Adopted**:
  - Model switching between low-cost alternatives
  - Model fallback chain pattern (primary → fallback → emergency → human)
  - Provider switching concepts
  - Low-cost model awareness for routing score
- **Code Reused**: No code directly reused. Model failover chain adapted into Layer 37. Model router cost tracking and fallback concepts adapted from (Layer 8).
- **Date Reviewed**: 2026-08-23

**19. deer-flow** (https://github.com/bytedance/deer-flow)
- **Author/Organization**: bytedance
- **License**: MIT
- **Ideas Adopted** (FOCUSED EXTRACTION - specific capabilities, not full repository):
  - Long-horizon super-agent harness concepts
  - Agent-to-agent messaging systems
  - Memory system patterns (scaled for RaidanOpencode scope)
  - Workflow orchestration ideas
- **Code Reused**: No code directly analyzed due to repository scale (80,555 stars). Only specific capability concepts extracted with focused analysis. Full repository not analyzed due to scope.
- **Date Reviewed**: 2026-08-23

**20. ruflo** (https://github.com/ruvnet/ruflo)
- **Author/Organization**: ruvnet
- **License**: MIT
- **Ideas Adopted** (FOCUSED EXTRACTION - specific capabilities, not full repository):
  - Multi-player swarm concepts (scaled down for RaidanOpencode)
  - Adaptive memory ideas
  - RAG integration patterns (conceptual inspiration for Layer 9 Context Engine)
  - Self-learning intelligence concepts (observability influence)
- **Code Reused**: No code directly analyzed due to repository scale (68,837 stars). Only specific capability concepts extracted with focused analysis. Full repository not analyzed due to scope.
- **Date Reviewed**: 2026-08-23

**21. oh-my-openagent** (https://github.com/code-yeongyu/oh-my-openagent)
- **Author/Organization**: code-yeongyu
- **License**: Other (noassertion)
- **Ideas Adopted** (FOCUSED EXTRACTION - specific capabilities, not full repository):
  - Coding agent harness patterns
  - Orchestration concepts
  - Skill management ideas
  - TUI patterns
- **Code Reused**: No code analyzed due to "Other" license and repository scale (68,234 stars). Only public documentation and architectural ideas reviewed.
- **Date Reviewed**: 2026-08-23

### License Compliance

#### MIT-Licensed Repositories (Code Concepts Adopted Freely)
- OpenAgentsControl (MIT)
- 5dive (MIT)
- agent-deck (MIT)
- agent-of-empires (MIT)
- agent-squid/squid (MIT)
- agx (no formal license - concepts extracted with attribution)
- clideck (MIT)
- ai-maestro (MIT)
- nimbalyst (MIT)
- ponytail (MIT)
- ruflo (MIT)
- deer-flow (MIT)

#### Apache-2.0 Licensed Repositories (Code Concepts Adopted Freely)
- agent-console (Apache-2.0)
- agent-manager (Apache-2.0)
- agent-orchestrator (Apache-2.0)
- opencode-swarm (MIT, used as conceptual inspiration only)

#### AGPL-3.0 Licensed Repositories (Concepts ONLY, Code NOT Reused)
- agent-teams-ai (AGPL-3.0) — Only conceptual ideas extracted; code non-reusable due to copyleft
- kandev (AGPL-3.0) — Only conceptual ideas extracted; code non-reusable due to copyleft

#### Insufficient Metadata
- comet (zeronsh) — No descriptive metadata; concepts not extracted

### Third-Party Notices

All third-party attributions are preserved in:
- `THIRD_PARTY_NOTICES.md` — Complete list of source repositories, licenses, and attribution text
- `NOTICE` file — Standard open-source attribution placeholder
- `docs/SOURCES.md` — Detailed source attribution document (this file)
- `docs/legal/IP-DECISIONS.md` — License compliance decisions and rationale

### Attribution Wording

Project materials use wording such as:

> "RaidanOpencode was inspired by architectural ideas and public documentation from the following open-source projects: [list]. Code was not reused from AGPL-licensed projects. Concepts were adapted into the RaidanOpencode canonical architecture."

> "RaidanOpencode acknowledges [Project Name] for [specific capability]. [Code was not reused / Concepts were adapted]."

> "The [specific capability] implementation in RaidanOpencode was inspired by [Project Name] but reimplemented independently to avoid duplication and license conflicts."

### What Was NOT Reused

The following capabilities were identified from source repositories but **not** integrated into RaidanOpencode's codebase:

1. **Complete orchestration engine from agent-orchestrator** — Replaced by RaidanOpencode's canonical single orchestrator (Layer 7)
2. **AGPL-3.0 code from agent-teams-ai** — Not reusable due to copyleft; only concepts extracted
3. **AGPL-3.0 code from kandev** — Not reusable due to copyleft; only concepts extracted
4. **Bubble Tea TUI frameworks** from agent-console, agent-manager — Not reused; RaidanOpencode creates canonical TUI
5. **Specific language implementations** (TypeScript, Go, Rust, JavaScript) — Concepts adapted, implementations original
6. **Dashboard/UI frameworks** from individual repositories — One canonical TUI only (Layer 18)
7. **Database-specific implementations** (PostgreSQL required, Redis-specific, etc.) — SQLite default with PostgreSQL migration path

### Code Reuse Policy

- **Zero lines of AGPL-3.0 code** embedded in RaidanOpencode core
- **Zero lines of GPL-compatible code** without explicit dual-licensing review
- **All code is original implementation** unless explicitly from MIT/Apache-2.0 licensed repositories
- **Concepts and workflows** from all sources are extracted and reimplemented in RaidanOpencode's architecture
- **Attribution preserved** in ALL documentation and source files

---
*Source attribution generated on 2026-08-23. Based on analysis of 21 source repositories via GitHub API. License decisions recorded per repository. All code original; concepts adapted with explicit attribution.*
