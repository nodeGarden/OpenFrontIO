---
id: env-ports
name: "Environment Variable Port Configuration"
category: features
priority: high
enabled: true
files_modified: 4
dependencies:
  - env-file
tags:
  - server
  - client
  - ports
  - environment
  - networking
  - configuration
target_files:
  - path: .env
    changes: 1
  - path: vite.config.ts
    changes: 1
  - path: src/server/Master.ts
    changes: 1
  - path: src/core/configuration/DefaultConfig.ts
    changes: 1
  - path: src/server/MapLandTiles.ts
    changes: 1
---

# Environment Variable Port Configuration

## Description

Makes all game service ports configurable via `.env` file instead of being hardcoded across the codebase. This allows running multiple instances on different ports, avoids port conflicts, and makes the dev setup more flexible.

### Environment Variables

| Variable                     | Default | Description                                                |
| ---------------------------- | ------- | ---------------------------------------------------------- |
| `OPENFRONT_CLIENT_PORT`      | `9000`  | Vite dev server port                                       |
| `OPENFRONT_SERVER_PORT`      | `3000`  | Master HTTP/WebSocket server port                          |
| `OPENFRONT_WORKER_BASE_PORT` | `3001`  | First worker port (subsequent workers increment from here) |

Worker ports are calculated as `OPENFRONT_WORKER_BASE_PORT + workerIndex`.

## Configuration

### `.env`

Add or update these variables:

```env
# Ports (defaults: client=9000, server=3000, worker_base=3001)
OPENFRONT_CLIENT_PORT=9000
OPENFRONT_SERVER_PORT=3000
OPENFRONT_WORKER_BASE_PORT=3001
```

## Files Modified

### 1. `.env`

**Description**: Add worker base port variable.

**Search pattern**:

```bash
grep -n "OPENFRONT_SERVER_PORT" .env
```

**Before**:

```env
OPENFRONT_CLIENT_PORT=9000
OPENFRONT_SERVER_PORT=8000
```

**After**:

```env
OPENFRONT_CLIENT_PORT=9000
OPENFRONT_SERVER_PORT=3000
OPENFRONT_WORKER_BASE_PORT=3001
```

### 2. `vite.config.ts`

**Description**: Read all ports from env variables instead of hardcoding. Affects: Vite dev server port, WEBSOCKET_URL define, and all proxy targets.

**Dependencies**: Vite's `loadEnv()` already loads `.env` — available via `env` variable.

**Search pattern**:

```bash
grep -n "localhost:3000\|localhost:3001\|localhost:3002\|port: 9000" vite.config.ts
```

**Step 1 — WEBSOCKET_URL define**

Find the `define:` block with `process.env.WEBSOCKET_URL`.

**Before**:

```typescript
    define: {
      "process.env.WEBSOCKET_URL": JSON.stringify(
        isProduction ? "" : "localhost:3000",
      ),
```

**After**:

```typescript
    // CUSTOM: env-ports — read ports from .env
    const clientPort = parseInt(env.OPENFRONT_CLIENT_PORT || "9000", 10);
    const serverPort = parseInt(env.OPENFRONT_SERVER_PORT || "3000", 10);
    const workerBasePort = parseInt(env.OPENFRONT_WORKER_BASE_PORT || "3001", 10);

    define: {
      "process.env.WEBSOCKET_URL": JSON.stringify(
        isProduction ? "" : `localhost:${serverPort}`,
      ),
```

**Step 2 — Server port and proxy targets**

Find `server: {` block.

**Before**:

```typescript
    server: {
      port: 9000,
      // Automatically open the browser when the server starts
      open: process.env.SKIP_BROWSER_OPEN !== "true",
      proxy: {
        "/lobbies": {
          target: "ws://localhost:3000",
          ws: true,
          changeOrigin: true,
        },
        // Worker proxies
        "/w0": {
          target: "ws://localhost:3001",
          ws: true,
          secure: false,
          changeOrigin: true,
          bypass: (req) => devGameHtmlBypass(req),
          rewrite: (path) => path.replace(/^\/w0/, ""),
        },
        "/w1": {
          target: "ws://localhost:3002",
          ws: true,
          secure: false,
          changeOrigin: true,
          bypass: (req) => devGameHtmlBypass(req),
          rewrite: (path) => path.replace(/^\/w1/, ""),
        },
        // API proxies
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
```

**After**:

