import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ContextEngine, estimateTokens } from "../src/core/context/engine.js";
import { MemoryEngine } from "../src/core/memory/engine.js";
import { TeamEngine } from "../src/core/teams/engine.js";
import {
  Orchestrator,
  classify,
  routeFor,
  selectAgents,
} from "../src/core/orchestration/orchestrator.js";
import type { AgentContract } from "../src/core/agents/registry.js";
import { TaskEngine } from "../src/core/tasks/engine.js";
import { EventBus } from "../src/core/events/bus.js";

function tempStore(name: string): string {
  return join(mkdtempSync(join(tmpdir(), `raidan-${name}-`)), `${name}.json`);
}

test("context: estimateTokens uses chars/4", () => {
  assert.equal(estimateTokens("abcdefgh"), 2);
  assert.equal(estimateTokens("abc"), 1);
});

test("context: assemble packs highest-scoring entries within budget and defers rest (MVI)", () => {
  const path = tempStore("ctx");
  const eng = new ContextEngine(path);
  const big = eng.upsert({ layer: "project", title: "big doc", content: "x".repeat(4000), priority: 3 });
  const small = eng.upsert({ layer: "task", title: "small note auth flow", content: "auth flow details".repeat(4), priority: 8 });
  const r = eng.assemble({ keywords: ["auth"], budgetTokens: 50 });
  assert.ok(r.included.some((e) => e.id === small.id), "high-scoring small entry included");
  assert.ok(r.deferred.some((e) => e.id === big.id) || r.included.some((e) => e.id === big.id));
  assert.equal(r.included.length + r.deferred.length, 2);
  assert.ok(r.tokensUsed <= r.budgetTokens);
});

test("context: write gate refuses overflow store", () => {
  const path = tempStore("ctxfull");
  const eng = new ContextEngine(path, undefined, 1);
  eng.upsert({ layer: "system", title: "a", content: "a" });
  assert.throws(() => eng.upsert({ layer: "system", title: "b", content: "b" }), /context store full/);
});

test("context: upsert by id updates instead of duplicating", () => {
  const eng = new ContextEngine(tempStore("ctxupd"));
  const e = eng.upsert({ id: "fixed-id", layer: "system", title: "v1", content: "one" });
  eng.upsert({ id: "fixed-id", layer: "system", title: "v2", content: "two" });
  assert.equal(eng.get(e.id)?.title, "v2");
  assert.equal(eng.list().length, 1);
});

test("memory: dedup gate merges same content instead of duplicating", () => {
  const eng = new MemoryEngine(tempStore("mem"));
  const a = eng.write({ type: "working", content: "user prefers TypeScript" });
  const b = eng.write({ type: "working", content: "User prefers TYPESCRIPT!" });
  assert.equal(b.updated, true);
  assert.equal(b.item.id, a.item.id);
  assert.equal(b.gateApplied, "dedup");
  assert.equal(eng.list().length, 1);
});

test("memory: long-term write gate requires importance floor unless forced", () => {
  const eng = new MemoryEngine(tempStore("memgate"));
  assert.throws(
    () => eng.write({ type: "semantic", content: "fact", importance: 0.1 }),
    /write-gate/,
  );
  const ok = eng.write({ type: "semantic", content: "fact", importance: 0.9 });
  assert.equal(ok.updated, false);
  const forced = eng.write({ type: "semantic", content: "low fact force", importance: 0.05 }, { force: true });
  assert.equal(forced.item.importance, 0.05);
});

test("memory: ranked retrieval orders keyword+recency+importance and touches accessCount", () => {
  const eng = new MemoryEngine(tempStore("memrank"));
  eng.write({ type: "episodic", content: "deploy pipeline broken on windows runner", importance: 0.6 });
  eng.write({ type: "episodic", content: "lunch order was pizza", importance: 0.5 });
  const rows = eng.search("deploy pipeline windows");
  assert.ok(rows[0].content.includes("deploy"));
  const first = rows.find((m) => m.content.includes("deploy"))!;
  assert.ok(first.accessCount >= 1);
});

test("memory: capacity gate evicts lowest vitality item of that type", () => {
  const eng = new MemoryEngine(tempStore("memcap"));
  const low = eng.write({ type: "working", content: "weak old memory alpha", importance: 0.1 });
  eng.write({ type: "working", content: "strong recent memory beta", importance: 0.95 });
  const r = eng.write(
    { type: "working", content: "third incoming memory gamma", importance: 0.8 },
    { maxPerType: 2 },
  );
  assert.equal(r.evicted?.id, low.item.id);
  assert.equal(r.gateApplied, "capacity-evict");
  assert.equal(eng.list("working").length, 2);
});

