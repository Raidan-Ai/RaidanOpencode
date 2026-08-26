import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CapabilityRegistry,
  type Capability,
} from "../src/core/capabilities/registry.js";

function securityReview(): Capability {
  return {
    id: "security-review",
    name: "Security Review",
    description: "Review code for security vulnerabilities",
    level: "advanced",
    requiredTools: ["git", "filesystem"],
    riskLevel: "SENSITIVE",
    costClass: "medium",
    confidence: 0.9,
  };
}

test("capability registry: register/get/list with upsert semantics", () => {
  const reg = new CapabilityRegistry();
  reg.register(securityReview());

  const cap = reg.get("security-review");
  assert.ok(cap);
  assert.equal(cap.name, "Security Review");
  assert.equal(cap.confidence, 0.9);

  // Upsert replaces, never duplicates.
  reg.register({ ...securityReview(), name: "Security Review v2" });
  assert.equal(reg.list().length, 1);
  assert.equal(reg.get("security-review")?.name, "Security Review v2");

  assert.equal(reg.remove("security-review"), true);
  assert.equal(reg.get("security-review"), undefined);
  assert.equal(reg.list().length, 0);
});

test("capability registry: rejects malformed definitions", () => {
  const reg = new CapabilityRegistry();
  assert.throws(() => reg.register({ id: "", name: "x" }), /id is required/);
  assert.throws(
    () => reg.register({ id: "c1", name: "" } as Capability),
    /name is required/,
  );
});

test("capability graph: bind/unbind edges and both lookup directions", () => {
  const reg = new CapabilityRegistry();
  reg.register(securityReview());
  reg.bind({ subjectId: "agent-oc", subjectType: "agent", capabilityId: "security-review", score: 0.9 });
  reg.bind({ subjectId: "skill-sec", subjectType: "skill", capabilityId: "security-review", score: 0.7 });

  assert.equal(reg.bindingsFor("security-review").length, 2);
  assert.deepEqual(
    reg.capabilitiesOf("agent-oc").map((c) => c.id),
    ["security-review"],
  );

  // Re-bind same pair updates in place.
  reg.bind({ subjectId: "agent-oc", subjectType: "agent", capabilityId: "security-review", score: 0.95 });
  assert.equal(reg.bindingsFor("security-review").length, 2);
  assert.equal(reg.findCandidates({ capabilityId: "security-review" })[0].subjectId, "agent-oc");

  // Removing the capability drops its bindings.
  reg.remove("security-review");
  assert.equal(reg.bindingsFor("security-review").length, 0);

  // unbindSubject removes every edge of a subject.
  reg.register(securityReview());
  reg.bind({ subjectId: "a1", subjectType: "agent", capabilityId: "security-review" });
  reg.bind({ subjectId: "a1", subjectType: "runtime", capabilityId: "security-review" });
  assert.equal(reg.unbindSubject("a1"), 2);
});

test("capability graph: binding to unknown capability throws", () => {
  const reg = new CapabilityRegistry();
  assert.throws(
    () => reg.bind({ subjectId: "x", subjectType: "agent", capabilityId: "ghost" }),
    /unknown capability/,
  );
});

test("routing query: unknown capability yields no candidates", () => {
  const reg = new CapabilityRegistry();
  assert.deepEqual(reg.findCandidates({ capabilityId: "nope" }), []);
});

test("routing query: minLevel filters against capability's declared level", () => {
  const reg = new CapabilityRegistry();
  reg.register(securityReview()); // advanced
  reg.bind({ subjectId: "weak-agent", subjectType: "agent", capabilityId: "security-review" });

  assert.equal(reg.findCandidates({ capabilityId: "security-review" }).length, 1);
  assert.equal(
    reg.findCandidates({ capabilityId: "security-review", minLevel: "advanced" }).length,
    1,
    "advanced capability satisfies an advanced minimum",
  );
  assert.equal(
    reg.findCandidates({ capabilityId: "security-review", minLevel: "basic" }).length,
    1,
    "advanced satisfies basic minimum too",
  );

  // A basic-level capability cannot satisfy an advanced requirement.
  reg.register({ id: "lint", name: "Lint", level: "basic" });
  reg.bind({ subjectId: "linter", subjectType: "tool", capabilityId: "lint" });
  assert.equal(
    reg.findCandidates({ capabilityId: "lint", minLevel: "advanced" }).length,
    0,
  );
});

test("routing query: tool requirements filter candidates", () => {
  const reg = new CapabilityRegistry();
  reg.register(securityReview()); // requires git + filesystem
  reg.bind({ subjectId: "full", subjectType: "agent", capabilityId: "security-review", score: 0.8 });
  reg.bind({ subjectId: "partial", subjectType: "agent", capabilityId: "security-review", score: 0.99 });

  const all = reg.findCandidates({
    capabilityId: "security-review",
    withTools: ["git", "filesystem"],
  });
  assert.deepEqual(all.map((m) => m.subjectId), ["full"]);

  const gitOnly = reg.findCandidates({
    capabilityId: "security-review",
    withTools: ["git"],
  });
  assert.equal(gitOnly.length, 2);
});

test("routing query: results sorted by score desc, subjectTypes filter respected", () => {
  const reg = new CapabilityRegistry();
  reg.register({ id: "coding", name: "Coding", confidence: 1 });
  reg.bind({ subjectId: "b-agent", subjectType: "agent", capabilityId: "coding", score: 0.6 });
  reg.bind({ subjectId: "a-agent", subjectType: "agent", capabilityId: "coding", score: 0.9 });
  reg.bind({ subjectId: "model-x", subjectType: "model", capabilityId: "coding", score: 0.99 });

  const agentsOnly = reg.findCandidates({
    capabilityId: "coding",
    subjectTypes: ["agent"],
  });
  assert.deepEqual(agentsOnly.map((m) => m.subjectId), ["a-agent", "b-agent"]);

  const everyone = reg.findCandidates({ capabilityId: "coding" });
  assert.deepEqual(everyone.map((m) => m.subjectId), ["model-x", "a-agent", "b-agent"]);
});

test("routing query: scores clamp and combine binding score × confidence", () => {
  const reg = new CapabilityRegistry();
  reg.register({ id: "c", name: "C", confidence: 0.5 });
  reg.bind({ subjectId: "s1", subjectType: "agent", capabilityId: "c", score: 5 }); // clamps to 1
  reg.bind({ subjectId: "s2", subjectType: "agent", capabilityId: "c", score: -3 }); // clamps to 0

  const [top, bottom] = reg.findCandidates({ capabilityId: "c" });
  assert.equal(top.subjectId, "s1");
  assert.ok(Math.abs(top.score - 0.5) < 1e-9); // 1 × 0.5
  assert.equal(bottom.score, 0);
});

test("stats: counts capabilities, bindings, and per-type breakdown", () => {
  const reg = new CapabilityRegistry();
  reg.register({ id: "c1", name: "C1" });
  reg.register({ id: "c2", name: "C2" });
  reg.bind({ subjectId: "a", subjectType: "agent", capabilityId: "c1" });
  reg.bind({ subjectId: "r", subjectType: "runtime", capabilityId: "c1" });
  reg.bind({ subjectId: "m", subjectType: "model", capabilityId: "c2" });

  const s = reg.stats();
  assert.equal(s.capabilities, 2);
  assert.equal(s.bindings, 3);
  assert.equal(s.bySubjectType.agent, 1);
  assert.equal(s.bySubjectType.runtime, 1);
  assert.equal(s.bySubjectType.model, 1);
});
