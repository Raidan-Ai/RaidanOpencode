import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export interface SkillEntry {
  name: string;
  dir: string;
  description?: string;
  license?: string;
  scope: "global" | "project";
}

export interface SkillDuplicate {
  name: string;
  locations: string[];
}

/** Scans OpenCode-native skill dirs (<dir>/<name>/SKILL.md). Read-only. */
export class SkillRegistry {
  constructor(private dirs: { path: string; scope: "global" | "project" }[]) {}

  list(): SkillEntry[] {
    const out: SkillEntry[] = [];
    for (const d of this.dirs) {
      if (!existsSync(d.path)) continue;
      for (const entry of readdirSync(d.path)) {
        const skillDir = join(d.path, entry);
        if (!statSync(skillDir).isDirectory()) continue;
        const md = join(skillDir, "SKILL.md");
        if (!existsSync(md)) continue;
        try {
          const raw = readFileSync(md, "utf8");
          const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? "";
          const get = (k: string) =>
            new RegExp(`^${k}\\s*:\\s*(.+)$`, "m").exec(fm)?.[1]?.trim();
          out.push({
            name: entry,
            dir: skillDir,
            description: get("description"),
            license: get("license"),
            scope: d.scope,
          });
        } catch {
          /* skip unreadable */
        }
      }
    }
    return out;
  }

  findDuplicates(): SkillDuplicate[] {
    const byName = new Map<string, string[]>();
    for (const s of this.list()) {
      const arr = byName.get(s.name) ?? [];
      arr.push(`${s.scope}:${s.dir}`);
      byName.set(s.name, arr);
    }
    return [...byName.entries()]
      .filter(([, locs]) => locs.length > 1)
      .map(([name, locations]) => ({ name, locations }));
  }
}
