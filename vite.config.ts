import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";

// Vite already handles these, but its good practice to define them explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";
  // In dev, redirect visits to /w*/game/* to "/" so Vite serves the index.html.
  const devGameHtmlBypass = (req?: {
    url?: string;
    method?: string;
    headers?: { accept?: string | string[] };
  }) => {
    if (req?.method !== "GET") return undefined;
    const accept = req.headers?.accept;
    const acceptValue = Array.isArray(accept)
      ? accept.join(",")
      : (accept ?? "");
    if (!acceptValue.includes("text/html")) return undefined;
    if (!req.url) return undefined;
    if (/^\/w\d+\/game\/[^/]+/.test(req.url)) {
      return "/";
    }
    return undefined;
  };

  // CUSTOM: env-ports — read ports from .env
  const clientPort = parseInt(env.OPENFRONT_CLIENT_PORT || "9000", 10);
  const serverPort = parseInt(env.OPENFRONT_SERVER_PORT || "3000", 10);
  const workerBasePort = parseInt(env.OPENFRONT_WORKER_BASE_PORT || "3001", 10);

  return {
    // CUSTOM: Use custom logger to suppress noisy warnings
    customLogger: createCustomLogger(),
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./tests/setup.ts",
    },
    root: "./",
    base: "/",
    publicDir: "resources", // Access static assets via import or explicit copy

    resolve: {
      alias: {
        "protobufjs/minimal": path.resolve(
          __dirname,
          "node_modules/protobufjs/minimal.js",
        ),
        resources: path.resolve(__dirname, "resources"),
      },
    },

    plugins: [
      tsconfigPaths(),
      ...(isProduction
        ? []
        : [
            createHtmlPlugin({
              minify: false,
              entry: "/src/client/Main.ts",
              template: "index.html",
              inject: {
                data: {
                  gitCommit: JSON.stringify("DEV"),
                  instanceId: JSON.stringify("DEV_ID"),
                },
              },
            }),
          ]),
      viteStaticCopy({
        targets: [
          {
            src: "proprietary/*",
            dest: ".",
          },
        ],
      }),
      tailwindcss(),
    ],

    define: {
      "process.env.WEBSOCKET_URL": JSON.stringify(
        isProduction ? "" : `localhost:${serverPort}`,
      ),
      "process.env.GAME_ENV": JSON.stringify(isProduction ? "prod" : "dev"),
      "process.env.STRIPE_PUBLISHABLE_KEY": JSON.stringify(
        env.STRIPE_PUBLISHABLE_KEY,
      ),
      "process.env.API_DOMAIN": JSON.stringify(env.API_DOMAIN),
      // Add other process.env variables if needed, OR migrate code to import.meta.env
    },

    build: {
      outDir: "static", // Webpack outputs to 'static', assuming we want to keep this.
      emptyOutDir: true,
      assetsDir: "assets", // Sub-directory for assets
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["pixi.js", "howler", "zod", "protobufjs"],
          },
        },
      },
    },

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
  };
});
