---
id: pr-3383-maps
name: "Puerto Rico + Panama Maps"
category: upstream-pr
priority: low
enabled: true
files_modified: 6
files_created: 58
dependencies: []
tags:
  - maps
  - content
  - flags
  - i18n
source:
  type: github-pr
  repo: openfrontio/OpenFrontIO
  pr: 3383
  title: "Adding Puerto Rico Map"
  author_discord: ""
  fetched_at: "2026-03-16"
upstream_status: open
merged_to_main: false
notes: "Adds both Puerto Rico and Panama maps with nations, flags, and translations. Binary files (map images, thumbnails) fetched separately from PR branch."
target_files:
  - path: src/core/game/Game.ts
    changes: 1
  - path: src/server/MapPlaylist.ts
    changes: 1
  - path: resources/countries.json
    changes: 1
  - path: resources/lang/en.json
    changes: 1
  - path: resources/lang/es.json
    changes: 1
  - path: resources/flags/custom/frame.svg
    changes: 1
  - path: map-generator/main.go
    changes: 1
  - path: "resources/flags/*.svg"
    changes: 50
  - path: "resources/maps/panama/"
    changes: 1
  - path: "resources/maps/puertorico/"
    changes: 1
  - path: "map-generator/assets/maps/panama/"
    changes: 1
  - path: "map-generator/assets/maps/puertorico/"
    changes: 1
---

# Puerto Rico + Panama Maps

## Source

- **PR**: [#3383](https://github.com/openfrontio/OpenFrontIO/pull/3383)
- **Status**: Open (not yet merged to main)

## Description

Adds two new regional maps:

- **Puerto Rico** — with municipalities, districts, and custom flags
- **Panama** — with provinces and custom flags

Includes:

- Map enum entries in `Game.ts`
- Playlist entries in `MapPlaylist.ts`
- ~50 new SVG flag files for nations/regions
- Country/nation entries in `countries.json`
- English and Spanish translations
- Map generator assets (PNG source images)
- Map thumbnails (WebP)
- Updated `frame.svg` with new flag references

## Binary Files

Binary files (PNG maps, WebP thumbnails) cannot be applied via `git apply` — they were fetched directly from the PR branch commit `dd7f56a5` via GitHub API.

## Verification

```bash
# Check map enums
grep -n "PuertoRico\|Panama" src/core/game/Game.ts src/server/MapPlaylist.ts

# Check flags exist
ls resources/flags/pr-*.svg resources/flags/pa-*.svg | wc -l

# Check map assets
ls map-generator/assets/maps/panama/image.png map-generator/assets/maps/puertorico/image.png
ls resources/maps/panama/thumbnail.webp resources/maps/puertorico/thumbnail.webp

# Check countries
grep -c "panama\|puertorico\|Puerto Rico" resources/countries.json
```

## When Upstream Merges

Once PR #3383 is merged to `openfrontio/OpenFrontIO:main`:

1. Set `upstream_status: merged` and `merged_to_main: true`
2. After pulling main, all map files will come from upstream — this patch becomes redundant

## Rollback

1. Remove map enums from `Game.ts` and `MapPlaylist.ts`
2. Remove country entries from `countries.json`
3. Remove i18n keys from `en.json` and `es.json`
4. Delete `resources/flags/pr-*.svg` and `resources/flags/pa-*.svg`
5. Delete `resources/maps/panama/` and `resources/maps/puertorico/`
6. Delete `map-generator/assets/maps/panama/` and `map-generator/assets/maps/puertorico/`
7. Revert `frame.svg` and `map-generator/main.go` changes
