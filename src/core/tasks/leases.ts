/**
 * RaidanOpencode — Task Lease System
 *
 * Implements ARCHITECTURE.md §19: every worker that claims a task holds a
 * LEASE with an expiry. Failure behavior:
 *
 *   worker death → lease expiry → READY / RECOVERY → retry / reassign / escalate
 *
 * This prevents duplicate execution: a second agent cannot acquire a task
 * while a live lease exists. Time is injectable so expiry is testable
 * deterministically.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskLease {
  taskId: string;
  agentId: string;
  sessionId?: string;
  acquiredAt: string;
  expiresAt: string;
  heartbeats: number;
}

/** Raised when another agent holds a live lease on the task. */
export class LeaseHeldError extends Error {
  readonly code = "LEASE_HELD";
  constructor(
    readonly taskId: string,
    readonly heldBy: string,
    readonly expiresAt: string,
  ) {
    super(
      `task ${taskId} is leased by ${heldBy} until ${expiresAt} — ` +
        `sweep expired leases or wait for release`,
    );
    this.name = "LeaseHeldError";
  }
}

/** Raised when heartbeat/release is attempted without holding the lease. */
export class NotLeaseHolderError extends Error {
  readonly code = "NOT_LEASE_HOLDER";
  constructor(
    readonly taskId: string,
    readonly agentId: string,
    reason: "missing" | "expired" | "other-holder",
  ) {
    super(`task ${taskId}: ${agentId} does not hold the lease (${reason})`);
    this.name = "NotLeaseHolderError";
  }
}

export interface TaskLeaseManagerOptions {
  /** Default lease time-to-live in ms. Default 60_000. */
  ttlMs?: number;
  /** Injectable wall clock (ms epoch) for deterministic tests. */
  now?: () => number;
}

const DEFAULT_TTL_MS = 60_000;

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

export class TaskLeaseManager {
  private leases = new Map<string, TaskLease>();
  private readonly ttlMs: number;
  private readonly nowFn: () => number;

  constructor(options: TaskLeaseManagerOptions = {}) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    this.nowFn = options.now ?? (() => Date.now());
  }

  private iso(ms: number): string {
    return new Date(ms).toISOString();
  }

  /**
   * Acquire (or re-acquire) the lease on a task.
   * - Live lease held by ANOTHER agent → LeaseHeldError.
   * - Live lease held by SAME agent → refresh (idempotent reclaim).
   * - Expired/absent lease → fresh acquisition.
   */
  acquire(
    taskId: string,
    agentId: string,
    opts: { ttlMs?: number; sessionId?: string } = {},
  ): TaskLease {
    const now = this.nowFn();
    const ttl = opts.ttlMs ?? this.ttlMs;
    const existing = this.leases.get(taskId);

    if (
      existing &&
      existing.agentId !== agentId &&
      new Date(existing.expiresAt).getTime() > now
    ) {
      throw new LeaseHeldError(taskId, existing.agentId, existing.expiresAt);
    }

    const lease: TaskLease = {
      taskId,
      agentId,
      sessionId: opts.sessionId ?? existing?.sessionId,
      acquiredAt: existing?.agentId === agentId ? existing.acquiredAt : this.iso(now),
      expiresAt: this.iso(now + ttl),
      heartbeats: existing?.agentId === agentId ? existing.heartbeats : 0,
    };
    this.leases.set(taskId, lease);
    return { ...lease };
  }

  /** Extend the lease; only the holder may heartbeat. */
  heartbeat(taskId: string, agentId: string, opts: { ttlMs?: number } = {}): TaskLease {
    const now = this.nowFn();
    const lease = this.leases.get(taskId);
    if (!lease) throw new NotLeaseHolderError(taskId, agentId, "missing");
    if (new Date(lease.expiresAt).getTime() <= now)
      throw new NotLeaseHolderError(taskId, agentId, "expired");
    if (lease.agentId !== agentId)
      throw new NotLeaseHolderError(taskId, agentId, "other-holder");

    lease.expiresAt = this.iso(now + (opts.ttlMs ?? this.ttlMs));
    lease.heartbeats += 1;
    return { ...lease };
  }

  /** Voluntary release. Returns false when the caller did not hold it. */
  release(taskId: string, agentId: string): boolean {
    const lease = this.leases.get(taskId);
    if (!lease || lease.agentId !== agentId) return false;
    this.leases.delete(taskId);
    return true;
  }

  /**
   * Recovery sweep: drop every expired lease and return the freed task ids.
   * The orchestrator routes these back to READY / RECOVERY.
   */
  sweep(): string[] {
    const now = this.nowFn();
    const freed: string[] = [];
    for (const [taskId, lease] of this.leases) {
      if (new Date(lease.expiresAt).getTime() <= now) {
        this.leases.delete(taskId);
        freed.push(taskId);
      }
    }
    return freed.sort();
  }

  /** Live lease for a task, or undefined if absent/expired (lazy cleanup). */
  get(taskId: string): TaskLease | undefined {
    const lease = this.leases.get(taskId);
    if (!lease) return undefined;
    if (new Date(lease.expiresAt).getTime() <= this.nowFn()) {
      this.leases.delete(taskId);
      return undefined;
    }
    return { ...lease };
  }

  isHeld(taskId: string): boolean {
    return this.get(taskId) !== undefined;
  }

  /** All live leases, sorted by taskId for determinism. */
  active(): TaskLease[] {
    return [...this.leases.entries()]
      .filter(([id]) => this.isHeld(id))
      .map(([, l]) => ({ ...l }))
      .sort((a, b) => a.taskId.localeCompare(b.taskId));
  }
}
