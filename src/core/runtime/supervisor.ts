import { existsSync, mkdirSync, openSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import type { EventBus } from "../events/bus.js";

export type SupervisedState = "RUNNING" | "STOPPED" | "CRASHED" | "UNKNOWN";

export interface SupervisedProcess {
  id: string;
  command: string;
  args: string[];
  cwd?: string;
  pid?: number;
  state: SupervisedState;
  autoRestart: boolean;
  restarts: number;
  startedAt?: string;
  stoppedAt?: string;
  exitSignal?: string;
  logFile: string;
}

export interface StartOptions {
  autoRestart?: boolean;
  maxRestarts?: number;
}

const DEFAULT_MAX_RESTARTS = 3;

export function isAlive(pid?: number): boolean {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

export async function waitFor(
  predicate: () => boolean,
  timeoutMs = 5000,
  stepMs = 150,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await new Promise((r) => setTimeout(r, stepMs));
  }
  return predicate();
}

export class RuntimeSupervisor {
  constructor(private storePath: string, private runsDir: string, private bus?: EventBus) {
    mkdirSync(dirname(storePath), { recursive: true });
    mkdirSync(runsDir, { recursive: true });
    if (!existsSync(storePath)) writeFileSync(storePath, JSON.stringify([]));
  }

  private loadAll(): SupervisedProcess[] {
    return JSON.parse(readFileSync(this.storePath, "utf8")) as SupervisedProcess[];
  }

  private saveAll(rows: SupervisedProcess[]): void {
    const tmp = `${this.storePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(rows, null, 2));
    renameSync(tmp, this.storePath);
  }

  get(id: string): SupervisedProcess | undefined {
    const all = this.loadAll();
    const p = all.find((x) => x.id === id);
    if (!p) return undefined;
    if (p.state === "RUNNING" && !isAlive(p.pid)) {
      p.state = "CRASHED";
      p.stoppedAt = new Date().toISOString();
      this.saveAll(all);
      this.bus?.emit("agent.failed", { supervisorId: id, crashed: true }, { agentId: id });
    }
    return p;
  }

  private markCrashed(p: SupervisedProcess): void {
    p.state = "CRASHED";
    p.stoppedAt = new Date().toISOString();
    this.bus?.emit("agent.failed", { supervisorId: p.id, crashed: true }, { agentId: p.id });
  }

  list(): SupervisedProcess[] {
    return this.refresh();
  }

  logFileFor(id: string): string {
    return join(this.runsDir, `${id}.log`);
  }

  start(id: string, command: string, args: string[], opts: StartOptions = {}): SupervisedProcess {
    const all = this.loadAll();
    const existing = all.find((p) => p.id === id);
    if (existing && existing.state === "RUNNING" && isAlive(existing.pid))
      throw new Error(`process ${id} already RUNNING (pid ${existing.pid})`);

    const logFile = existing?.logFile ?? this.logFileFor(id);
    const out = openSync(logFile, "a");
    const child: ChildProcess = spawn(command, args, {
      cwd: existing?.cwd,
      detached: true,
      windowsHide: true,
      stdio: ["ignore", out, out],
    });
    const now = new Date().toISOString();
    const rec: SupervisedProcess = existing ?? {
      id,
      command,
      args,
      state: "RUNNING",
      autoRestart: false,
      restarts: 0,
      logFile,
    };
    rec.command = command;
    rec.args = args;
    rec.pid = typeof child.pid === "number" ? child.pid : undefined;
    rec.state = rec.pid ? "RUNNING" : "UNKNOWN";
    rec.autoRestart = opts.autoRestart ?? existing?.autoRestart ?? false;
    rec.startedAt = now;
    rec.stoppedAt = undefined;
    delete rec.exitSignal;
    child.unref();

    if (!existing) all.push(rec);
    this.saveAll(all);
    this.bus?.emit("agent.started", { supervisorId: id, pid: rec.pid }, { agentId: id });
    return rec;
  }

  async stop(id: string): Promise<SupervisedProcess> {
    const all = this.loadAll();
    const p = all.find((x) => x.id === id);
    if (!p) throw new Error(`process not found: ${id}`);
    if (p.pid && isAlive(p.pid)) {
      try {
        process.kill(p.pid);
      } catch {
        /* already gone */
      }
      await waitFor(() => !isAlive(p.pid), 4000);
    }
    p.state = "STOPPED";
    p.stoppedAt = new Date().toISOString();
    p.exitSignal = "SIGTERM";
    this.saveAll(all);
    this.bus?.emit("agent.stopped", { supervisorId: id }, { agentId: id });
    return p;
  }

  async restart(id: string): Promise<SupervisedProcess> {
    const cur = this.get(id);
    if (!cur) throw new Error(`process not found: ${id}`);
    const wasRunning = cur.state === "RUNNING" && isAlive(cur.pid);
    if (wasRunning) await this.stop(id);
    const next = this.start(id, cur.command, cur.args, { autoRestart: cur.autoRestart });
    const all = this.loadAll();
    const p = all.find((x) => x.id === id)!;
    p.restarts += 1;
    this.saveAll(all);
    this.bus?.emit("agent.restarted", { supervisorId: id, wasRunning }, { agentId: id });
    return next;
  }

  refresh(maxRestarts = DEFAULT_MAX_RESTARTS): SupervisedProcess[] {
    const all = this.loadAll();
    let dirty = false;
    const toRecover: string[] = [];
    for (const p of all) {
      if (p.state === "RUNNING" && !isAlive(p.pid)) {
        this.markCrashed(p);
        dirty = true;
        if (p.autoRestart && p.restarts < maxRestarts) toRecover.push(p.id);
      } else if (p.state !== "RUNNING" && p.state !== "STOPPED" && p.pid && isAlive(p.pid)) {
        p.state = "RUNNING";
        dirty = true;
      }
    }
    if (dirty) this.saveAll(all);
    for (const id of toRecover) {
      try {
        const stale = this.loadAll().find((x) => x.id === id)!;
        this.start(id, stale.command, stale.args, { autoRestart: stale.autoRestart });
        const now = this.loadAll();
        const live = now.find((x) => x.id === id);
        if (live) {
          live.restarts = stale.restarts + 1;
          this.saveAll(now);
        }
        this.bus?.emit("agent.restarted", { supervisorId: id, reason: "crash-recovery" }, { agentId: id });
      } catch {
        /* respawn failure leaves CRASHED */
      }
    }
    return this.loadAll();
  }

  tailLog(id: string, lines = 30): string {
    const p = this.get(id);
    if (!p) throw new Error(`process not found: ${id}`);
    if (!existsSync(p.logFile)) return "";
    const rows = readFileSync(p.logFile, "utf8").split(/\r?\n/);
    while (rows.length && rows[rows.length - 1] === "") rows.pop();
    return rows.slice(-lines).join("\n");
  }
}
