@echo off
setlocal EnableExtensions EnableDelayedExpansion
title HR System - Update, Validate and Start

set "REPO_URL=https://github.com/moustafaadelammar/github-progect.git"
set "ROOT=C:\HR-System"
set "REPO=%ROOT%\github-progect"
set "APP=%REPO%\admin-affairs"
set "OFFLINE=0"

if /I "%~1"=="offline" set "OFFLINE=1"

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git is not installed or not in PATH.
  pause
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  pause
  exit /b 1
)
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm.cmd is not available.
  pause
  exit /b 1
)

if not exist "%ROOT%" mkdir "%ROOT%"

if not exist "%REPO%\.git" (
  if "%OFFLINE%"=="1" (
    echo [ERROR] Offline mode requested but no local Git copy exists:
    echo %REPO%
    pause
    exit /b 1
  )
  echo [1/7] Cloning project from GitHub...
  if exist "%REPO%" rmdir /s /q "%REPO%"
  git clone "%REPO_URL%" "%REPO%"
  if errorlevel 1 (
    echo [ERROR] Git clone failed.
    pause
    exit /b 1
  )
) else if "%OFFLINE%"=="0" (
  echo [1/7] Updating project from GitHub...
  cd /d "%REPO%"
  git fetch origin
  if errorlevel 1 (
    echo [WARNING] GitHub update failed. Continuing with the local copy.
  ) else (
    git reset --hard origin/main
    if errorlevel 1 (
      echo [ERROR] Git reset failed.
      pause
      exit /b 1
    )
    git clean -fd -e node_modules -e logs
  )
) else (
  echo [1/7] Offline mode: using existing local copy.
)

if not exist "%APP%\package.json" (
  echo [ERROR] admin-affairs project files are missing.
  pause
  exit /b 1
)

cd /d "%APP%"

echo [2/7] Preparing dependencies...
if "%OFFLINE%"=="1" (
  if not exist "node_modules\vite\bin\vite.js" (
    echo [ERROR] Offline dependencies are not installed.
    echo Run RUN-HR-SYSTEM.cmd once online, then use RUN-HR-SYSTEM.cmd offline.
    pause
    exit /b 1
  )
  echo [OK] Existing node_modules will be used. No Internet package download.
) else (
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo [3/7] TypeScript + Vite build validation...
call npm.cmd run build
if errorlevel 1 (
  echo [ERROR] Build failed. The system was NOT started.
  echo Review the error above.
  pause
  exit /b 1
)

echo [4/7] ESLint validation...
call npm.cmd run lint
if errorlevel 1 (
  echo [WARNING] ESLint reported issues. The build passed, so startup will continue.
)

if not exist "logs" mkdir logs

echo [5/7] Starting local services...
call npm.cmd run start:local
if errorlevel 1 (
  echo [ERROR] Local services failed to start.
  echo Check:
  echo   %APP%\logs\vite.log
  echo   %APP%\logs\fingerprint-gateway.log
  pause
  exit /b 1
)

echo [6/7] Checking ports...
powershell -NoProfile -Command "$a=Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue; if($a){exit 0}else{exit 1}"
if errorlevel 1 (
  echo [ERROR] HR System is not listening on 5173.
  type "%APP%\logs\vite.log" 2>nul
  pause
  exit /b 1
)
powershell -NoProfile -Command "$a=Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue; if($a){exit 0}else{exit 1}"
if errorlevel 1 echo [WARNING] Fingerprint Gateway is not listening on 8787.

echo [7/7] Opening HR System...
start "" http://localhost:5173/

echo.
echo ==========================================
echo        HR SYSTEM IS READY
if "%OFFLINE%"=="1" echo        OFFLINE MODE
 echo       http://localhost:5173/
echo ==========================================
echo.
pause
exit /b 0
