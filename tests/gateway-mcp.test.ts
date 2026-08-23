import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ModelRouter,
  type ModelEntry,
} from "../src/core/gateway/router.js";
import { McpRegistry } from "../src/core/mcp/registry.js";

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cat: ModelEntry[] = [
  { id: "a/coder", provider: "a", aliases: [], capabilities: ["coding", "tool-calling"], costTier: 3, latencyClass: "slow" },
  { id: "b/local", provider: "b", aliases: [], capabilities: ["coding", "fast", "cheap"], costTier: 0, latencyClass: "fast" },
  { id: "c/reasoner", provider: "c", aliases: [], capabilities: ["reasoning", "coding"], costTier: 2, latencyClass: "medium" },
];

test("router: hard capability filter excludes non-matching models", () => {
  const chain = new ModelRouter(cat).route({ requires: ["reasoning"] });
  assert.equal(chain.primary.id, "c/reasoner");
  assert.equal(chain.secondary, undefined); // only one reasoning-capable model
});

test("router: cost preference flips order toward cheap local", () => {
  const chain = new ModelRouter(cat).route({ requires: ["coding"], prefer: "cost" });
  assert.equal(chain.primary.id, "b/local");
  assert.equal(chain.secondary?.id, "c/reasoner");
});

test("router: default catalog routes fast need to omiroute best-fast", () => {
  const chain = ModelRouter.defaultCatalog();
  const r = new ModelRouter(chain).route({ requires: ["fast"] });
  assert.ok(r.primary.id.includes("best-fast") || r.primary.capabilities.includes("fast"));
  // full chain present
  assert.ok(r.emergency && r.fallback);
});

test("mcp registry: classifies env-ref remote as safe-ish, literal creds as HIGH", () => {
  const dir = mkdtempSync(join(tmpdir(), "raidan-mcp-"));
  try {
    writeFileSync(
      join(dir, "opencode.jsonc"),
      JSON.stringify({
        mcp: {
          github: {
            type: "remote",
            url: "https://api.githubcopilot.com/mcp/",
            headers: { Authorization: "Bearer {env:GITHUB_TOKEN}" },
          },
          evil: {
            type: "remote",
            url: "http://sketchy.example/mcp",
            headers: { Authorization: "Bearer ghp_REALISH0000000000000000000000000000" },
          },
        },
      }),
    );
    const reg = new McpRegistry(dir);
    const gh = reg.get("github");
    assert.equal(gh?.risk, "LOW");
    assert.equal(gh?.authMode, "env-ref");
    const evil = reg.get("evil");
    assert.equal(evil?.risk, "HIGH");
    assert.ok(evil?.risks.some((r) => r.includes("literal")));
    assert.ok(evil?.risks.some((r) => r.includes("non-https")));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
