/**
 * RaidanOpencode — Runtime Adapter Contract (RAAP v1.0)
 *
 * Implements ADR-013 (runtime abstraction) and ARCHITECTURE.md §26/§29.
 *
 * This module is KERNEL-LEVEL: it defines contracts and domain primitives only.
 * It MUST NOT depend on OpenCode, Claude, Codex, Gemini, tmux, Docker,
 * Kubernetes, or any specific cloud provider. Adapters implement this contract;
 * the kernel consumes it exclusively through these types.
 *
 * RAAP = Raidan Agent Adapter Protocol — a transport-neutral protocol so a new
 * runtime can be added without changing the Kernel, Task Engine, Orchestrator,
 * Memory, Messaging, Policy, or UI (ARCHITECTURE.md §29).
 */

/** RAAP protocol version supported by this contract. */
export const RAAP_VERSION = "1.0" as const;

// ---------------------------------------------------------------------------
// Primitive identifiers
// ---------------------------------------------------------------------------

/** Stable identifier for a runtime implementation (e.g. "opencode", "codex"). */
export type RuntimeId = string;

/** Stable identifier for an agent session within a runtime. */
export type SessionId = string;

/** Stable identifier for an agent profile (role + implementation binding). */
export type AgentId = string;

// ---------------------------------------------------------------------------
// Trust & capability vocabulary (ARCHITECTURE.md §50, §9)
// ---------------------------------------------------------------------------

export type TrustLevel = "SAFE" | "CONTROLLED" | "SENSITIVE" | "DANGEROUS";

export type CapabilityLevel = "basic" | "intermediate" | "advanced";

/**
 * A capability requirement expressed by a task or agent role.
 * Routing resolves requirements against the Capability Graph; adapters only
 * need to report what they can execute.
 */
export interface CapabilityRequirement {
  id: string;
  level?: CapabilityLevel;
  requiredTools?: string[];
  riskLevel?: TrustLevel;
}

// ---------------------------------------------------------------------------
// Launch specification
// ---------------------------------------------------------------------------

export type WorkspacePolicy = "shared" | "isolated-worktree" | "isolated-approval";

/** Everything a runtime needs to launch one agent session. */
export interface AgentLaunchSpec {
  /** Agent profile id from the Agent Registry. */
  agentId: AgentId;
  /** Role name (e.g. "reviewer"); implementation is chosen by the adapter. */
  role?: string;
  /** Executable override; adapter default applies when omitted. */
  command?: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  model?: string;
  provider?: string;
  capabilities?: CapabilityRequirement[];
  workspacePolicy?: WorkspacePolicy;
  /** Maximum context tokens the runtime may load (Minimal Viable Information). */
  maxContextTokens?: number;
  /** Autonomy level L0–L5 per task policy (ARCHITECTURE.md §52). */
  autonomyLevel?: number;
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

export type SessionState =
  | "STARTING"
  | "RUNNING"
  | "PAUSED"
  | "STOPPED"
  | "CRASHED"
  | "UNKNOWN";

/** Handle to a live or historical agent session. */
export interface SessionHandle {
  sessionId: SessionId;
  runtimeId: RuntimeId;
  agentId: AgentId;
  pid?: number;
  state: SessionState;
  startedAt?: string;
  stoppedAt?: string;
  exitSignal?: string;
  /** OS process id of the host terminal/shell when applicable. */
  meta?: Record<string, unknown>;
}

export interface StopOptions {
  /** Grace period in ms before escalating to SIGKILL. Default 4000. */
  graceMs?: number;
  reason?: string;
}

// ---------------------------------------------------------------------------
// RAAP envelope (transport-neutral message contract)
// ---------------------------------------------------------------------------

export type RaapMessageType =
  | "prompt"
  | "response"
  | "event"
  | "control"
  | "error"
  | "heartbeat";

/**
 * The single wire format every adapter must speak. Mirrors the envelope shape
 * used across Raidan subsystems: monotonic seq per session, ISO timestamps,
 * correlation/trace ids for observability joins.
 */
export interface RaapEnvelope<T = unknown> {
  raapVersion: typeof RAAP_VERSION;
  envelopeId: string;
  /** Monotonic sequence number scoped to the session. */
  seq: number;
  ts: string;
  type: RaapMessageType;
  payload: T;
  /** Links a response/error back to its originating prompt envelope. */
  correlationId?: string;
  /** Distributed trace id shared across the whole task run. */
  traceId?: string;
}

let seqCounterBySession = new Map<SessionId, number>();

/**
 * Build a RAAP envelope with a fresh envelope id and the next monotonic seq
 * for the given session. Deterministic ordering is enforced per session only.
 */
export function makeEnvelope<T>(
  sessionId: SessionId,
  type: RaapMessageType,
  payload: T,
  opts: { correlationId?: string; traceId?: string; now?: () => string } = {},
): RaapEnvelope<T> {
  const next = (seqCounterBySession.get(sessionId) ?? 0) + 1;
  seqCounterBySession.set(sessionId, next);
  return {
    raapVersion: RAAP_VERSION,
    envelopeId: `${sessionId}:${next}:${Date.now().toString(36)}`,
    seq: next,
    ts: (opts.now ?? (() => new Date().toISOString()))(),
    type,
    payload,
    correlationId: opts.correlationId,
    traceId: opts.traceId,
  };
}

/** Structural guard for untrusted inbound envelopes. */
export function isRaapEnvelope(value: unknown): value is RaapEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.raapVersion === RAAP_VERSION &&
    typeof v.envelopeId === "string" &&
    typeof v.seq === "number" &&
    typeof v.ts === "string" &&
    typeof v.type === "string" &&
    ["prompt", "response", "event", "control", "error", "heartbeat"].includes(v.type) &&
    "payload" in v
  );
}

