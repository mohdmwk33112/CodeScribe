# Security Incident Remediation - IBM Cloud API Key Exposure

## Incident Summary

**Date Discovered:** May 3, 2026  
**Severity:** CRITICAL  
**Type:** API Key Exposure in Git History  
**Affected Files:** Multiple files in `bob_sessions/` directory  
**Exposed Credentials:** IBM Watsonx API Key

## What Happened

IBM Cloud API keys were accidentally committed to the Git repository in multiple markdown files within the `bob_sessions/` directory. These files contained:
- `WATSONX_API_KEY` values
- API endpoint URLs
- Project IDs
- Model IDs

GitHub's security scanning detected these exposed credentials and flagged them as critical security vulnerabilities.

## Immediate Actions Required

### 1. Rotate API Keys (URGENT - Do This First!)

**Before cleaning Git history, rotate your API keys:**

1. Log in to IBM Cloud Console: https://cloud.ibm.com/
2. Navigate to: **Manage** → **Access (IAM)** → **API keys**
3. Find the exposed API key
4. Click **Actions** → **Delete**
5. Create a new API key
6. Update your local `.env` file with the new key
7. **DO NOT commit the new key to Git**

### 2. Clean Git History

Run the provided cleanup script:

```powershell
# Make sure you're in the repository root
cd h:/Compititions/BobHackaton/CodeScribe

# Run the cleanup script
.\clean_git_history.ps1
```

The script will:
- Create a backup branch (`backup-before-cleanup`)
- Remove `bob_sessions/` from entire Git history
- Clean up references and run garbage collection
- Verify the removal

### 3. Force Push to Remote

**WARNING:** This rewrites Git history. All collaborators must re-clone.

```powershell
# Push the cleaned history
git push origin --force --all

# Push cleaned tags
git push origin --force --tags
```

### 4. Notify Collaborators

All team members must:
1. Delete their local repository
2. Re-clone from the remote
3. Never use the old API keys

```powershell
# For collaborators:
cd ..
Remove-Item -Recurse -Force CodeScribe
git clone <repository-url>
```

## Prevention Measures Implemented

### 1. Updated .gitignore

Added `bob_sessions` to `.gitignore` to prevent future commits:

```gitignore
.env
node_modules
Tasks
Tests
bob_sessions
```

### 2. Pre-commit Hook (Recommended)

Create `.git/hooks/pre-commit` to scan for secrets:

```bash
#!/bin/sh
# Prevent committing files with potential secrets

if git diff --cached --name-only | grep -q "bob_sessions"; then
    echo "ERROR: Attempting to commit bob_sessions directory!"
    echo "This directory may contain sensitive information."
    exit 1
fi

if git diff --cached | grep -E "(WATSONX_API_KEY|apikey.*=)"; then
    echo "ERROR: Potential API key detected in commit!"
    echo "Please remove sensitive data before committing."
    exit 1
fi

exit 0
```

### 3. GitHub Secret Scanning

GitHub's secret scanning is already enabled and detected this issue. Keep it enabled.

### 4. Environment Variable Best Practices

**Always:**
- Store secrets in `.env` files (already in `.gitignore`)
- Use environment variables for sensitive data
- Never hardcode credentials in source code
- Never commit `.env` files

**Never:**
- Commit API keys, tokens, or passwords
- Share credentials in chat logs or session files
- Store secrets in documentation or markdown files

## Verification Steps

After running the cleanup script, verify the removal:

```powershell
# Check if bob_sessions exists in history
git log --all --full-history --source --name-only -- bob_sessions

# Should return nothing if successful

# Check current repository
git ls-files | Select-String "bob_sessions"

# Should return nothing
```

## Technical Details

### Files Affected

The following files contained exposed credentials:
- `bob_sessions/bob_task_may-1-2026_9-21-21-pm.md`
- `bob_sessions/bob_task_may-1-2026_10-14-20-pm.md`
- `bob_sessions/bob_task_may-2-2026_3-14-34-pm.md`
- `bob_sessions/bob_task_may-2-2026_6-33-36-pm.md`
- `bob_sessions/bob_task_may-2-2026_8-35-37-pm.md`
- `bob_sessions/bob_task_may-2-2026_9-34-02-pm.md`
- `bob_sessions/bob_task_may-2-2026_10-22-11-pm.md`
- `bob_sessions/bob_task_may-2-2026_10-41-40-pm.md`
- `bob_sessions/bob_task_may-2-2026_11-17-55-pm.md`
- `bob_sessions/bob_task_may-3-2026_12-24-12-am.md`
- `bob_sessions/bob_task_may-3-2026_1-09-10-am.md`
- `bob_sessions/bob_task_may-3-2026_1-39-21-am.md`

### Exposed Information

- IBM Watsonx API Keys
- Watsonx endpoint URLs
- Project IDs
- Model IDs
- IAM token exchange patterns

## Recovery Plan

If something goes wrong during cleanup:

```powershell
# Restore from backup branch
git checkout backup-before-cleanup

# Or restore from remote (if not yet force-pushed)
git fetch origin
git reset --hard origin/main
```

## Lessons Learned

1. **Session logs can contain sensitive data** - Bob's session files captured environment variable discussions
2. **Always review before committing** - Check for sensitive data in all files
3. **Use .gitignore proactively** - Add patterns before they become a problem
4. **Rotate keys immediately** - Don't wait to rotate exposed credentials

## Contact

For questions about this incident:
- Security Team: [security@example.com]
- Project Lead: [lead@example.com]

## References

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [IBM Cloud: Managing API keys](https://cloud.ibm.com/docs/account?topic=account-userapikey)
- [git-filter-repo documentation](https://github.com/newren/git-filter-repo)

---

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**Status:** Active Incident - Remediation in Progress