/**
 * RaidanOpencode — Deduplication Engine
 *
 * Implements ARCHITECTURE.md §12 and ADR-015: before creating any Agent,
 * Skill, Workflow, Plugin, Command, MCP integration, Runtime adapter or
 * Connector, evaluate similarity against what already exists and return a
 * deterministic verdict:
 *
 *   REUSE      — an existing entity already does this (similarity ≥ 0.90)
 *   EXTEND     — close match; extend it instead of forking (≥ 0.70)
 *   MERGE      — partial overlap in the SAME scope (≥ 0.50)
 *   SPECIALIZE — partial overlap but DIFFERENT scope (≥ 0.50)
 *   CREATE     — nothing close enough exists
 *
 * This is governance infrastructure: the registries call it on every create.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DedupEntity {
  id: string;
  name: string;
  purpose: string;
  capabilities: string[];
  keywords: string[];
  scope?: string;
}

export type DedupVerdict = "REUSE" | "EXTEND" | "MERGE" | "SPECIALIZE" | "CREATE";

export interface DedupDecision {
  verdict: DedupVerdict;
  /** Best-matching existing entity, when one exists. */
  matchId?: string;
  similarity: number;
  rationale: string;
}

export interface DedupThresholds {
  reuse: number;
  extend: number;
  merge: number;
}

export const DEFAULT_THRESHOLDS: DedupThresholds = {
  reuse: 0.9,
  extend: 0.7,
  merge: 0.5,
};

// ---------------------------------------------------------------------------
// Similarity primitives (deterministic)
// ---------------------------------------------------------------------------

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9\u0600-\u06FF]+/) // latin + arabic word chars
      .filter((t) => t.length > 2),
  );
}

/** Jaccard similarity of two token sets. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function setOverlap(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const bs = new Set(b.map((x) => x.toLowerCase()));
  let inter = 0;
  for (const x of a) if (bs.has(x.toLowerCase())) inter += 1;
  return inter / Math.max(a.length, b.length);
}

/**
 * Composite similarity: keyword overlap (40%), capability overlap (40%),
 * purpose-text overlap (20%). All components deterministic.
 */
export function similarity(proposal: DedupEntity, existing: DedupEntity): number {
  const kw = jaccard(tokenize(proposal.keywords.join(" ")), tokenize(existing.keywords.join(" ")));
  const cap = setOverlap(proposal.capabilities, existing.capabilities);
  const purpose = jaccard(tokenize(proposal.purpose), tokenize(existing.purpose));
  return 0.4 * kw + 0.4 * cap + 0.2 * purpose;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export class DeduplicationEngine {
  private entities = new Map<string, DedupEntity>();

  constructor(private thresholds: DedupThresholds = { ...DEFAULT_THRESHOLDS }) {}

  register(entity: DedupEntity): void {
    if (!entity.id) throw new Error("entity.id is required");
    this.entities.set(entity.id, entity);
  }

  get(id: string): DedupEntity | undefined {
    return this.entities.get(id);
  }

  list(): DedupEntity[] {
    return [...this.entities.values()];
  }

  /**
   * Evaluate a proposal against everything registered. Returns the decision
   * for the BEST match; ties broken by id for determinism.
   */
  evaluate(proposal: Omit<DedupEntity, "id">): DedupDecision {
    let best: { entity: DedupEntity; score: number } | null = null;

    for (const entity of this.entities.values()) {
      const score = similarity({ id: "", ...proposal }, entity);
      if (
        !best ||
        score > best.score ||
        (score === best.score && entity.id < best.entity.id)
      ) {
        best = { entity, score };
      }
    }

    if (!best) {
      return {
        verdict: "CREATE",
        similarity: 0,
        rationale: "registry is empty — nothing to duplicate",
      };
    }

    const { entity, score } = best;
    const rounded = Math.round(score * 1000) / 1000;
    const t = this.thresholds;

    if (rounded >= t.reuse) {
      return {
        verdict: "REUSE",
        matchId: entity.id,
        similarity: rounded,
        rationale: `"${entity.name}" already covers this (${rounded} ≥ ${t.reuse}) — use it`,
      };
    }
    if (rounded >= t.extend) {
      return {
        verdict: "EXTEND",
        matchId: entity.id,
        similarity: rounded,
        rationale: `"${entity.name}" is close (${rounded} ≥ ${t.extend}) — extend it rather than fork`,
      };
    }
    if (rounded >= t.merge) {
      const sameScope =
        (proposal.scope ?? "").toLowerCase() === (entity.scope ?? "").toLowerCase();
      return sameScope
        ? {
            verdict: "MERGE",
            matchId: entity.id,
            similarity: rounded,
            rationale: `partial overlap with "${entity.name}" in the same scope (${rounded}) — merge capabilities`,
          }
        : {
            verdict: "SPECIALIZE",
            matchId: entity.id,
            similarity: rounded,
            rationale: `partial overlap with "${entity.name}" but different scope (${rounded}) — specialize instead of duplicating`,
          };
    }
    return {
      verdict: "CREATE",
      matchId: entity.id,
      similarity: rounded,
      rationale: `closest match "${entity.name}" is only ${rounded} (< ${t.merge}) — safe to create`,
    };
  }
}