/** Reset internal seq counters (test helper). */
export function resetRaapSequences(): void {
  seqCounterBySession = new Map();
}

// ---------------------------------------------------------------------------
// Discovery & health
// ---------------------------------------------------------------------------

export interface DiscoveryInfo {
  runtimeId: RuntimeId;
  name: string;
  version?: string;
  available: boolean;
  /** Human-readable install command/hint when not available. */
  installHint?: string;
  capabilities: string[];
}

export interface ValidationReport {
  ok: boolean;
  problems: string[];
}

export interface HealthReport {
  runtimeId: RuntimeId;
  healthy: boolean;
  detail?: string;
  checkedAt: string;
  latencyMs?: number;
}

export interface LogOptions {
  lines?: number;
  since?: string;
  until?: string;
}

// ---------------------------------------------------------------------------
// The RuntimeAdapter contract (ARCHITECTURE.md §26)
// ---------------------------------------------------------------------------

export type Unsubscribe = () => void;

/**
 * Every runtime integration implements this interface. The Orchestration
 * Kernel depends ONLY on this contract — never on a concrete runtime.
 */
export interface RuntimeAdapter {
  readonly runtimeId: RuntimeId;

  /** Report availability/version/capabilities without launching anything. */
  discover(): Promise<DiscoveryInfo>;

  /** Verify prerequisites (binary present, config valid, auth reachable). */
  validate(): Promise<ValidationReport>;

  /** Optional guided installation for missing prerequisites. */
  install?(options?: Record<string, unknown>): Promise<void>;

  /** Launch a new agent session from a launch spec. */
  spawn(spec: AgentLaunchSpec): Promise<SessionHandle>;

  /** Re-attach to an existing session (e.g. after orchestrator restart). */
  attach(sessionId: SessionId): Promise<SessionHandle>;

  /** Detach from a session without stopping it. */
  detach(sessionId: SessionId): Promise<void>;

  /**
   * Send a prompt/control envelope to a session. Returns the immediate ack or
   * response envelope when the transport is synchronous; otherwise void.
   */
  send(
    sessionId: SessionId,
    envelope: RaapEnvelope,
  ): Promise<RaapEnvelope | void>;

  /** Subscribe to outbound envelopes (responses/events/errors) of a session. */
  receive(
    sessionId: SessionId,
    handler: (envelope: RaapEnvelope) => void,
  ): Unsubscribe;

  pause(sessionId: SessionId): Promise<SessionHandle>;
  resume(sessionId: SessionId): Promise<SessionHandle>;
  stop(sessionId: SessionId, options?: StopOptions): Promise<SessionHandle>;
  restart(sessionId: SessionId): Promise<SessionHandle>;

  /** Point-in-time snapshot of a session's state. */
  inspect(sessionId: SessionId): Promise<SessionHandle>;

  /** Aggregate runtime health probe. */
  health(): Promise<HealthReport>;

  /** Fetch recent transcript/log output for a session. Never includes secrets. */
  logs(sessionId: SessionId, options?: LogOptions): Promise<string[]>;

  /** Terminal teardown: stop if running and release all resources. */
  destroy(sessionId: SessionId): Promise<void>;
}
