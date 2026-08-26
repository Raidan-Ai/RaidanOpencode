/**
 * RaidanOpencode — Meta Router
 *
 * Implements ARCHITECTURE.md §10–§11: answers "what is the cheapest, fastest,
 * safest and most reliable way to accomplish this task?" by turning capability
 * requirements into a DECISION PLAN over the Capability Registry.
 *
 * BOUNDARY (§10): the Meta Router is NOT a second orchestrator. It produces a
 * plan; the Orchestration Kernel executes it and handles dynamic changes.
 *
 * HONEST SCORING NOTE: multi-objective weights (§11) are recorded on every
 * plan for observability, but candidate selection today ranks purely by the
 * registry's score (binding × confidence). Cost/latency/risk telemetry does
 * not exist yet; when it lands, selection will blend weights × telemetry.
 */

import type {
  CapabilityLevel,
  CapabilityMatch,
  CapabilityRegistry,
  SubjectType,
} from "../capabilities/registry.js";

// ---------------------------------------------------------------------------
// Multi-objective weights (ARCHITECTURE.md §11)
// ---------------------------------------------------------------------------

export interface RoutingWeights {
  quality: number;
  reliability: number;
  cost: number;
  latency: number;
  risk: number;
  context: number;
}

/** Blueprint §11 defaults; policy-configurable at construction time. */
export const DEFAULT_WEIGHTS: RoutingWeights = {
  quality: 0.4,
  reliability: 0.2,
  cost: 0.15,
  latency: 0.1,
  risk: 0.1,
  context: 0.05,
};

export function normalizeWeights(w: RoutingWeights): RoutingWeights {
  const total =
    w.quality + w.reliability + w.cost + w.latency + w.risk + w.context;
  if (total <= 0) return { ...DEFAULT_WEIGHTS };
  return {
    quality: w.quality / total,
    reliability: w.reliability / total,
    cost: w.cost / total,
    latency: w.latency / total,
    risk: w.risk / total,
    context: w.context / total,
  };
}

// ---------------------------------------------------------------------------
// Routing input / output
// ---------------------------------------------------------------------------

export interface RouteRequirement {
  capabilityId: string;
  minLevel?: CapabilityLevel;
  withTools?: string[];
}

export interface RoutingInput {
  requirements: RouteRequirement[];
  /** Subject types eligible to satisfy requirements. Default: ["agent"]. */
  subjectTypes?: SubjectType[];
  /** Extra candidates kept per requirement beyond the primary. Default 1. */
  fallbacksPerRequirement?: number;
}

export interface CapabilityAssignment {
  capabilityId: string;
  primary: CapabilityMatch | null;
  fallbacks: CapabilityMatch[];
}

export type WorkspaceStrategy = "shared" | "isolated-worktree";

/**
 * A decision plan. The kernel executes this; nothing here mutates system state.
 */
export interface RoutingPlan {
  assignments: CapabilityAssignment[];
  /** Requirement ids with no candidates — orchestrator must escalate or ask. */
  unresolved: string[];
  /** Unique primary subjects across all assignments (minimum sufficient team). */
  teamSize: number;
  workspaceStrategy: WorkspaceStrategy;
  weights: RoutingWeights;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export class MetaRouter {
  private readonly weights: RoutingWeights;

  constructor(
    private registry: CapabilityRegistry,
    weights?: Partial<RoutingWeights>,
  ) {
    this.weights = normalizeWeights({ ...DEFAULT_WEIGHTS, ...weights });
  }

  /**
   * Produce a routing plan for the given capability requirements.
   * Deterministic: same registry state + input ⇒ same plan.
   */
  route(input: RoutingInput): RoutingPlan {
    const subjectTypes = input.subjectTypes ?? ["agent"];
    const fallbackCount = Math.max(0, input.fallbacksPerRequirement ?? 1);

    const assignments: CapabilityAssignment[] = [];
    const unresolved: string[] = [];
    const primaries = new Set<string>();

    for (const req of input.requirements) {
      const candidates = this.registry.findCandidates({
        capabilityId: req.capabilityId,
        minLevel: req.minLevel,
        withTools: req.withTools,
        subjectTypes,
      });

      if (candidates.length === 0) {
        unresolved.push(req.capabilityId);
        assignments.push({
          capabilityId: req.capabilityId,
          primary: null,
          fallbacks: [],
        });
        continue;
      }

      const [primary, ...rest] = candidates;
      primaries.add(primary.subjectId);
      assignments.push({
        capabilityId: req.capabilityId,
        primary,
        fallbacks: rest.slice(0, fallbackCount),
      });
    }

    // Minimum sufficient team: one agent can hold several capabilities, so the
    // team size counts UNIQUE subjects, not assignments.
    const teamSize = primaries.size;
    const workspaceStrategy: WorkspaceStrategy =
      teamSize > 1 ? "isolated-worktree" : "shared";

    return {
      assignments,
      unresolved,
      teamSize,
      workspaceStrategy,
      weights: { ...this.weights },
      generatedAt: new Date().toISOString(),
    };
  }
}
