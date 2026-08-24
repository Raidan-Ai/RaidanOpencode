import { existsSync, readFileSync } from "node:fs";
import type { RaidanEvent, RaidanEventName } from "../events/bus.js";

export interface LedgerFilter {
  name?: RaidanEventName | string;
  taskId?: string;
  agentId?: string;
  since?: string;
  limit?: number;
}

export interface LedgerSummary {
  total: number;
  byName: Record<string, number>;
  firstTs?: string;
  lastTs?: string;
}

function parseLedger(ledgerPath: string): RaidanEvent[] {
  if (!existsSync(ledgerPath)) return [];
  const out: RaidanEvent[] = [];
  for (const line of readFileSync(ledgerPath, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line) as RaidanEvent;
      if (e && typeof e.id === "string" && typeof e.name === "string") out.push(e);
    } catch {
      /* corrupt trailing lines are skipped, never fatal */
    }
  }
  return out;
}

export class LedgerQuery {
  constructor(private ledgerPath: string) {}

  all(filter: LedgerFilter = {}): RaidanEvent[] {
    let rows = parseLedger(this.ledgerPath);
    if (filter.name) rows = rows.filter((e) => e.name === filter.name);
    if (filter.taskId) rows = rows.filter((e) => e.taskId === filter.taskId);
    if (filter.agentId) rows = rows.filter((e) => e.agentId === filter.agentId);
    if (filter.since) rows = rows.filter((e) => e.ts >= filter.since!);
    return filter.limit ? rows.slice(-filter.limit) : rows;
  }

  trace(taskId: string): RaidanEvent[] {
    const direct = this.all({ taskId });
    const seen = new Set(direct.map((e) => e.id));
    const related = parseLedger(this.ledgerPath).filter((e) => {
      if (seen.has(e.id)) return false;
      const dataTaskId =
        e.data && typeof e.data === "object" && "taskId" in (e.data as Record<string, unknown>)
          ? String((e.data as Record<string, unknown>).taskId)
          : undefined;
      return dataTaskId === taskId;
    });
    return [...direct, ...related].sort((a, b) => a.ts.localeCompare(b.ts));
  }

  summary(): LedgerSummary {
    const rows = parseLedger(this.ledgerPath);
    const byName: Record<string, number> = {};
    for (const e of rows) byName[e.name] = (byName[e.name] ?? 0) + 1;
    return {
      total: rows.length,
      byName,
      firstTs: rows[0]?.ts,
      lastTs: rows[rows.length - 1]?.ts,
    };
  }
}
