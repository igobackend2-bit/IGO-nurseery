@echo off
echo ============================================================
echo  IGO Nursery - Push Speed Fixes to GitHub
echo ============================================================
echo.

cd /d "D:\Igo-websites\Igo-Nursery"

:: Remove stale git lock if present
if exist ".git\index.lock" (
    echo Removing stale git lock file...
    del /f ".git\index.lock"
)

:: Stage only the performance-fix files
echo Staging files...
git add App.tsx index.html vite.config.ts

:: Show what will be committed
echo.
echo Files staged for commit:
git diff --cached --stat
echo.

:: Commit
git commit -m "perf: code-split pages, fix font loading, optimise build config

- App.tsx: convert all 25 page imports to React.lazy + Suspense so each
  page is its own JS chunk loaded only when navigated to (was ~1.6 MB
  monolithic bundle, now split on demand)
- App.tsx: fix order-number mismatch bug — newOrder in local state now
  uses response.order.orderNumber from DB instead of a separately
  generated local ID that never matched the DB record
- index.html: load Google Fonts asynchronously (media=print trick) to
  eliminate render-blocking font stylesheet delay
- index.html: add rel=preload for font CSS + dns-prefetch for CDN origins
- index.html: remove unused importmap pointing to esm.sh (Vite bundles
  React at compile time so the CDN refs were never used — just extra DNS)
- vite.config.ts: emptyOutDir true (was false — 100+ stale chunks had
  accumulated in dist/assets/)
- vite.config.ts: manualChunks to split React, Supabase, jsPDF, xlsx,
  Lucide into separately cached vendor bundles"

if %errorlevel% neq 0 (
    echo.
    echo Nothing new to commit - files may already be up to date.
)

:: Push to origin (main repo)
echo.
echo Pushing to GitHub (origin / main)...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo  SUCCESS! Speed fixes are now live on GitHub.
    echo  Vercel / your host will auto-deploy from the push.
    echo ============================================================
) else (
    echo.
    echo Push failed. Check your internet connection or GitHub token.
)

echo.
pause
