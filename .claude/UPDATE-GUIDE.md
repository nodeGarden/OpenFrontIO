# AI Agent Update Guide for OpenFront Customizations

This guide is designed for AI agents (like Claude) to automatically re-apply customizations after upstream updates. It uses pattern matching, block replacement, and injection strategies.

## Quick Start for AI Agents

When the user asks to update from upstream:

1. **Preserve these files** (never overwrite):
   - `.claude/custom-config.ts`
   - `.claude/PATCHES.md`
   - `.claude/UPDATE-GUIDE.md` (this file)
   - `.env` (contains custom configuration)

2. **Check which files were modified upstream**:

   ```bash
   git status
   git diff main <each-modified-file>
   ```

3. **Re-apply patches** using the patterns and templates below

4. **Validate** by running `pnpm dev:client` and checking console output

---

## Pattern Matching Strategy

### Finding Injection Points

Use these search patterns to locate where to inject code:

#### Pattern 1: Import Statements

**Search for**: Last import statement in file
**Inject after**: The last `import` line
**Example files**: `src/client/Main.ts`, `src/client/LobbySocket.ts`

```typescript
// PATTERN: Find last import
import { something } from "somewhere";
// INJECT CUSTOM IMPORT HERE
```

#### Pattern 2: Console Method Calls

**Search for**: `console.log(`, `console.info(`, `this.log.info(`
**Action**: Comment out or wrap with config check
**Example**: Any file with logging

#### Pattern 3: Error Catch Blocks

**Search for**: `} catch (error)` or `} catch (e)`
**Inject**: ECONNREFUSED suppression after catch statement
**Files**: Server-side files making HTTP requests

#### Pattern 4: Function Start

**Search for**: Function signature (e.g., `async start()`, `private async maybeScheduleLobby()`)
**Inject after**: Opening brace of function
**Example**: `LobbySocket.ts`, `MasterLobbyService.ts`

#### Pattern 5: Configuration Checks

**Search for**: Boolean conditions or flags
**Modify**: Add custom config check
**Example**: `window.adsEnabled = ...` in `Main.ts`

---

## Block Replacement Templates

### Template 1: Add Custom Config Import

**Pattern**: File needs to reference custom configuration
**Search**: `import.*from.*["\'].*;$` (find imports section)
**Inject after last import**:

```typescript
import { customConfig } from "../../.claude/custom-config";
```

**Note**: Path may be `"../../.claude/custom-config"` or `"../../../.claude/custom-config"` depending on file depth. Count directory levels from file to project root.

---

### Template 2: Override Console Methods

**Pattern**: Early in application lifecycle (Main.ts)
**Search**: After all imports, before main application code
**Inject**:

```typescript
// CUSTOM: Override console.log and console.info based on customConfig
// This keeps console.error and console.warn functional
if (!customConfig.enableInfoLogging) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
}
```

---

### Template 3: Suppress ECONNREFUSED Errors

**Pattern**: Any catch block in server-side code making HTTP requests
**Search**: `} catch (error) {` or `catch (error: unknown)`
**Replace entire catch block**:

```typescript
} catch (error) {
  // CUSTOM: Suppress ECONNREFUSED errors (expected in dev when service isn't running)
  const isConnectionRefused = error && typeof error === 'object' &&
    'cause' in error && error.cause && typeof error.cause === 'object' &&
    'code' in error.cause && error.cause.code === 'ECONNREFUSED';

  if (!isConnectionRefused) {
    log.error(`[ORIGINAL ERROR MESSAGE HERE]`, error);
  }
  return; // or return null; depending on function signature
}
```

**Files using this pattern**:

- `src/server/PrivilegeRefresher.ts` (line ~40-60)
- `src/server/PollingLoop.ts` (line ~16)
- `src/server/Worker.ts` (line ~535)
- `src/server/Archive.ts` (lines ~41 and ~72)

---

### Template 4: Comment Out Noisy Logs

**Pattern**: Information-only console.log or this.log.info calls
**Search**: `console.log(`, `console.info(`, `this.log.info(`
**Replace**:

```typescript
// CUSTOM: Suppressed noisy log
// [ORIGINAL LINE HERE]
```

