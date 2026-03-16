---
id: pr-3425-train-gold
name: "Asymmetric Train Gold Rewards"
category: upstream-pr
priority: medium
enabled: true
files_modified: 4
files_created: 0
dependencies: []
tags:
  - gameplay
  - economy
  - trains
  - balance
source:
  type: github-pr
  repo: openfrontio/OpenFrontIO
  pr: 3425
  title: "Asymmetric train gold rewards"
  author_discord: ""
  fetched_at: "2026-03-16"
upstream_status: open
merged_to_main: false
notes: "Factory owner gets +5k gold bonus over city owner per train delivery"
target_files:
  - path: src/core/configuration/Config.ts
    changes: 1
  - path: src/core/configuration/DefaultConfig.ts
    changes: 1
  - path: src/core/execution/nation/NationStructureBehavior.ts
    changes: 1
  - path: src/core/game/TrainStation.ts
    changes: 1
  - path: tests/core/game/TrainStation.test.ts
    changes: 1
---

# Asymmetric Train Gold Rewards

## Source

- **PR**: [#3425](https://github.com/openfrontio/OpenFrontIO/pull/3425)
- **Status**: Open (not yet merged to main)

## Description

Adds an `isReceiver` boolean parameter to the `trainGold()` config method, allowing the factory owner (sender) to receive +5,000 more gold than the city owner (receiver) per train delivery. This creates an asymmetric incentive where building factories is more rewarding than just receiving trains.

## Changes

### `src/core/configuration/Config.ts`

Added `isReceiver: boolean` parameter to `trainGold()` interface method.

### `src/core/configuration/DefaultConfig.ts`

Updated `trainGold()` implementation to subtract 5,000 gold when `isReceiver` is true.

### `src/core/execution/nation/NationStructureBehavior.ts`

Updated call sites to pass `isReceiver` flag when distributing train gold to factory owner vs city owner.

### `src/core/game/TrainStation.ts`

Updated `goldForVisit()` to accept and forward the `isReceiver` parameter.

### `tests/core/game/TrainStation.test.ts`

Updated all test cases to include the `isReceiver` parameter.

## Verification

```bash
# Check isReceiver parameter exists
grep -n "isReceiver" src/core/configuration/Config.ts src/core/configuration/DefaultConfig.ts src/core/game/TrainStation.ts

# Run tests
pnpm test -- tests/core/game/TrainStation.test.ts
```

## When Upstream Merges

Once PR #3425 is merged to `openfrontio/OpenFrontIO:main`:

1. Set `upstream_status: merged` and `merged_to_main: true`
2. After pulling main, this patch becomes redundant — remove it
3. Run `grep -n "isReceiver" src/core/` to confirm upstream version matches

## Rollback

1. Remove `isReceiver` parameter from `Config.ts` interface
2. Remove asymmetry logic from `DefaultConfig.ts`
3. Revert `NationStructureBehavior.ts` call sites
4. Revert `TrainStation.ts` and tests
