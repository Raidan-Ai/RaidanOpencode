import { test } from "node:test";
import assert from "node:assert/strict";

import {
  WorkflowCompiler,
  WorkflowRegistry,
  builtinWorkflows,
} from "../src/core/workflows/engine.js";

function makeRegistry() {
  const reg = new WorkflowRegistry();
  for (const wf of builtinWorkflows()) reg.register(wf);
  return reg;
}

test("workflow registry: registers all 9 built-ins with valid structure", () => {
  const reg = makeRegistry();
  assert.equal(reg.list().length, 9);
  for (const id of [
    "feature-development",
    "bug-fix",
    "security-review",
    "research",
    "refactor",
    "release",
    "incident-response",
    "documentation",
    "migration",
  ]) {
    const wf = reg.get(id);
    assert.ok(wf, id);
    assert.ok(wf.stages.length >= 3, `${id} has stages`);
  }
});

test("workflow registry: rejects duplicates and malformed definitions", () => {
  const reg = new WorkflowRegistry();
  assert.throws(() => reg.register({ id: "", name: "x", description: "", stages: [{ id: "a", name: "A", role: "r" }] }), /id is required/);
  assert.throws(
    () => reg.register({ id: "w", name: "x", description: "", stages: [] }),
    /at least one stage/,
  );
  reg.register({ id: "w", name: "x", description: "", stages: [{ id: "a", name: "A", role: "r" }] });
  assert.throws(
    () =>
      reg.register({
        id: "w2",
        name: "y",
        description: "",
        stages: [
          { id: "a", name: "A", role: "r" },
          { id: "a", name: "B", role: "r" },
        ],
      }),
    /duplicate stage id/,
  );
});

test("compiler: explicit workflowId compiles a sequential chain by default", () => {
  const compiler = new WorkflowCompiler(makeRegistry());
  const out = compiler.compile("whatever", { workflowId: "bug-fix" });

  assert.equal(out.workflowId, "bug-fix");
  assert.equal(out.matchedBy, "explicit");
  assert.deepEqual(out.waves, [["reproduce"], ["diagnose"], ["fix"], ["verify"], ["review"]]);

  const fix = out.nodes.find((n) => n.id === "fix")!;
  assert.deepEqual(fix.dependsOn, ["diagnose"]);
});

test("compiler: keyword matching selects the right template", () => {
  const compiler = new WorkflowCompiler(makeRegistry());

  const cases: Array<[string, string]> = [
    ["Fix the login crash on empty password", "bug-fix"],
    ["Audit the auth module for security vulnerabilities", "security-review"],
    ["Research and compare vector databases", "research"],
    ["Refactor the gateway router for clarity", "refactor"],
    ["Prepare the v0.7 release and publish", "release"],
    ["Migrate config to the new schema", "migration"],
    ["Write documentation for the CLI", "documentation"],
    ["Production outage — hotfix now", "incident-response"],
  ];
  for (const [objective, expected] of cases) {
    const out = compiler.compile(objective);
    assert.equal(out.workflowId, expected, `objective: ${objective}`);
    assert.equal(out.matchedBy, "keyword");
  }
});

test("compiler: unmatched objective falls back to feature-development", () => {
  const compiler = new WorkflowCompiler(makeRegistry());
  const out = compiler.compile("do the thing");
  assert.equal(out.workflowId, "feature-development");
  assert.equal(out.matchedBy, "keyword");
});

test("compiler: parallelGroup members share one wave after the barrier", () => {
  const reg = new WorkflowRegistry();
  reg.register({
    id: "parallel-demo",
    name: "Parallel Demo",
    description: "",
    stages: [
      { id: "plan", name: "Plan", role: "planner" },
      { id: "backend", name: "Backend", role: "implementer", parallelGroup: "build" },
      { id: "frontend", name: "Frontend", role: "implementer", parallelGroup: "build" },
      { id: "docs", name: "Docs", role: "documenter", parallelGroup: "build" },
      { id: "integrate", name: "Integrate", role: "tester" },
    ],
  });

  const out = new WorkflowCompiler(reg).compile("x", { workflowId: "parallel-demo" });
  assert.deepEqual(out.waves, [["plan"], ["backend", "docs", "frontend"], ["integrate"]]);

  // All group members depend only on the barrier node.
  for (const id of ["backend", "frontend", "docs"]) {
    const n = out.nodes.find((x) => x.id === id)!;
    assert.deepEqual(n.dependsOn, ["plan"]);
  }
  assert.deepEqual(out.nodes.find((n) => n.id === "integrate")!.dependsOn, ["frontend"]);
});

test("compiler: approval gates survive compilation", () => {
  const compiler = new WorkflowCompiler(makeRegistry());
  const release = compiler.compile("ship it", { workflowId: "release" });
  const approve = release.nodes.find((n) => n.id === "approve")!;
  assert.equal(approve.approvalGate, true);
  assert.equal(approve.role, "human");

  const migration = compiler.compile("migrate db", { workflowId: "migration" });
  assert.equal(migration.nodes.find((n) => n.id === "approve")!.approvalGate, true);

  const feature = compiler.compile("add feature", { workflowId: "feature-development" });
  assert.equal(feature.nodes.every((n) => !n.approvalGate), true);
});

test("compiler: unknown explicit workflow throws", () => {
  const compiler = new WorkflowCompiler(makeRegistry());
  assert.throws(() => compiler.compile("x", { workflowId: "ghost" }), /unknown workflow/);
});
