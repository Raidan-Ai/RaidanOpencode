# ADR-013 - Runtime Supervisor Abstraction
Status: Accepted · Date: 2026-08-23
Backend SPI: start/stop/restart/pause/resume/health/heartbeat/logs/resource-limits/recovery. Backends: windows-native (job objects), linux-native, systemd OPTIONAL, docker OPTIONAL, wsl BRIDGE. No systemd/tmux requirement anywhere in core (breaks Windows mandate).
Consequences: + persistent/background agents portable across OS; - backend parity testing burden; feature detection via raidan doctor.
