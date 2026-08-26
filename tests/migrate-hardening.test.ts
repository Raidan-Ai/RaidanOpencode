import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { MigrationEngine } from "../src/core/migrate/engine.js";

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "raidan-mig-test-"));
  const sourceDir = join(root, "src-skills");
  const targetDir = join(root, "target", "skills");
  const statePath = join(root, "state", "install-state.json");
  mkdirSync(join(sourceDir, "demo"), { recursive: true });
  writeFileSync(join(sourceDir, "demo", "SKILL.md"), "# demo v1\n");
  return { root, sourceDir, targetDir, statePath };
}

test("migrate hardening: corrupt state file is quarantined and engine recovers", () => {
  const fx = makeFixture();
  const engine = new MigrationEngine(fx.statePath, fx.targetDir);

  // Corrupt the state file directly.
  mkdirSync(join(fx.statePath, ".."), { recursive: true });
  writeFileSync(fx.statePath, "{ this is not json !!!");

  const state = engine.loadState();
  assert.equal(state.version, 1);
  assert.equal(state.files.length, 0, "must fall back to a fresh manifest");

  // Evidence preserved, not destroyed.
  const dirEntries = require("node:fs").readdirSync(join(fx.statePath, ".."));
  assert.ok(
    dirEntries.some((n: string) => n.includes(".corrupt-")),
    `expected quarantine file, got: ${dirEntries.join(", ")}`,
  );

  // Engine remains fully usable after recovery.
  const steps = engine.plan(fx.sourceDir);
  assert.equal(steps.length, 1);
  const { copied } = engine.apply(steps);
  assert.equal(copied.length, 1);
  rmSync(fx.root, { recursive: true, force: true });
});

test("migrate hardening: ownership matching is case-insensitive across plan and apply", () => {
  const fx = makeFixture();
  const engine = new MigrationEngine(fx.statePath, fx.targetDir);

  // First install records ownership.
  engine.apply(engine.plan(fx.sourceDir));

  // Simulate a state written with different path casing (e.g. recorded on
  // another platform or by an older version).
  const raw = JSON.parse(readFileSync(fx.statePath, "utf8"));
  raw.files[0].dest = raw.files[0].dest.toUpperCase();
  writeFileSync(fx.statePath, JSON.stringify(raw));

  // Updated content must be treated as an OWNED update, not skipped as foreign.
  writeFileSync(join(fx.sourceDir, "demo", "SKILL.md"), "# demo v2\n");
  const result = engine.apply(engine.plan(fx.sourceDir));
  assert.equal(result.copied.length, 1, JSON.stringify(result));
  assert.equal(result.skipped.length, 0, JSON.stringify(result));
  assert.match(readFileSync(result.copied[0], "utf8"), /v2/);

  rmSync(fx.root, { recursive: true, force: true });
});

test("migrate hardening: backup + restore round-trips externally-modified files", () => {
  const fx = makeFixture();
  const engine = new MigrationEngine(fx.statePath, fx.targetDir);
  engine.apply(engine.plan(fx.sourceDir));
  const destFile = join(fx.targetDir, "demo", "SKILL.md");

  // External modification after install.
  writeFileSync(destFile, "# locally edited\n");

  // Backup captures the current (edited) content.
  const manifest = engine.backup([destFile]);
  assert.equal(manifest.entries.length, 1);
  assert.ok(existsSync(manifest.entries[0].backupFile));

  // Further mutation, then restore brings back the backed-up content.
  writeFileSync(destFile, "# clobbered\n");
  const restored = engine.restore(manifest);
  assert.deepEqual(restored, [destFile]);
  assert.match(readFileSync(destFile, "utf8"), /locally edited/);

  rmSync(fx.root, { recursive: true, force: true });
});

test("migrate hardening: rollback still only removes hash-verified owned files", () => {
  const fx = makeFixture();
  const engine = new MigrationEngine(fx.statePath, fx.targetDir);
  engine.apply(engine.plan(fx.sourceDir));
  const destFile = join(fx.targetDir, "demo", "SKILL.md");

  // Externally modified → rollback must leave it alone.
  writeFileSync(destFile, "# user edited, keep me\n");
  const removed = engine.rollback();
  assert.equal(removed.length, 0);
  assert.ok(existsSync(destFile), "externally modified file must survive rollback");
  assert.match(readFileSync(destFile, "utf8"), /keep me/);

  rmSync(fx.root, { recursive: true, force: true });
});
