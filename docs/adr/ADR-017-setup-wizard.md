# ADR-017 — Setup Wizard Shape

Status: Accepted · Date: 2026-08-23

## Context
Wizard requirements span 22 phases (spec §42) across 4 modes (quick/standard/advanced/headless). Ecosystem wizards range from deer-flow make-setup to ECC profiles; mega-prompt onboarding fails users.

## Decision
`raidan init|setup` = state-machine wizard, phases skippable, progressive disclosure (Recommended default · Advanced · Skip per section). Modes map to phase subsets:
- quick: env-check → opencode-detect → provider/model → core skills → security defaults
- standard: + embeddings/search/MCP/connectors/memory/notifications
- advanced: everything incl. RAG/deployment/teams
- headless: --config file (yaml/json/env), zero prompts, dry-run report first
Every mutating step: backup → apply → verify → record in install-state manifest. Re-runs are idempotent resumes.

## Consequences
+ Onboarding survives interruption; CI-testable via headless mode
− Wizard engine itself needs a test harness (phase fixtures)
