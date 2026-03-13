# OpenFront Custom Patches

> **Note**: This is the master patch registry. Individual patch files are in the `patches/` directory.
>
> **New Modular System**: Patches are now organized as individual files for better maintainability and selective application.

## Quick Links

- 📖 [Patch System Documentation](PATCH-SYSTEM.md) - How this system works
- 🔧 [Update Guide](UPDATE-GUIDE.md) - AI agent instructions for applying patches
- 📝 [Feature Summary](FEATURE-SUMMARY.md) - Lost features from previous branches
- 📋 [YAML Index](PATCHES-index.yaml) - Machine-readable patch registry

## Active Patches

| Status | Patch                                                           | Priority | Files | Category | Description                                              |
| ------ | --------------------------------------------------------------- | -------- | ----- | -------- | -------------------------------------------------------- |
| ✅     | [Vite Logger](patches/PATCH-vite-logger.md)                     | Medium   | 1     | Build    | Suppress noisy Vite build warnings                       |
| ✅     | [NPM/PNPM Logging](patches/PATCH-npmrc.md)                      | Low      | 1     | Build    | Suppress npm/pnpm package manager warnings               |
| ✅     | [Console Override](patches/PATCH-console-override.md)           | High     | 1     | Logging  | Suppress console.log and console.info globally           |
| ✅     | [Disable Ads](patches/PATCH-disable-ads.md)                     | High     | 1     | Features | Disable all advertisements                               |
| ✅     | [Disable Lobby Polling](patches/PATCH-disable-lobby-polling.md) | Medium   | 1     | Features | Disable lobby WebSocket polling and errors               |
| ✅     | [Suppress ECONNREFUSED](patches/PATCH-suppress-econnrefused.md) | High     | 4     | Logging  | Suppress connection refused errors for optional services |
| ✅     | [Suppress Config Logs](patches/PATCH-suppress-config-logs.md)   | Low      | 1     | Logging  | Suppress configuration loading log messages              |
| ✅     | [Public Games Env](patches/PATCH-public-games-env.md)           | Medium   | 1     | Features | Disable public game scheduling via environment variable  |
| ✅     | [Suppress Server Logs](patches/PATCH-suppress-server-logs.md)   | Low      | 2     | Logging  | Suppress noisy server informational logs                 |
| ✅     | [Env Ports](patches/PATCH-env-ports.md)                         | High     | 4     | Features | Configure all game service ports via .env file           |
| ❌     | [Game Template Manager](patches/PATCH-game-template-manager.md) | Medium   | 3     | UI       | Save/load game setting templates with favorite support   |

**Legend**: ✅ Enabled | ❌ Disabled

## Patch Categories

### 🔨 Build (2 patches)

- **Vite Logger** - Suppress build warnings
- **NPM/PNPM Logging** - Suppress package manager warnings

### 📊 Logging (5 patches)

- **Console Override** - Client-side logging suppression
- **Suppress ECONNREFUSED** - Server connection error suppression
- **Suppress Config Logs** - Configuration loading log suppression
- **Suppress Server Logs** - General server log suppression

### ✨ Features (4 patches)

- **Disable Ads** - Remove advertisements
- **Disable Lobby Polling** - Disable public lobby WebSocket
- **Public Games Env** - Control public game scheduling
- **Env Ports** - Configure all service ports via .env

### 🎨 UI (1 patch)

- **Game Template Manager** - Save/load game setting templates with favorite support

## Dependencies

### Custom Config (`.claude/custom-config.ts`)

Required by:

- Console Override
- Disable Ads
- Disable Lobby Polling

### Environment File (`.env`)

Required by:

- Public Games Env

## Application Order

When applying patches after an upstream update, use this order:

1. **Prerequisites**
   - Ensure `.claude/custom-config.ts` exists
   - Ensure `.env` exists

2. **Build Tooling**
   - NPM/PNPM Logging
   - Vite Logger

3. **Client Configuration**
   - Console Override (requires custom-config)
   - Disable Ads (requires custom-config, console-override)
   - Disable Lobby Polling (requires custom-config)

4. **Server Logging**
   - Suppress Config Logs
   - Suppress Server Logs
   - Suppress ECONNREFUSED

5. **Server Features**
   - Public Games Env (requires .env)

## Quick Actions

### Enable/Disable a Patch

**In this file (Markdown)**: Change the status icon:

- ✅ Enabled
- ❌ Disabled

**In YAML index**: Set `enabled: true/false`

Then have an AI agent re-apply patches.

### Add a New Patch

1. Create new file: `.claude/patches/PATCH-your-feature.md`
2. Follow the template structure (see existing patches)
3. Add row to the table above
4. Update `PATCHES-index.yaml` with metadata
5. Update application order if needed
6. Document dependencies

### Verify Patches

After applying patches:

```bash
# Check custom changes are present
grep -r "CUSTOM:" src/

# Verify config file exists
ls -la .claude/custom-config.ts

# Test the application
pnpm dev:client
pnpm dev:server
```

## Patch Statistics

- **Total Patches**: 11
- **Enabled**: 10
- **Disabled**: 1
- **Total Files Modified**: 21
- **Categories**: 4 (Build, Logging, Features, UI)

## Format Options

This patch system supports two index formats:

### 1. Markdown Index (This File)

- Human-readable
- Rich formatting
- GitHub renders nicely
- Easy to edit manually

### 2. YAML Index ([PATCHES-index.yaml](PATCHES-index.yaml))

- Machine-parseable
- Structured metadata
- Better for automation
- Easy to query/filter

**Choose the format that works best for your workflow!**

## For AI Agents

To apply all enabled patches:

1. **Option A - Read Markdown**: Parse this file's table for ✅ entries
2. **Option B - Read YAML**: Parse `PATCHES-index.yaml` for `enabled: true`
3. Read each patch file for implementation details
4. Apply patches in the order specified above
5. Verify each patch after applying
6. Report any conflicts or issues

## Recent Changes

- 2026-02-14: Created modular patch system
- 2026-02-14: Migrated from monolithic PATCHES.md
- 2026-02-14: Added YAML index option
- 2026-02-14: All patches documented and tested

## Notes

- All patches use pattern matching, not line numbers
- All custom code marked with `// CUSTOM:` comments
- Patches are designed to survive upstream updates
- See [PATCH-SYSTEM.md](PATCH-SYSTEM.md) for detailed documentation
- Individual patch files contain complete implementation instructions

## Migration from Old System

The old monolithic PATCHES.md has been replaced with:

- **Individual patch files** in `patches/` directory (self-contained)
- **This file** as the index/registry (human-readable)
- **PATCHES-index.yaml** as alternative index (machine-readable)

Benefits:

- ✅ Modular and maintainable
- ✅ Enable/disable individual patches
- ✅ Add new patches without affecting existing ones
- ✅ Better organization and discoverability
- ✅ Suitable for automation and tooling
