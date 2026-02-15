# Custom Features from Previous Branches

This document summarizes custom features that existed in your `local` branch (December 2025 - January 2026) that were lost during branch changes.

## Overview

Your previous work included two distinct configuration approaches:

### 1. **Current Simple Approach** (Recently Implemented)

- File: `.claude/custom-config.ts`
- TypeScript-based configuration
- Requires rebuild to change settings
- **Pros**: Simple, type-safe
- **Cons**: Not runtime-configurable, requires recompilation

### 2. **Previous Dev Feature Flags System** (From `local` branch)

- Files: `src/client/DevConfig.ts`, `config.json`
- Runtime JSON configuration
- Loaded before external scripts in HTML
- **Pros**: Runtime-configurable, no rebuild needed, more flexible
- **Cons**: More complex implementation

---

## Features from Previous Branches

### ✅ Already Restored

1. **ENABLE_PUBLIC_GAMES** (Commit: 8cf4523d2)
   - Environment variable to disable public game creation
   - Reduces server log noise
   - Status: ✅ Restored (modified for current codebase structure)

### 🔄 Partially Restored

2. **Dev Feature Flags System** (Commits: d31697f2c, 5d58644c2, 388cabecd)
   - **What it did**:
     - Runtime feature flags via `config.json`
     - Disable: analytics, ads, Cloudflare/Turnstile, public lobbies
     - Synchronous loading in HTML before external scripts
     - Conditional script loading based on config
   - **Current status**: Replaced with simpler `.claude/custom-config.ts`
   - **Files involved**:
     - `src/client/DevConfig.ts` (config loader)
     - `config.json` (runtime config file)
     - `config.example.json` (template)
     - Modified: `src/client/Main.ts`, `src/client/PublicLobby.ts`, `index.html`

### 📋 Not Yet Restored

3. **Configurable Dev Server Ports** (Commit: 969623bb0)
   - Environment variables for client and server ports
   - Status: May already exist in current codebase (check `.env`)

4. **Theme/Display Settings** (Multiple commits)
   - Light/dark theme support (Commits: 2177a88d0, a89a54625)
   - Theme mode sync with settings
   - Dark mode button integrated with settings
   - Territory Skins component (Commit: d9c3efbc2)
   - Status: ❌ Not restored

5. **Color Palette Editor** (Commit: 65a17beed)
   - Editor for Territory Colors in settings
   - Custom color palette configuration
   - Status: ❌ Not restored

6. **Enhanced Settings Modal** (Multiple commits)
   - Sticky tabs below header (Commit: 791923ec0)
   - Collapsible grouped settings with 2-column layout (Commit: f2d284271)
   - Display tab with theme mode and cosmetics (Commit: 8434392f4)
   - Masonry layout with CSS columns (Commit: 31447d49d)
   - Nested settings structure (Commit: c1a6a7de9)
   - Status: ❌ Not restored

7. **Game Setting Templates** (Commits: b5262f955, b6bbefeac, 546653292, 0b06ccc8e, 77bc7b08b)
   - Templates for SinglePlayerModal
   - Quick game setup presets
   - Save/load game settings with favorite support
   - Visual feedback when loading favorite template
   - Import/Export template functionality
   - Status: ✅ **Documented as patch** (see `.claude/patches/PATCH-game-template-manager.md`)
   - Source branch: `dev-2`

8. **Local Dev Convenience Scripts** (Commit: 9b856263d)
   - Convenience scripts for local development
   - Status: ❌ Not restored (may exist in package.json)

9. **Shift+Drag Bounding Box Selection** (Commit: 2fc67edfe)
   - Reserved gesture for future feature
   - Status: ❌ Not restored

---

## Recommendation: Which Approach to Use?

Given your goal of maintaining customizations across upstream updates, I recommend:

### **Option A: Hybrid Approach (Recommended)**

Combine both systems for maximum flexibility:

1. **Use `config.json` + `DevConfig.ts` for runtime features**:
   - Ads control
   - Analytics control
   - Cloudflare/Turnstile
   - Public lobbies
   - Any feature that users might want to toggle without rebuilding

2. **Use `.claude/custom-config.ts` for build-time features**:
   - Console logging suppression
   - Vite logger customization
   - Development-only code paths

3. **Benefits**:
   - Runtime configuration for most features (no rebuild needed)
   - Type safety where it matters
   - Clear separation between runtime and build-time config

### **Option B: Keep Current Simple Approach**

If you prefer simplicity:

- Keep `.claude/custom-config.ts`
- Accept rebuild requirement for changes
- Easier to understand and maintain

