# ADR-008 - Model Router
Status: Accepted · Date: 2026-08-23
Routing by declared need, never hard-coded names: inputs per spec §25 (task type/complexity, role, capabilities incl. vision/audio/tool-calling/structured-output, context, latency, cost, health, quota, preferences). Chains primary>secondary>fallback>emergency; transitions policy-controlled + model.switched events. Classification taxonomy per §130 maintained in providers/catalog.yaml.
Consequences: + provider portability; cost-aware defaults (never auto-pick most expensive); - catalog upkeep burden.
