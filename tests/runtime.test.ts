import assert from "node:assert/strict";
import { test } from "node:test";
import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { RuntimeSupervisor, isAlive, waitFor } from "../src/core/runtime/supervisor.js";
import {
  NotificationEngine,
  TerminalChannel,
  WebhookChannel,
  NOTIFY_LEVELS,
} from "../src/core/notifications/engine.js";
import { LedgerQuery } from "../src/core/observability/query.js";
import { EventBus } from "../src/core/events/bus.js";

function tempDir(name: string): string {
  return mkdtempSync(join(tmpdir(), `raidan-${name}-`));
}

const SLEEPER = ["-e", "setTimeout(()=>{},60000)"];

test("supervisor: start -> RUNNING with live pid; duplicate start rejected; stop works", async () => {
  const dir = tempDir("rt");
  try {
    const sup = new RuntimeSupervisor(join(dir, "procs.json"), join(dir, "runs"));
    const p = sup.start("worker-1", process.execPath, SLEEPER);
    assert.equal(p.state, "RUNNING");
    assert.ok(typeof p.pid === "number");
    const aliveSoon = await waitFor(() => sup.get("worker-1") !== undefined && isAlive(sup.get("worker-1")!.pid));
    assert.ok(aliveSoon);
    assert.throws(() => sup.start("worker-1", process.execPath, SLEEPER), /already RUNNING/);
    const stopped = await sup.stop("worker-1");
    assert.equal(stopped.state, "STOPPED");
    assert.ok(!isAlive(stopped.pid));
    await assert.rejects(() => sup.stop("nope"), /not found/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("supervisor: crash detection marks CRASHED and emits failure event", async () => {
  const dir = tempDir("rt2");
  try {
    let failures = 0;
    const bus = new EventBus(join(dir, "ledger.jsonl"));
    bus.on("agent.failed", () => { failures++; });
    const sup = new RuntimeSupervisor(join(dir, "procs.json"), join(dir, "runs"), bus);
    sup.start("doomed", process.execPath, ["-e", "process.exit(7)"]);
    const crashed = await waitFor(() => sup.get("doomed")?.state === "CRASHED", 15000);
    sup.refresh();
    assert.equal(sup.get("doomed")!.state, "CRASHED");
    assert.ok(crashed);
    assert.ok(failures >= 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("supervisor: auto-restart recovers a one-shot crasher deterministically", async () => {
  const dir = tempDir("rt3");
  try {
    let failures = 0;
    let restarted = 0;
    const bus = new EventBus(join(dir, "ledger.jsonl"));
    bus.on("agent.failed", () => { failures++; });
    bus.on("agent.restarted", () => { restarted++; });
    const sup = new RuntimeSupervisor(join(dir, "procs.json"), join(dir, "runs"), bus);
    const marker = join(dir, "crashed-once.flag");
    const oneShot =
      "const fs=require('fs');const m=process.argv[1];if(fs.existsSync(m)){setTimeout(()=>{},60000)}else{fs.writeFileSync(m,'x');process.exit(7)}";
    sup.start("recover", process.execPath, ["-e", oneShot, marker], { autoRestart: true });
    const healed = await waitFor(
      () => {
        sup.refresh();
        const p = sup.get("recover")!;
        return p.state === "RUNNING" && p.restarts >= 1 && isAlive(p.pid);
      },
      20000,
    );
    assert.ok(healed, "expected supervisor to detect crash and recover");
    assert.ok(failures >= 1);
    assert.ok(restarted >= 1);
    await sup.stop("recover");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("supervisor: restart increments counter; tailLog streams child output", async () => {
  const dir = tempDir("rt4");
  try {
    const sup = new RuntimeSupervisor(join(dir, "procs.json"), join(dir, "runs"));
    sup.start("logger", process.execPath, ["-e", "console.log('hello-from-child'); setTimeout(()=>{},60000)"]);
    await waitFor(() => sup.tailLog("logger").includes("hello-from-child"), 10000);
    assert.ok(sup.tailLog("logger").includes("hello-from-child"));
    const before = sup.get("logger")!.restarts;
    await sup.restart("logger");
    assert.equal(sup.get("logger")!.restarts, before + 1);
    writeFileSync(join(dir, "runs", "logger.log"), "line1\nline2\nline3\n");
    assert.deepEqual(sup.tailLog("logger", 2).trim().split(/\r?\n/), ["line2", "line3"]);
    await sup.stop("logger");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

function httpServer(handler: (req: IncomingMessage, res: ServerResponse) => void): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server: Server = createServer(handler);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({
        url: `http://127.0.0.1:${addr.port}/`,
        close: () => new Promise((res) => server.close(() => res())),
      });
    });
  });
}

test("notifications: level gating routes only qualifying channels", async () => {
  const lines: string[] = [];
  const eng = new NotificationEngine({ terminalSink: (l) => lines.push(l) });
  assert.deepEqual(eng.listChannels(), [{ name: "terminal", minLevel: "info" }]);
  const results = await eng.send({ level: "critical", title: "disk almost full" });
  assert.equal(results.length, 1);
  assert.equal(results[0].ok, true);
  assert.match(lines.join("\n"), /\[!!\] disk almost full/);

  const strict = new NotificationEngine({
    terminalSink: (l) => lines.push(l),
    webhookUrl: "http://127.0.0.1:9",
    webhookMinLevel: "error",
  });
  strict.channelsFor("info").forEach((c) => assert.notEqual(c.name, "webhook"));
  assert.ok(strict.channelsFor("error").some((c) => c.name === "webhook"));
});

test("notifications: webhook channel posts JSON and surfaces transport errors", async () => {
  const bodies: unknown[] = [];
  const srv = await httpServer((req, res) => {
    let raw = "";
    req.on("data", (d) => (raw += d));
    req.on("end", () => {
      bodies.push(JSON.parse(raw));
      res.statusCode = 204;
      res.end();
    });
  });
  try {
    const ch = new WebhookChannel("info", srv.url);
    await ch.send({ level: "approval", title: "deploy needs approval", body: "prod" });
    const payload = bodies[0] as Record<string, unknown>;
    assert.equal(payload.title, "deploy needs approval");
    assert.equal(payload.level, "approval");
    assert.equal(payload.source, "raidan-opencode");

    const bad = new WebhookChannel("info", "http://127.0.0.1:1/", 500);
    await assert.rejects(() => bad.send({ level: "info", title: "x" }));
  } finally { await srv.close(); }
});

test("notifications: NOTIFY_LEVELS ordering is defined and complete", () => {
  assert.deepEqual([...NOTIFY_LEVELS], ["info", "warning", "approval", "error", "critical"]);
});

test("observability: ledger filters by name/task/agent/limit, tolerates corrupt lines, summarizes", () => {
  const dir = tempDir("obs");
  try {
    const ledger = join(dir, "events.jsonl");
    const bus = new EventBus(ledger);
    bus.emit("task.created", null, { taskId: "T-a" });
    bus.emit("task.started", null, { taskId: "T-a" });
    bus.emit("task.completed", null, { taskId: "T-a" });
    bus.emit("run.failed", { reason: "boom" }, { agentId: "ag-x" });
    appendFileSync(ledger, "{corrupt json\n", "utf8");

    const q = new LedgerQuery(ledger);
    assert.equal(q.all({ name: "task.created" }).length, 1);
    assert.equal(q.all({ taskId: "T-a" }).length, 3);
    assert.equal(q.all({ agentId: "ag-x" }).length, 1);
    const limited = q.all({ limit: 2 });
    assert.equal(limited.length, 2);
    assert.equal(limited[limited.length - 1].name, "run.failed");

    const trace = q.trace("T-a");
    assert.deepEqual(trace.map((e) => e.name), ["task.created", "task.started", "task.completed"]);
    const summary = q.summary();
    assert.equal(summary.total, 4);
    assert.equal(summary.byName["task.started"], 1);
    assert.ok(summary.lastTs);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("observability: trace picks up events whose DATA references the task", () => {
  const dir = tempDir("obs2");
  try {
    const ledger = join(dir, "events.jsonl");
    const bus = new EventBus(ledger);
    bus.emit("run.started", { mode: "plan-execute" }, { taskId: "T-b" });
    bus.emit("context.loaded", { taskId: "T-b", included: 3 });
    const trace = new LedgerQuery(ledger).trace("T-b");
    assert.deepEqual(trace.map((e) => e.name), ["run.started", "context.loaded"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
