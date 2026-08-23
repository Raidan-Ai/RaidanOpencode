# Security Policy

## Reporting a vulnerability

Report privately via GitHub Security Advisories ("Report a vulnerability" on this repo) or the contact links in README. Do NOT open public issues for security reports. You will get a response within 72 hours; coordinated disclosure timeline agreed case-by-case.

## Design guarantees

1. **No secrets in code or config.** All credentials resolve via `{env:VAR}` / `{file:path}` references at runtime.
2. **Redaction by default.** `raidan config show` masks key-named fields AND value-patterns (`sk-*`, `ghp_*`, `gho_*`, `xox*`, `AKIA*`) wherever they appear, including under misleading field names (regression-tested).
3. **Destructive-action denial.** The Policy Engine denies destructive patterns (`rm -rf`, force-push, format…) even in `autonomous` mode; everything else is mode-gated (manual/supervised/balanced/autonomous).
4. **Backup before mutation.** Migration/config writes create timestamped backups outside any git repository before changing anything.
5. **Telemetry OFF by default.** No prompts, source code, or credentials ever leave the machine.
6. **Audit ledger.** Approval requests/rejections and task lifecycle transitions append to a local JSONL event ledger.
7. **CI secret scanning.** Every push scans tracked sources for token patterns.

## Known limitations (honesty section)

- v0.3 Policy Engine evaluates locally-declared actions only; interception of live OpenCode permission events lands with the plugin integration phase.
- MCP server trust is metadata-only until the registry review workflow ships; third-party servers should be treated as untrusted input surfaces today.
