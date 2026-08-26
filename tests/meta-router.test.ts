import { test } from "node:test";
import assert from "node:assert/strict";

import { CapabilityRegistry } from "../src/core/capabilities/registry.js";
import {
  DEFAULT_WEIGHTS,
  MetaRouter,
  normalizeWeights,
} from "../src/core/routing/meta-router.js";

function buildRegistry() {
  const reg = new CapabilityRegistry();
  reg.register({ id: "coding", name: "Coding", level: "advanced", confidence: 1 });
  reg.register({ id: "review", name: "Code Review", level: "intermediate", confidence: 0.8 });
  reg.register({ id: "security-review", name: "Security Review", level: "advanced", confidence: 0.9 });

  // One agent holds two capabilities → team size must count it once.
  reg.bind({ subjectId: "agent-oc", subjectType: "agent", capabilityId: "coding", score: 0.9 });
  reg.bind({ subjectId: "agent-oc", subjectType: "agent", capabilityId: "review", score: 0.7 });
  reg.bind({ subjectId: "agent-sec", subjectType: "agent", capabilityId: "security-review", score: 0.95 });
  reg.bind({ subjectId: "agent-sec2", subjectType: "agent", capabilityId: "security-review", score: 0.6 });
  return reg;
}

test("meta router: default weights match blueprint §11 and normalize to 1", () => {
  const w = normalizeWeights(DEFAULT_WEIGHTS);
  const sum = w.quality + w.reliability + w.cost + w.latency + w.risk + w.context;
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.equal(w.quality, 0.4);
});

test("meta router: normalizes arbitrary weights proportionally", () => {
  const w = normalizeWeights({ quality: 2, reliability: 2, cost: 2, latency: 2, risk: 2, context: 2 });
  assert.ok(Math.abs(w.quality - 1 / 6) < 1e-9);

  // Degenerate all-zero input falls back to defaults.
  const z = normalizeWeights({ quality: 0, reliability: 0, cost: 0, latency: 0, risk: 0, context: 0 });
  assert.equal(z.quality, DEFAULT_WEIGHTS.quality);
});

test("meta router: assigns best primary per requirement with fallbacks", () => {
  const router = new MetaRouter(buildRegistry());
  const plan = router.route({
    requirements: [{ capabilityId: "security-review" }],
    fallbacksPerRequirement: 1,
  });

  assert.equal(plan.unresolved.length, 0);
  assert.equal(plan.assignments.length, 1);

  const a = plan.assignments[0];
  assert.equal(a.primary?.subjectId, "agent-sec");
  assert.deepEqual(a.fallbacks.map((f) => f.subjectId), ["agent-sec2"]);
});

test("meta router: unique subjects collapse into minimum sufficient team", () => {
  const router = new MetaRouter(buildRegistry());
  const plan = router.route({
    requirements: [
      { capabilityId: "coding" },
      { capabilityId: "review" },          // same agent-oc
      { capabilityId: "security-review" }, // agent-sec
    ],
  });

  assert.equal(plan.unresolved.length, 0);
  assert.equal(plan.teamSize, 2, "3 assignments across 2 unique agents");
  assert.equal(plan.workspaceStrategy, "isolated-worktree");
});

test("meta router: single-agent plan uses shared workspace", () => {
  const reg = new CapabilityRegistry();
  reg.register({ id: "docs", name: "Docs" });
  reg.bind({ subjectId: "writer", subjectType: "agent", capabilityId: "docs" });

  const plan = new MetaRouter(reg).route({ requirements: [{ capabilityId: "docs" }] });
  assert.equal(plan.teamSize, 1);
  assert.equal(plan.workspaceStrategy, "shared");
});

test("meta router: tracks unresolved capabilities explicitly", () => {
  const router = new MetaRouter(buildRegistry());
  const plan = router.route({
    requirements: [
      { capabilityId: "coding" },
      { capabilityId: "quantum-alchemy" }, // nobody has it
    ],
  });

  assert.deepEqual(plan.unresolved, ["quantum-alchemy"]);
  const ghost = plan.assignments.find((a) => a.capabilityId === "quantum-alchemy");
  assert.ok(ghost);
  assert.equal(ghost.primary, null);
  assert.deepEqual(ghost.fallbacks, []);
});

test("meta router: subjectTypes filter restricts the candidate pool", () => {
  const reg = buildRegistry();
  reg.bind({ subjectId: "model-big", subjectType: "model", capabilityId: "coding", score: 0.99 });

  const agentsOnly = new MetaRouter(reg).route({
    requirements: [{ capabilityId: "coding" }],
    subjectTypes: ["agent"],
  });
  assert.equal(agentsOnly.assignments[0].primary?.subjectId, "agent-oc");

  const modelsWelcome = new MetaRouter(reg).route({
    requirements: [{ capabilityId: "coding" }],
    subjectTypes: ["agent", "model"],
  });
  assert.equal(modelsWelcome.assignments[0].primary?.subjectId, "model-big");
});

test("meta router: deterministic for identical registry state and input", () => {
  const r1 = new MetaRouter(buildRegistry()).route({
    requirements: [{ capabilityId: "security-review" }, { capabilityId: "coding" }],
  });
  const r2 = new MetaRouter(buildRegistry()).route({
    requirements: [{ capabilityId: "security-review" }, { capabilityId: "coding" }],
  });

  assert.deepEqual(
    r1.assignments.map((a) => [a.capabilityId, a.primary?.subjectId]),
    r2.assignments.map((a) => [a.capabilityId, a.primary?.subjectId]),
  );
  assert.equal(r1.teamSize, r2.teamSize);
  assert.equal(r1.workspaceStrategy, r2.workspaceStrategy);
});

test("meta router: custom weights are recorded on the plan (observability)", () => {
  const router = new MetaRouter(buildRegistry(), { quality: 10, cost: 30 });
  const plan = router.route({ requirements: [] });
  assert.ok(Math.abs(plan.weights.quality - 0.25) < 1e-9); // 10/40
  assert.ok(Math.abs(plan.weights.cost - 0.75) < 1e-9);   // 30/40
  assert.ok(Date.parse(plan.generatedAt) > 0);
});
