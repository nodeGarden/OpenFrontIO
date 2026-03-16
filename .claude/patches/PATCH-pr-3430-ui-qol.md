---
id: pr-3430-ui-qol
name: "UI Quality of Life Upgrade"
category: upstream-pr
priority: high
enabled: true
files_modified: 14
files_created: 2
dependencies: []
tags:
  - ui
  - hud
  - diplomacy
  - rate-limiting
  - security
  - balance
source:
  type: github-pr
  repo: openfrontio/OpenFrontIO
  pr: 3430
  title: "Upgrade of UI quality of life"
  author_discord: ""
  fetched_at: "2026-03-16"
upstream_status: open
merged_to_main: false
notes: |
  Large PR with multiple improvements:
  - Moveable HUD panels (control panel + events display can swap sides)
  - Diplomacy panel in events display with alliance timers
  - Nuke threat grouping in events
  - Client message rate limiting on server
  - Various UI polish (backdrop blur, padding, sizing)
  - CrazyGames SDK integration for hiding ranked mode
  - WebSocket maxPayload limits
  Also adds `limiter` npm dependency.
target_files:
  - path: index.html
    changes: 1
  - path: package.json
    changes: 1
  - path: src/client/GameModeSelector.ts
    changes: 1
  - path: src/client/components/BaseModal.ts
    changes: 1
  - path: src/client/graphics/layers/AttacksDisplay.ts
    changes: 1
  - path: src/client/graphics/layers/ControlPanel.ts
    changes: 1
  - path: src/client/graphics/layers/EventsDisplay.ts
    changes: 1
  - path: src/client/graphics/layers/GameLeftSidebar.ts
    changes: 1
  - path: src/client/graphics/layers/NameLayer.ts
    changes: 1
  - path: src/client/graphics/layers/PlayerInfoOverlay.ts
    changes: 1
  - path: src/core/configuration/Colors.ts
    changes: 1
  - path: src/server/ClientMsgRateLimiter.ts
    changes: 1
  - path: src/server/GameServer.ts
    changes: 1
  - path: src/server/MasterLobbyService.ts
    changes: 1
  - path: src/server/Worker.ts
    changes: 1
  - path: src/server/WorkerLobbyService.ts
    changes: 1
  - path: tests/server/ClientMsgRateLimiter.test.ts
    changes: 1
---

# UI Quality of Life Upgrade

## Source

- **PR**: [#3430](https://github.com/openfrontio/OpenFrontIO/pull/3430)
- **Status**: Open (not yet merged to main)

## Description

Major UI and server-side improvements:

### Client-Side

- **Moveable HUD panels**: Control panel and events display can be toggled between left/right sides via buttons. Position persists in localStorage.
- **Diplomacy panel**: New section in events display showing active alliances with timers and quick-action buttons.
- **Nuke threat grouping**: Nuclear attack events are grouped by attacker for cleaner display.
- **UI polish**: Updated backdrop blur (`bg-gray-800/92 backdrop-blur-sm`), reduced padding, fixed widths on overlays.
- **Base modal guard**: Prevents double-opening modals.
- **CrazyGames integration**: Hides ranked mode card on CrazyGames platform.
- **Name layer fix**: Better null-check for `nameLocation()` — missing location returns early without removing render.
- **Team colors**: Narrowed hue spread from +/-12 to +/-6 degrees.

### Server-Side

- **Rate limiting**: New `ClientMsgRateLimiter` class using `limiter` package to prevent message flooding. Integrated into `GameServer.ts`.
- **WebSocket limits**: `maxPayload: 2MB` on game WSS, `256KB` on lobby WSS.
- **Lobby polling**: Changed to 500ms interval, added `worker.kill()` on send failures.
- **JSON safety**: GameServer catches JSON parse errors and kicks the client.

### New Files

- `src/server/ClientMsgRateLimiter.ts` — Rate limiter implementation
- `tests/server/ClientMsgRateLimiter.test.ts` — Rate limiter tests

### New Dependencies

- `limiter: ^3.0.0` — Token bucket rate limiting library

## Conflicts with Other PRs

This PR overlaps with:

- **PR #3425** (`DefaultConfig.ts`, `TrainStation.test.ts`) — Resolved by keeping both `isReceiver` param and updated gold values/free window.
- **PR #3397** (`GameRightSidebar.ts`, `ReplayPanel.ts`) — Resolved by keeping keybind handlers and applying backdrop CSS updates.

## Verification

```bash
# Check HUD position toggle
grep -n "CONTROL_PANEL_POSITION_KEY\|EVENTS_DISPLAY_POSITION_KEY" src/client/graphics/layers/ControlPanel.ts src/client/graphics/layers/EventsDisplay.ts

# Check rate limiter
grep -rn "ClientMsgRateLimiter" src/server/

# Check diplomacy panel
grep -n "diplomacy\|renderDiplomacyPanel" src/client/graphics/layers/EventsDisplay.ts

# Check backdrop updates
grep -rn "bg-gray-800/92" src/client/graphics/layers/

# Check new dependency
grep "limiter" package.json

# Run rate limiter tests
pnpm test -- tests/server/ClientMsgRateLimiter.test.ts
```

## When Upstream Merges

Once PR #3430 is merged to `openfrontio/OpenFrontIO:main`:

1. Set `upstream_status: merged` and `merged_to_main: true`
2. After pulling main, this patch becomes redundant — remove it
3. The `limiter` dependency will come from upstream `package.json`
4. Remove `src/server/ClientMsgRateLimiter.ts` and its test from untracked files

## Rollback

This is a large patch. To rollback:

1. Revert `index.html` HUD grid layout
2. Remove HUD position toggle from `ControlPanel.ts` and `EventsDisplay.ts`
3. Revert diplomacy panel from `EventsDisplay.ts`
4. Revert backdrop CSS changes in `AttacksDisplay.ts`, `GameLeftSidebar.ts`, `GameRightSidebar.ts`
5. Revert `BaseModal.ts`, `GameModeSelector.ts`, `NameLayer.ts`, `PlayerInfoOverlay.ts`
6. Revert `Colors.ts` team color hue change
7. Remove `ClientMsgRateLimiter.ts` and its test
8. Revert `GameServer.ts`, `MasterLobbyService.ts`, `Worker.ts`, `WorkerLobbyService.ts`
9. Remove `limiter` from `package.json` and run `pnpm install`