**Files using this pattern**:

- `src/core/configuration/ConfigLoader.ts` (3 locations)
- `src/server/PrivilegeRefresher.ts` (2 locations)
- `src/server/Worker.ts` (2 locations)

---

### Template 5: Conditional Console Errors

**Pattern**: console.error calls that should respect config
**Search**: `console.error(` in client-side code
**Replace**:

```typescript
if (customConfig.showLobbyPollingErrors) {
  console.error("[ORIGINAL MESSAGE]", error);
}
```

**Files using this pattern**:

- `src/client/LobbySocket.ts` (4 locations: handleMessage, handleClose, handleError, handleConnectError)

---

### Template 6: Early Return Based on Config

**Pattern**: Function that should be disabled via config
**Search**: Function signature (e.g., `async start() {`)
**Inject at start of function**:

```typescript
async start() {
  // CUSTOM: Don't start [FEATURE NAME] if disabled
  if (!customConfig.enable[FeatureName]) {
    return;
  }
  // ... rest of original function
}
```

**Example**:

```typescript
async start() {
  // CUSTOM: Don't start lobby polling if disabled
  if (!customConfig.enableLobbyPolling) {
    return;
  }
  // ... original code
}
```

**Files using this pattern**:

- `src/client/LobbySocket.ts` (start method)

---

### Template 7: Environment Variable Check

**Pattern**: Function that should respect environment variables
**Search**: Function signature
**Inject at start of function**:

```typescript
private async maybeScheduleLobby() {
  // CUSTOM: Respect ENABLE_PUBLIC_GAMES environment variable
  if (process.env.ENABLE_PUBLIC_GAMES === "false") {
    return;
  }
  // ... rest of original function
}
```

**Files using this pattern**:

- `src/server/MasterLobbyService.ts` (maybeScheduleLobby method)

---

### Template 8: Modify Boolean Expression

**Pattern**: Boolean assignment that should include custom config
**Search**: `window.adsEnabled = `
**Find line**: Look for the assignment in `onUserMe` function
**Replace**:

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

**Files using this pattern**:

- `src/client/Main.ts` (line ~471, in onUserMe function)

---

### Template 9: Vite Custom Logger

**Pattern**: Suppress Vite build warnings
**File**: `vite.config.ts`
**Inject after imports, before export**:

```typescript
// CUSTOM: Custom logger to suppress specific warnings
function createCustomLogger() {
  const logger = {
    warn: (msg: string, options?: any) => {
      // Suppress PostCSS @import warnings
      if (msg.includes("@import must precede all other statements")) return;
      // Suppress public directory import warnings
      if (msg.includes("Assets in public directory cannot be imported")) return;
      // Suppress public directory path warnings
      if (
        msg.includes(
          "Files in the public directory are served at the root path",
        )
      )
        return;
      // Default: show the warning
      console.warn(msg, options);
    },
    info: (msg: string) => console.info(msg),
    error: (msg: string, options?: any) => console.error(msg, options),
    warnOnce: (msg: string, options?: any) => console.warn(msg, options),
    clearScreen: () => {},
    hasWarned: false,
  };
  return logger;
}
```

**Then in the config return object**:

```typescript
return {
  // CUSTOM: Use custom logger to suppress noisy warnings
  customLogger: createCustomLogger(),
  // ... rest of config
};
```

---

## File-by-File Injection Guide

### 1. vite.config.ts

**Patches needed**: 2

**Patch 1 - Add custom logger function**:

- **Location**: After imports, before `export default`
- **Pattern**: Find `import` statements, inject after last one
- **Template**: Use Template 9

**Patch 2 - Use custom logger**:

- **Location**: In the return object of defineConfig
- **Pattern**: Find `return {`, inject as first property
- **Code**: `customLogger: createCustomLogger(),`

---

### 2. .npmrc

**Create file if doesn't exist**:

```
# CUSTOM: Suppress npm/pnpm warnings
loglevel=error
```

---

### 3. src/core/configuration/ConfigLoader.ts

**Patches needed**: 3 (all comment-outs)

**Patch 1**:

