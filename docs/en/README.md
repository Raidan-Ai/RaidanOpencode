# RaidanOpencode

**RaidanOpencode** - A portable, reproducible, cross-platform OpenCode agent operating system.

## Overview

RaidanOpencode combines your current OpenCode installation/configuration with architectural primitives from 37+ reference repositories to create a portable agent operating system. The goal is reproducibility across Linux (Ubuntu 24.04), Windows, and macOS without cloning repositories wholesale or committing machine-specific data.

## Philosophy

- **Portable**: Configuration is separated into PORTABLE/MACHINE-SPECIFIC/SECRET/OPTIONAL/DEPRECATED layers
- **Reproducible**: Full install scripts for Linux (install.sh), Windows (install.ps1, install.cmd)
- **Cross-platform**: Same architecture works on all major OSes
- **Secure**: No secrets committed to repository; all secrets externalized via environment variables

## Architecture

The system provides:

1. **Orchestrator** - Task planning and multi-agent coordination
2. **Agent Registry** - Skill discovery and loading
3. **Task Engine** - Test-driven development, verification loops
4. **Session Manager** - Context preservation across sessions
5. **Runtime Abstraction** - Cloudflare Workers, local execution, etc.
6. **Memory Architecture** - Unified memory with AgentDB HNSW indexing
7. **Messaging Layer** - MQTT, WebSocket, or IPC for agent communication
8. **Policy Engine** - Security, compliance, and access controls
9. **Event Model** - Standardized event types and payloads
10. **Configuration Model** - Hierarchical config with precedence layers

## Installation

### Linux

```bash
bash install.sh
```

### Windows

```powershell
# PowerShell
.\install.ps1

# Command Prompt
install.cmd
```

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built on OpenCode framework
- Architectural primitives from 37+ reference repositories
- Arabic documentation: docs/ar/README.md