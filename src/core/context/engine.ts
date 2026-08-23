import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { EventBus } from "../events/bus.js";

export type ContextLayer =
  | "system"
  | "organization"
  | "project"
  | "team"
  | "agent"
  | "task"
  | "runtime"
  | "external-docs";

export const CONTEXT_LAYERS: readonly ContextLayer[] = [
  "system",
  "organization",
  "project",
  "team",
  "agent",
  "task",
  "runtime",
  "external-docs",
];

export interface ContextEntry {
  id: string;
  layer: ContextLayer;
  title: string;
  content: string;
  priority: number;
  tags: string[];
  updatedAt: string;
}

export interface AssembleNeed {
  keywords?: string[];
  layers?: ContextLayer[];
  budgetTokens?: number;
}

export interface AssembleResult {
  included: ContextEntry[];
  deferred: ContextEntry[];
  tokensUsed: number;
  budgetTokens: number;
}

const LAYER_WEIGHT: Record<ContextLayer, number> = {
  system: 2,
  task: 1.5,
  agent: 1,
  project: 1,
  team: 0.5,
  organization: 0.5,
  runtime: 0.5,
  "external-docs": 0.5,
};

const DEFAULT_BUDGET_TOKENS = 4000;
const HALF_LIFE_DAYS = 30;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

let seq = 0;

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function overlap(keywords: string[], words: Set<string>): number {
  if (!keywords.length) return 0;
  let hit = 0;
  for (const k of keywords) if (words.has(k.toLowerCase())) hit++;
  return hit / keywords.length;
}

export class ContextEngine {
  constructor(private storePath: string, private bus?: EventBus, private maxEntries = 500) {
    mkdirSync(dirname(storePath), { recursive: true });
    if (!existsSync(storePath)) writeFileSync(storePath, JSON.stringify([]));
  }

  private loadAll(): ContextEntry[] {
    return JSON.parse(readFileSync(this.storePath, "utf8")) as ContextEntry[];
  }

  private saveAll(entries: ContextEntry[]): void {
    const tmp = `${this.storePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(entries, null, 2));
    renameSync(tmp, this.storePath);
  }

  upsert(
    entry: Pick<ContextEntry, "layer" | "title" | "content"> &
      Partial<Pick<ContextEntry, "id" | "priority" | "tags">>,
  ): ContextEntry {
    const all = this.loadAll();
    const now = new Date().toISOString();
    const existing = entry.id ? all.find((e) => e.id === entry.id) : undefined;
    if (existing) {
      existing.layer = entry.layer;
      existing.title = entry.title;
      existing.content = entry.content;
      existing.priority = entry.priority ?? existing.priority;
      existing.tags = entry.tags ?? existing.tags;
      existing.updatedAt = now;
      this.saveAll(all);
      return existing;
    }
    if (all.length >= this.maxEntries)
      throw new Error(`context store full (${this.maxEntries}); prune entries before adding`);
    const e: ContextEntry = {
      id: entry.id ?? `C-${Date.now().toString(36)}-${(seq++).toString(36)}`,
      layer: entry.layer,
      title: entry.title,
      content: entry.content,
      priority: clampPriority(entry.priority ?? 5),
      tags: entry.tags ?? [],
      updatedAt: now,
    };
    all.push(e);
    this.saveAll(all);
    return e;
  }

  remove(id: string): boolean {
    const all = this.loadAll();
    const next = all.filter((e) => e.id !== id);
    if (next.length === all.length) return false;
    this.saveAll(next);
    return true;
  }

  list(layer?: ContextLayer): ContextEntry[] {
    const all = this.loadAll();
    return layer ? all.filter((e) => e.layer === layer) : all;
  }

  get(id: string): ContextEntry | undefined {
    return this.loadAll().find((e) => e.id === id);
  }

  score(entry: ContextEntry, keywords: string[]): number {
    const ageDays =
      (Date.now() - new Date(entry.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recency = 2 * Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    return (
      overlap(keywords, new Set([...normalize(entry.title), ...normalize(entry.content), ...entry.tags.map((t) => t.toLowerCase())])) *
        5 +
      entry.priority +
      LAYER_WEIGHT[entry.layer] +
      recency
    );
  }

  assemble(need: AssembleNeed = {}): AssembleResult {
    const budgetTokens = need.budgetTokens ?? DEFAULT_BUDGET_TOKENS;
    const keywords = need.keywords ?? [];
    let candidates = this.list();
    if (need.layers?.length) candidates = candidates.filter((e) => need.layers!.includes(e.layer));
    const ranked = [...candidates].sort((a, b) => this.score(b, keywords) - this.score(a, keywords));
    const included: ContextEntry[] = [];
    const deferred: ContextEntry[] = [];
    let used = 0;
    for (const e of ranked) {
      const t = estimateTokens(e.content);
      if (used + t <= budgetTokens) {
        included.push(e);
        used += t;
      } else deferred.push(e);
    }
    this.bus?.emit("context.loaded", { included: included.length, tokensUsed: used });
    return { included, deferred, tokensUsed: used, budgetTokens };
  }
}

function clampPriority(p: number): number {
  return Math.max(0, Math.min(10, p));
}