- **Location**: ~line 23
- **Search**: `console.log("using prod config")`
- **Template**: Use Template 4

**Patch 2**:

- **Location**: ~line 42
- **Search**: `console.log("Server config loaded:", config)`
- **Template**: Use Template 4

**Patch 3**:

- **Location**: ~lines 54-60, in getServerConfig function
- **Search**: Three case statements with console.log
- **Template**: Use Template 4 for each

---

### 4. src/client/Main.ts

**Patches needed**: 3

**Patch 1 - Import**:

- **Location**: After existing imports
- **Pattern**: Find last import statement
- **Template**: Use Template 1
- **Code**: `import { customConfig } from "../../.claude/custom-config";`

**Patch 2 - Console override**:

- **Location**: After all imports, before application code (~line 72)
- **Template**: Use Template 2

**Patch 3 - Ads control**:

- **Location**: In onUserMe function (~line 471)
- **Search**: `window.adsEnabled = `
- **Template**: Use Template 8

---

### 5. src/client/LobbySocket.ts

**Patches needed**: 6

**Patch 1 - Import**:

- **Location**: After existing imports
- **Template**: Use Template 1
- **Code**: `import { customConfig } from "../../.claude/custom-config";`

**Patch 2 - Early return**:

- **Location**: In start() method (~line 33)
- **Template**: Use Template 6

**Patches 3-6 - Conditional errors**:

- **Location**: handleMessage, handleClose, handleError, handleConnectError methods
- **Search**: `console.error(` calls
- **Template**: Use Template 5
- **Note**: Also wrap `alert()` call in handleConnectError

---

### 6. src/server/PrivilegeRefresher.ts

**Patches needed**: 3

**Patch 1-2 - Comment out logs**:

- **Location**: start() method (~line 29) and loadPrivilegeChecker() (~line 40, 60)
- **Search**: `this.log.info(` calls
- **Template**: Use Template 4

**Patch 3 - ECONNREFUSED suppression**:

- **Location**: loadPrivilegeChecker catch block (~line 40-60)
- **Template**: Use Template 3

---

### 7. src/server/PollingLoop.ts

**Patches needed**: 1

**Patch 1 - ECONNREFUSED suppression**:

- **Location**: In startPolling function, .catch() handler (~line 16)
- **Template**: Use Template 3

---

### 8. src/server/Worker.ts

**Patches needed**: 3

**Patch 1 - ECONNREFUSED suppression**:

- **Location**: startMatchmakingPolling catch block (~line 535)
- **Template**: Use Template 3

**Patch 2 - Comment out success log**:

- **Location**: ~line 524
- **Search**: `log.info("Lobby poll successful:", data)`
- **Template**: Use Template 4

**Patch 3 - Comment out game start log**:

- **Location**: ~line 531
- **Search**: `console.log("Starting game ${gameId}")`
- **Template**: Use Template 4

---

### 9. src/server/Archive.ts

**Patches needed**: 2

**Patch 1 - ECONNREFUSED in archive function**:

- **Location**: archive function catch block (~line 41)
- **Template**: Use Template 3

**Patch 2 - ECONNREFUSED in readGameRecord function**:

- **Location**: readGameRecord catch block (~line 72)
- **Template**: Use Template 3

---

### 10. src/server/MasterLobbyService.ts

**Patches needed**: 1

**Patch 1 - Environment variable check**:

- **Location**: maybeScheduleLobby method start (~line 99)
- **Template**: Use Template 7

---

## Injecting Custom UI Elements (Buttons, Modals)

### Strategy for UI Modifications

When adding custom UI elements like buttons or modals:

#### 1. **Identify the Component**

- Search for React/UI component files in `src/client/`
- Look for existing patterns (button components, modal components)

#### 2. **Create Custom Component File**

- Place in `.claude/components/` directory
- Keep custom code separate from upstream

#### 3. **Import and Inject**

- **Pattern**: Find parent component's render/return statement
- **Search**: Look for JSX structure where element should appear
- **Inject**: Import custom component and add to JSX

#### Example Template:

