import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { EventBus } from "../events/bus.js";

export type TaskState =
  | "CREATED"
  | "PLANNED"
  | "ASSIGNED"
  | "RUNNING"
  | "WAITING"
  | "REVIEW"
  | "APPROVAL"
  | "COMPLETED";

export type TaskFailureAction = "RETRY" | "RECOVER" | "REASSIGN" | "ESCALATE";

export interface RaidanTask {
  id: string;
  title: string;
  state: TaskState;
  priority?: "low" | "medium" | "high" | "critical";
  assigneeAgentId?: string;
  parentTaskId?: string;
  dependsOn: string[];
  complexity: "L0" | "L1" | "L2" | "L3" | "L4";
  attempts: number;
  failureAction?: TaskFailureAction;
  result?: unknown;
  createdAt: string;
  updatedAt: string;
}

const TRANSITIONS: Record<TaskState, TaskState[]> = {
  CREATED: ["PLANNED", "ASSIGNED"],
  PLANNED: ["ASSIGNED"],
  ASSIGNED: ["RUNNING"],
  RUNNING: ["WAITING", "REVIEW", "APPROVAL", "COMPLETED"],
  WAITING: ["RUNNING"],
  REVIEW: ["APPROVAL", "RUNNING"],
  APPROVAL: ["COMPLETED", "RUNNING"],
  COMPLETED: [],
};

let seq = 0;

export class TaskEngine {
  constructor(private storePath: string, private bus?: EventBus) {
    mkdirSync(dirname(storePath), { recursive: true });
    if (!existsSync(storePath)) writeFileSync(storePath, JSON.stringify([]));
  }

  private loadAll(): RaidanTask[] {
    return JSON.parse(readFileSync(this.storePath, "utf8")) as RaidanTask[];
  }

  private saveAll(tasks: RaidanTask[]): void {
    const tmp = `${this.storePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(tasks, null, 2));
    renameSync(tmp, this.storePath);
  }

  create(title: string, opts: Partial<Pick<RaidanTask, "priority" | "complexity" | "parentTaskId" | "dependsOn">> = {}): RaidanTask {
    const t: RaidanTask = {
      id: `T-${Date.now().toString(36)}-${(seq++).toString(36)}`,
      title,
      state: "CREATED",
      priority: opts.priority ?? "medium",
      parentTaskId: opts.parentTaskId,
      dependsOn: opts.dependsOn ?? [],
      complexity: opts.complexity ?? "L1",
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = this.loadAll();
    all.push(t);
    this.saveAll(all);
    this.bus?.emit("task.created", { title }, { taskId: t.id });
    return t;
  }

  private assertCanTransition(all: RaidanTask[], t: RaidanTask, next: TaskState): void {
    if (!TRANSITIONS[t.state].includes(next))
      throw new Error(`illegal transition ${t.state} -> ${next} for ${t.id}`);
    for (const dep of t.dependsOn) {
      const d = all.find((x) => x.id === dep);
      if (d && d.state !== "COMPLETED")
        throw new Error(`dependency ${dep} not COMPLETED (${d.state})`);
    }
  }

  transition(id: string, next: TaskState): RaidanTask {
    const all = this.loadAll();
    const t = all.find((x) => x.id === id);
    if (!t) throw new Error(`task not found: ${id}`);
    this.assertCanTransition(all, t, next);
    t.state = next;
    t.updatedAt = new Date().toISOString();
    if (next === "RUNNING") { t.attempts += 1; this.bus?.emit("task.started", null, { taskId: id }); }
    if (next === "WAITING") this.bus?.emit("task.waiting", null, { taskId: id });
    if (next === "COMPLETED") this.bus?.emit("task.completed", null, { taskId: id });
    this.saveAll(all);
    return t;
  }

  assign(id: string, agentId: string): RaidanTask {
    const all = this.loadAll();
    const t = all.find((x) => x.id === id);
    if (!t) throw new Error(`task not found: ${id}`);
    this.assertCanTransition(all, t, "ASSIGNED");
    t.assigneeAgentId = agentId;
    t.state = "ASSIGNED";
    t.updatedAt = new Date().toISOString();
    this.bus?.emit("task.assigned", { agentId }, { taskId: id });
    this.saveAll(all);
    return t;
  }

  fail(id: string, action: TaskFailureAction): RaidanTask {
    const all = this.loadAll();
    const t = all.find((x) => x.id === id);
    if (!t) throw new Error(`task not found: ${id}`);
    t.failureAction = action;
    t.updatedAt = new Date().toISOString();
    this.bus?.emit("task.failed", { action }, { taskId: id });
    this.saveAll(all);
    return t;
  }

  list(state?: TaskState): RaidanTask[] {
    const all = this.loadAll();
    return state ? all.filter((t) => t.state === state) : all;
  }

  get(id: string): RaidanTask | undefined {
    return this.loadAll().find((t) => t.id === id);
  }
}
