---
id: public-games-env
name: Public Games Environment Control
category: features
priority: medium
enabled: true
files_modified: 1
dependencies:
  - env-file
tags:
  - server
  - multiplayer
  - lobby
  - environment
  - games
target_files:
  - path: src/server/MasterLobbyService.ts
    changes: 1
---

# Public Games Environment Control

## Description

Adds environment variable check to disable automatic public game creation. This reduces server noise during local development when you're only playing single-player or private games.

## Configuration

Set in `.env` file:

```bash
ENABLE_PUBLIC_GAMES=false
```

## Files Modified

### src/server/MasterLobbyService.ts

**Location**: In `maybeScheduleLobby` method, at the beginning (~line 99)

#### Add environment variable check

**Before**:

```typescript
private async maybeScheduleLobby() {
  const lobbies = this.getAllLobbies();
  // ... rest of method
}
```

**After**:

```typescript
private async maybeScheduleLobby() {
  // CUSTOM: Respect ENABLE_PUBLIC_GAMES environment variable
  if (process.env.ENABLE_PUBLIC_GAMES === "false") {
    return;
  }

  const lobbies = this.getAllLobbies();
  // ... rest of method
}
```

## Pattern Matching

**Find the method**:

```bash
grep -n "maybeScheduleLobby" src/server/MasterLobbyService.ts
```

**Search pattern**:

- Look for `private async maybeScheduleLobby()`
- Add early return check as first statement in method body

## Verification

After applying:

1. Ensure `.env` has `ENABLE_PUBLIC_GAMES=false`
2. Run `pnpm dev:server`
3. Server console should NOT show:
   - "Scheduled public game [gameID] on worker [workerID]"
4. No public games should be created automatically

To verify it works when enabled:

1. Set `ENABLE_PUBLIC_GAMES=true` in `.env`
2. Restart server
3. Should see public games being scheduled

## Rollback

To re-enable public games:

1. Set `ENABLE_PUBLIC_GAMES=true` in `.env`
2. Or remove the environment check from the code
3. Restart server

## Related Patches

- PATCH-disable-lobby-polling.md (client-side lobby polling control)

## Notes

This was originally a user-created feature (commit 8cf4523d2) that was lost during branch changes. The original implementation added `enablePublicGames()` to the ServerConfig interface, but the current codebase structure has refactored Master.ts into MasterLobbyService.ts, so we check the environment variable directly.
