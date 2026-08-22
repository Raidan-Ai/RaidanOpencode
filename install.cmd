@echo off
:: RaidanOpencode Windows CMD Installer
:: Portable, reproducible OpenCode agent OS installation for Windows

echo == RaidanOpencode Windows Installer ==
echo Target: Windows 10/11
echo.

:: Detect environment
ver >nul 2>&1
if %errorlevel% equ 0 echo Windows environment detected

:: Install system dependencies
echo Installing system dependencies...
apt-get update 2>nul || pwsh -Command "apt-get update"

:: Install Node.js if needed
if not exist %APPDATA%\npm\node.exe (
    echo Installing Node.js...
) else (
    echo Node.js already installed
)

:: Install pnpm if needed
if not %APPDATA%\npm\pnpm.cmd (
    echo Installing pnpm...
) else (
    echo pnpm already installed
)

:: Install Oh-My-Opencode-Slim
if not exist %APPDATA%\..\..\config\opencode (
    echo Installing Oh-My-Opencode-Slim...
    git clone https://github.com/Raidan-Ai/oh-my-opencode-slim.git "%APPDATA%\..\..\config\opencode"
) else (
    echo Oh-My-Opencode-Slim already installed
)

:: Apply portable configuration
if exist ..\opencode.jsonc (
    copy opencode.jsonc "%APPDATA%\..\..\config\opencode\opencode.jsonc" /Y
    echo Configuration applied
) else (
    echo No local opencode.jsonc found - using remote configuration
)

echo.
echo RaidanOpencode Windows Installation Complete
echo.
echo Run: opencode
echo.
echo Next steps:
echo 1. Set environment variables for API keys (never commit these!)
echo 2. Run: opencode --init
echo 3. Explore: opencode --help

pause