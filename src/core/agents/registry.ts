import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface AgentContract {
  id: string;
  name?: string;
  description?: string;
  role?: string;
  capabilities: string[];
  skills: string[];
  tools: string[];
  models: { primary?: string; fallback?: string; emergency?: string };
  autonomy: "manual" | "supervised" | "balanced" | "autonomous";
  permissions: Record<string, unknown>;
  sourcePath: string;
}

export type AgentIssue =
  | { kind: "missing-contract-field"; field: keyof AgentContract | string }
  | { kind: "no-model-chain" };

/** Minimal frontmatter parser (key: value / key: [a, b] lines) — no YAML dep needed. */
function parseFrontmatter(raw: string): Record<string, unknown> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) return {};
  const out: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, k, vRaw] = kv;
    let v: unknown = vRaw.trim();
    if (typeof v === "string" && /^\[.*\]$/.test(v))
      v = v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
    if (v === "") continue;
    out[k.toLowerCase()] = v;
  }
  return out;
}

export function loadAgentFile(path: string): AgentContract {
  const fm = parseFrontmatter(readFileSync(path, "utf8"));
  return {
    id: String(fm["id"] ?? basenameNoExt(path)),
    name: fm["name"] as string | undefined,
    description: fm["description"] as string | undefined,
    role: fm["role"] as string | undefined,
    capabilities: (fm["capabilities"] as string[]) ?? [],
    skills: (fm["skills"] as string[]) ?? [],
    tools: (fm["tools"] as string[]) ?? [],
    models: {
      primary: fm["model"] as string | undefined,
      fallback: fm["model_fallback"] as string | undefined,
      emergency: fm["model_emergency"] as string | undefined,
    },
    autonomy:
      (fm["autonomy"] as AgentContract["autonomy"]) ??
      ((fm["mode"] === "subagent" ? "supervised" : "balanced") as AgentContract["autonomy"]),
    permissions: (fm["permission"] as Record<string, unknown>) ?? {},
    sourcePath: path,
  };
}

function basenameNoExt(p: string): string {
  const base = p.split(/[\\/]/).pop() ?? p;
  return base.replace(/\.md$/i, "");
}

export class AgentRegistry {
  constructor(private dirs: string[]) {}

  list(): AgentContract[] {
    const agents = new Map<string, AgentContract>();
    for (const dir of this.dirs) {
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (!statSync(p).isFile() || !/\.md$/i.test(f) || f.startsWith(".")) continue;
        try {
          const a = loadAgentFile(p);
          // local-wins: later dirs override earlier by id
          agents.set(a.id, a);
        } catch {
          /* unreadable agent files are skipped; doctor reports them separately */
        }
      }
    }
    return [...agents.values()];
  }

  get(id: string): AgentContract | undefined {
    return this.list().find((a) => a.id === id);
  }

  validate(a: AgentContract): AgentIssue[] {
    const issues: AgentIssue[] = [];
    if (!a.description) issues.push({ kind: "missing-contract-field", field: "description" });
    if (!a.role) issues.push({ kind: "missing-contract-field", field: "role" });
    if (!a.models.primary) issues.push({ kind: "no-model-chain" });
    return issues;
  }
}
