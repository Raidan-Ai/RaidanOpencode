import type { TaskEngine, RaidanTask } from "../tasks/engine.js";
import type { AgentContract } from "../agents/registry.js";
import type { EventBus } from "../events/bus.js";

export type Complexity = "L0" | "L1" | "L2" | "L3" | "L4";

export interface ComplexitySignal {
  label: string;
  pattern: RegExp;
  points: number;
}

export const COMPLEXITY_SIGNALS: readonly ComplexitySignal[] = [
  { label: "system-level scope", pattern: /\b(whole codebase|end[- ]to[- ]end project|multi[- ]repo|monorepo|(platform |full |complete )?rewrite from scratch)\b/i, points: 6 },
  { label: "large migration/rewrite", pattern: /\b(migrat(e|ing|ion)|rewrite)\b[^.]*\b(entire|whole|everything|all of it)\b/i, points: 6 },
  { label: "architecture/refactor", pattern: /\b(architect(ure)?|refactor|redesign|restructure)\b/i, points: 4 },
  { label: "multi-file feature", pattern: /\b(feature|module|api endpoint|component|integrat(e|ion)|(several|multiple) files?)\b/i, points: 2 },
  { label: "small change", pattern: /\b(add|fix|update|implement|create|change|extend)\b/i, points: 0 },
  { label: "trivial edit", pattern: /\b(typo|whitespace|comment only|rename a variable)\b/i, points: -2 },
];

export interface Classification {
  level: Complexity;
  score: number;
  signals: string[];
  explicit?: boolean;
}

export interface ExecutionPlan {
  mode: string;
  steps: string[];
  maxParallelAgents: number;
  approvalRequired: boolean;
  rationale: string;
}

const ROUTES: Record<Complexity, ExecutionPlan> = {
  L0: {
    mode: "direct",
    steps: ["execute"],
    maxParallelAgents: 1,
    approvalRequired: false,
    rationale: "trivial edit goes straight to one agent",
  },
  L1: {
    mode: "plan-execute",
    steps: ["plan", "execute"],
    maxParallelAgents: 1,
    approvalRequired: false,
    rationale: "simple task gets planner + single executor",
  },
  L2: {
    mode: "plan-specialists",
    steps: ["plan", "delegate", "review"],
    maxParallelAgents: 3,
    approvalRequired: false,
    rationale: "medium task parallelizes across up to 3 specialists with review",
  },
  L3: {
    mode: "architecture-team",
    steps: ["research", "architecture", "plan", "delegate", "review", "approve"],
    maxParallelAgents: 8,
    approvalRequired: true,
    rationale: "complex work needs architecture pass and a coordinated team",
  },
  L4: {
    mode: "full-orchestration",
    steps: ["research", "architecture", "checkpoint-approve", "plan", "delegate", "review", "approve"],
    maxParallelAgents: 8,
    approvalRequired: true,
    rationale: "system-level scope requires full orchestration with human checkpoints",
  },
};

export function classify(goal: string): Classification {
  const explicit = /^\s*\[?(L[0-4])\]?\b/.exec(goal);
  if (explicit) return { level: explicit[1] as Complexity, score: 0, signals: ["explicit override"], explicit: true };
  let score = 0;
  const signals: string[] = [];
  for (const s of COMPLEXITY_SIGNALS) {
    if (s.pattern.test(goal)) {
      score += s.points;
      signals.push(`${s.label} (${s.points >= 0 ? "+" : ""}${s.points})`);
    }
  }
  let level: Complexity;
  if (score < 0) level = "L0";
  else if (score <= 1) level = "L1";
  else if (score <= 3) level = "L2";
  else if (score <= 5) level = "L3";
  else level = "L4";
  return { level, score, signals };
}

export function routeFor(level: Complexity): ExecutionPlan {
  return ROUTES[level];
}

export function selectAgents(
  candidates: AgentContract[],
  requiredCapabilities: string[],
  limit = 5,
): Array<{ agent: AgentContract; matchScore: number }> {
  if (!requiredCapabilities.length) return candidates.slice(0, limit).map((agent) => ({ agent, matchScore: 0 }));
  const need = new Set(requiredCapabilities.map((c) => c.toLowerCase()));
  return candidates
    .map((agent) => {
      const caps = agent.capabilities.map((c) => c.toLowerCase());
      let hits = 0;
      for (const c of caps) if (need.has(c)) hits++;
      return { agent, matchScore: hits };
    })
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || a.agent.capabilities.length - b.agent.capabilities.length)
    .slice(0, limit);
}

export interface PlanResult {
  goal: string;
  taskId: string;
  taskState: RaidanTask["state"];
  classification: Classification;
  plan: ExecutionPlan;
  suggestedAgents?: Array<{ id: string; matchScore: number }>;
}

export class Orchestrator {
  constructor(
    private tasks: TaskEngine,
    private bus?: EventBus,
    private agentsProvider?: () => AgentContract[],
  ) {}

  plan(goal: string, opts: { capabilities?: string[] } = {}): PlanResult {
    const classification = classify(goal);
    const plan = routeFor(classification.level);
    const task = this.tasks.create(goal, { complexity: classification.level });
    this.bus?.emit("run.started", { mode: plan.mode }, { taskId: task.id });
    const result: PlanResult = { goal, taskId: task.id, taskState: task.state, classification, plan };
    if (opts.capabilities?.length && this.agentsProvider) {
      result.suggestedAgents = selectAgents(this.agentsProvider(), opts.capabilities).map((r) => ({
        id: r.agent.id,
        matchScore: r.matchScore,
      }));
    }
    return result;
  }

  assign(taskId: string, agentId: string): RaidanTask {
    return this.tasks.assign(taskId, agentId);
  }
}
