import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export type RaidanEventName =
  | "agent.created"
  | "agent.started"
  | "agent.stopped"
  | "agent.restarted"
  | "agent.failed"
  | "agent.completed"
  | "task.created"
  | "task.assigned"
  | "task.started"
  | "task.waiting"
  | "task.reviewed"
  | "task.completed"
  | "task.failed"
  | "tool.started"
  | "tool.completed"
  | "tool.failed"
  | "model.failed"
  | "model.switched"
  | "approval.requested"
  | "approval.approved"
  | "approval.rejected"
  | "context.loaded"
  | "context.compacted"
  | "run.started"
  | "run.completed"
  | "run.failed";

export interface RaidanEvent<T = unknown> {
  id: string;
  name: RaidanEventName;
  ts: string;
  runId?: string;
  taskId?: string;
  agentId?: string;
  data?: T;
}

type Handler = (e: RaidanEvent) => void;

let counter = 0;

export class EventBus {
  private handlers = new Map<RaidanEventName | "*", Set<Handler>>();
  constructor(private ledgerPath?: string) {
    if (ledgerPath) {
      mkdirSync(dirname(ledgerPath), { recursive: true });
      if (!existsSync(ledgerPath)) appendFileSync(ledgerPath, "");
    }
  }

  on(name: RaidanEventName | "*", fn: Handler): () => void {
    const set = this.handlers.get(name) ?? new Set<Handler>();
    set.add(fn);
    this.handlers.set(name, set);
    return () => set.delete(fn);
  }

  emit(
    name: RaidanEventName,
    data?: unknown,
    refs: Partial<Pick<RaidanEvent, "runId" | "taskId" | "agentId">> = {},
  ): RaidanEvent {
    const e: RaidanEvent = {
      id: `${Date.now().toString(36)}-${(counter++).toString(36)}`,
      name,
      ts: new Date().toISOString(),
      ...refs,
      data,
    };
    if (this.ledgerPath)
      appendFileSync(this.ledgerPath, JSON.stringify(e) + "\n", "utf8");
    for (const fn of this.handlers.get(name) ?? []) fn(e);
    for (const fn of this.handlers.get("*") ?? []) fn(e);
    return e;
  }

  static defaultLedger(stateDir: string): string {
    return join(stateDir, "events.jsonl");
  }
}