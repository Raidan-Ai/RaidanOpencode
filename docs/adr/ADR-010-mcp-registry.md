# ADR-010 - MCP Registry
Status: Accepted · Date: 2026-08-23
OpenCode IS the MCP client; Raidan governs it. Registry adds provenance/license/source/permission-surface/risk-rating/health metadata over native config entries; third-party servers default WARN until reviewed; dangerous surface => ASK via Policy Engine (§48). No second MCP client implementation.
Consequences: + security posture without reinventing transport; - governance metadata lives beside (not inside) OpenCode config, synced by migration engine.
