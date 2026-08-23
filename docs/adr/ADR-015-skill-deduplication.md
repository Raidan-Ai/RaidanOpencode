# ADR-015 - Skill Deduplication & Registry
Status: Accepted · Date: 2026-08-23
Source priority ladder (§50): installed-quality > opencode-native > maintained-OSS > compatible > local-adaptation > new-custom. Compression rule (§14): minimum skills maximum capability. Ship: AGENT_SKILL_REGISTRY.yaml (+md), ownership manifest, pinned-source lockfile (omni-skills MECHANICS only - content unlicensed), idempotent installer. User inventory (1564 skills) preserved untouched; duplicates flagged not deleted (§52).
Consequences: + no skill-1 skill-2 proliferation; - curated subset requires editorial maintenance each release.
