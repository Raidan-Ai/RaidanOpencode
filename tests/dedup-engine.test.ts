import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DeduplicationEngine,
  jaccard,
  similarity,
} from "../src/core/dedup/engine.js";

const REVIEWER = {
  id: "skill-review",
  name: "Code Review Skill",
  purpose: "Review code changes for correctness and style",
  capabilities: ["code-review", "git"],
  keywords: ["review", "pull-request", "diff", "quality"],
  scope: "repo",
};

test("jaccard: identical sets = 1, disjoint = 0, empty handling", () => {
  assert.equal(jaccard(new Set(["a", "b"]), new Set(["a", "b"])), 1);
  assert.equal(jaccard(new Set(["a"]), new Set(["b"])), 0);
  assert.equal(jaccard(new Set(), new Set()), 1);
  assert.equal(jaccard(new Set(), new Set(["a"])), 0);
});

test("similarity: identical entities score 1, unrelated score near 0", () => {
  const a = { ...REVIEWER };
  const b = { ...REVIEWER, id: "x" };
  assert.equal(similarity(a, b), 1);

  const unrelated = {
    id: "y",
    name: "Deploy Bot",
    purpose: "Ship containers to production clusters",
    capabilities: ["deployment"],
    keywords: ["docker", "kubernetes"],
  };
  assert.ok(similarity(REVIEWER, unrelated) < 0.1);
});

test("dedup engine: empty registry yields CREATE with zero similarity", () => {
  const engine = new DeduplicationEngine();
  const d = engine.evaluate({ ...REVIEWER, id: undefined } as never);
  assert.equal(d.verdict, "CREATE");
  assert.equal(d.similarity, 0);
  assert.match(d.rationale, /registry is empty/);
});

test("dedup engine: near-identical proposal → REUSE", () => {
  const engine = new DeduplicationEngine();
  engine.register(REVIEWER);
  const d = engine.evaluate({
    name: "PR Review Helper",
    purpose: "Review pull request diffs for quality and correctness",
    capabilities: ["code-review", "git"],
    keywords: ["review", "pull-request", "diff"],
  });
  assert.equal(d.verdict, "REUSE");
  assert.equal(d.matchId, "skill-review");
  assert.ok(d.similarity >= 0.9);
});

test("dedup engine: close-but-narrower proposal → EXTEND", () => {
  const engine = new DeduplicationEngine();
  engine.register(REVIEWER);
  const d = engine.evaluate({
    name: "Diff Quality Check",
    purpose: "Check diff quality before merge",
    capabilities: ["code-review"],
    keywords: ["review", "diff"],
  });
  assert.equal(d.verdict, "EXTEND");
  assert.ok(d.similarity >= 0.7 && d.similarity < 0.9);
});

test("dedup engine: partial overlap same scope → MERGE; different scope → SPECIALIZE", () => {
  const base = {
    name: "Security Scanner",
    purpose: "Scan dependencies for known vulnerabilities",
    capabilities: ["security-scan", "dependencies"],
    keywords: ["security", "scan", "cve"],
  };

  const e1 = new DeduplicationEngine();
  e1.register({ ...base, id: "sec-scan", scope: "monorepo" });
  const merged = e1.evaluate({ ...base, scope: "monorepo" });
  assert.equal(merged.verdict, "MERGE");

  const e2 = new DeduplicationEngine();
  e2.register({ ...base, id: "sec-scan", scope: "monorepo" });
  const specialized = e2.evaluate({ ...base, scope: "mobile-apps" });
  assert.equal(specialized.verdict, "SPECIALIZE");
});

test("dedup engine: distant proposal → CREATE (with best-match reported)", () => {
  const engine = new DeduplicationEngine();
  engine.register(REVIEWER);
  const d = engine.evaluate({
    name: "Music Playlist Generator",
    purpose: "Generate party playlists from mood input",
    capabilities: ["media"],
    keywords: ["music", "playlist", "party"],
  });
  assert.equal(d.verdict, "CREATE");
  assert.equal(d.matchId, "skill-review");
  assert.ok(d.similarity < 0.5);
});

test("dedup engine: ties broken by id for determinism", () => {
  const engine = new DeduplicationEngine();
  engine.register({ ...REVIEWER, id: "b-twin" });
  engine.register({ ...REVIEWER, id: "a-twin" });

  const d = engine.evaluate({
    name: "Exact Review Clone",
    purpose: REVIEWER.purpose,
    capabilities: [...REVIEWER.capabilities],
    keywords: [...REVIEWER.keywords],
  });
  assert.equal(d.matchId, "a-twin");
});

test("dedup engine: custom thresholds shift verdicts", () => {
  const strict = new DeduplicationEngine({ reuse: 0.99, extend: 0.95, merge: 0.8 });
  strict.register(REVIEWER);
  const d = strict.evaluate({
    name: "PR Review Helper",
    purpose: "Review pull request diffs for quality and correctness",
    capabilities: ["code-review", "git"],
    keywords: ["review", "pull-request", "diff"],
  });
  // Same proposal that was REUSE at defaults drops below the stricter bars.
  assert.notEqual(d.verdict, "REUSE");
});
