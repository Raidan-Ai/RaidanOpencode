/**
 * RaidanOpencode — Workflow Engine & Compiler
 *
 * Implements ARCHITECTURE.md §20–§21:
 *  - §20: built-in reusable workflow library (stages, roles, capabilities,
 *    approval gates).
 *  - §21: Workflow Compiler — High-Level Objective → Workflow Graph (DAG).
 *
 * HONEST HEURISTIC NOTE: objective→template selection is keyword-based and
 * deterministic. It is a routing seed, not intelligence; callers may always
 * pass an explicit workflowId to bypass it.
 */

// ---------------------------------------------------------------------------
// Definitions (§20)
// ---------------------------------------------------------------------------

export interface WorkflowStage {
  id: string;
  name: string;
  /** Role name (role ≠ implementation — ARCHITECTURE.md §13.2). */
  role: string;
  /** Capability ids this stage requires (routed via CapabilityRegistry). */
  capabilities?: string[];
  /** Human approval gate after this stage completes. */
  approvalGate?: boolean;
  /**
   * Stages sharing a parallelGroup run concurrently after the previous
   * sequential barrier. Absent = strictly sequential.
   */
  parallelGroup?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
}

/** Registry of workflow definitions — one canonical store. */
export class WorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();

  register(def: WorkflowDefinition): WorkflowDefinition {
    if (!def.id) throw new Error("workflow.id is required");
    if (!def.stages?.length)
      throw new Error(`workflow ${def.id}: at least one stage is required`);
    const ids = new Set<string>();
    for (const s of def.stages) {
      if (!s.id || !s.role) throw new Error(`workflow ${def.id}: stage id and role are required`);
      if (ids.has(s.id)) throw new Error(`workflow ${def.id}: duplicate stage id "${s.id}"`);
      ids.add(s.id);
    }
    const stored = { ...def, stages: def.stages.map((s) => ({ ...s })) };
    this.workflows.set(def.id, stored);
    return stored;
  }

  get(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  list(): WorkflowDefinition[] {
    return [...this.workflows.values()];
  }
}

/**
 * The nine built-in workflows from ARCHITECTURE.md §20.
 * Returned fresh each call so callers can mutate registrations safely.
 */
