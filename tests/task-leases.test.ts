import { test } from "node:test";
import assert from "node:assert/strict";

import {
  LeaseHeldError,
  NotLeaseHolderError,
  TaskLeaseManager,
} from "../src/core/tasks/leases.js";

/** Deterministic clock the tests can advance manually. */
function makeClock(start = 1_000_000) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

test("task leases: acquire → active → release cycle", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now, ttlMs: 10_000 });

  const lease = mgr.acquire("task-1", "agent-a");
  assert.equal(lease.taskId, "task-1");
  assert.equal(lease.agentId, "agent-a");
  assert.equal(lease.heartbeats, 0);
  assert.ok(mgr.isHeld("task-1"));
  assert.equal(mgr.active().length, 1);

  assert.equal(mgr.release("task-1", "agent-a"), true);
  assert.equal(mgr.isHeld("task-1"), false);
});

test("task leases: second agent cannot acquire a live lease (duplicate-execution guard)", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now, ttlMs: 10_000 });

  mgr.acquire("task-2", "agent-a");
  assert.throws(
    () => mgr.acquire("task-2", "agent-b"),
    (err: unknown) =>
      err instanceof LeaseHeldError &&
      err.heldBy === "agent-a" &&
      err.code === "LEASE_HELD",
  );
});

test("task leases: same agent re-acquiring refreshes idempotently", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now, ttlMs: 10_000 });

  const first = mgr.acquire("task-3", "agent-a");
  clock.advance(5_000);
  const again = mgr.acquire("task-3", "agent-a");

  assert.equal(again.acquiredAt, first.acquiredAt, "original acquisition preserved");
  assert.ok(new Date(again.expiresAt) > new Date(first.expiresAt), "expiry extended");
});

test("task leases: heartbeat extends expiry and counts, holder-only", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now, ttlMs: 10_000 });

  mgr.acquire("task-4", "agent-a");
  clock.advance(4_000);
  const hb = mgr.heartbeat("task-4", "agent-a");
  assert.equal(hb.heartbeats, 1);
  clock.advance(4_000);
  // Without the heartbeat this would be expired; with it, still alive.
  assert.ok(mgr.isHeld("task-4"));

  assert.throws(
    () => mgr.heartbeat("task-4", "agent-b"),
    (err: unknown) =>
      err instanceof NotLeaseHolderError && err.message.includes("other-holder"),
  );
});

test("task leases: expired lease blocks heartbeat but frees acquisition", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now, ttlMs: 5_000 });

  mgr.acquire("task-5", "agent-a");
  clock.advance(6_000);

  assert.throws(
    () => mgr.heartbeat("task-5", "agent-a"),
    (err: unknown) =>
      err instanceof NotLeaseHolderError && err.message.includes("expired"),
  );

  // Expired lease no longer blocks another agent — recovery path works.
  const reclaimed = mgr.acquire("task-5", "agent-b");
  assert.equal(reclaimed.agentId, "agent-b");
});

test("task leases: sweep returns freed task ids sorted", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now, ttlMs: 5_000 });

  mgr.acquire("t-b", "a1");
  mgr.acquire("t-a", "a2");
  mgr.acquire("t-live", "a3", { ttlMs: 60_000 });

  clock.advance(6_000);
  assert.deepEqual(mgr.sweep(), ["t-a", "t-b"]);
  assert.deepEqual(mgr.active().map((l) => l.taskId), ["t-live"]);
  assert.deepEqual(mgr.sweep(), [], "second sweep finds nothing new");
});

test("task leases: release by non-holder returns false without effect", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now });

  mgr.acquire("task-9", "agent-a");
  assert.equal(mgr.release("task-9", "agent-b"), false);
  assert.equal(mgr.release("ghost", "agent-a"), false);
  assert.ok(mgr.isHeld("task-9"));
});

test("task leases: get lazily cleans expired leases", () => {
  const clock = makeClock();
  const mgr = new TaskLeaseManager({ now: clock.now, ttlMs: 1_000 });

  mgr.acquire("task-x", "agent-a");
  clock.advance(2_000);
  assert.equal(mgr.get("task-x"), undefined);
  assert.equal(mgr.active().length, 0);
});
