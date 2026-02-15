---
id: suppress-server-logs
name: Suppress Server Info Logs
category: logging
priority: low
enabled: true
files_modified: 2
dependencies: []
tags:
  - logging
  - server
  - info
  - debugging
target_files:
  - path: src/server/PrivilegeRefresher.ts
    changes: 2
  - path: src/server/Worker.ts
    changes: 2
---

# Suppress Server Info Logs

## Description

Comments out various informational log messages that provide no actionable value during development. Keeps the server console clean while preserving error and warning messages.

## Files Modified

### 1. src/server/PrivilegeRefresher.ts

#### Patch 1: Suppress startup info log

**Location**: In `start()` method (~line 29)

**Before**:

```typescript
this.log.info(
  `Starting privilege refresher with interval ${this.refreshInterval}`,
);
```

**After**:

```typescript
// CUSTOM: Suppressed noisy info log
// this.log.info(
//   `Starting privilege refresher with interval ${this.refreshInterval}`,
// );
```

#### Patch 2: Suppress loading info logs

**Location**: In `loadPrivilegeChecker` method (~lines 40-60)

**Before**:

```typescript
this.log.info(`Loading privilege checker from ${this.endpoint}`);
// ... later in method ...
this.log.info(`Privilege checker loaded successfully`);
```

**After**:

```typescript
// CUSTOM: Suppressed noisy info log
// this.log.info(`Loading privilege checker from ${this.endpoint}`);
// ... later in method ...
// CUSTOM: Suppressed noisy info log
// this.log.info(`Privilege checker loaded successfully`);
```

### 2. src/server/Worker.ts

#### Patch 1: Suppress lobby poll success log

**Location**: In matchmaking polling handler (~line 524)

**Before**:

```typescript
log.info(`Lobby poll successful:`, data);
```

**After**:

```typescript
// CUSTOM: Suppressed noisy info log
// log.info(`Lobby poll successful:`, data);
```

#### Patch 2: Suppress game start log

**Location**: In game start handler (~line 531)

**Before**:

```typescript
console.log(`Starting game ${gameId}`);
```

**After**:

```typescript
// CUSTOM: Suppressed noisy log
// console.log(`Starting game ${gameId}`);
```

## Pattern Matching

**Find info logs**:

```bash
grep -n "this.log.info\|log.info" src/server/PrivilegeRefresher.ts
grep -n "log.info\|console.log" src/server/Worker.ts
```

**Find specific patterns**:

```bash
# PrivilegeRefresher
grep -n "Starting privilege refresher\|Loading privilege checker\|loaded successfully" src/server/PrivilegeRefresher.ts

# Worker
grep -n "Lobby poll successful\|Starting game" src/server/Worker.ts
```

## Verification

After applying:

1. Run `pnpm dev:server`
2. Server console should NOT show:
   - "Starting privilege refresher with interval"
   - "Loading privilege checker from"
   - "Privilege checker loaded successfully"
   - "Lobby poll successful:"
   - "Starting game [gameId]"
3. Should STILL show error and warning messages

## Rollback

To re-enable server logs:

1. Uncomment all log.info and console.log statements
2. Remove `// CUSTOM: Suppressed noisy` comments
3. Restart server

## Related Patches

- PATCH-suppress-config-logs.md (config loader log suppression)
- PATCH-suppress-econnrefused.md (error suppression)
