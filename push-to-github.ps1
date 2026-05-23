# IGO Nursery — Push all SEO & code fixes to GitHub
# Run this once in PowerShell (right-click > Run with PowerShell)

$repoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoPath

Write-Host "=== IGO Nursery Git Push Script ===" -ForegroundColor Cyan

# 1. Remove stale git lock if it exists
$lockFile = Join-Path $repoPath ".git\index.lock"
if (Test-Path $lockFile) {
    Write-Host "Removing stale .git/index.lock..." -ForegroundColor Yellow
    Remove-Item $lockFile -Force
    Write-Host "Lock removed." -ForegroundColor Green
}

# 2. Untrack junk/backup files (remove from git index only, not disk)
Write-Host "`nUntracking backup/junk files..." -ForegroundColor Yellow
$junkPaths = @("backup/", "scratch/", "logo_base64.txt", "test_write.txt", "pages/Landscape.tsx.backup", "IGO_Nursery_SEO_Audit_Updated.docx")
foreach ($path in $junkPaths) {
    $fullPath = Join-Path $repoPath $path
    if ((Test-Path $fullPath) -or (git ls-files --error-unmatch $path 2>$null)) {
        git rm --cached -r $path 2>$null
    }
}

# 3. Stage all changes
Write-Host "`nStaging all changes..." -ForegroundColor Yellow
git add -A

# 4. Show what will be committed
Write-Host "`nFiles staged for commit:" -ForegroundColor Cyan
git status --short

# 5. Commit
Write-Host "`nCommitting..." -ForegroundColor Yellow
git commit -m "SEO audit fixes, TypeScript error resolutions, junk file cleanup

- index.html: Fixed broken viewport meta, added full meta block (description,
  keywords, robots), canonical URL, Open Graph tags, Twitter Card, JSON-LD
  LocalBusiness schema
- public/robots.txt: Created with correct directives and sitemap URL
- public/sitemap.xml: Created with 9 URLs, priorities, and lastmod dates
- pages/Home.tsx: H1 SEO text, heading hierarchy fixed (eyebrow p vs h2)
- pages/Landscape.tsx: Alt text for carousel/case study images; restored
  truncated file (missing closing tags + export default)
- MainApp.tsx: Merged duplicate import, stripped null bytes, added products
  prop to Product component call
- server/index.js: Removed console.log that exposed plaintext passwords,
  stripped null bytes
- components/ErrorBoundary.tsx: Fixed this.children -> this.props.children,
  stripped null bytes
- types.ts: Added title? to Notification, selectedPlan? to Lead,
  deletionRequested? to Order; restored truncated AssistantData interface
- pages/MailHub.tsx: Added leadId? to SimulatedEmail interface; restored
  truncated export default
- .gitignore: Rewrote as UTF-8, added *.db, backup/, scratch/, junk patterns
- Removed from git tracking: backup/*.bak, scratch/dump_schema.cjs,
  logo_base64.txt, test_write.txt, pages/Landscape.tsx.backup"

# 6. Push
Write-Host "`nPushing to origin main..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "   https://github.com/igobackend2-bit/IGO-nurseery" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Push failed. Check your credentials or network." -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
