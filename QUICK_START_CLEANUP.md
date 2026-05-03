# Quick Start: Security Cleanup

## ⚠️ CRITICAL: Do These Steps IN ORDER

### Step 1: Rotate API Key (DO THIS FIRST!)
🔴 **BEFORE running any cleanup scripts:**

1. Go to: https://cloud.ibm.com/iam/apikeys
2. Delete the exposed API key
3. Create a new API key
4. Update your local `.env` file with the new key
5. **Verify `.env` is in `.gitignore`** ✓ (already done)

### Step 2: Run Cleanup Script

```powershell
# Navigate to repository root
cd h:/Compititions/BobHackaton/CodeScribe

# Run the cleanup script
.\clean_git_history.ps1
```

### Step 3: Force Push (After Cleanup Succeeds)

```powershell
# Push cleaned history to remote
git push origin --force --all

# Push cleaned tags
git push origin --force --tags
```

### Step 4: Verify

```powershell
# Check that bob_sessions is gone from history
git log --all --full-history --source --name-only -- bob_sessions

# Should return nothing
```

## What the Script Does

1. ✓ Creates backup branch (`backup-before-cleanup`)
2. ✓ Removes `bob_sessions/` from entire Git history
3. ✓ Cleans up references
4. ✓ Runs garbage collection
5. ✓ Verifies removal

## If Something Goes Wrong

```powershell
# Restore from backup
git checkout backup-before-cleanup
```

## After Cleanup

- [ ] Notify all collaborators to re-clone the repository
- [ ] Update any CI/CD pipelines with new API key
- [ ] Monitor IBM Cloud for unauthorized usage
- [ ] Document the incident (see SECURITY_INCIDENT_REMEDIATION.md)

## Files Created

- ✓ `.gitignore` - Updated to exclude `bob_sessions`
- ✓ `clean_git_history.ps1` - Automated cleanup script
- ✓ `SECURITY_INCIDENT_REMEDIATION.md` - Full documentation
- ✓ `QUICK_START_CLEANUP.md` - This file

## Need Help?

See full documentation: `SECURITY_INCIDENT_REMEDIATION.md`