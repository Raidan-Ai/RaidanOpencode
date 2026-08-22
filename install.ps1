<#RaidanOpencode
# RaidanOpencode Windows PowerShell Installer
# Portable, reproducible OpenCode agent OS installation for Windows

Write-Host "=== RaidanOpencode Windows Installer ===" -ForegroundColor Cyan
Write-Host "Target: Windows 10/11" -ForegroundColor White
Write-Host ""

# Detect PowerShell version
$psVersion = $PSVersionTable.PSVersion
Write-Host "PowerShell version: $psVersion" -ForegroundColor White

# Install Chocolatey if not present
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host ">>> Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    https://community.chocolatey.org/install.ps1 | iex
}

# Install Node.js if not present
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host ">>> Installing Node.js..." -ForegroundColor Yellow
    choco install nodejs-lts -y | Out-Null
}

# Install pnpm if not present
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host ">>> Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm | Out-Null
}

# Install Oh-My-Opencode-Slim
$opencodePath = "$env:HOMEPATH\.config\opencode"
if (-not (Test-Path $opencodePath)) {
    Write-Host ">>> Installing Oh-My-Opencode-Slim..." -ForegroundColor Yellow
    git clone https://github.com/Raidan-Ai/oh-my-opencode-slim.git $opencodePath
    Write-Host ">>> Installed to: $opencodePath" -ForegroundColor Green
} else {
    Write-Host ">>> Oh-My-Opencode-Slim already installed" -ForegroundColor Green
}

# Apply portable configuration
$configPath = "$opencodePath\opencode.jsonc"
if (Test-Path "./opencode.jsonc") {
    Copy-Item ./opencode.jsonc $configPath -Force
    Write-Host ">>> Configuration applied" -ForegroundColor Green
} else {
    Write-Host ">>> No local opencode.jsonc found - using remote configuration" -ForegroundColor Yellow
}

# Initialize skills
Write-Host ">>> Skills directory handling..." -ForegroundColor Cyan
if (Test-Path "./skills") {
    Write-Host ">>> Skills directory found - will be linked later" -ForegroundColor White
}

# Initialize commands
Write-Host ">>> Commands directory handling..." -ForegroundColor Cyan
if (Test-Path "./commands") {
    Write-Host ">>> Commands directory found - will be linked later" -ForegroundColor White
}

Write-Host "" -ForegroundColor Cyan
Write-Host "=== RaidanOpencode Windows Installation Complete ===" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Run: opencode" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Set environment variables for API keys (never commit these!)" -ForegroundColor White
Write-Host "2. Run: opencode --init" -ForegroundColor White
Write-Host "3. Explore: opencode --help" -ForegroundColor White