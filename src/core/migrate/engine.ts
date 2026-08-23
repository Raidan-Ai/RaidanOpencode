import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

export interface InstallRecord {
  src: string;
  dest: string;
  hash: string;
}
export interface InstallState {
  version: 1;
  installedAt: string;
  files: InstallRecord[];
}

export interface PlanStep {
  action: "copy";
  src: string;
  dest: string;
  reason?: string;
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/**
 * Migration engine core (ADR-018): ownership-manifest installs.
 * Only removes files it recorded AND whose content still matches the recorded hash.
 */
export class MigrationEngine {
  constructor(
    private statePath: string,
    private targetSkillsDir: string,
  ) {
    mkdirSync(this.statePath.split(/[\\/]/).slice(0, -1).join("\\"), { recursive: true });
  }

  loadState(): InstallState {
    if (!existsSync(this.statePath))
      return { version: 1, installedAt: "", files: [] };
    return JSON.parse(readFileSync(this.statePath, "utf8")) as InstallState;
  }

  private saveState(s: InstallState): void {
    const tmp = `${this.statePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(s, null, 2));
    rmSync(this.statePath, { force: true });
    writeFileSync(this.statePath, JSON.stringify(s, null, 2));
  }

  /** Discover <sourceDir>/<skill>/SKILL.md trees. */
  private discover(sourceDir: string): string[] {
    if (!existsSync(sourceDir)) return [];
    return readdirSync(sourceDir)
      .map((n) => join(sourceDir, n))
      .filter((p) => statSync(p).isDirectory() && existsSync(join(p, "SKILL.md")));
  }

  plan(sourceSkillsDir: string): PlanStep[] {
    const steps: PlanStep[] = [];
    const state = this.loadState();
    for (const skillDir of this.discover(sourceSkillsDir)) {
      const name = skillDir.split(/[\\/]/).pop()!;
      const destDir = join(this.targetSkillsDir, name);
      const destFile = join(destDir, "SKILL.md");
      const foreignUnowned =
        existsSync(destFile) &&
        !state.files.some((f) => f.dest.toLowerCase() === destFile.toLowerCase());
      steps.push({
        action: "copy",
        src: join(skillDir, "SKILL.md"),
        dest: destFile,
        reason: foreignUnowned ? "SKIP: foreign dir not owned by raidan" : "install/update owned asset",
      });
    }
    return steps;
  }

  /** Executes copy steps, skipping foreign dirs. Idempotent by content hash. */
  apply(steps: PlanStep[]): { copied: string[]; skipped: string[] } {
    const state = this.loadState();
    const copied: string[] = [];
    const skipped: string[] = [];
    for (const s of steps) {
      if (s.reason?.startsWith("SKIP")) { skipped.push(s.dest); continue; }
      const content = readFileSync(s.src, "utf8");
      const hash = sha256(content);
      const existing = state.files.find((f) => f.dest === s.dest);
      if (existing && existing.hash === hash && existsSync(s.dest)) { skipped.push(s.dest); continue; }
      mkdirSync(s.dest.split(/[\\/]/).slice(0, -1).join("\\"), { recursive: true });
      // Never clobber foreign content silently
      if (!existing && existsSync(s.dest)) { skipped.push(`${s.dest} (foreign)`); continue; }
      writeFileSync(s.dest, content);
      if (existing) existing.hash = hash;
      else state.files.push({ src: s.src, dest: s.dest, hash });
      copied.push(s.dest);
    }
    state.installedAt = new Date().toISOString();
    this.saveState(state);
    return { copied, skipped };
  }

  /** Removes exactly what we own (hash must still match). */
  rollback(): string[] {
    const state = this.loadState();
    const removed: string[] = [];
    const remaining: InstallRecord[] = [];
    for (const f of state.files) {
      if (existsSync(f.dest) && sha256(readFileSync(f.dest, "utf8")) === f.hash) {
        rmSync(f.dest);
        removed.push(f.dest);
      } else remaining.push(f); // changed externally or gone — leave alone, keep record
    }
    state.files = remaining;
    this.saveState(state);
    return removed;
  }
}

/** Lightweight inventory of the OpenCode global install (for migrate inspect). */
export function inspectOpencode(globalDir: string): Record<string, number | boolean> {
  const count = (p: string) => {
    try { return readdirSync(p).length; } catch { return 0; }
  };
  return {
    configExists:
      existsSync(join(globalDir, "opencode.jsonc")) || existsSync(join(globalDir, "opencode.json")),
    agents: count(join(globalDir, "agents")) + count(join(globalDir, "agent")),
    commands: count(join(globalDir, "commands")) + count(join(globalDir, "command")),
    skills: count(join(globalDir, "skills")),
    plugins: count(join(globalDir, "plugins")),
  };
}
