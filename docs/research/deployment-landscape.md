# Deployment Landscape

Date: 2026-08-23
Deployment Registry categories + target support matrix. Separation enforced: build ≠ release ≠ deploy ≠ publish ≠ announce. Production deploys require explicit policy authorization — never automatic.

| Target | Method | Secrets ref | Rollback | Priority |
|---|---|---|---|---|
| SSH server | rsync/scp/systemd-unit or pm2-less node service | SSH key via OS credential store reference; known_hosts pinned | previous-release symlink flip | P0 |
| Docker server | image build + compose/swarm deploy | registry creds env-ref | tag rollback | P1 (docker absent on current host) |
| Linux VM (cloud-agnostic) | ssh bootstrap scripts | cloud creds env-ref | snapshot/AMI pin | P1 |
| GitHub Releases | gh CLI + workflow | GITHUB_TOKEN env-ref | re-publish prior tag | P0 (project dogfood) |
| Cloudflare Pages/Workers | wrangler | CF_API_TOKEN env-ref | immediate version rollback | P2 |
| Vercel / Netlify | CLI/token | token env-ref | instant rollback APIs | P2 |
| AWS / GCP / Azure | CLIs/IaC | cloud cred chains | infra-specific | P3 |

## Current-host reality (Windows)
No Docker installed → executor/deployment backends degrade gracefully: local-process primary, docker/ssh marked UNAVAILABLE by `raidan doctor` with repair guidance (install Docker Desktop / enable WSL).

## Rules
- Every target entry records: strategy, health-check command, notification hook, secrets references (never values).
- `raidan deploy --dry-run` prints full plan incl. diff of what would change.
- Rollback tested as part of migration test suite, not assumed.
