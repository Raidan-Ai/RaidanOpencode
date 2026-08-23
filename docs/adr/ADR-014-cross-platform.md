# ADR-014 — Cross-Platform: Windows First-Class

Status: Accepted · Date: 2026-08-23

## Context
Current host is native Windows. Research showed most ecosystem tools are POSIX-bound: tmux dependencies (agent-deck, agent-manager, AoE, ai-maestro), systemd requirements (5dive), bash-only installers. Only opencode-swarm, ponytail, kandev, clideck treat Windows properly.

## Decision
Windows 10/11 PowerShell is a FIRST-CLASS target equal to Linux/WSL/macOS:
- No hard-coded `/`, no `~` assumptions (use os.homedir()), pathlib everywhere
- Runtime Supervisor backends: windows-native (job objects via node), linux-native, systemd OPTIONAL, docker OPTIONAL, wsl BRIDGE
- Installers: install.ps1 parity-gated with install.sh; CI matrix ubuntu+windows mandatory
- Shell-write guardrails cover PowerShell/cmd heuristics AND POSIX AST

## Consequences
+ Project actually runs where the owner works
− Every subsystem carries platform test debt; enforced via CI matrix and doctor checks
