import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConfigManager, resolveRefs, parseJsonc } from "../src/core/config/manager.js";
import { EventBus } from "../src/core/events/bus.js";
import { TaskEngine } from "../src/core/tasks/engine.js";
import { PolicyEngine } from "../src/core/policies/engine.js";
import { AgentRegistry, loadAgentFile } from "../src/core/agents/registry.js";
import { SkillRegistry } from "../src/core/skills/registry.js";

test("config: jsonc comments stripped", () => {
  const parsed = parseJsonc(`{ /* c */ "a": 1, // line\n "b": 2 }`);
  assert.deepEqual(parsed, { a: 1, b: 2 });
});

test("config: layered merge precedence", () => {
  const dir = mkdtempSync(join(tmpdir(), "raidan-cfg-"));
  try {
    writeFileSync(join(dir, "global.json"), JSON.stringify({ policies: { mode: "manual" }, telemetry: "off", extra: { a: 1 } }));
    writeFileSync(join(dir, "project.json"), JSON.stringify({ policies: { mode: "balanced" } }));
    const cfg = new ConfigManager({
      global: join(dir, "global.json"),
      project: join(dir, "project.json"),
    }).load();
    assert.equal(cfg.policies?.mode, "balanced"); // project overrides global
    assert.equal(cfg.telemetry, "off"); // global preserved
    assert.deepEqual((cfg.extra as Record<string, unknown>), { a: 1 });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("config: redactSecrets masks token-like keys but keeps env refs readable", () => {
  const mgr = new ConfigManager({});
  const out = mgr.redactSecrets({
    providers: { x: { apiKey: "supersecret", baseURL: "http://localhost:20128/v1" } },
    mcp: { github: { headers: { Authorization: "Bearer {env:GITHUB_TOKEN}" } } },
  } as never);
  assert.equal((out.providers as never as Record<string, { apiKey: string }>).x.apiKey, "{redacted}");
  assert.equal((out.providers as never as Record<string, { baseURL: string }>).x.baseURL, "http://localhost:20128/v1");
  assert.ok(JSON.stringify(out.mcp).includes("GITHUB_TOKEN")); // reference visible, value never existed
});

test("config: redactSecrets catches secrets under misleading field names", () => {
  const mgr = new ConfigManager({});
  // Synthetic tokens matching real-world shapes — never embed genuine credentials in tests.
  const fakeSk = "sk-" + "a".repeat(28);
  const fakeGhp = "ghp_" + "b".repeat(36);
  const out = mgr.redactSecrets({
    provider: {
      gw: {
        name: fakeSk,
        note: `see ${fakeGhp} inside text`,
        url: "http://localhost:20128/v1",
      },
    },
  } as never);
  const s = JSON.stringify(out);
  assert.ok(!s.includes(fakeSk), "sk-style key leaked");
  assert.ok(!s.includes("ghp_"), "ghp_ token leaked");
  assert.ok(s.includes("{redacted}"));
  assert.ok(s.includes("http://localhost:20128/v1"));
});

test("events: bus appends ledger and notifies wildcard", () => {
  const dir = mkdtempSync(join(tmpdir(), "raidan-ev-"));
  try {
    let seen = 0;
    const bus = new EventBus(join(dir, "events.jsonl"));
    bus.on("*", () => { seen++; });
    bus.emit("task.created", { title: "x" }, { taskId: "T-1" });
    bus.emit("task.completed", null, { taskId: "T-1" });
    assert.equal(seen, 2);
    const lines = readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n");
    assert.equal(lines.length, 2);
    assert.ok(JSON.parse(lines[0]).name === "task.created");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("tasks: lifecycle transitions + dependency guard", () => {
  const dir = mkdtempSync(join(tmpdir(), "raidan-tk-"));
  try {
    const eng = new TaskEngine(join(dir, "tasks.json"), new EventBus());
    const dep = eng.create("dependency");
    eng.transition(dep.id, "PLANNED");
    eng.transition(dep.id, "ASSIGNED");
    eng.transition(dep.id, "RUNNING");
    eng.transition(dep.id, "COMPLETED");

    const t = eng.create("main", { dependsOn: [dep.id] });
    assert.throws(() => { eng.transition(t.id, "RUNNING"); }); // CREATED->RUNNING illegal
    eng.transition(t.id, "ASSIGNED");
    eng.transition(t.id, "RUNNING");
    assert.equal(t.attempts >= 1, false); // local copy stale; re-read below
    assert.equal(eng.get(t.id)?.state, "RUNNING");
    eng.transition(t.id, "REVIEW");
    eng.transition(t.id, "APPROVAL");
    eng.transition(t.id, "COMPLETED");
    assert.equal(eng.get(t.id)?.state, "COMPLETED");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("policy: modes gate risk; destructive denied even in autonomous", () => {
  const supervised = new PolicyEngine(undefined, "supervised");
  assert.equal(supervised.evaluate("model-usage", "select-model").verdict, "ALLOW");
  assert.equal(supervised.evaluate("shell", "run-command").verdict, "ASK");
  const auto = new PolicyEngine(undefined, "autonomous");
  assert.equal(auto.evaluate("shell", "run-command").verdict, "ALLOW");
  assert.equal(auto.evaluate("filesystem", "rm -rf /").verdict, "DENY");
  assert.equal(auto.evaluate("secrets", "read-token").verdict, "ALLOW");
  const manual = new PolicyEngine(undefined, "manual");
  assert.equal(manual.evaluate("cost", "spend").verdict, "ASK");
});

test("agents: frontmatter contract parse + registry override by id", () => {
  const dir = mkdtempSync(join(tmpdir(), "raidan-ag-"));
  try {
    writeFileSync(
      join(dir, "researcher.md"),
      `---\nid: researcher\ndescription: Research specialist\nrole: research\ncapabilities: [web-research, synthesis]\nskills: [deep-research]\ntools: [webfetch, read]\nmodel: provider/fast-model\n---\nBody`,
    );
    const a = loadAgentFile(join(dir, "researcher.md"));
    assert.equal(a.id, "researcher");
    assert.deepEqual(a.capabilities, ["web-research", "synthesis"]);
    assert.equal(a.models.primary, "provider/fast-model");
    const reg = new AgentRegistry([dir]);
    assert.equal(reg.get("researcher")?.role, "research");
    assert.ok(reg.validate(a).length === 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("skills: duplicate detection across scopes", () => {
  const g = mkdtempSync(join(tmpdir(), "raidan-sk-g-"));
  const p = mkdtempSync(join(tmpdir(), "raidan-sk-p-"));
  try {
    for (const [root] of [[g], [p]] as const) {
      mkdirSkill(join(root, "my-skill"));
    }
    function mkdirSkill(d: string) {
      mkdirSync(d, { recursive: true });
      writeFileSync(join(d, "SKILL.md"), "---\nname: my-skill\ndescription: dup test\n---\nbody");
    }
    const reg = new SkillRegistry([
      { path: g, scope: "global" },
      { path: p, scope: "project" },
    ]);
    const dups = reg.findDuplicates();
    assert.equal(dups.length, 1);
    assert.equal(dups[0].name, "my-skill");
  } finally { rmSync(g, { recursive: true, force: true }); rmSync(p, { recursive: true, force: true }); }
});
