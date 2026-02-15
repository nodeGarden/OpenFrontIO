---
id: vite-logger
name: Vite Custom Logger
category: build
priority: medium
enabled: true
files_modified: 1
dependencies: []
tags:
  - build
  - vite
  - logging
  - warnings
target_files:
  - path: vite.config.ts
    changes: 2
---

# Vite Custom Logger

## Description

Adds a custom Vite logger that suppresses specific warnings during development:

- PostCSS @import warnings
- Public directory import warnings
- Public directory path warnings

This keeps the dev console clean while still showing important errors and relevant warnings.

## Files Modified

### vite.config.ts

**Location**: After imports, before `export default`

#### Step 1: Add custom logger function

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

#### Step 2: Use custom logger in config

**Location**: In the return object of `defineConfig`

```typescript
return {
  // CUSTOM: Use custom logger to suppress noisy warnings
  customLogger: createCustomLogger(),
  // ... rest of config
};
```

## Pattern Matching

**Find injection point**:

```bash
# Find the imports section
grep -n "^import" vite.config.ts | tail -1

# Find the defineConfig return statement
grep -n "return {" vite.config.ts
```

**Search pattern**:

- Inject function after last import, before `export default`
- Inject `customLogger` property as first item in return object

## Verification

After applying:

1. Run `pnpm dev:client`
2. Check console output
3. Should NOT see:
   - "@import must precede all other statements"
   - "Assets in public directory cannot be imported"
   - "Files in the public directory are served at the root path"
4. Should still see legitimate errors and warnings

## Rollback

To disable this patch:

1. Remove `createCustomLogger()` function
2. Remove `customLogger: createCustomLogger(),` line from config
3. Rebuild: `pnpm dev:client`
