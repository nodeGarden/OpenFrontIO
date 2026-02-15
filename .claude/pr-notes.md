# PR Documentation

## Branch: feature/local-dev-setup

**Base branch:** main

### PR Title

Add dev feature flags and settings UI improvements

### PR Description

    ## Summary

    Adds developer tooling and settings UI improvements:

    **Dev Feature Flags** - Config-based system to disable external services (analytics, Cloudflare/Turnstile, ads, public lobbies) for local development without modifying code.

    **Settings UI Overhaul** - New Display tab with theme mode selector (Light/Dark/System), collapsible setting groups, and placeholder components for future premium features.

    Sorry these aren't separated, but I went too far down the path, and separating became messy.

    ## Changes

    ### Dev Feature Flags

    #### Client-side
    - **DevConfig.ts** (new): Feature flag system that loads from `config.json`
    - **index.html**: Synchronously loads config.json and conditionally blocks external scripts
    - **Main.ts**: Skips Turnstile when cloudflare feature disabled
    - **PublicLobby.ts**: Skips lobby fetching when publicLobbies feature disabled
    - **config.example.json** (new): Template for local config with all available options

    #### Server-side
    - **Config.ts**: Added `enablePublicGames()` to ServerConfig interface
    - **DefaultConfig.ts**: Reads `ENABLE_PUBLIC_GAMES` env var (defaults to true)
    - **Master.ts**: Skips public game scheduling when disabled, reads port env vars
    - **webpack.config.js**: Reads port env vars via dotenv

    #### Dev convenience
    - **scripts/dev-stop.js** (new): Script to stop dev servers on configured ports
    - **package.json**: Added `dev:stop` script

    ### Settings UI Improvements

    #### New Components
    - **SettingGroup.ts**: Collapsible groups with localStorage persistence
    - **SettingThemeMode.ts**: Light/Dark/System theme selector
    - **SettingTerritorySkins.ts**: Territory skin preview (placeholder for premium)
    - **SettingColorPalette.ts**: Color customization (placeholder for premium)

    #### Theme Support
    - **Modal.ts**: Light theme CSS variables, MutationObserver for theme detection
    - **DarkModeButton.ts**: Syncs with settings modal via events
    - **UserSettings.ts**: Added `themeMode()`, `setThemeMode()`, `isDarkModeActive()`

    #### UI Improvements
    - **UserSettingModal.ts**: Reorganized with Display tab, sticky tabs, grouped settings
    - **setting.css**: Tab styling, theme-aware colors
    - Removed emoji icons from setting labels (all 30+ language files)

    ### Other
    - **PlayerInfoOverlay.ts**: Fixed lit import path
    - **tsconfig.json**: Added `skipLibCheck` and jest types
    - **InputHandler.ts**: Minor keybind adjustments
    - **.gitignore**: Excludes config.json, .env, internal dev files

    ## Usage

    ### Client features (config.json)

    Copy `config.example.json` to `config.json` and customize:

        {
          "features": {
            "analytics": false,
            "publicLobbies": false,
            "cloudflare": false,
            "ads": false
          },
          "settings": {
            "display": { "themeMode": "dark" }
          }
        }

    ### Server features (.env)

        ENABLE_PUBLIC_GAMES=false
        OPENFRONT_CLIENT_PORT=8080
        OPENFRONT_SERVER_PORT=4000

    ## Test plan

    ### Dev Feature Flags
    - [ ] Without config.json - all features enabled (default behavior unchanged)
    - [ ] With `cloudflare: false` - Turnstile skipped, no verification errors
    - [ ] With `publicLobbies: false` - no lobby polling
    - [ ] With `ENABLE_PUBLIC_GAMES=false` - server skips public game scheduling
    - [ ] Custom ports work when env vars are set

    ### Settings UI
    - [ ] Theme persists across page refreshes
    - [ ] Dark mode button syncs with settings modal theme selector
    - [ ] Light theme applies correct colors
    - [ ] System theme follows OS preference
    - [ ] Setting groups collapse/expand and remember state
    - [ ] Tabs are sticky when scrolling

    🤖 Generated with [Claude Code](https://claude.com/claude-code)

### Files Changed

#### New Files

- `src/client/DevConfig.ts`
- `src/client/components/baseComponents/setting/SettingGroup.ts`
- `src/client/components/baseComponents/setting/SettingThemeMode.ts`
- `src/client/components/baseComponents/setting/SettingTerritorySkins.ts`
- `src/client/components/baseComponents/setting/SettingColorPalette.ts`
- `config.example.json`
- `scripts/dev-stop.js`

#### Modified Files

- `src/client/index.html`
- `src/client/Main.ts`
- `src/client/PublicLobby.ts`
- `src/client/DarkModeButton.ts`
- `src/client/UserSettingModal.ts`
- `src/client/InputHandler.ts`
- `src/client/components/baseComponents/Modal.ts`
- `src/client/graphics/layers/PlayerInfoOverlay.ts`
- `src/client/styles/components/setting.css`
- `src/client/styles/components/modal.css`
- `src/core/configuration/Config.ts`
- `src/core/configuration/DefaultConfig.ts`
- `src/core/game/UserSettings.ts`
- `src/server/Master.ts`
- `tests/util/TestServerConfig.ts`
- `webpack.config.js`
- `tsconfig.json`
- `package.json`
- `.gitignore`
- `resources/lang/*.json` (30+ language files - emoji removal)
