---
id: disable-lobby-polling
name: Disable Lobby Polling
category: features
priority: medium
enabled: true
files_modified: 1
dependencies:
  - custom-config
tags:
  - lobby
  - websocket
  - client
  - multiplayer
  - networking
target_files:
  - path: src/client/LobbySocket.ts
    changes: 5
---

# Disable Lobby Polling

## Description

Disables lobby polling (WebSocket connection to public game lobbies) and suppresses all related error messages. This is useful for single-player development where public lobbies are not needed.

## Configuration

Controlled by `.claude/custom-config.ts`:

```typescript
enableLobbyPolling: false; // Disable lobby polling entirely
showLobbyPollingErrors: false; // Suppress error messages even if enabled
```

## Files Modified

### src/client/LobbySocket.ts

**Dependencies**: Requires `.claude/custom-config.ts`

#### Step 1: Import custom config

**Location**: After existing imports, near top of file

```typescript
import { customConfig } from "../../.claude/custom-config";
```

#### Step 2: Add early return in start()

**Location**: In `start()` method, at the beginning (~line 33)

```typescript
async start() {
  // CUSTOM: Don't start lobby polling if disabled
  if (!customConfig.enableLobbyPolling) {
    return;
  }
  // ... rest of original function
}
```

#### Step 3: Wrap error logging

**Location**: Throughout the file, wrap all `console.error()` calls

**In handleMessage method** (~line 84):

```typescript
if (customConfig.showLobbyPollingErrors) {
  console.error("Error parsing WebSocket message:", error);
}
```

**In handleClose method** (~line 105):

```typescript
if (customConfig.showLobbyPollingErrors) {
  console.error("Max WebSocket attempts reached");
}
```

**In handleError method** (~line 112):

```typescript
if (customConfig.showLobbyPollingErrors) {
  console.error("WebSocket error:", error);
}
```

**In handleConnectError method** (~line 116):

```typescript
if (customConfig.showLobbyPollingErrors) {
  console.error("Error connecting WebSocket:", error);
  // ...
  alert("error connecting to game service");
}
```

## Pattern Matching

**Find methods**:

```bash
grep -n "async start()" src/client/LobbySocket.ts
grep -n "handleMessage\|handleClose\|handleError\|handleConnectError" src/client/LobbySocket.ts
```

**Search pattern for errors**:

```bash
grep -n "console.error" src/client/LobbySocket.ts
```

Each `console.error` should be wrapped with the config check.

## Verification

After applying:

1. Run `pnpm dev:client`
2. Open browser console
3. Should NOT see:
   - "Error parsing WebSocket message"
   - "Max WebSocket attempts reached"
   - "WebSocket error"
   - "Error connecting WebSocket"
4. No alert popups about game service connection

## Rollback

To re-enable lobby polling:

1. Set `enableLobbyPolling: true` in `.claude/custom-config.ts`
2. Set `showLobbyPollingErrors: true` to see errors
3. Rebuild: `pnpm dev:client`

Or remove the code modifications entirely.

## Related Patches

- PATCH-public-games-env.md (server-side public game control)
