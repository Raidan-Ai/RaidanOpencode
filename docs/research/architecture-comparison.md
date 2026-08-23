# Architecture Comparison

Date: 2026-08-23
Question: which orchestration/control-plane shape should RaidanOpencode standardize on? Compared across the strongest researched systems.

## Candidates

### 1. In-session gated pipeline (opencode-swarm style)
Architect-led roles inside ONE OpenCode session; plan→critic→code→review→test gates; state in `.swarm/` ledger.
- ✅ Zero new infrastructure; works everywhere OpenCode runs incl. Windows; proven gates; PRM anti-loop protection.
- ❌ Single-session bound; cross-project fleet visibility weak; no long-running background agents.

### 2. Orchestrator/Worker IDE (agent-orchestrator style)
Persistent planner agent + worker units (task+agent+workspace); fact-derived kanban; daemon watches SCM/CI.
- ✅ Cleanest separation of planning vs execution; scales across parallel workstreams; native Windows precedent.
- ❌ Requires daemon + rich state; heavier than most users need at L0–L2.

### 3. Conductor fleet supervision (agent-deck style)
One supervisory agent session watches worker sessions; escalates to human via bridges.
- ✅ Great for mixed-runtime fleets; phone escalation; worktree lifecycle best-in-class.
- ❌ tmux-bound process layer; conductor quality depends on model quality; drift risk without deterministic gates.

### 4. Org-chart OS (5dive style)
Unix-user isolation + systemd services + SQLite bus + council review; humans answer gates by phone.
- ✅ Strongest security posture; measurable autonomy ratio; verifier discipline.
- ❌ Linux-only primitives; root installer; unusable directly on Windows/macOS.

### 5. Graph harness (deer-flow/ruflo style)
Lead agent spawns capped sub-agents in graph runtime; heavy memory/tracing infra.
- ✅ Long-horizon task handling; deep observability.
- ❌ Second runtime competing with OpenCode; duplication of agents/hooks/memory we already get natively.

## Decision: layered hybrid behind ONE facade

```
L0/L1 ─ direct execution / planner+executor        → plain OpenCode session (no swarm)
L2    ─ planner + specialist                        → gated pipeline (pattern 1, adopted from opencode-swarm)
L3    ─ architecture + multi-agent team             → pattern 1 + Lean-Turbo file-disjoint lanes + Council gate
L4    ─ full orchestration                          → Raidan Orchestrator daemon (pattern 2) supervising
                                                        multiple OpenCode sessions via serve-API,
                                                        Runtime Supervisor for background/long-running,
                                                        Policy Engine choke-pointing all permissions
```

Rationale:
1. **No over-orchestration** (spec §20): 90% of daily work is L0–L2 and must not pay daemon tax.
2. **Windows mandate**: everything above L2 uses OpenCode serve-API + node child processes — no tmux/systemd anywhere in core paths.
3. **Single brain**: complexity classifier is the ONLY component that picks a lane; lanes are implementations, not products.
4. **Security inheritance**: L3/L4 inherit opencode-swarm-style gates + 5dive-style isolation tiers reimplemented portably (job objects / containers when available).
5. **Fleet later**: cross-machine federation stays a documented design (ruflo-inspired trust scoring) until v2 — no premature distribution.

## What we explicitly do NOT build
- Another LangGraph/AutoGen/CrewAI-compatible runtime
- A second chat UI wrapping sessions
- Agent-to-agent messaging protocols other than internal events + A2A
- Autonomous-by-default anything (policy modes gate it)
