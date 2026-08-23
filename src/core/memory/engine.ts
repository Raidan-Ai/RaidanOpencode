import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { EventBus } from "../events/bus.js";

export type MemoryType =
  | "working"
  | "episodic"
  | "semantic"
  | "procedural"
  | "project"
  | "agent"
  | "team";

export const MEMORY_TYPES: readonly MemoryType[] = [
  "working",
  "episodic",
  "semantic",
  "procedural",
  "project",
  "agent",
  "team",
];

export interface MemoryItem {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;
  tags: string[];
  provenance: { agentId?: string; taskId?: string; source?: string };
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessAt?: string;
}

export interface WriteGateOptions {
  force?: boolean;
  minLongTermImportance?: number;
  maxPerType?: number;
}

export interface MemoryWriteResult {
  item: MemoryItem;
  updated: boolean;
  evicted?: MemoryItem;
  gateApplied?: string;
}

const LONG_TERM_TYPES: ReadonlySet<MemoryType> = new Set(["semantic", "procedural", "project"]);
const DEFAULT_MIN_LONG_TERM_IMPORTANCE = 0.3;
const DEFAULT_MAX_PER_TYPE = 1000;
const HALF_LIFE_DAYS = 30;

let seq = 0;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export class MemoryEngine {
  constructor(private storePath: string, private bus?: EventBus) {
    mkdirSync(dirname(storePath), { recursive: true });
    if (!existsSync(storePath)) writeFileSync(storePath, JSON.stringify([]));
  }

  private loadAll(): MemoryItem[] {
    return JSON.parse(readFileSync(this.storePath, "utf8")) as MemoryItem[];
  }

  private saveAll(items: MemoryItem[]): void {
    const tmp = `${this.storePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(items, null, 2));
    renameSync(tmp, this.storePath);
  }

  write(
    input: Pick<MemoryItem, "type" | "content"> &
      Partial<Pick<MemoryItem, "importance" | "tags" | "provenance">>,
    gates: WriteGateOptions = {},
  ): MemoryWriteResult {
    const all = this.loadAll();
    const now = new Date().toISOString();
    const importance = clamp01(input.importance ?? 0.5);
    const minLong = gates.minLongTermImportance ?? DEFAULT_MIN_LONG_TERM_IMPORTANCE;

    if (!gates.force && LONG_TERM_TYPES.has(input.type) && importance < minLong)
      throw new Error(
        `write-gate: ${input.type} memory requires importance >= ${minLong} (got ${importance.toFixed(2)}); pass force to override`,
      );

    const norm = tokenize(input.content).join(" ");
    const existing = all.find((m) => m.type === input.type && tokenize(m.content).join(" ") === norm);
    if (existing && !gates.force) {
      existing.importance = Math.max(existing.importance, importance);
      existing.updatedAt = now;
      this.saveAll(all);
      return { item: existing, updated: true, gateApplied: "dedup" };
    }

    const maxPerType = gates.maxPerType ?? DEFAULT_MAX_PER_TYPE;
    let evicted: MemoryItem | undefined;
    if (all.filter((m) => m.type === input.type).length >= maxPerType) {
      const victim = all
        .filter((m) => m.type === input.type)
        .sort((a, b) => this.vitality(a) - this.vitality(b))[0];
      if (victim) {
        evicted = victim;
        this.saveAll(all.filter((m) => m.id !== victim.id));
        this.bus?.emit("context.compacted", { evictedId: victim.id, memoryType: victim.type });
      }
    }

    const items = evicted ? this.loadAll() : all;
    const item: MemoryItem = {
      id: `M-${Date.now().toString(36)}-${(seq++).toString(36)}`,
      type: input.type,
      content: input.content,
      importance,
      tags: input.tags ?? [],
      provenance: input.provenance ?? {},
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
    };
    items.push(item);
    this.saveAll(items);
    this.bus?.emit("run.completed", { memoryId: item.id, kind: "memory.write" }, { agentId: input.provenance?.agentId, taskId: input.provenance?.taskId });
    return { item, updated: false, evicted, gateApplied: evicted ? "capacity-evict" : undefined };
  }

  search(query: string, opts: { type?: MemoryType; limit?: number } = {}): MemoryItem[] {
    const qWords = new Set(tokenize(query));
    const all = this.loadAll();
    const ranked = all
      .filter((m) => !opts.type || m.type === opts.type)
      .map((m) => ({ m, score: this.retrievalScore(m, qWords) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, opts.limit ?? 10);
    if (ranked.length) {
      const now = new Date().toISOString();
      for (const { m } of ranked) {
        m.accessCount += 1;
        m.lastAccessAt = now;
      }
      this.saveAll(all);
    }
    return ranked.map((r) => r.m);
  }

  retrievalScore(m: MemoryItem, queryWords: Set<string>): number {
    const words = new Set([...tokenize(m.content), ...m.tags.map((t) => t.toLowerCase())]);
    let hits = 0;
    for (const w of queryWords) if (words.has(w)) hits++;
    const keywordScore = queryWords.size ? hits / queryWords.size : 0;
    const ageDays = (Date.now() - new Date(m.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recency = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    return 0.5 * keywordScore + 0.3 * recency + 0.2 * m.importance;
  }

  private vitality(m: MemoryItem): number {
    const ageDays = (Date.now() - new Date(m.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return m.importance * Math.pow(0.5, ageDays / HALF_LIFE_DAYS) + m.accessCount * 0.01;
  }

  touch(id: string): void {
    const all = this.loadAll();
    const m = all.find((x) => x.id === id);
    if (!m) return;
    m.accessCount += 1;
    m.lastAccessAt = new Date().toISOString();
    this.saveAll(all);
  }

  list(type?: MemoryType): MemoryItem[] {
    const all = this.loadAll();
    return type ? all.filter((m) => m.type === type) : all;
  }

  get(id: string): MemoryItem | undefined {
    return this.loadAll().find((m) => m.id === id);
  }

  forget(id: string): boolean {
    const all = this.loadAll();
    const next = all.filter((m) => m.id !== id);
    if (next.length === all.length) return false;
    this.saveAll(next);
    return true;
  }
}
