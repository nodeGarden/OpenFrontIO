---
id: suppress-config-logs
name: Suppress Config Loader Logs
category: logging
priority: low
enabled: true
files_modified: 1
dependencies: []
tags:
  - logging
  - server
  - config
  - initialization
target_files:
  - path: src/core/configuration/ConfigLoader.ts
    changes: 3
---

# Suppress Config Loader Logs

## Description

Comments out noisy configuration loading log messages that clutter the server console during development. These logs provide no actionable information in dev environment.

## Files Modified

### src/core/configuration/ConfigLoader.ts

**Action**: Comment out console.log statements

#### Patch 1: Suppress "using prod config" log

**Location**: ~line 23

**Before**:

```typescript
console.log("using prod config");
```

**After**:

```typescript
// CUSTOM: Suppressed noisy log
// console.log("using prod config");
```

#### Patch 2: Suppress "Server config loaded" log

**Location**: ~line 42

**Before**:

```typescript
// Log the retrieved configuration
console.log("Server config loaded:", config);
```

**After**:

```typescript
// CUSTOM: Suppressed noisy log
// Log the retrieved configuration
// console.log("Server config loaded:", config);
```

#### Patch 3: Suppress environment config logs

**Location**: In `getServerConfig` function (~lines 54-60)

**Before**:

```typescript
case "dev":
  console.log("using dev server config");
  return new DevServerConfig();
case "staging":
  console.log("using preprod server config");
  return preprodConfig;
case "prod":
  console.log("using prod server config");
  return prodConfig;
```

**After**:

```typescript
case "dev":
  // CUSTOM: Suppressed noisy log
  // console.log("using dev server config");
  return new DevServerConfig();
case "staging":
  // CUSTOM: Suppressed noisy log
  // console.log("using preprod server config");
  return preprodConfig;
case "prod":
  // CUSTOM: Suppressed noisy log
  // console.log("using prod server config");
  return prodConfig;
```

## Pattern Matching

**Find console.log calls**:

```bash
grep -n "console.log" src/core/configuration/ConfigLoader.ts
```

**Find getServerConfig function**:

```bash
grep -n "getServerConfig" src/core/configuration/ConfigLoader.ts
```

## Verification

After applying:

1. Run `pnpm dev:server`
2. Server console should NOT show:
   - "using prod config"
   - "Server config loaded:"
   - "using dev server config"
   - "using preprod server config"
   - "using prod server config"

## Rollback

To re-enable config logs:

1. Uncomment all console.log statements
2. Remove `// CUSTOM: Suppressed noisy log` comments
3. Restart server

## Related Patches

- PATCH-suppress-server-logs.md (for other server log suppression)
