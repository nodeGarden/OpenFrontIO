---
id: pr-3397-game-speed-keybinds
name: "Game Speed + Pause Keybinds"
category: upstream-pr
priority: medium
enabled: true
files_modified: 7
files_created: 0
dependencies: []
tags:
  - ui
  - keybinds
  - gameplay
  - speed
  - pause
source:
  type: github-pr
  repo: openfrontio/OpenFrontIO
  pr: 3397
  title: "Game Speed + Pause keybinds"
  author_discord: ""
  fetched_at: "2026-03-16"
upstream_status: open
merged_to_main: false
notes: "P=pause, </>=speed down/up. Works in both live games and replays."
target_files:
  - path: resources/lang/en.json
    changes: 1
  - path: src/client/HelpModal.ts
    changes: 1
  - path: src/client/InputHandler.ts
    changes: 1
  - path: src/client/LocalServer.ts
    changes: 1
  - path: src/client/UserSettingModal.ts
    changes: 1
  - path: src/client/graphics/layers/GameRightSidebar.ts
    changes: 1
  - path: src/client/graphics/layers/ReplayPanel.ts
    changes: 1
  - path: tests/InputHandler.test.ts
    changes: 1
---

# Game Speed + Pause Keybinds

## Source

- **PR**: [#3397](https://github.com/openfrontio/OpenFrontIO/pull/3397)
- **Status**: Open (not yet merged to main)

## Description

Adds keyboard shortcuts for controlling game speed:

- **P** — Toggle pause
- **<** (comma) — Slow down game speed
- **>** (period) — Speed up game speed

Works in both live single-player games and replay mode. Adds new intent events (`TogglePauseIntentEvent`, `GameSpeedUpIntentEvent`, `GameSpeedDownIntentEvent`) and corresponding user settings to toggle keybinds on/off.

## Changes

### `resources/lang/en.json`

Added i18n keys for speed control settings and help text.

### `src/client/HelpModal.ts`

Added keybind entries to the help modal showing P, <, > shortcuts.

### `src/client/InputHandler.ts`

Added keyboard event handlers for P, comma, and period keys that emit the new intent events.

### `src/client/LocalServer.ts`

Added listeners for the new intent events to actually change game speed/pause state.

### `src/client/UserSettingModal.ts`

Added toggle settings for enabling/disabling speed keybinds.

### `src/client/graphics/layers/GameRightSidebar.ts`

Added event listener to update pause button state when `TogglePauseIntentEvent` fires.

### `src/client/graphics/layers/ReplayPanel.ts`

Added event listener for speed change events to update replay speed display.

### `tests/InputHandler.test.ts`

Added tests for the new keybind handlers.

## Verification

```bash
# Check new intent events exist
grep -rn "TogglePauseIntentEvent\|GameSpeedUpIntentEvent\|GameSpeedDownIntentEvent" src/

# Check keybind handlers
grep -n "Comma\|Period\|KeyP" src/client/InputHandler.ts

# Run tests
pnpm test -- tests/InputHandler.test.ts
```

## When Upstream Merges

Once PR #3397 is merged to `openfrontio/OpenFrontIO:main`:

1. Set `upstream_status: merged` and `merged_to_main: true`
2. After pulling main, this patch becomes redundant — remove it

## Rollback

Revert all 7 files to their upstream main state (remove intent events, keybind handlers, settings, and i18n keys).
