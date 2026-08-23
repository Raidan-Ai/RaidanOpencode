# Contributing to RaidanOpencode

Thanks for considering a contribution.

## Ground rules
1. **Research before implementation** — check docs/research + ADRs; if your idea touches a canonical subsystem, open an issue referencing the relevant ADR first.
2. **One of each** — no second orchestrator/task-engine/dashboard. Proposals must deduplicate against existing plans.
3. **Windows parity mandatory** — no POSIX-only code paths in core; CI runs ubuntu + windows.
4. **Secrets discipline** — never commit tokens; use `{env:}` refs; CI scans.
5. **License hygiene** — new dependencies need license entry in THIRD_PARTY_NOTICES.md; AGPL/SUL/no-license sources are inspiration-only.

## Workflow
```bash
git checkout -b feature/my-change
npm install
npm run typecheck && npm test   # 9+ tests must stay green
node dist/src/cli/index.js doctor
```

## Commits
Conventional commits: `feat(core): ...`, `docs(adr): ...`, `fix(cli): ...`, `ci: ...`.

## Tests
Node built-in test runner (`node:test`). Add tests in `tests/core.test.ts`; keep the single-file suite or update the npm script when adding files. Every bug fix ships with a regression test.
