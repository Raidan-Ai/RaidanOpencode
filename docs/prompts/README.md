# Runtime Installation Prompts

Per ARCHITECTURE.md §78, this directory will hold copy-paste installation prompts for wiring RaidanOpencode into each supported agent runtime:

| Target | Status |
|--------|--------|
| OpenCode | 📋 Planned (Phase 2 wizard) |
| Claude Code | 🔮 Phase 9 |
| Codex | 🔮 Phase 9 |
| Gemini CLI | 🔮 Phase 9 |
| OpenClaw | 🔮 Future |
| Hermes | 🔮 Future |
| Generic AI Agent | 🔮 Future |

## Rules for prompt files

1. Each prompt must be self-contained: no reliance on conversation history.
2. Prompts instruct the runtime to run the **setup wizard**, never to hand-edit config files.
3. Every prompt carries a deduplication check (ARCHITECTURE.md §12) before recommending new skills/agents.
4. Nothing in a prompt may request credentials — secrets come from the environment only.
