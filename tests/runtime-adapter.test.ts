import { test } from "node:test";
import assert from "node:assert/strict";

import {
  RAAP_VERSION,
  makeEnvelope,
  isRaapEnvelope,
  resetRaapSequences,
} from "../src/core/runtime/adapter.js";

test("RAAP contract: makeEnvelope produces valid envelopes with monotonic per-session seq", () => {
  resetRaapSequences();
  const a1 = makeEnvelope("s1", "prompt", { text: "hello" });
  const a2 = makeEnvelope("s1", "prompt", { text: "again" });
  const b1 = makeEnvelope("s2", "control", { op: "pause" });

  assert.equal(a1.raapVersion, RAAP_VERSION);
  assert.equal(a1.seq, 1);
  assert.equal(a2.seq, 2, "seq must increment within a session");
  assert.equal(b1.seq, 1, "seq is scoped per session");
  assert.notEqual(a1.envelopeId, a2.envelopeId);
  assert.ok(Date.parse(a1.ts) > 0, "timestamp must be ISO-parseable");

  // correlation + trace ids pass through
  const c = makeEnvelope("s1", "response", {}, {
    correlationId: a1.envelopeId,
    traceId: "trace-42",
  });
  assert.equal(c.correlationId, a1.envelopeId);
  assert.equal(c.traceId, "trace-42");
});

test("RAAP contract: isRaapEnvelope accepts valid and rejects malformed envelopes", () => {
  resetRaapSequences();
  const good = makeEnvelope("s1", "event", { any: true });
  assert.equal(isRaapEnvelope(good), true);

  assert.equal(isRaapEnvelope(null), false);
  assert.equal(isRaapEnvelope("nope"), false);
  assert.equal(isRaapEnvelope({}), false);

  const wrongVersion = { ...good, raapVersion: "9.9" };
  assert.equal(isRaapEnvelope(wrongVersion), false);

  const badType = { ...good, type: "gossip" };
  assert.equal(isRaapEnvelope(badType), false);

  const missingPayload = { ...good };
  delete (missingPayload as Record<string, unknown>).payload;
  assert.equal(isRaapEnvelope(missingPayload), false);
});

test("RAAP contract: resetRaapSequences restarts counters", () => {
  resetRaapSequences();
  makeEnvelope("sX", "heartbeat", null);
  makeEnvelope("sX", "heartbeat", null);
  resetRaapSequences();
  const after = makeEnvelope("sX", "heartbeat", null);
  assert.equal(after.seq, 1);
});
