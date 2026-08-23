# Connector Landscape

Date: 2026-08-23
Connectors = integrations to external services. Registry: detect → catalogue → recommend → guided setup. Never assume availability. Least privilege default. Auth via OAuth/device-flow/env-ref/OS store — never plaintext repo files.

## Categories & candidates

### Developer
| Connector | Auth | Priority | Notes |
|---|---|---|---|
| GitHub | PAT env-ref / OAuth device / GitHub App | P0 | MCP already configured this host; App path enables delegated-push design post-v1 |
| GitLab | PAT | P2 | |
| Linear / Jira | OAuth/API key | P2 | ticket ingestion loop (agx pattern) |
| Trello | OAuth | P3 | |

### Knowledge & Productivity
| Connector | Auth | Priority | Notes |
|---|---|---|---|
| Notion | OAuth (read-only default) | P1 | guided setup per spec §34 |
| Google Drive | OAuth (read-only default) | P1 | least privilege; scope escalation requires approval gate |
| Google Docs/Sheets | OAuth | P2 | |
| OneDrive/Dropbox | OAuth | P3 | |

### Communication & Notifications
| Connector | Auth | Priority | Notes |
|---|---|---|---|
| Telegram Bot | bot token env-ref | P1 | notification/approval channel ONLY; every action policy-checked (spec §35) |
| Discord webhook | webhook URL env-ref | P2 | notifications |
| Slack | OAuth app | P3 | |

### Storage & Cloud
| Connector | Auth | Priority |
|---|---|---|
| S3-compatible | keys env-ref | P2 |
| Cloudflare (R2/Workers/Pages) | API token env-ref | P2 |
| Vercel / Netlify | token env-ref | P2 (deployment targets too) |
| AWS / Azure / GCP | standard cloud creds chains | P3 |

## Recommendation engine rules (spec §76)
- research tasks → search + browser + Notion/Drive
- software engineering → GitHub + docs + CI/CD
- content production → Drive/Notion + Telegram + publishing targets
- Recommendations are SUGGESTIONS — never auto-install without explicit user choice.

## Security gates applied to all connectors
provenance record · permission scope display before connect · secret never echoed/logged · revocation instructions in uninstall path.
