---
id: console-override
name: Console Logging Override
category: logging
priority: high
enabled: true
files_modified: 1
dependencies:
  - custom-config
tags:
  - logging
  - console
  - client
  - debugging
target_files:
  - path: src/client/Main.ts
    changes: 2
---

# Console Logging Override

## Description

Overrides `console.log` and `console.info` to no-op functions based on custom configuration. Preserves `console.error` and `console.warn` for debugging. This dramatically reduces console noise during development while keeping important error messages visible.

## Configuration

Controlled by `.claude/custom-config.ts`:

```typescript
enableInfoLogging: false; // Set to true to re-enable console.log/info
```

## Files Modified

### src/client/Main.ts

**Dependencies**: Requires `.claude/custom-config.ts`

#### Step 1: Import custom config

**Location**: After existing imports, near top of file

```typescript
import { customConfig } from "../../.claude/custom-config";
```

#### Step 2: Add console override

**Location**: After all imports, before main application code (~line 72)

```typescript
// CUSTOM: Override console.log and console.info based on customConfig
// This keeps console.error and console.warn functional
if (!customConfig.enableInfoLogging) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
}
```

## Pattern Matching

**Find import section**:

```bash
# Find last import
grep -n "^import" src/client/Main.ts | tail -1
```

**Find injection point for override**:

- After all imports
- Before `class Client` or main code
- Look for existing comment blocks or initialization code

## Verification

After applying:

1. Run `pnpm dev:client`
2. Open browser console
3. Should NOT see:
   - `console.log()` messages
   - `console.info()` messages
4. Should STILL see:
   - `console.error()` messages
   - `console.warn()` messages

Test with temporary code:

```typescript
console.log("TEST - should not appear");
console.info("TEST - should not appear");
console.warn("TEST - should appear");
console.error("TEST - should appear");
```

## Rollback

To disable this patch:

1. Set `enableInfoLogging: true` in `.claude/custom-config.ts`
2. Or remove the console override code block
3. Rebuild: `pnpm dev:client`

## Related Patches

- PATCH-suppress-config-logs.md (comments out server-side logs)
