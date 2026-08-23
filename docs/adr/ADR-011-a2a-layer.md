# ADR-011 — A2A as External Interop Only

Status: Accepted · Date: 2026-08-23

## Context
No researched project implements Google A2A; ecosystems invented proprietary protocols (AMP/AID/AAP) or used ACP. Spec §22 mandates: internal collaboration via native task/message system; external interop via A2A; MCP stays the tool plane. A2A v1.0.0 is now stable (LF).

## Decision
Implement A2A adapter (HTTP+JSON binding first): Agent Card publishing our capabilities, SendMessage/task ops bridged to OpenCode sessions (taskId↔sessionId), SSE bridging from /event stream, permission prompts mapped to auth-required states. MCP and A2A remain SEPARATE registries/subsystems. AMP-style protocols rejected (lock-in); ACP deferred (editor-oriented).

## Consequences
+ Standards-based interop with the wider agent ecosystem
+ Clean separation prevents protocol collapse
− We are early; SDK maturity unverified → implement against spec directly, conformance-test in CI later
