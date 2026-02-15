---
id: npmrc
name: NPM/PNPM Logging Suppression
category: build
priority: low
enabled: true
files_modified: 1
dependencies: []
tags:
  - build
  - npm
  - pnpm
  - logging
target_files:
  - path: .npmrc
    changes: 1
---

# NPM/PNPM Logging Suppression

## Description

Creates `.npmrc` file to suppress noisy npm/pnpm warnings during package installation and management. Only shows errors.

## Files Modified

### .npmrc

**Action**: Create file if it doesn't exist

```
# CUSTOM: Suppress npm/pnpm warnings
loglevel=error
```

## Pattern Matching

**Check if file exists**:

```bash
ls -la .npmrc
```

**Create if missing**:

```bash
echo "# CUSTOM: Suppress npm/pnpm warnings" > .npmrc
echo "loglevel=error" >> .npmrc
```

## Verification

After applying:

1. Run `pnpm install`
2. Should only see errors (if any), not warnings

## Rollback

To disable this patch:

```bash
rm .npmrc
```

Or change `loglevel=error` to `loglevel=warn`