```typescript
// At top of file with imports
import { CustomButton } from "../../../.claude/components/CustomButton";

// In render/return, find injection point
return (
  <div>
    {/* existing elements */}
    {/* CUSTOM: Add custom feature button */}
    <CustomButton onClick={handleCustomAction} />
  </div>
);
```

#### 4. **Modal Injection Pattern**

- **Search**: Existing modal implementations (look for `Modal`, `Dialog`, `Popup` components)
- **Copy pattern**: Use same state management approach
- **Inject**: Add state, handler, and modal component

#### Example:

```typescript
// State for modal
const [showCustomModal, setShowCustomModal] = useState(false);

// Handler
const handleCustomAction = () => {
  setShowCustomModal(true);
};

// In JSX
{showCustomModal && (
  <CustomModal onClose={() => setShowCustomModal(false)} />
)}
```

---

## Automated Re-application Procedure

For AI agents to follow when user requests "re-apply patches after upstream update":

### Step 1: Verification

```bash
# Check current branch
git branch --show-current

# Check what files were modified
git status

# Compare modified files with main
git diff main vite.config.ts
git diff main .npmrc
git diff main src/core/configuration/ConfigLoader.ts
git diff main src/client/Main.ts
git diff main src/client/LobbySocket.ts
git diff main src/server/PrivilegeRefresher.ts
git diff main src/server/PollingLoop.ts
git diff main src/server/Worker.ts
git diff main src/server/Archive.ts
git diff main src/server/MasterLobbyService.ts
```

### Step 2: Apply Patches

- Follow the "File-by-File Injection Guide" above
- Apply patches in order (1-10)
- Mark each patch with `// CUSTOM:` comment

### Step 3: Validation

```bash
# Run development server
pnpm dev:client

# Check console for:
# ✓ No ads
# ✓ No info/log messages (only errors if any)
# ✓ No lobby polling errors
# ✓ Clean Vite build output
```

### Step 4: Test

- Start solo game
- Verify ads don't appear
- Check console remains clean
- Confirm no lobby errors

---

## Quick Reference: Search Patterns

Use these grep commands to find all custom changes:

```bash
# Find all custom modifications
grep -r "CUSTOM:" src/

# Find all custom config imports
grep -r "custom-config" src/

# Find all ECONNREFUSED checks
grep -r "isConnectionRefused" src/

# Find all commented logs
grep -r "// CUSTOM: Suppressed" src/
```

---

## Configuration Reference

File: `.claude/custom-config.ts`

```typescript
export const customConfig = {
  enableAds: false, // Control ad display
  enableInfoLogging: false, // Control console.log/info
  enableLobbyPolling: false, // Control lobby WebSocket
  showLobbyPollingErrors: false, // Show/hide lobby errors
};
```

To enable features: Change `false` to `true` in the config file. No code changes needed.

---

## Troubleshooting

### Import Path Issues

- From `src/client/`: Use `"../../.claude/custom-config"`
- From `src/core/`: Use `"../../.claude/custom-config"`
- Count `..` segments: one per directory level up to project root

### TypeScript Errors

- Ensure `.claude/custom-config.ts` exports `customConfig`
- Check import paths match file structure
- Verify TypeScript can resolve the module

### Patches Not Working

- Verify `// CUSTOM:` comment is present
- Check line numbers haven't shifted (use pattern matching, not line numbers)
- Compare with original code in PATCHES.md

---

## Notes for AI Agents

1. **Always preserve existing custom code**: Don't remove `// CUSTOM:` blocks during updates
2. **Use pattern matching, not line numbers**: Upstream changes will shift line numbers
3. **Validate after each patch**: Check that code compiles and runs
4. **Mark all changes**: Every custom modification must have `// CUSTOM:` comment
5. **Keep config separate**: Never hardcode values - use `customConfig`
6. **Test thoroughly**: Run dev server and verify features work as expected

---

## Future Enhancements

Areas where this guide could be extended:

1. **Automated patch script**: Create a script that applies patches automatically
2. **Git hooks**: Pre-merge hook to detect conflicts with custom code
3. **Patch validation**: Script to verify all patches are present
4. **UI component library**: Shared custom components in `.claude/components/`
5. **State management**: Custom config for UI state if needed