### **Option C: Full DevConfig Migration**

Move everything to runtime config:

- Replace `.claude/custom-config.ts` with `DevConfig.ts` + `config.json`
- Most flexible but most complex
- Best if you frequently toggle features

---

## Implementation Path for Hybrid Approach

If you choose Option A (Hybrid), here's the migration path:

### Phase 1: Restore DevConfig System

1. Restore `src/client/DevConfig.ts` from commit 388cabecd
2. Create `config.json` and `config.example.json`
3. Update `index.html` to load config synchronously
4. Update `.gitignore` to exclude `config.json`

### Phase 2: Migrate Runtime Features

Move these from `.claude/custom-config.ts` to `config.json`:

- `enableAds` → `features.ads`
- `enableLobbyPolling` → `features.publicLobbies`
- `showLobbyPollingErrors` → keep in custom-config (build-time)

### Phase 3: Restore UI Features (Optional)

Based on priority:

1. Theme/Display settings (user-facing value)
2. Game setting templates (convenience)
3. Enhanced settings modal (UX improvement)
4. Color palette editor (customization)

---

## DevConfig.ts Reference (From Commit d31697f2c)

```typescript
export interface DevFeatureConfig {
  features: {
    analytics: boolean;
    publicLobbies: boolean;
    cloudflare: boolean;
    ads: boolean;
  };
}

const defaultConfig: DevFeatureConfig = {
  features: {
    analytics: true,
    publicLobbies: true,
    cloudflare: true,
    ads: true,
  },
};

export async function loadDevConfig(): Promise<DevFeatureConfig> {
  // Load from /config.json, fall back to defaults
}

export function isDevFeatureEnabled(
  feature: keyof DevFeatureConfig["features"],
): boolean {
  return getDevConfig().features[feature];
}
```

### config.json Format

```json
{
  "features": {
    "analytics": false,
    "publicLobbies": false,
    "cloudflare": false,
    "ads": false
  }
}
```

### Usage in Code

```typescript
// In Main.ts initialize()
await loadDevConfig();

// Check features
if (!isDevFeatureEnabled("cloudflare")) {
  // Skip Turnstile
}

if (!isDevFeatureEnabled("ads")) {
  window.adsEnabled = false;
}
```

---

## HTML Script Loading Pattern (From Commit 388cabecd)

The sophisticated approach loaded config.json synchronously in HTML before any external scripts:

```html
<script>
  // Load config.json synchronously before any other scripts
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/config.json", false); // Synchronous
  xhr.send();

  const config =
    xhr.status === 200
      ? JSON.parse(xhr.responseText)
      : { features: { ads: true, analytics: true, cloudflare: true } };

  window.__DEV_CONFIG__ = config;
</script>

<!-- Conditionally load external scripts based on config -->
<script>
  if (window.__DEV_CONFIG__.features.ads) {
    // Load ad scripts
  }
  if (window.__DEV_CONFIG__.features.analytics) {
    // Load analytics scripts
  }
  if (window.__DEV_CONFIG__.features.cloudflare) {
    // Load Turnstile
  }
</script>
```

This prevented external scripts from loading at all when disabled, rather than just not using them.

---

## Files to Restore for Full DevConfig System

From commit tree `d31697f2c` → `388cabecd`:

1. **New files to create**:
   - `src/client/DevConfig.ts`
   - `config.json` (gitignored)
   - `config.example.json` (committed)

2. **Files to modify**:
   - `src/client/Main.ts` - Add `loadDevConfig()` call
   - `src/client/PublicLobby.ts` - Wait for config before polling
   - `index.html` - Add synchronous config loading script
   - `.gitignore` - Add `config.json`

3. **Files to potentially remove**:
   - `.claude/custom-config.ts` (if fully migrating to DevConfig)

---

## Next Steps - Choose Your Path

### If you want **Option A (Hybrid)**:

1. I'll restore DevConfig.ts from your branches
2. Create config.json template
3. Update HTML for synchronous loading
4. Migrate runtime features to config.json
5. Keep build-time features in custom-config.ts

### If you want **Option B (Keep Simple)**:

1. Continue using `.claude/custom-config.ts`
2. Use UPDATE-GUIDE.md for re-applying patches
3. Accept rebuild requirement

### If you want **Option C (Full DevConfig)**:

1. Restore complete DevConfig system
2. Remove `.claude/custom-config.ts`
3. Migrate all features to runtime config

**Which option would you prefer?** I recommend Option A (Hybrid) for maximum flexibility while keeping the maintenance burden reasonable.
