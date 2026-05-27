@echo off
title IGO Nursery — Push SEO Fixes to GitHub
color 0A
echo.
echo ============================================================
echo   IGO Nursery SEO Fixes — Push to GitHub
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

:: ── Step 4: Stage SEO files ──────────────────────────────────
echo.
echo [4/5] Staging SEO files...

git add hooks/useSEO.ts
git add index.html
git add pages/Product.tsx
git add pages/Shop.tsx
git add pages/Home.tsx
git add pages/Lab.tsx
git add pages/Landscape.tsx
git add pages/AMC.tsx
git add pages/KnowledgeHub.tsx
git add pages/Visit.tsx
git add pages/GardenAssistant.tsx
git add pages/Cart.tsx
git add pages/Checkout.tsx
git add pages/CustomerAuth.tsx
git add components/SiteHeader.tsx
git add components/Footer.tsx
git add SEO_FIXES_COMPLETED.md
git add IGO_Nursery_SEO_Audit_2026.docx

echo.
echo   Files staged:
git diff --cached --stat
echo.

:: ── Step 5: Commit + Push ─────────────────────────────────────
echo [5/5] Committing and pushing to main branch...
echo.

git commit -m "SEO: Full-site SEO audit fixes — useSEO hook, JSON-LD schemas, anchor links, canonical URLs

- NEW hooks/useSEO.ts: Dynamic title/description/canonical/OG per page
- NEW SEO_CONFIGS for all 12 pages + getProductSEO() for per-product metadata
- index.html: WebSite + FAQPage + BreadcrumbList JSON-LD, OG hero image, hreflang
- pages/Product.tsx: Product JSON-LD schema, BreadcrumbList, breadcrumb nav, anchor links
- pages/Shop.tsx: H1 with keywords, breadcrumb nav, product cards as crawlable <a href>
- pages/Home.tsx: Keyword H1 (sr-only), fixed heading hierarchy, all CTAs as anchor links
- components/SiteHeader.tsx: All nav items as <a href> (Googlebot-crawlable)
- components/Footer.tsx: All links as <a href>, improved alt text
- Remaining pages (Lab, Landscape, AMC, KnowledgeHub, Visit, GardenAssistant,
  Cart, Checkout, CustomerAuth): useSEO hook added for unique titles and canonicals
- Cart/Checkout: noIndex added to prevent indexing transactional pages"

echo.
echo Pushing to ffwebsite/main...
git push ffwebsite main

echo.
if %ERRORLEVEL% EQU 0 (
  color 0A
  echo ============================================================
  echo   SUCCESS! All SEO fixes pushed to:
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
