@echo off
title IGO Nursery — Push README to GitHub
color 0A
echo.
echo ============================================================
echo   IGO Nursery — Push Updated README.md to GitHub
echo   Target: https://github.com/igobackend2-bit/ffwebsite.git
echo ============================================================
echo.

cd /d "%~dp0"

:: ── Step 1: Remove stale lock files ──────────────────────────
echo [1/5] Clearing stale git locks...
if exist ".git\index.lock" del /f /q ".git\index.lock" && echo   Removed index.lock
if exist ".git\config.lock" del /f /q ".git\config.lock" && echo   Removed config.lock

:: ── Step 2: Set git identity ──────────────────────────────────
echo.
echo [2/5] Setting git identity...
git config user.email "igobackend3@gmail.com"
git config user.name "IGO Nursery"

:: ── Step 3: Set remote ───────────────────────────────────────
echo.
echo [3/5] Configuring remote (ffwebsite)...
git remote remove ffwebsite 2>nul
git remote add ffwebsite "https://github.com/igobackend2-bit/ffwebsite.git"
echo   Remote set: https://github.com/igobackend2-bit/ffwebsite.git

:: ── Step 4: Stage README ──────────────────────────────────
echo.
echo [4/5] Staging README.md...
git add README.md

echo.
echo   Files staged:
git diff --cached --stat
echo.

:: ── Step 5: Commit + Push ─────────────────────────────────────
echo [5/5] Committing and pushing to main branch...
echo.

git commit -m "Update README with project overview, setup, and deployment instructions"

echo.
echo Pushing to ffwebsite/main...
git push ffwebsite main

echo.
if %ERRORLEVEL% EQU 0 (
  color 0A
  echo ============================================================
  echo   SUCCESS! README pushed to:
  echo   https://github.com/igobackend2-bit/ffwebsite
  echo ============================================================
) else (
  color 0C
  echo ============================================================
  echo   PUSH FAILED. The commit is saved locally.
  echo   Try: git push ffwebsite main --force
  echo   Or check if the repo exists and you have write access.
  echo ============================================================
)

echo.
pause