```typescript
    server: {
      port: clientPort, // CUSTOM: env-ports
      // Automatically open the browser when the server starts
      open: process.env.SKIP_BROWSER_OPEN !== "true",
      proxy: {
        "/lobbies": {
          target: `ws://localhost:${serverPort}`, // CUSTOM: env-ports
          ws: true,
          changeOrigin: true,
        },
        // Worker proxies
        "/w0": {
          target: `ws://localhost:${workerBasePort}`, // CUSTOM: env-ports
          ws: true,
          secure: false,
          changeOrigin: true,
          bypass: (req) => devGameHtmlBypass(req),
          rewrite: (path) => path.replace(/^\/w0/, ""),
        },
        "/w1": {
          target: `ws://localhost:${workerBasePort + 1}`, // CUSTOM: env-ports
          ws: true,
          secure: false,
          changeOrigin: true,
          bypass: (req) => devGameHtmlBypass(req),
          rewrite: (path) => path.replace(/^\/w1/, ""),
        },
        // API proxies
        "/api": {
          target: `http://localhost:${serverPort}`, // CUSTOM: env-ports
          changeOrigin: true,
          secure: false,
        },
      },
    },
```

### 3. `src/server/Master.ts`

**Description**: Read master server port from `OPENFRONT_SERVER_PORT` env variable.

**Search pattern**:

```bash
grep -n "const PORT = 3000" src/server/Master.ts
```

**Before**:

```typescript
const PORT = 3000;
server.listen(PORT, () => {
  log.info(`Master HTTP server listening on port ${PORT}`);
});
```

**After**:

```typescript
// CUSTOM: env-ports — read master port from environment
const PORT = parseInt(process.env.OPENFRONT_SERVER_PORT || "3000", 10);
server.listen(PORT, () => {
  log.info(`Master HTTP server listening on port ${PORT}`);
});
```

### 4. `src/core/configuration/DefaultConfig.ts`

**Description**: Read worker base port from `OPENFRONT_WORKER_BASE_PORT` env variable.

**Search pattern**:

```bash
grep -n "3001 + index" src/core/configuration/DefaultConfig.ts
```

**Before**:

```typescript
  workerPortByIndex(index: number): number {
    return 3001 + index;
  }
```

**After**:

```typescript
  workerPortByIndex(index: number): number {
    // CUSTOM: env-ports — read worker base port from environment
    const basePort = typeof process !== 'undefined' && process.env?.OPENFRONT_WORKER_BASE_PORT
      ? parseInt(process.env.OPENFRONT_WORKER_BASE_PORT, 10)
      : 3001;
    return basePort + index;
  }
```

### 5. `src/server/MapLandTiles.ts`

**Description**: Read master port from `OPENFRONT_SERVER_PORT` for map fetching.

**Search pattern**:

```bash
grep -n "localhost:3000/maps" src/server/MapLandTiles.ts
```

**Before**:

```typescript
function getMapLoader(): GameMapLoader {
  mapLoader ??= new FetchGameMapLoader("http://localhost:3000/maps");
  return mapLoader;
}
```

**After**:

```typescript
function getMapLoader(): GameMapLoader {
  // CUSTOM: env-ports — read master port from environment
  const port = process.env.OPENFRONT_SERVER_PORT || "3000";
  mapLoader ??= new FetchGameMapLoader(`http://localhost:${port}/maps`);
  return mapLoader;
}
```

## Pattern Matching

All injection points use unique patterns that should survive upstream changes:

```bash
# Find all hardcoded port references
grep -rn "localhost:3000\|localhost:3001\|localhost:3002" src/ vite.config.ts
grep -n "const PORT = 3000" src/server/Master.ts
grep -n "3001 + index" src/core/configuration/DefaultConfig.ts
grep -n "port: 9000" vite.config.ts
```

## Verification

After applying this patch:

```bash
# 1. Check all CUSTOM markers are present
grep -rn "CUSTOM: env-ports" src/ vite.config.ts

# 2. Verify no hardcoded port 3000 remains in modified files
grep -n "localhost:3000" src/server/Master.ts src/server/MapLandTiles.ts
# Should return NO results

# 3. Verify .env has all three port variables
grep "OPENFRONT_.*PORT" .env
# Should show: OPENFRONT_CLIENT_PORT, OPENFRONT_SERVER_PORT, OPENFRONT_WORKER_BASE_PORT

# 4. Test with default ports
pnpm dev:client # Should start on port 9000
pnpm dev:server # Should start on port 3000

# 5. Test with custom ports (change .env then restart)
# OPENFRONT_CLIENT_PORT=4000
# OPENFRONT_SERVER_PORT=5000
# OPENFRONT_WORKER_BASE_PORT=5001
```

## Rollback

To remove this patch:

1. Revert `vite.config.ts`: Remove port variables block, restore hardcoded values
2. Revert `src/server/Master.ts`: Change back to `const PORT = 3000;`
3. Revert `src/core/configuration/DefaultConfig.ts`: Change back to `return 3001 + index;`
4. Revert `src/server/MapLandTiles.ts`: Change back to `"http://localhost:3000/maps"`
5. Remove `OPENFRONT_WORKER_BASE_PORT` from `.env`
6. Search for and remove all `// CUSTOM: env-ports` comments
7. Restart dev servers

## Metadata

- **Dependencies**: env-file (`.env` must exist)
- **Related patches**: None
- **Tags**: server, client, ports, environment, networking, configuration
