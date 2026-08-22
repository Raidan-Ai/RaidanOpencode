#!/usr/bin/env bash
# RaidanOpencode Linux Installer
# Portable, reproducible OpenCode agent OS installation for Ubuntu 24.04+

set -euo pipefail

echo "=== RaidanOpencode Linux Installer ==="
echo "Target: Ubuntu 24.04 / Debian-based"
echo ""

# Detect system
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "Detected: $NAME $VERSION_ID"
fi

# Install system dependencies
echo ">>> Installing system dependencies..."
apt-get update
apt-get install -y curl git wget build-essential

# Install Node.js (if needed)
if ! command -v node &>/dev/null; then
    echo ">>> Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install pnpm
if ! command -v pnpm &>/dev/null; then
    echo ">>> Installing pnpm..."
    npm install -g pnpm
fi

# Install Oh-My-Opencode-Slim
if [ ! -d "$HOME/.config/opencode" ]; then
    echo ">>> Installing Oh-My-Opencode-Slim..."
    git clone https://github.com/Raidan-Ai/oh-my-opencode-slim.git "$HOME/.config/opencode"
else
    echo ">>> Oh-My-Opencode-Slim already installed"
fi

# Apply portable configuration
echo ">>> Applying portable configuration..."
if [ -f "./opencode.jsonc" ]; then
    cp ./opencode.jsonc "$HOME/.config/opencode/opencode.jsonc"
    echo ">>> Configuration applied"
else
    echo ">>> No local opencode.jsonc found - using remote configuration"
fi

# Initialize skills
echo ">>> Initializing skills..."
if [ -d "./skills" ]; then
    echo ">>> Skills directory found - will be linked later"
fi

# Initialize commands
echo ">>> Initializing commands..."
if [ -d "./commands" ]; then
    echo ">>> Commands directory found - will be linked later"
fi

echo ""
echo "=== RaidanOpencode Linux Installation Complete ==="
echo "Run: opencode"
echo ""
echo "Next steps:"
echo "1. Set environment variables for API keys (never commit these!)"
echo "2. Run: opencode --init"
echo "3. Explore: opencode --help"