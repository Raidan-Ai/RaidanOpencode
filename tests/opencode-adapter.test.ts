import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  OpenCodeRuntimeAdapter,
  RaapTransportNotImplementedError,
} from "../src/adapters/opencode/index.js";
import { makeEnvelope } from "../src/core/runtime/adapter.js";

function makeAdapter(opts: ConstructorParameters<typeof OpenCodeRuntimeAdapter>[0] = {}) {
  const dir = mkdtempSync(join(tmpdir(), "raidan-oc-test-"));
  return new OpenCodeRuntimeAdapter({
    storePath: join(dir, "supervisor.json"),
    runsDir: join(dir, "runs"),
    ...opts,
  });
}

/** A long-lived no-op process that works on Linux and Windows CI. */
const LONG_LIVED = {
  command: process.execPath,
  args: ["-e", "setInterval(()=>{},10000)"],
};

test("OpenCode adapter: spawn produces a RUNNING session handle", async () => {
  const adapter = makeAdapter();
  const handle = await adapter.spawn({ agentId: "coder", ...LONG_LIVED });

  assert.equal(handle.runtimeId, "opencode");
  assert.equal(handle.agentId, "coder");
  assert.ok(handle.sessionId.startsWith("oc-coder-"), `got ${handle.sessionId}`);
  assert.equal(handle.state, "RUNNING");
  assert.ok(typeof handle.pid === "number");

  await adapter.destroy(handle.sessionId);
});

test("OpenCode adapter: stop transitions to STOPPED and destroy is idempotent-safe", async () => {
  const adapter = makeAdapter();
  const h = await adapter.spawn({ agentId: "reviewer", ...LONG_LIVED });

  const stopped = await adapter.stop(h.sessionId);
  assert.equal(stopped.state, "STOPPED");
  assert.ok(stopped.stoppedAt);

  // destroy on an already-stopped session must not throw
  await adapter.destroy(h.sessionId);
});

test("OpenCode adapter: restart increments restart counter and returns RUNNING", async () => {
  const adapter = makeAdapter();
  const h = await adapter.spawn({ agentId: "planner", ...LONG_LIVED });
  await adapter.stop(h.sessionId);

  const restarted = await adapter.restart(h.sessionId);
  assert.equal(restarted.state, "RUNNING");
  assert.equal(restarted.meta?.restarts, 1);

  await adapter.destroy(h.sessionId);
});

test("OpenCode adapter: inspect throws for unknown sessions", async () => {
  const adapter = makeAdapter();
  await assert.rejects(() => adapter.inspect("oc-ghost-xyz"), /session not found/);
});

test("OpenCode adapter: RAAP transport operations raise explicit not-implemented errors", async () => {
  const adapter = makeAdapter();
  const envelope = makeEnvelope("oc-x-1", "prompt", { text: "hi" });

  await assert.rejects(
    () => adapter.send("oc-x-1", envelope),
    (err: unknown) => err instanceof RaapTransportNotImplementedError,
  );
  assert.throws(() => adapter.receive("oc-x-1", () => {}), RaapTransportNotImplementedError);
  await assert.rejects(
    () => adapter.pause("oc-x-1"),
    (err: unknown) => err instanceof RaapTransportNotImplementedError,
  );
  await assert.rejects(
    () => adapter.resume("oc-x-1"),
    (err: unknown) => err instanceof RaapTransportNotImplementedError,
  );
});

test("OpenCode adapter: discover reflects probe result and validate reports problems", async () => {
  const unavailable = makeAdapter({
    probe: async () => ({ available: false, detail: "not found" }),
  });
  const info = await unavailable.discover();
  assert.equal(info.available, false);
  assert.ok(info.installHint);
  assert.ok(info.capabilities.includes("coding"));

  const report = await unavailable.validate();
  assert.equal(report.ok, false);
  assert.equal(report.problems.length, 1);
  assert.match(report.problems[0], /not resolvable\/executable/);

  const available = makeAdapter({
    probe: async () => ({ available: true, version: "opencode 1.2.3" }),
  });
  const okInfo = await available.discover();
  assert.equal(okInfo.available, true);
  assert.equal(okInfo.version, "opencode 1.2.3");
  assert.equal((await available.validate()).ok, true);
});

test("OpenCode adapter: health reports unhealthy when a managed session crashed", async () => {
  const adapter = makeAdapter();
  const h = await adapter.spawn({ agentId: "worker", ...LONG_LIVED });

  // Kill externally so the supervisor observes a crash on next refresh.
  if (typeof h.pid === "number") process.kill(h.pid);

  const health = await adapter.health();
  assert.equal(health.healthy, false);
  assert.match(health.detail ?? "", /crashed/);

  await adapter.destroy(h.sessionId);
});

test("OpenCode adapter: logs returns array output for a session", async () => {
  const adapter = makeAdapter();
  const h = await adapter.spawn({
    agentId: "logger",
    command: process.execPath,
    args: ["-e", "console.log('raad-log-line'); setInterval(()=>{},10000)"],
  });

  // give the child a moment to flush stdout into the log file
  await new Promise((r) => setTimeout(r, 500));
  const lines = await adapter.logs(h.sessionId, { lines: 10 });
  assert.ok(lines.some((l) => l.includes("raad-log-line")), JSON.stringify(lines));

  await adapter.destroy(h.sessionId);
});