export function builtinWorkflows(): WorkflowDefinition[] {
  const review = (capabilities: string[] = ["code-review"]): Partial<WorkflowStage> => ({
    role: "reviewer",
    capabilities,
  });

  return [
    {
      id: "feature-development",
      name: "Feature Development",
      description: "Plan → implement → test → review → deliver",
      stages: [
        { id: "plan", name: "Plan", role: "planner", capabilities: ["planning"] },
        { id: "implement", name: "Implement", role: "implementer", capabilities: ["coding"] },
        { id: "test", name: "Test", role: "tester", capabilities: ["testing"] },
        { id: "review", name: "Review", ...review() },
      ],
    },
    {
      id: "bug-fix",
      name: "Bug Fix",
      description: "Reproduce → diagnose → fix → verify regression test",
      stages: [
        { id: "reproduce", name: "Reproduce", role: "debugger", capabilities: ["debugging"] },
        { id: "diagnose", name: "Diagnose root cause", role: "debugger" },
        { id: "fix", name: "Fix", role: "implementer", capabilities: ["coding"] },
        { id: "verify", name: "Verify + regression test", role: "tester", capabilities: ["testing"] },
        { id: "review", name: "Review", ...review() },
      ],
    },
    {
      id: "security-review",
      name: "Security Review",
      description: "Threat-model scan → findings → remediation plan",
      stages: [
        { id: "scan", name: "Scan", role: "security-auditor", capabilities: ["security-scan"] },
        { id: "triage", name: "Triage findings", role: "security-auditor" },
        { id: "remediate-plan", name: "Remediation plan", role: "security-auditor" },
        { id: "approve", name: "Approve remediation", ...review(["security-review"]), approvalGate: true },
      ],
    },
    {
      id: "research",
      name: "Research",
      description: "Question → sources → synthesis → citations",
      stages: [
        { id: "scope", name: "Scope the question", role: "researcher", capabilities: ["research"] },
        { id: "gather", name: "Gather sources", role: "researcher" },
        { id: "synthesize", name: "Synthesize", role: "researcher" },
        { id: "cite-check", name: "Citation check", role: "reviewer" },
      ],
    },
    {
      id: "refactor",
      name: "Refactor",
      description: "Baseline tests → refactor → behavior parity check",
      stages: [
        { id: "baseline", name: "Baseline tests green", role: "tester", capabilities: ["testing"] },
        { id: "refactor", name: "Refactor", role: "implementer", capabilities: ["coding"] },
        { id: "parity", name: "Behavior parity check", role: "tester" },
        { id: "review", name: "Review", ...review() },
      ],
    },
    {
      id: "release",
      name: "Release",
      description: "Changelog → version → build → approval → publish",
      stages: [
        { id: "changelog", name: "Changelog", role: "documenter", capabilities: ["documentation"] },
        { id: "version", name: "Version bump", role: "release-manager" },
        { id: "build", name: "Build + verify artifacts", role: "release-manager" },
        { id: "approve", name: "Release approval", role: "human", approvalGate: true },
        { id: "publish", name: "Publish", role: "release-manager", capabilities: ["deployment"] },
      ],
    },
    {
      id: "incident-response",
      name: "Incident Response",
      description: "Mitigate → diagnose → fix → postmortem",
      stages: [
        { id: "mitigate", name: "Mitigate impact", role: "operator" },
        { id: "diagnose", name: "Diagnose", role: "debugger" },
        { id: "fix", name: "Permanent fix", role: "implementer", capabilities: ["coding"] },
        { id: "postmortem", name: "Postmortem", role: "documenter" },
      ],
    },
    {
      id: "documentation",
      name: "Documentation",
      description: "Outline → draft → technical review → publish",
      stages: [
        { id: "outline", name: "Outline", role: "documenter", capabilities: ["documentation"] },
        { id: "draft", name: "Draft", role: "documenter" },
        { id: "tech-review", name: "Technical review", ...review() },
      ],
    },
    {
      id: "migration",
      name: "Migration",
      description: "Backup → migrate → validate → rollback-ready",
      stages: [
        { id: "backup", name: "Backup", role: "operator" },
        { id: "migrate", name: "Migrate", role: "implementer", capabilities: ["migration"] },
        { id: "validate", name: "Validate", role: "tester" },
        { id: "approve", name: "Cutover approval", role: "human", approvalGate: true },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Compiler (§21): objective → DAG
// ---------------------------------------------------------------------------

export interface CompiledNode {
  id: string;
  name: string;
  role: string;
  dependsOn: string[];
  approvalGate: boolean;
  parallelGroup?: string;
}

export interface CompiledWorkflow {
  workflowId: string;
  matchedBy: "explicit" | "keyword";
  nodes: CompiledNode[];
  /** Topological waves — each wave runs in parallel after the previous one. */
  waves: string[][];
}

/** Deterministic keyword → workflow seed table. */
const KEYWORD_SEEDS: Array<{ workflowId: string; words: string[] }> = [
  { workflowId: "security-review", words: ["security", "vulnerability", "cve", "audit", "injection"] },
  { workflowId: "bug-fix", words: ["bug", "fix", "error", "crash", "regression", "failing"] },
  { workflowId: "incident-response", words: ["incident", "outage", "hotfix", "production-down"] },
  { workflowId: "refactor", words: ["refactor", "restructure", "cleanup", "decouple"] },
  { workflowId: "release", words: ["release", "publish", "ship", "tag"] },
  { workflowId: "migration", words: ["migrate", "migration", "upgrade", "port"] },
  { workflowId: "documentation", words: ["document", "docs", "readme", "guide"] },
  { workflowId: "research", words: ["research", "investigate", "compare", "evaluate-options"] },
];

const DEFAULT_WORKFLOW_ID = "feature-development";

export class WorkflowCompiler {
  constructor(private registry: WorkflowRegistry) {}

  /**
   * Compile an objective into a DAG. Explicit workflowId wins; otherwise the
   * first keyword seed that matches (case-insensitive substring) selects the
   * template; otherwise feature-development.
   */
  compile(objective: string, opts: { workflowId?: string } = {}): CompiledWorkflow {
    let workflowId = opts.workflowId;
    let matchedBy: CompiledWorkflow["matchedBy"] = "explicit";

    if (!workflowId) {
      matchedBy = "keyword";
      const text = objective.toLowerCase();
      workflowId =
        KEYWORD_SEEDS.find((seed) => seed.words.some((w) => text.includes(w)))
          ?.workflowId ?? DEFAULT_WORKFLOW_ID;
    }

    const def = this.registry.get(workflowId);
    if (!def) throw new Error(`unknown workflow: ${workflowId}`);

    // Build dependency edges honoring parallelGroups.
    const nodes: CompiledNode[] = [];
    const lastBeforeGroup = new Map<string, string>();
    let prevId: string | undefined;

    for (const stage of def.stages) {
      const dependsOn: string[] = [];
      if (stage.parallelGroup && prevId && prevId === lastBeforeGroup.get(stage.parallelGroup)) {
        // First member of a group hangs off the prior sequential node.
        if (prevId) dependsOn.push(prevId);
      } else if (stage.parallelGroup && lastBeforeGroup.has(stage.parallelGroup)) {
        // Subsequent members also hang off the same barrier — parallel peers.
        const barrier = lastBeforeGroup.get(stage.parallelGroup)!;
        if (barrier) dependsOn.push(barrier);
      } else if (prevId) {
        dependsOn.push(prevId);
      }

      if (stage.parallelGroup && !lastBeforeGroup.has(stage.parallelGroup)) {
        lastBeforeGroup.set(stage.parallelGroup, prevId ?? "");
      }

      nodes.push({
        id: stage.id,
        name: stage.name,
        role: stage.role,
        dependsOn,
        approvalGate: stage.approvalGate ?? false,
        parallelGroup: stage.parallelGroup,
      });
      prevId = stage.id;
    }

    return {
      workflowId,
      matchedBy,
      nodes,
      waves: computeWaves(nodes),
    };
  }
}

/** Longest-path leveling: wave index = 1 + max(wave of dependencies). */
function computeWaves(nodes: CompiledNode[]): string[][] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depth = new Map<string, number>();

  const levelOf = (id: string, seen = new Set<string>()): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (seen.has(id)) return 0; // cycle guard (registry forbids dupes; be safe)
    seen.add(id);
    const node = byId.get(id);
    const d =
      !node || node.dependsOn.length === 0
        ? 0
        : 1 + Math.max(...node.dependsOn.map((dep) => levelOf(dep, seen)));
    depth.set(id, d);
    return d;
  };

  for (const n of nodes) levelOf(n.id);

  const waves: string[][] = [];
  for (const n of nodes) {
    const d = depth.get(n.id)!;
    (waves[d] ??= []).push(n.id);
  }
  return waves.filter(Boolean).map((w) => w.sort());
}
