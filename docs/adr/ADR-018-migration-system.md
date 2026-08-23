# ADR-018 - Migration Engine
Status: Accepted · Date: 2026-08-23
inspect>plan>backup>apply>verify>rollback; dry-run DEFAULT. Preserves: opencode config, agents, skills, MCP, commands, plugins, hooks, rules, models/providers, auth references, custom prompts (§88). Backups OUTSIDE repo (~/.raidan-opencode-backups) w/ manifest+hashes+changed-files; restore command provided. Idempotency: re-init detects existing components, never suffixes -1/-2 (§90).
Consequences: + user state sacred; confidence for adoption on existing machines; - apply step needs transactional file writer w/ rollback journal.
