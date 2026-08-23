import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type ConfigLayer =
  | "global"
  | "organization"
  | "project"
  | "team"
  | "agent"
  | "task";

export const LAYER_PRECEDENCE: ConfigLayer[] = [
  "global",
  "organization",
  "project",
  "team",
  "agent",
  "task",
];

/** Resolve {env:VAR} and {file:path} references. Never logs resolved secrets. */
export function resolveRefs(value: string): string {
  return value
    .replace(/\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, v) => process.env[v] ?? "")
    .replace(/\{file:([^}]+)\}/g, (_, p) =>
      existsSync(p) ? readFileSync(p, "utf8").trim() : "",
    );
}

function deepMerge<T extends object>(base: T, over: Partial<T>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    if (v && typeof v === "object" && !Array.isArray(v) &&
        typeof out[k] === "object" && out[k] !== null && !Array.isArray(out[k]))
      out[k] = deepMerge(out[k] as object, v as object);
    else if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export function parseJsonc(raw: string): unknown {
  return JSON.parse(stripJsoncComments(raw));
}

/** String-aware JSONC comment stripper (handles escapes; never touches string contents). */
export function stripJsoncComments(src: string): string {
  let out = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; out += c; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; out += "\n"; continue; }
    if (c === "/" && src[i + 1] === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i++; continue; }
    out += c;
  }
  return out;
}

export interface RaidanConfig {
  name?: string;
  version?: string;
  policies?: { mode?: "manual" | "supervised" | "balanced" | "autonomous" };
  providers?: Record<string, unknown>;
  models?: Record<string, unknown>;
  mcp?: Record<string, unknown>;
  agents?: Record<string, unknown>;
  telemetry?: "off" | "on";
  [k: string]: unknown;
}

const DEFAULTS: RaidanConfig = {
  name: "raidan",
  version: "0.1.0",
  policies: { mode: "supervised" },
  telemetry: "off",
};

export class ConfigManager {
  constructor(private layerPaths: Partial<Record<ConfigLayer, string>>) {}

  load(): RaidanConfig {
    let cfg: RaidanConfig = { ...DEFAULTS };
    for (const layer of LAYER_PRECEDENCE) {
      const p = this.layerPaths[layer];
      if (!p || !existsSync(p)) continue;
      const parsed = parseJsonc(readFileSync(p, "utf8")) as Partial<RaidanConfig>;
      cfg = deepMerge(cfg, parsed);
    }
    return cfg;
  }

  /** Atomic-ish write with backup sibling. */
  save(layer: ConfigLayer, cfg: RaidanConfig): void {
    const p = this.layerPaths[layer];
    if (!p) throw new Error(`no path configured for layer ${layer}`);
    mkdirSync(dirname(p), { recursive: true });
    if (existsSync(p)) {
      const bak = `${p}.${Date.now()}.bak`;
      writeFileSync(bak, readFileSync(p, "utf8"));
    }
    writeFileSync(p, JSON.stringify(cfg, null, 2));
  }

  redactSecrets(cfg: RaidanConfig): RaidanConfig {
    const clone = JSON.parse(JSON.stringify(cfg));
    // Value-level secret patterns catch keys stored under misleading field names.
    const SECRET_VALUE = /\b(sk-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|xox[bp]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/;
    const walk = (o: Record<string, unknown>) => {
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (typeof v === "string") {
          if (/(apikey|api_key|token|secret|password)/i.test(k) && !v.includes("{env:") && !v.includes("{file:"))
            o[k] = "{redacted}";
          else if (SECRET_VALUE.test(v)) o[k] = v.replace(SECRET_VALUE, "{redacted}");
        } else if (v && typeof v === "object") walk(v as Record<string, unknown>);
      }
    };
    walk(clone);
    return clone;
  }
}
