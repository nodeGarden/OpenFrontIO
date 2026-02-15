---
id: disable-ads
name: Disable Ads
category: features
priority: high
enabled: true
files_modified: 1
dependencies:
  - custom-config
  - console-override
tags:
  - ads
  - features
  - client
  - ui
target_files:
  - path: src/client/Main.ts
    changes: 1
---

# Disable Ads

## Description

Disables ads by modifying the `window.adsEnabled` flag based on custom configuration. Ad components are still loaded but won't display.

## Configuration

Controlled by `.claude/custom-config.ts`:

```typescript
enableAds: false; // Set to true to re-enable ads
```

## Files Modified

### src/client/Main.ts

**Dependencies**: Requires `.claude/custom-config.ts`

#### Modify ads flag

**Location**: In `onUserMe` function (~line 471)
**Search for**: `window.adsEnabled = `

**Before**:

```typescript
window.adsEnabled = !hasLinkedAccount && !crazyGamesSDK.isOnCrazyGames();
```

**After**:

```typescript
// CUSTOM: Use customConfig to control ads
window.adsEnabled =
  customConfig.enableAds &&
  !hasLinkedAccount &&
  !crazyGamesSDK.isOnCrazyGames();
```

## Pattern Matching

**Find the line**:

```bash
grep -n "window.adsEnabled" src/client/Main.ts
```

**Search pattern**:

- Look for `onUserMe` function
- Find `window.adsEnabled = ` assignment
- Prepend `customConfig.enableAds &&` to the condition

## Verification

After applying:

1. Run `pnpm dev:client`
2. Open the application
3. No ads should appear on any page
4. Check `window.adsEnabled` in console: should be `false`

## Rollback

To re-enable ads:

1. Set `enableAds: true` in `.claude/custom-config.ts`
2. Or remove `customConfig.enableAds &&` from the condition
3. Rebuild: `pnpm dev:client`
