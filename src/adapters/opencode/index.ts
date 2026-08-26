/**
 * RaidanOpencode — OpenCode Runtime Adapter
 *
 * Implements the kernel `RuntimeAdapter` contract (RAAP v1.0) for OpenCode.
 * See ARCHITECTURE.md §28 and ADR-001 / ADR-013.
 *
 * SCOPE (honest boundaries):
 *  - Process lifecycle (spawn/stop/restart/inspect/health/logs/destroy) is
 *    fully implemented on top of the existing, tested `RuntimeSupervisor`.
 *  - RAAP message transport (send/receive/pause/resume) is intentionally NOT
 *    implemented yet — it requires a verified OpenCode transport surface
 *    (stdio protocol / SDK). It throws `RaapTransportNotImplementedError`
 *    rather than guessing at undocumented CLI flags or APIs.
 *  - Availability probing is configurable: the default probe executes the
 *    configured command with `versionArgs` (default ["--version"]) and treats
 *    any failure as "not available". Operators can override `command`,
 *    `versionArgs`, or inject a custom `probe` if their build differs.
 */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

import {
  RuntimeSupervisor,
  isAlive,
} from "../../core/runtime/supervisor.js";
import type { SupervisedProcess } from "../../core/runtime/supervisor.js";
import type {
  AgentLaunchSpec,
  DiscoveryInfo,
  HealthReport,
  LogOptions,
  RaapEnvelope,
  RuntimeAdapter,
  SessionHandle,
  SessionId,
  SessionState,
  StopOptions,
  Unsubscribe,
  ValidationReport,
} from "../../core/runtime/adapter.js";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Raised for RAAP transport operations that are not implemented yet. */
export class RaapTransportNotImplementedError extends Error {
  readonly code = "RAAP_TRANSPORT_NOT_IMPLEMENTED";
  constructor(operation: string) {
    super(
      `OpenCode adapter: RAAP transport operation "${operation}" is not implemented yet. ` +
        `Process lifecycle is available; message transport lands with the verified ` +
        `OpenCode stdio/SDK integration (ROADMAP Phase 5/6).`,
    );
    this.name = "RaapTransportNotImplementedError";
  }
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface OpenCodeAdapterOptions {
  /** Supervisor state file. Default: <os tmp>/raidan/opencode-supervisor.json */
  storePath?: string;
  /** Directory for session logs. Default: <os tmp>/raidan/runs */
  runsDir?: string;
  /** OpenCode executable. Default: "opencode" (resolved via PATH by the OS). */
  command?: string;
  /** Args used by the availability probe. Default: ["--version"]. */
  versionArgs?: string[];
  /** Extra args prepended to every spawn. */
  baseArgs?: string[];
  /** Injected availability probe; overrides the default execFile probe. */
  probe?: () => Promise<{ available: boolean; version?: string; detail?: string }>;
  /** Optional EventBus wiring is done by the caller via supervisor events. */
  supervisor?: RuntimeSupervisor;
}

function defaultStorePath(): string {
  return join(tmpdir(), "raidan", "opencode-supervisor.json");
}

function defaultRunsDir(): string {
  return join(tmpdir(), "raidan", "runs");
}

/** Default availability probe: run `<command> <versionArgs>` with a timeout. */
function defaultProbe(
  command: string,
  versionArgs: string[],
): () => Promise<{ available: boolean; version?: string; detail?: string }> {
  return () =>
    new Promise((resolve) => {
      const child = execFile(
        command,
        versionArgs,
        { timeout: 5000, windowsHide: true },
        (err, stdout) => {
          if (err) {
            resolve({ available: false, detail: String(err.message).split("\n")[0] });
            return;
          }
          const firstLine = String(stdout).trim().split(/\r?\n/)[0];
          resolve({ available: true, version: firstLine || undefined });
        },
      );
      child.on("error", () => {
        /* handled in callback as err */
      });
    });
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class OpenCodeRuntimeAdapter implements RuntimeAdapter {
  readonly runtimeId = "opencode" as const;

  private readonly supervisor: RuntimeSupervisor;
  private readonly command: string;
  private readonly versionArgs: string[];
  private readonly baseArgs: string[];
  private readonly probeFn: () => Promise<{
    available: boolean;
    version?: string;
    detail?: string;
  }>;

  constructor(options: OpenCodeAdapterOptions = {}) {
    this.command = options.command ?? "opencode";
    this.versionArgs = options.versionArgs ?? ["--version"];
    this.baseArgs = options.baseArgs ?? [];
    this.probeFn =
      options.probe ?? defaultProbe(this.command, this.versionArgs);
    this.supervisor =
      options.supervisor ??
      new RuntimeSupervisor(
        options.storePath ?? defaultStorePath(),
        options.runsDir ?? defaultRunsDir(),
      );
  }

  // -- discovery & validation ------------------------------------------------

  async discover(): Promise<DiscoveryInfo> {
    const probed = await this.probeFn();
    return {
      runtimeId: this.runtimeId,
      name: "OpenCode",
      version: probed.version,
      available: probed.available,
      installHint: probed.available
        ? undefined
        : "Install OpenCode, or point OpenCodeAdapterOptions.command at your binary.",
      capabilities: [
        "coding",
        "file-editing",
        "shell",
        "git",
        "session-resume",
      ],
    };
  }

  async validate(): Promise<ValidationReport> {
    const problems: string[] = [];
    const probed = await this.probeFn();
    if (!probed.available) {
      problems.push(
        `command "${this.command}" not resolvable/executable (${probed.detail ?? "probe failed"})`,
      );
    }
    return { ok: problems.length === 0, problems };
  }

  async install(): Promise<void> {
    throw new Error(
      "OpenCode adapter: guided installation is not implemented yet (ROADMAP Phase 2 wizard work).",
    );
  }

  // -- lifecycle -------------------------------------------------------------

  async spawn(spec: AgentLaunchSpec): Promise<SessionHandle> {
    const id = sessionIdFor(spec.agentId);
    const args = [
      ...this.baseArgs,
      ...(spec.args ?? []),
    ];
    const rec = this.supervisor.start(id, spec.command ?? this.command, args, {
      autoRestart: false,
    });
    return toHandle(this.runtimeId, spec.agentId, rec);
  }

  async attach(sessionId: SessionId): Promise<SessionHandle> {
    const rec = requireRecord(this.supervisor, sessionId);
    return toHandle(this.runtimeId, agentIdFromSession(sessionId), rec);
  }

  async detach(_sessionId: SessionId): Promise<void> {
    /* detached supervision is the default mode; nothing to release */
  }

  async send(
    _sessionId: SessionId,
    _envelope: RaapEnvelope,
  ): Promise<RaapEnvelope | void> {
    throw new RaapTransportNotImplementedError("send");
  }

  receive(_sessionId: SessionId, _handler: (envelope: RaapEnvelope) => void): Unsubscribe {
    throw new RaapTransportNotImplementedError("receive");
  }

  async pause(_sessionId: SessionId): Promise<SessionHandle> {
    throw new RaapTransportNotImplementedError("pause");
  }

  async resume(_sessionId: SessionId): Promise<SessionHandle> {
    throw new RaapTransportNotImplementedError("resume");
  }

  async stop(sessionId: SessionId, options?: StopOptions): Promise<SessionHandle> {
    void options?.graceMs; // supervisor applies its own fixed grace window today
    const rec = await this.supervisor.stop(sessionId);
    return toHandle(this.runtimeId, agentIdFromSession(sessionId), rec);
  }

  async restart(sessionId: SessionId): Promise<SessionHandle> {
    const rec = await this.supervisor.restart(sessionId);
    return toHandle(this.runtimeId, agentIdFromSession(sessionId), rec);
  }

  async inspect(sessionId: SessionId): Promise<SessionHandle> {
    const rec = this.supervisor.get(sessionId);
    if (!rec) throw new Error(`session not found: ${sessionId}`);
    return toHandle(this.runtimeId, agentIdFromSession(sessionId), rec);
  }

  async health(): Promise<HealthReport> {
    const started = Date.now();
    const rows = this.supervisor.refresh();
    const mine = rows.filter((r) => r.id.startsWith(SESSION_PREFIX));
    const crashed = mine.filter((r) => r.state === "CRASHED").length;
    const running = mine.filter((r) => r.state === "RUNNING").length;
    return {
      runtimeId: this.runtimeId,
      healthy: crashed === 0,
      detail: `${running} running, ${crashed} crashed of ${mine.length} managed sessions`,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
    };
  }

  async logs(sessionId: SessionId, options?: LogOptions): Promise<string[]> {
    const text = this.supervisor.tailLog(sessionId, options?.lines ?? 30);
    return text.length ? text.split(/\r?\n/) : [];
  }

  /**
   * Terminal teardown. The supervisor record is retained deliberately:
   * audit/history must survive session destruction (ARCHITECTURE.md §53).
   */
  async destroy(sessionId: SessionId): Promise<void> {
    const rec = this.supervisor.get(sessionId);
    if (rec && rec.state === "RUNNING" && isAlive(rec.pid)) {
      await this.supervisor.stop(sessionId);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SESSION_PREFIX = "oc-";

function sessionIdFor(agentId: string): string {
  return `${SESSION_PREFIX}${agentId}-${Date.now().toString(36)}`;
}

function agentIdFromSession(sessionId: string): string {
  const withoutPrefix = sessionId.startsWith(SESSION_PREFIX)
    ? sessionId.slice(SESSION_PREFIX.length)
    : sessionId;
  const cut = withoutPrefix.lastIndexOf("-");
  return cut > 0 ? withoutPrefix.slice(0, cut) : withoutPrefix;
}

function requireRecord(
  supervisor: RuntimeSupervisor,
  sessionId: string,
): SupervisedProcess {
  const rec = supervisor.get(sessionId);
  if (!rec) throw new Error(`session not found: ${sessionId}`);
  return rec;
}

function toHandle(
  runtimeId: string,
  agentId: string,
  rec: SupervisedProcess,
): SessionHandle {
  const handle: SessionHandle = {
    sessionId: rec.id,
    runtimeId,
    agentId,
    pid: rec.pid,
    state: normalizeState(rec.state),
    startedAt: rec.startedAt,
    stoppedAt: rec.stoppedAt,
    exitSignal: rec.exitSignal,
    meta: { logFile: rec.logFile, restarts: rec.restarts },
  };
  return handle;
}

function normalizeState(state: SupervisedProcess["state"]): SessionState {
  switch (state) {
    case "RUNNING":
      return "RUNNING";
    case "STOPPED":
      return "STOPPED";
    case "CRASHED":
      return "CRASHED";
    default:
      return "UNKNOWN";
  }
}

/**
 * Convenience factory used by the CLI/setup wizard: builds an adapter whose
 * supervisor state lives under the user's home directory instead of tmp,
 * so sessions survive reboots when explicitly requested.
 */
export function createPersistentOpenCodeAdapter(): OpenCodeRuntimeAdapter {
  const base = join(homedir(), ".raidan");
  return new OpenCodeRuntimeAdapter({
    storePath: join(base, "opencode-supervisor.json"),
    runsDir: join(base, "runs"),
  });
}

/** Re-exported for callers that only need an existence check helper. */
export { existsSync };
