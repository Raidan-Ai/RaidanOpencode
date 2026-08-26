import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

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

export interface BackupManifest {
  version: 1;
  createdAt: string;
  /** Directory containing manifest.json + payload files. */
  dir: string;
  entries: { originalPath: string; backupFile: string; hash: string }[];
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/** Case-insensitive path key so ownership checks behave identically on Windows and POSIX. */
function pathKey(p: string): string {
  return p.replace(/\\/g, "/").toLowerCase();
}

/**
 * Migration engine core (ADR-018): ownership-manifest installs.
 * Only removes files it recorded AND whose content still matches the recorded hash.
 *
 * Hardening (Phase 2c):
 *  - atomic state persistence (write tmp → rename)
 *  - corrupt-state recovery (quarantine + fresh state instead of crash)
 *  - consistent case-insensitive ownership matching across plan/apply/rollback
 *  - explicit backup()/restore() snapshots before destructive operations
 */
export class MigrationEngine {
  constructor(
    private statePath: string,
    private targetSkillsDir: string,
  ) {
    mkdirSync(dirname(this.statePath), { recursive: true });
  }

  loadState(): InstallState {
    if (!existsSync(this.statePath))
      return { version: 1, installedAt: "", files: [] };
    try {
      return JSON.parse(readFileSync(this.statePath, "utf8")) as InstallState;
    } catch {
      // Quarantine the corrupt file rather than destroying evidence, then
      // continue with a fresh manifest. A corrupt state must never brick the
      // migration engine or silently delete user skills.
      const quarantine = `${this.statePath}.corrupt-${Date.now()}`;
      try {
        renameSync(this.statePath, quarantine);
      } catch {
        rmSync(this.statePath, { force: true });
      }
      return { version: 1, installedAt: "", files: [] };
    }
  }

  private saveState(s: InstallState): void {
    // Atomic: write sibling temp file, then rename over the target.
    const tmp = `${this.statePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(s, null, 2));
    renameSync(tmp, this.statePath);
  }

  private ensureParentDir(p: string): void {
    mkdirSync(dirname(p), { recursive: true });
  }

  /** Discover <sourceDir>/<skill>/SKILL.md trees. */
  private discover(sourceDir: string): string[] {
    if (!existsSync(sourceDir)) return [];
    return readdirSync(sourceDir)
      .map((n) => join(sourceDir, n))
      .filter((p) => statSync(p).isDirectory() && existsSync(join(p, "SKILL.md")));
  }

  private isOwned(dest: string, state: InstallState): boolean {
    const key = pathKey(dest);
    return state.files.some((f) => pathKey(f.dest) === key);
  }

  plan(sourceSkillsDir: string): PlanStep[] {
    const steps: PlanStep[] = [];
    const state = this.loadState();
    for (const skillDir of this.discover(sourceSkillsDir)) {
      const name = skillDir.split(/[\\/]/).pop()!;
      const destDir = join(this.targetSkillsDir, name);
      const destFile = join(destDir, "SKILL.md");
      const foreignUnowned =
        existsSync(destFile) && !this.isOwned(destFile, state);
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
      const existing = state.files.find((f) => pathKey(f.dest) === pathKey(s.dest));
      if (existing && existing.hash === hash && existsSync(s.dest)) { skipped.push(s.dest); continue; }
      this.ensureParentDir(s.dest);
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

  /**
   * Snapshot files to `<stateDir>/backups/<timestamp>/` with a manifest.json.
   * Defaults to every owned destination on record; pass explicit paths to
   * include foreign files you are about to touch. Returns the manifest needed
   * by restore().
   */
  backup(paths?: string[]): BackupManifest {
    const state = this.loadState();
    const targets = paths ?? state.files.map((f) => f.dest);
    const dir = join(dirname(this.statePath), "backups", String(Date.now()));
    mkdirSync(dir, { recursive: true });
    const entries: BackupManifest["entries"] = [];
    for (const original of targets) {
      if (!existsSync(original)) continue;
      const backupFile = join(dir, sha256(original).slice(0, 16) + ".bak");
      copyFileSync(original, backupFile);
      entries.push({
        originalPath: original,
        backupFile,
        hash: sha256(readFileSync(original, "utf8")),
      });
    }
    const manifest: BackupManifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      dir,
      entries,
    };
    writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
    return manifest;
  }

  /**
   * Restore files from a backup manifest (or a backup directory containing
   * manifest.json). Overwrites current content — that is its purpose — but
   * never deletes anything.
   */
  restore(backupOrManifestDir: string | BackupManifest): string[] {
    const dir = typeof backupOrManifestDir === "string"
      ? backupOrManifestDir
      : backupOrManifestDir.dir;
    const manifestPath = join(dir, "manifest.json");
    if (!existsSync(manifestPath))
      throw new Error(`backup manifest not found: ${manifestPath}`);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as BackupManifest;
    const restored: string[] = [];
    for (const entry of manifest.entries) {
      if (!existsSync(entry.backupFile)) continue; // payload lost — skip, don't guess
      this.ensureParentDir(entry.originalPath);
      copyFileSync(entry.backupFile, entry.originalPath);
      restored.push(entry.originalPath);
    }
    return restored;
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
