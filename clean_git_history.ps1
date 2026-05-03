# Script to remove bob_sessions directory from Git history
# This removes sensitive API keys that were accidentally committed

Write-Host "=== Git History Cleanup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Not in a git repository root directory!" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "WARNING: You have uncommitted changes. Please commit or stash them first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (yes/no)"
    if ($continue -ne "yes") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Step 1: Creating backup branch..." -ForegroundColor Green
git branch backup-before-cleanup 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backup branch 'backup-before-cleanup' created" -ForegroundColor Green
} else {
    Write-Host "✓ Backup branch already exists" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 2: Removing bob_sessions from Git history..." -ForegroundColor Green
Write-Host "This will use git filter-repo to rewrite history..." -ForegroundColor Yellow
Write-Host ""

# Check if git-filter-repo is available
$filterRepoAvailable = $false
try {
    git filter-repo --help 2>&1 | Out-Null
    $filterRepoAvailable = $true
} catch {
    $filterRepoAvailable = $false
}

if ($filterRepoAvailable) {
    Write-Host "Using git-filter-repo (recommended method)..." -ForegroundColor Cyan
    git filter-repo --path bob_sessions --invert-paths --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully removed bob_sessions from history" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to remove bob_sessions" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "git-filter-repo not found. Using git filter-branch (slower)..." -ForegroundColor Yellow
    Write-Host "To install git-filter-repo: pip install git-filter-repo" -ForegroundColor Yellow
    Write-Host ""
    
    git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch bob_sessions" --prune-empty --tag-name-filter cat -- --all
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully removed bob_sessions from history" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to remove bob_sessions" -ForegroundColor Red
        exit 1
    }
    
    # Clean up filter-branch refs
    Write-Host "Cleaning up filter-branch references..." -ForegroundColor Cyan
    git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
    git reflog expire --expire=now --all
}

Write-Host ""
Write-Host "Step 3: Garbage collection..." -ForegroundColor Green
git gc --prune=now --aggressive

Write-Host ""
Write-Host "Step 4: Verifying removal..." -ForegroundColor Green
$bobSessionsExists = git log --all --full-history --source --name-only -- bob_sessions 2>&1
if ($bobSessionsExists) {
    Write-Host "✗ WARNING: bob_sessions still found in history!" -ForegroundColor Red
    Write-Host $bobSessionsExists
} else {
    Write-Host "✓ bob_sessions successfully removed from all history" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Review the changes: git log --oneline" -ForegroundColor White
Write-Host "2. If satisfied, force push to remote: git push origin --force --all" -ForegroundColor White
Write-Host "3. Force push tags: git push origin --force --tags" -ForegroundColor White
Write-Host "4. IMPORTANT: Rotate your IBM Cloud API key immediately!" -ForegroundColor Red
Write-Host "5. Notify all collaborators to re-clone the repository" -ForegroundColor White
Write-Host ""
Write-Host "If something went wrong, restore from backup:" -ForegroundColor Yellow
Write-Host "  git checkout backup-before-cleanup" -ForegroundColor White
Write-Host ""

# Made with Bob
