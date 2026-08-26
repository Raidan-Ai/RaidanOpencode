import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PromptCompiler,
  PromptFragmentRegistry,
} from "../src/core/prompt/compiler.js";

function buildRegistry() {
  const reg = new PromptFragmentRegistry();
  reg.register({
    id: "sec-never-secrets",
    category: "security",
    content: "Never print, log, or exfiltrate secrets.",
    priority: 10,
  });
  reg.register({
    id: "sec-scope",
    category: "security",
    content: "Stay inside the declared workspace; no paths outside it.",
    priority: 20,
  });
  reg.register({
    id: "git-conventional",
    category: "git",
    content: "Use conventional commit messages.",
  });
  return reg;
}

test("prompt compiler: assembles all sections in canonical order", () => {
  const compiler = new PromptCompiler(buildRegistry());
  const out = compiler.compile({
    task: "Fix the login race condition",
    agentProfile: {
      id: "agent-oc",
      role: "backend engineer",
      constraints: ["No new dependencies"],
    },
    runtime: "opencode",
    contextBlocks: ["Auth uses JWT with 15m expiry."],
    skillHints: ["tdd-discipline", "systematic-debugging"],
    successCriteria: ["Failing test added first", "All tests pass"],
    workspacePolicy: "shared workspace; commit to feature branch only",
  });

  const titles = out.sections.map((s) => s.title);
  assert.deepEqual(titles, [
    "IDENTITY",
    "TASK",
    "CONTEXT",
    "SKILLS",
    "CONSTRAINTS",
    "SECURITY POLICY",
    "SUCCESS CRITERIA",
    "WORKSPACE",
  ]);

  assert.match(out.prompt, /## SECURITY POLICY/);
  assert.match(out.prompt, /Never print, log, or exfiltrate secrets/);
  assert.ok(out.warnings.length === 0, JSON.stringify(out.warnings));
  assert.equal(out.charCount, out.prompt.length);
});

test("prompt compiler: minimal input compiles with identity omitted", () => {
  const compiler = new PromptCompiler(buildRegistry());
  const out = compiler.compile({ task: "Summarize the diff" });

  const titles = out.sections.map((s) => s.title);
  assert.ok(!titles.includes("IDENTITY"));
  assert.deepEqual(titles, ["TASK", "SECURITY POLICY"]);
});

test("prompt compiler: empty task is rejected", () => {
  const compiler = new PromptCompiler(buildRegistry());
  assert.throws(() => compiler.compile({ task: "   " }), /task is required/);
});

test("prompt compiler: missing security fragments produces explicit warning", () => {
  const emptyReg = new PromptFragmentRegistry();
  const compiler = new PromptCompiler(emptyReg);
  const out = compiler.compile({ task: "do a thing" });

  assert.equal(
    out.warnings.some((w) => w.includes("no security policy fragments")),
    true,
    JSON.stringify(out.warnings),
  );
  assert.ok(!out.sections.some((s) => s.title === "SECURITY POLICY"));
});

test("prompt compiler: duplicate extra fragment included once with warning", () => {
  const compiler = new PromptCompiler(buildRegistry());
  const out = compiler.compile({
    task: "task",
    extraFragmentIds: ["git-conventional", "git-conventional"],
  });

  assert.equal(
    out.warnings.filter((w) => w.includes("duplicate fragment")).length,
    1,
  );
  assert.equal(out.prompt.split("Use conventional commit messages.").length - 1, 1);
});

test("prompt compiler: unknown extra fragment warns and skips", () => {
  const compiler = new PromptCompiler(buildRegistry());
  const out = compiler.compile({ task: "task", extraFragmentIds: ["ghost"] });
  assert.equal(out.warnings.some((w) => w.includes('"ghost" not found')), true);
});

test("prompt compiler: char budget exceeded produces warning", () => {
  const compiler = new PromptCompiler(buildRegistry());
  const bigContext = Array.from({ length: 50 }, (_, i) => `context block ${i} — ${"x".repeat(200)}`);
  const out = compiler.compile({ task: "task", contextBlocks: bigContext, maxChars: 2000 });

  assert.equal(
    out.warnings.some((w) => w.includes("exceeds budget")),
    true,
    JSON.stringify(out.warnings),
  );
});

test("prompt compiler: deterministic output for identical input", () => {
  const mk = () =>
    new PromptCompiler(buildRegistry()).compile({
      task: "Refactor router",
      agentProfile: { id: "a1", role: "engineer" },
      skillHints: ["x"],
    });
  const a = mk();
  const b = mk();
  assert.equal(a.prompt, b.prompt);
  assert.deepEqual(a.warnings, b.warnings);
});

test("fragment registry: rejects malformed fragments and sorts by priority", () => {
  const reg = new PromptFragmentRegistry();
  assert.throws(() => reg.register({ id: "", category: "git", content: "x" }), /id is required/);
  assert.throws(
    () => reg.register({ id: "f", category: "git", content: "  " }),
    /content is required/,
  );

  reg.register({ id: "late", category: "testing", content: "B" });
  reg.register({ id: "early", category: "testing", content: "A", priority: 5 });
  assert.deepEqual(reg.byCategory("testing").map((f) => f.id), ["early", "late"]);
});
