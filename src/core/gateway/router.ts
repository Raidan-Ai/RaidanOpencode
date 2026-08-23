/**
 * Model/Provider routing (ADR-008/009).
 * Catalog entries declare capabilities; agents declare NEEDS; router scores and
 * returns an explicit chain. Failover triggers are infra-only — never answer quality.
 */
import { existsSync, readFileSync } from "node:fs";

export type Capability =
  | "coding" | "reasoning" | "fast" | "cheap" | "research"
  | "vision" | "audio" | "tool-calling" | "structured-output"
  | "long-context" | "embedding" | "reranking";

export interface ModelEntry {
  id: string;            // provider/model-id (OpenCode convention)
  provider: string;
  aliases: string[];
  capabilities: Capability[];
  costTier: 0 | 1 | 2 | 3; // 0=free/local … 3=premium
  latencyClass: "fast" | "medium" | "slow";
  contextWindow?: number;
}

export interface RouteNeed {
  requires?: Capability[];
  prefer?: "quality" | "cost" | "latency";
}

export interface RoutedChain {
  primary: ModelEntry;
  secondary?: ModelEntry;
  fallback?: ModelEntry;
  emergency?: ModelEntry;
  rationale: string;
}

export const FAILOVER_TRIGGERS = [
  "timeout",
  "provider-unavailable",
  "rate-limit",
  "capacity",
] as const;

export class ModelRouter {
  constructor(private catalog: ModelEntry[]) {}

  static defaultCatalog(): ModelEntry[] {
    return [
      // OmniRoute local gateway — detected on owner machine, aliases per opencode.jsonc
      ...["best-coding", "best-reasoning", "best-fast", "best-coding-fast", "best-chat", "coding", "chat", "fast"].map(
        (a): ModelEntry => ({
          id: `omiroute/auto/${a}`,
          provider: "omiroute-local",
          aliases: [a],
          capabilities:
            a.includes("reasoning") ? ["reasoning", "tool-calling", "structured-output"]
            : a.includes("coding") ? ["coding", "tool-calling"]
            : a.includes("fast") ? ["fast", "cheap"]
            : ["research"],
          costTier: 1,
          latencyClass: a.includes("fast") ? "fast" : "medium",
        }),
      ),
    ];
  }

  /** Load catalog from raidan config JSON {models:[...]} if present, else defaults. */
  static fromConfigFile(path: string | undefined): ModelRouter {
    if (!path || !existsSync(path)) return new ModelRouter(ModelRouter.defaultCatalog());
    try {
      const cfg = JSON.parse(readFileSync(path, "utf8")) as { models?: ModelEntry[] };
      if (Array.isArray(cfg.models) && cfg.models.length) return new ModelRouter(cfg.models);
    } catch { /* fall through */ }
    return new ModelRouter(ModelRouter.defaultCatalog());
  }

  route(need: RouteNeed = {}): RoutedChain {
    const ranked = this.catalog
      .map((m) => ({ m, score: this.score(m, need) }))
      .sort((a, b) => b.score - a.score);
    if (!ranked.length) throw new Error("empty catalog");
    // primary/secondary MUST satisfy every requirement;
    // fallback/emergency are best-effort last resorts drawn from the full catalog.
    const matching = ranked.filter((s) => this.meets(s.m, need));
    const primary = matching[0] ?? ranked[0];
    const secondary = matching[1];
    const usedIds = new Set([primary.m.id, ...(secondary ? [secondary.m.id] : [])]);
    const pool = ranked.filter((s) => !usedIds.has(s.m.id));
    return {
      primary: primary.m,
      secondary: secondary?.m,
      fallback: pool[0]?.m,
      emergency: pool[pool.length - 1]?.m,
      rationale:
        `needs=[${(need.requires ?? []).join(",")}] prefer=${need.prefer ?? "balanced"}; top=${primary.score.toFixed(1)}` +
        (matching.length === 0 ? "; WARNING no model meets all needs — degraded chain" : ""),
    };
  }

  private meets(m: ModelEntry, need: RouteNeed): boolean {
    return (need.requires ?? []).every((r) => m.capabilities.includes(r));
  }

  private score(m: ModelEntry, need: RouteNeed): number {
    let s = 0;
    for (const req of need.requires ?? []) {
      if (!m.capabilities.includes(req)) return Number.NEGATIVE_INFINITY; // hard filter
      s += 10;
    }
    s -= m.costTier * (need.prefer === "cost" ? 4 : 1.5);
    if (need.prefer === "latency" && m.latencyClass === "fast") s += 5;
    if (need.prefer === "quality") s += m.capabilities.length * 0.5;
    if (need.requires?.includes("fast") && m.latencyClass === "fast") s += 3;
    return s;
  }
}
