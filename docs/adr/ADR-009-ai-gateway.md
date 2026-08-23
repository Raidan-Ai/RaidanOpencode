# ADR-009 — AI Gateway Composes With Existing Proxies

Status: Accepted · Date: 2026-08-23

## Context
User already operates a local OmniRoute proxy (localhost:20128) with capability aliases. Building a second gateway would duplicate it; depending solely on external gateways breaks local-first.

## Decision
Raidan Gateway is a thin metadata+policy layer: health probes, quota/cost accounting, capability classification, failover chains (primary→secondary→fallback→emergency). Provider endpoints may be direct OR any OpenAI/Anthropic-compatible gateway (OmniRoute, LiteLLM, OpenRouter, NIM). Agents never hard-code providers; they declare capability needs. Failover triggers ONLY on timeout/unavailable/rate-limit/capacity/explicit policy — never on answer quality.

## Consequences
+ Composes with user's existing infra day one
− Gateway cannot see inside opaque upstreams → health = endpoint-level probes + response metadata only