test("teams: org tree membership, lead rules, escalation path", () => {
  const eng = new TeamEngine(tempStore("teams"));
  const org = eng.create("org", { id: "org" });
  const arch = eng.create("architecture", { parentId: org.id, id: "arch-team" });
  eng.addMember(arch.id, "agent-a");
  assert.throws(() => eng.setLead(arch.id, "agent-b"), /lead must be a member/);
  eng.setLead(arch.id, "agent-a");
  eng.addMember(org.id, "agent-org");
  assert.deepEqual(eng.pathToRoot(arch.id).map((t) => t.id), ["arch-team", "org"]);
  assert.equal(eng.checkDelegation(arch.id, "agent-a").ok, true);
  assert.equal(eng.checkDelegation(arch.id, "stranger").ok, false);
  assert.equal(eng.escalationPath(arch.id)[0].leadAgentId, "agent-a");
});

test("orchestrator: deterministic L0-L4 classification", () => {
  assert.equal(classify("[L0] anything").level, "L0");
  assert.equal(classify("fix typo in readme").level, "L0");
  assert.ok(["L1"].includes(classify("add validation to login form").level));
  assert.ok(["L2", "L3"].includes(classify("implement feature module across multiple files with api integration").level));
  assert.equal(classify("refactor architecture of the billing subsystem").level, "L3");
  assert.equal(classify("rewrite entire platform from scratch").level, "L4");
});

test("orchestrator: routes map complexity to plans", () => {
  assert.deepEqual(routeFor("L0").steps, ["execute"]);
  assert.equal(routeFor("L3").approvalRequired, true);
  assert.equal(routeFor("L4").maxParallelAgents, 8);
  assert.equal(routeFor("L2").mode, "plan-specialists");
});

test("orchestrator: plan creates task with classified complexity and emits run.started", () => {
  const dir = mkdtempSync(join(tmpdir(), "raidan-orch-"));
  try {
    const bus = new EventBus(join(dir, "ledger.jsonl"));
    let started = 0;
    bus.on("run.started", () => { started++; });
    const tasks = new TaskEngine(join(dir, "tasks.json"), bus);
    const orch = new Orchestrator(tasks, bus);
    const r = orch.plan("add dark mode toggle");
    const t = tasks.get(r.taskId)!;
    assert.equal(t.complexity, "L1");
    assert.equal(started, 1);
    assert.equal(t.state, "CREATED");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("orchestrator: selectAgents ranks capability overlap, prefers specialists on ties", () => {
  const wide: AgentContract = {
    id: "generalist",
    capabilities: ["typescript", "react", "node", "devops", "security"],
    skills: [], tools: [], models: {}, autonomy: "balanced", permissions: {}, sourcePath: "",
  };
  const narrow: AgentContract = {
    id: "react-specialist",
    capabilities: ["react"],
    skills: [], tools: [], models: {}, autonomy: "supervised", permissions: {}, sourcePath: "",
  };
  const none: AgentContract = {
    id: "unrelated",
    capabilities: ["cooking"],
    skills: [], tools: [], models: {}, autonomy: "manual", permissions: {}, sourcePath: "",
  };
  const picked = selectAgents([wide, narrow, none], ["react"]);
  assert.equal(picked[0].agent.id, "react-specialist");
  assert.equal(picked[0].matchScore, 1);
  assert.ok(!picked.some((p) => p.agent.id === "unrelated"));
});

test("tasks: assign transitions CREATED->ASSIGNED and respects dependency guard", () => {
  const dir = mkdtempSync(join(tmpdir(), "raidan-assign-"));
  try {
    const tasks = new TaskEngine(join(dir, "tasks.json"));
    const dep = tasks.create("dependency");
    const t = tasks.create("child task", { dependsOn: [dep.id] });
    assert.throws(() => tasks.assign(t.id, "agent-x"), /dependency .* not COMPLETED/);
    tasks.transition(dep.id, "ASSIGNED");
    tasks.transition(dep.id, "RUNNING");
    tasks.transition(dep.id, "COMPLETED");
    const assigned = tasks.assign(t.id, "agent-x");
    assert.equal(assigned.state, "ASSIGNED");
    assert.equal(assigned.assigneeAgentId, "agent-x");
    assert.throws(() => tasks.assign(dep.id, "agent-y"), /illegal transition COMPLETED -> ASSIGNED/);
    const persisted = JSON.parse(readFileSync(join(dir, "tasks.json"), "utf8"));
    assert.ok(Array.isArray(persisted) && persisted.length === 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
