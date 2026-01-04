/**
 * Development configuration system for local development.
 *
 * This module provides a way to override settings and disable features
 * during local development without modifying the codebase.
 *
 * Usage:
 * 1. Copy config.example.json to config.json in the project root
 * 2. Modify config.json to suit your local development needs
 * 3. The config is loaded synchronously in index.html before any scripts run
 *
 * Features that can be disabled:
 * - analytics: Google Analytics, Google Ads tracking
 * - ads: Publift/Fuse ads
 * - cloudflare: Turnstile captcha, Cloudflare Analytics
 * - publicLobbies: Public lobby fetching and display
 */

export interface DevConfigFeatures {
  analytics?: boolean;
  ads?: boolean;
  cloudflare?: boolean;
  publicLobbies?: boolean;
}

export interface DevConfigSettings {
  display?: {
    themeMode?: "light" | "dark" | "system";
  };
  interface?: {
    showFPS?: boolean;
  };
  graphics?: {
    lowPerformanceMode?: boolean;
  };
  controls?: {
    disableRightClickMenu?: boolean;
  };
  privacy?: {
    anonymousMode?: boolean;
  };
  audio?: {
    backgroundMusicVolume?: number;
    effectsVolume?: number;
  };
}

export interface DevConfig {
  features?: DevConfigFeatures;
  settings?: DevConfigSettings;
}

// Global dev config set synchronously in index.html
declare global {
  interface Window {
    __devConfig?: DevConfig;
  }
}

let asyncDevConfig: DevConfig | null = null;
let configLoadPromise: Promise<DevConfig | null> | null = null;

/**
 * Loads the dev config asynchronously. This is called early in Main.ts
 * to ensure the config is available before features are initialized.
 */
export async function loadDevConfig(): Promise<DevConfig | null> {
  // Return cached config if already loaded
  if (asyncDevConfig !== null) {
    return asyncDevConfig;
  }

  // Return existing promise if load is in progress
  if (configLoadPromise !== null) {
    return configLoadPromise;
  }

  configLoadPromise = (async () => {
    try {
      const response = await fetch("/config.json");
      if (!response.ok) {
        // No config.json file - this is expected in production
        return null;
      }
      asyncDevConfig = (await response.json()) as DevConfig;
      return asyncDevConfig;
    } catch {
      // Failed to load or parse - use production defaults
      return null;
    }
  })();

  return configLoadPromise;
}

/**
 * Wait for the dev config to be loaded. Call this before checking
 * feature flags if you need to ensure the async config is available.
 */
export async function waitForDevConfig(): Promise<void> {
  await loadDevConfig();
}

/**
 * Check if a dev feature is enabled. Returns true by default if no config
 * is present (production behavior).
 *
 * This function checks both the synchronous config (set in index.html)
 * and the async config (loaded in Main.ts).
 */
export function isDevFeatureEnabled(feature: keyof DevConfigFeatures): boolean {
  // Check synchronous config first (set in index.html)
  const syncConfig = window.__devConfig;
  if (syncConfig?.features?.[feature] === false) {
    return false;
  }

  // Check async config
  if (asyncDevConfig?.features?.[feature] === false) {
    return false;
  }

  // Default to enabled (production behavior)
  return true;
}

/**
 * Get the full dev config. Returns null if no config is present.
 */
export function getDevConfig(): DevConfig | null {
  return window.__devConfig ?? asyncDevConfig;
}

/**
 * Apply dev config settings to localStorage if they haven't been set yet.
 * This allows the config to provide default values without overwriting
 * user preferences.
 */
export function applyDevConfigSettings(): void {
  const config = getDevConfig();
  if (!config?.settings) {
    return;
  }

  const { settings } = config;

  const applySetting = <T>(key: string, value: T | undefined) => {
    if (value !== undefined && localStorage.getItem(key) === null) {
      localStorage.setItem(key, String(value));
    }
  };

  // Display settings
  if (settings.display) {
    applySetting("settings.themeMode", settings.display.themeMode);
  }

  // Interface settings
  if (settings.interface) {
    applySetting("settings.showFPS", settings.interface.showFPS);
  }

  // Graphics settings
  if (settings.graphics) {
    applySetting(
      "settings.lowPerformanceMode",
      settings.graphics.lowPerformanceMode,
    );
  }

  // Controls settings
  if (settings.controls) {
    applySetting(
      "settings.disableRightClickMenu",
      settings.controls.disableRightClickMenu,
    );
  }

  // Privacy settings
  if (settings.privacy) {
    applySetting("settings.anonymousMode", settings.privacy.anonymousMode);
  }

  // Audio settings
  if (settings.audio) {
    applySetting(
      "settings.backgroundMusicVolume",
      settings.audio.backgroundMusicVolume,
    );
    applySetting("settings.effectsVolume", settings.audio.effectsVolume);
  }
}
