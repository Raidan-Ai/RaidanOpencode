/**
 * RaidanOpencode — Capability Registry & Graph
 *
 * Implements ARCHITECTURE.md §9 (Capability System) — the foundation of
 * capability-first routing (§3.3, §10): routing resolves REQUIRED CAPABILITIES
 * to candidate subjects (agents, skills, tools, runtimes, models), never names.
 *
 * Kernel-pure: no dependencies outside RAK types. The Meta Router (§10) will
 * consume this registry; it must never become a second orchestrator.
 */

// ---------------------------------------------------------------------------
// Capability vocabulary
// ---------------------------------------------------------------------------

export type CapabilityLevel = "basic" | "intermediate" | "advanced";

export type RiskLevel = "SAFE" | "CONTROLLED" | "SENSITIVE" | "DANGEROUS";

export type CostClass = "low" | "medium" | "high";

/** A first-class capability object (ARCHITECTURE.md §9.1). */
export interface Capability {
  id: string;
  name: string;
  description?: string;
  level?: CapabilityLevel;
  /** Tools a subject needs to exercise this capability. */
  requiredTools?: string[];
  /** Skills that enable this capability. */
  requiredSkills?: string[];
  riskLevel?: RiskLevel;
  costClass?: CostClass;
  /** Registry confidence in this capability definition, 0..1. */
  confidence?: number;
}

/** Subject types that can hold capabilities (ARCHITECTURE.md §9.2 graph). */
export type SubjectType =
  | "agent"
  | "skill"
  | "tool"
  | "mcp"
  | "runtime"
  | "model"
  | "provider";

/**
 * One edge of the capability graph:
 *   subject --has/enables/supports/executes/bestAt--> capability
 */
export interface CapabilityBinding {
  subjectId: string;
  subjectType: SubjectType;
  capabilityId: string;
  /** Routing weight for this subject's ability to deliver the capability, 0..1. */
  score?: number;
}

/** What a task or role asks the registry for. */
export interface CapabilityQuery {
  capabilityId: string;
  /** Minimum level the candidate must demonstrate. */
  minLevel?: CapabilityLevel;
  /** Candidate must have access to every listed tool. */
  withTools?: string[];
  /** Restrict candidates to these subject types. */
  subjectTypes?: SubjectType[];
}

export interface CapabilityMatch extends CapabilityBinding {
  capabilityId: string;
  score: number;
}

const LEVEL_RANK: Record<CapabilityLevel, number> = {
  basic: 1,
  intermediate: 2,
  advanced: 3,
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * The single canonical capability registry (ARCHITECTURE.md §92 Q3: exactly
 * ONE capability registry). Upsert semantics everywhere; removal is explicit.
 */
export class CapabilityRegistry {
  private capabilities = new Map<string, Capability>();
  private bindings: CapabilityBinding[] = [];

  // -- capabilities ----------------------------------------------------------

  /** Register or update a capability definition. Returns the stored value. */
  register(capability: Capability): Capability {
    if (!capability.id) throw new Error("capability.id is required");
    if (!capability.name) throw new Error(`capability ${capability.id}: name is required`);
    const stored: Capability = {
      ...capability,
      confidence:
        capability.confidence === undefined ? undefined : clamp01(capability.confidence),
    };
    this.capabilities.set(capability.id, stored);
    return stored;
  }

  get(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  list(): Capability[] {
    return [...this.capabilities.values()];
  }

  remove(id: string): boolean {
    const existed = this.capabilities.delete(id);
    if (existed) this.bindings = this.bindings.filter((b) => b.capabilityId !== id);
    return existed;
  }

  // -- graph edges -----------------------------------------------------------

  /** Bind a subject to a capability (upsert per subject+capability pair). */
  bind(binding: CapabilityBinding): CapabilityBinding {
    if (!this.capabilities.has(binding.capabilityId)) {
      throw new Error(`unknown capability: ${binding.capabilityId}`);
    }
    const score = binding.score === undefined ? undefined : clamp01(binding.score);
    const stored: CapabilityBinding = { ...binding, score };
    const idx = this.bindings.findIndex(
      (b) =>
        b.subjectId === binding.subjectId &&
        b.subjectType === binding.subjectType &&
        b.capabilityId === binding.capabilityId,
    );
    if (idx >= 0) this.bindings[idx] = stored;
    else this.bindings.push(stored);
    return stored;
  }

  unbind(subjectId: string, capabilityId: string): boolean {
    const before = this.bindings.length;
    this.bindings = this.bindings.filter(
      (b) => !(b.subjectId === subjectId && b.capabilityId === capabilityId),
    );
    return this.bindings.length < before;
  }

  unbindSubject(subjectId: string): number {
    const before = this.bindings.length;
    this.bindings = this.bindings.filter((b) => b.subjectId !== subjectId);
    return before - this.bindings.length;
  }

  /** All subjects bound to a capability. */
  bindingsFor(capabilityId: string): CapabilityBinding[] {
    return this.bindings.filter((b) => b.capabilityId === capabilityId);
  }

  /** All capabilities held by a subject. */
  capabilitiesOf(subjectId: string): Capability[] {
    const ids = new Set(
      this.bindings.filter((b) => b.subjectId === subjectId).map((b) => b.capabilityId),
    );
    return [...ids].map((id) => this.capabilities.get(id)!).filter(Boolean);
  }

  // -- routing queries -------------------------------------------------------

  /**
   * Find candidates able to satisfy a capability query, best first.
   *
   * Filtering: unknown capability → []; level below minLevel → excluded;
   * missing any queried tool → excluded; subjectTypes filter respected.
   * Scoring: binding score (default 0.5) × definition confidence (default 0.8).
   */
  findCandidates(query: CapabilityQuery): CapabilityMatch[] {
    const cap = this.capabilities.get(query.capabilityId);
    if (!cap) return [];

    const needRank = query.minLevel ? LEVEL_RANK[query.minLevel] : undefined;
    const capRank = cap.level ? LEVEL_RANK[cap.level] : 1;

    const matches: CapabilityMatch[] = [];
    for (const b of this.bindingsFor(query.capabilityId)) {
      if (query.subjectTypes && !query.subjectTypes.includes(b.subjectType)) continue;

      // A subject claiming an advanced capability satisfies lower minimums too:
      // the check is against the CAPABILITY's declared level, not the subject's.
      if (needRank !== undefined && capRank < needRank) continue;

      if (query.withTools?.length) {
        const held = new Set(cap.requiredTools ?? []);
        const satisfied = query.withTools.every((t) => held.has(t));
        if (!satisfied) continue;
      }

      matches.push({
        ...b,
        capabilityId: query.capabilityId,
        score: clamp01((b.score ?? 0.5) * (cap.confidence ?? 0.8)),
      });
    }
    matches.sort((a, z) => z.score - a.score || a.subjectId.localeCompare(z.subjectId));
    return matches;
  }

  /** Graph statistics for doctor/observability surfaces. */
  stats(): { capabilities: number; bindings: number; bySubjectType: Record<string, number> } {
    const bySubjectType: Record<string, number> = {};
    for (const b of this.bindings) {
      bySubjectType[b.subjectType] = (bySubjectType[b.subjectType] ?? 0) + 1;
    }
    return { capabilities: this.capabilities.size, bindings: this.bindings.length, bySubjectType };
  }
}
