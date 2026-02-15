---
id: suppress-econnrefused
name: Suppress ECONNREFUSED Errors
category: logging
priority: high
enabled: true
files_modified: 4
dependencies: []
tags:
  - logging
  - server
  - errors
  - networking
  - services
target_files:
  - path: src/server/PrivilegeRefresher.ts
    changes: 1
  - path: src/server/PollingLoop.ts
    changes: 1
  - path: src/server/Worker.ts
    changes: 1
  - path: src/server/Archive.ts
    changes: 2
---

# Suppress ECONNREFUSED Errors

## Description

Suppresses ECONNREFUSED errors that occur when optional backend services (cosmetics, matchmaking, archive) aren't running. These errors are expected in local development and create console noise. The patch checks if the error is a connection refused error and only logs if it's a different type of error.

## Error Suppression Pattern

This is a reusable pattern applied across multiple server files. It suppresses both ECONNREFUSED errors and "network error" messages that occur when optional services aren't running:

```typescript
} catch (error) {
  // CUSTOM: Suppress ECONNREFUSED and network errors (expected in dev when service isn't running)
  const isConnectionRefused = error && typeof error === 'object' && (
    ('cause' in error && error.cause && typeof error.cause === 'object' &&
     'code' in error.cause && error.cause.code === 'ECONNREFUSED') ||
    (error instanceof Error && error.message.includes('network error'))
  );

  if (!isConnectionRefused) {
    log.error(`[ERROR MESSAGE]`, error);
  }
  return; // or return null; depending on function signature
}
```

**Note**: The enhanced pattern catches two types of errors:

1. Direct ECONNREFUSED errors from fetch calls
2. Wrapped "network error" messages thrown when fetch returns null

## Files Modified

### 1. src/server/PrivilegeRefresher.ts

**Location**: In `loadPrivilegeChecker` method catch block (~line 40-60)

**Apply pattern**: Wrap error logging with ECONNREFUSED check

**Before**:

```typescript
} catch (error) {
  this.log.error(`Failed to fetch cosmetics from ${this.endpoint}:`, error);
}
```

**After**:

```typescript
} catch (error) {
  // CUSTOM: Suppress ECONNREFUSED and network errors (expected in dev when cosmetics service isn't running)
  const isConnectionRefused = error && typeof error === 'object' && (
    ('cause' in error && error.cause && typeof error.cause === 'object' &&
     'code' in error.cause && error.cause.code === 'ECONNREFUSED') ||
    (error instanceof Error && error.message.includes('network error'))
  );

  if (!isConnectionRefused) {
    this.log.error(`Failed to load privilege checker:`, error);
  }
}
```

### 2. src/server/PollingLoop.ts

**Location**: In `startPolling` function, `.catch()` handler (~line 16)

**Apply pattern**: Wrap error logging with ECONNREFUSED check

**Before**:

```typescript
.catch((error) => {
  log.error("Error in polling loop:", error);
})
```

**After**:

```typescript
.catch((error) => {
  // CUSTOM: Suppress ECONNREFUSED and network errors (expected in dev when services aren't running)
  const isConnectionRefused = error && typeof error === 'object' && (
    ('cause' in error && error.cause && typeof error.cause === 'object' &&
     'code' in error.cause && error.cause.code === 'ECONNREFUSED') ||
    (error instanceof Error && error.message.includes('network error'))
  );

  if (!isConnectionRefused) {
    log.error("Error in polling loop:", error);
  }
})
```

### 3. src/server/Worker.ts

**Location**: In `startMatchmakingPolling` catch block (~line 535)

**Apply pattern**: Wrap error logging with ECONNREFUSED check

**Before**:

```typescript
} catch (error) {
  log.error(`Error polling lobby:`, error);
}
```

**After**:

```typescript
} catch (error) {
  // CUSTOM: Suppress ECONNREFUSED errors (expected in dev when matchmaking service isn't running)
  const isConnectionRefused = error && typeof error === 'object' &&
    'cause' in error && error.cause && typeof error.cause === 'object' &&
    'code' in error.cause && error.cause.code === 'ECONNREFUSED';

  if (!isConnectionRefused) {
    log.error(`Error polling lobby:`, error);
  }
}
```

### 4. src/server/Archive.ts

**Location**: Two catch blocks in `archive()` and `readGameRecord()` functions (~lines 41 and 72)

**Apply pattern to archive() function** (~line 41):

```typescript
} catch (error) {
  // CUSTOM: Suppress ECONNREFUSED errors (expected in dev when archive service isn't running)
  const isConnectionRefused = error && typeof error === 'object' &&
    'cause' in error && error.cause && typeof error.cause === 'object' &&
    'code' in error.cause && error.cause.code === 'ECONNREFUSED';

  if (!isConnectionRefused) {
    log.error(`error archiving game record: ${error}`, {
      gameID: gameRecord.info.gameID,
    });
  }
  return;
}
```

**Apply pattern to readGameRecord() function** (~line 72):

```typescript
} catch (error) {
  // CUSTOM: Suppress ECONNREFUSED errors (expected in dev when archive service isn't running)
  const isConnectionRefused = error && typeof error === 'object' &&
    'cause' in error && error.cause && typeof error.cause === 'object' &&
    'code' in error.cause && error.cause.code === 'ECONNREFUSED';

  if (!isConnectionRefused) {
    log.error(`error reading game record: ${error}`, {
      gameID: gameId,
    });
  }
  return null;
}
```

## Pattern Matching

**Find all catch blocks**:

```bash
# In each file
grep -n "} catch" src/server/PrivilegeRefresher.ts
grep -n "} catch\|\.catch(" src/server/PollingLoop.ts
grep -n "} catch" src/server/Worker.ts
grep -n "} catch" src/server/Archive.ts
```

**Search for error logging**:

```bash
grep -n "log.error" src/server/PrivilegeRefresher.ts
grep -n "log.error" src/server/PollingLoop.ts
grep -n "log.error" src/server/Worker.ts
grep -n "log.error" src/server/Archive.ts
```

## Verification

After applying:

1. Run `pnpm dev:server`
2. Server console should NOT show:
   - "Failed to fetch cosmetics"
   - "Error in polling loop" (for ECONNREFUSED)
   - "Error polling lobby" (for ECONNREFUSED)
   - "error archiving game record" (for ECONNREFUSED)
   - "error reading game record" (for ECONNREFUSED)
3. Should STILL show other error types (network errors, parsing errors, etc.)

## Rollback

To disable this patch:

1. Remove the ECONNREFUSED check in each catch block
2. Revert to original `log.error()` calls
3. Restart server: `pnpm dev:server`
