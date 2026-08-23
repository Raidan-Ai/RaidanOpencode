# Integration: Superpowers (obra/superpowers)

- Source: https://github.com/obra/superpowers
- Author: Jesse Vincent (obra)
- License: MIT (c) 2025 Jesse Vincent — compatible, no code vendored into this repository
- Integration type: optional runtime plugin, installed through OpenCode's native plugin mechanism
- Provenance record: `docs/sources/source-manifest.yaml` (`obra/superpowers`)

## What it provides

A curated engineering-discipline skill suite for OpenCode: brainstorming before
creative work, test-driven development discipline, writing/executing plans,
subagent-driven development, code review etiquette, git worktree workflows,
and verification-before-completion gates.

## Deduplication decision (spec §47/§50)

Before recommending installation we audited the local OpenCode global skills
directory. The following installed skills already cover most of superpowers'
workflow surface:

```
brainstorming, test-driven-development, systematic-debugging,
writing-plans*, executing-plans, requesting-code-review,
receiving-code-review, subagent-driven-development, git-worktree,
dispatching-parallel-agents
```

**Decision:** RaidanOpencode does NOT install superpowers automatically.
Install it only if you want its integrated plugin behavior on top of the
equivalents above (it is additive and safe — OpenCode deduplicates skill
activation by name).

## Installation (official method)

Add to the `plugin` array in your `opencode.json` / `opencode.jsonc`
(global at `~/.config/opencode/opencode.jsonc`, or project-level):

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

Restart OpenCode. Verify by asking the agent: "Tell me about your superpowers".

To pin a version:

```json
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v5.0.3"]
}
```

## Windows fallback

Some Windows OpenCode builds have upstream installer issues with git-backed
plugin specs (cache paths for `git+https` URLs; Bun not finding `git.exe`).
If the native install fails, use system npm with a prefix install:

```powershell
npm install superpowers@git+https://github.com/obra/superpowers.git --prefix "$HOME\.config\opencode"
```

Then reference the installed package path:

```json
{
  "plugin": ["~/.config/opencode/node_modules/superpowers"]
}
```

RaidanOpencode note: our `raidan migrate backup` command snapshots your
OpenCode config before any manual edit like this.

## Migrating from old symlink installs

If a previous git-clone + symlink setup exists, remove it first:

```bash
rm -f ~/.config/opencode/plugins/superpowers.js
rm -rf ~/.config/opencode/skills/superpowers
rm -rf ~/.config/opencode/superpowers
```

Then follow the official installation steps above.

## Updating / troubleshooting summary

- Updates may lag due to lockfile/cache pinning — clear OpenCode's package
  cache or reinstall the plugin if new commits do not appear.
- Plugin not loading: `opencode run --print-logs "hello" | grep -i superpowers`.
- Skills not found: list discovered skills via OpenCode's native `skill` tool.

Full upstream docs: https://github.com/obra/superpowers/blob/main/docs/README.opencode.md
Issues: https://github.com/obra/superpowers/issues
