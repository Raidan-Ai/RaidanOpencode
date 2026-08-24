import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chat,
  executeTool,
  invokeAgentTurn,
  withSpan,
} from "../src/core/observability/tracing.js";

const identity = {
  agentName: "test-agent",
  agentId: "test-agent-local",
  conversationId: "conv-test",
};

test("tracing facade no-ops outside Workers and preserves results", async () => {
  const result = await invokeAgentTurn(identity, async () =>
    chat(identity, "model/x", async () => "chat-ok"),
  );
  assert.equal(result, "chat-ok");
});

test("tracing facade propagates errors unchanged", async () => {
  await assert.rejects(
    withSpan("boom", undefined, async () => {
      throw new Error("kapow");
    }),
    /kapow/,
  );
});

test("executeTool runs the approval gate before the tool", async () => {
  const order: string[] = [];
  const out = await executeTool(
    identity,
    "write_file",
    async () => {
      order.push("run");
      return "done";
    },
    () => {
      order.push("approve");
      return true;
    },
  );
  assert.equal(out, "done");
  assert.deepEqual(order, ["approve", "run"]);
});

test("executeTool rejects execution when approval denies", async () => {
  await assert.rejects(
    executeTool(identity, "deploy_prod", async () => "should-not-run", () => false),
    /approval gate/,
  );
});
