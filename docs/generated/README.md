# Generated State Documentation

Per ARCHITECTURE.md §79, the setup wizard and `raidan doctor` will generate a snapshot of the local installation into this directory:

```
installed-agents.md
installed-skills.md
installed-mcp.md
installed-a2a.md
installed-models.md
installed-providers.md
installed-connectors.md
installed-runtimes.md
installed-config.md
```

## Policy

1. **Never commit these files** — they describe one machine's state. This README is the only permanent resident.
2. **Never include secrets** — generated docs list *what* is configured (names, endpoints, capability flags), never keys or tokens.
3. Generated files are regenerated wholesale on every doctor run; manual edits are discarded by design.
4. `raidan export` packages these snapshots (minus secrets) for support and reproduction.

Nothing here yet — generation lands with the setup wizard (ROADMAP Phase 2).
