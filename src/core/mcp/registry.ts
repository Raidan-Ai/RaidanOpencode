import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseJsonc } from "../config/manager.js";

export interface McpServerRecord {
  name: string;
  transport: "remote" | "local";
  target: string; // url or command[0]
  risk: "LOW" | "MEDIUM" | "HIGH";
  risks: string[];
  provenanceKnown: boolean;
  authMode: "env-ref" | "literal-detected" | "none" | "oauth";
}

/**
 * Governance layer OVER native OpenCode `"mcp"` config (ADR-010).
 * Read-only today; enforcement hooks land with plugin integration phase.
 */
export class McpRegistry {
  constructor(private opencodeGlobalDir: string) {}

  private configPaths(): string[] {
    return [
      join(this.opencodeGlobalDir, "opencode.jsonc"),
      join(this.opencodeGlobalDir, "opencode.json"),
    ].filter(existsSync);
  }

  list(): McpServerRecord[] {
    const out: McpServerRecord[] = [];
    for (const p of this.configPaths()) {
      let cfg: { mcp?: Record<string, unknown> };
      try { cfg = parseJsonc(readFileSync(p, "utf8")) as typeof cfg; }
      catch { continue; }
      for (const [name, def] of Object.entries(cfg.mcp ?? {})) {
        out.push(this.classify(name, def as Record<string, unknown>));
      }
    }
    return out;
  }

  get(name: string): McpServerRecord | undefined {
    return this.list().find((r) => r.name === name);
  }

  private classify(name: string, def: Record<string, unknown>): McpServerRecord {
    const risks: string[] = [];
    const transport = def["type"] === "local" ? "local" : "remote";
    const target =
      transport === "local"
        ? ((def["command"] as string[] | undefined)?.[0] ?? "?")
        : ((def["url"] as string | undefined) ?? "?");

    let authMode: McpServerRecord["authMode"] = "none";
    const headers = def["headers"] as Record<string, string> | undefined;
    const authStr = JSON.stringify(headers ?? {});
    if (/Bearer \{env:/.test(authStr)) authMode = "env-ref";
    else if (/ghp_|sk-|token|key/i.test(authStr)) { authMode = "literal-detected"; risks.push("credential literal in config"); }

    if (transport === "local") {
      risks.push("executes local process");
      if (target === "npx" || target === "uvx" || /npx|uvx/.test(target)) risks.push("network-fetched code");
    } else {
      if (!target.startsWith("https://")) risks.push("non-https remote");
      if (!/githubcopilot\.com|modelcontextprotocol|api\.github\.com/.test(target)) risks.push("unverified origin");
    }

    const risk: McpServerRecord["risk"] = (() => {
      if (risks.some((r) => r.includes("literal") || r.includes("non-https") || r.includes("unverified")))
        return "HIGH";
      if (risks.length === 0) return "LOW";
      return "MEDIUM"; // e.g. local process / network-fetched code
    })();

    return { name, transport, target, risk, risks, provenanceKnown: false, authMode };
  }
}
