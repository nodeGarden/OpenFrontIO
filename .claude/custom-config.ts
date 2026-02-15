/**
 * Custom Configuration for OpenFront Modifications
 *
 * This file contains feature toggles to make it easier to maintain
 * custom modifications after upstream updates.
 *
 * To re-apply customizations after an upstream update:
 * 1. Keep this file as-is
 * 2. Re-apply the code patches documented in .claude/PATCHES.md
 */

export const customConfig = {
  /**
   * Enable/disable ads across the application
   * When false, all ad components will be hidden
   */
  enableAds: false,

  /**
   * Enable/disable non-error console logging
   * When false, only console.error and console.warn will work
   */
  enableInfoLogging: false,

  /**
   * Enable/disable lobby polling
   * When false, lobby polling will be disabled for single-player games
   */
  enableLobbyPolling: false,

  /**
   * Enable/disable lobby polling error messages
   * When false, suppresses WebSocket connection errors in console
   */
  showLobbyPollingErrors: false,

  /**
   * Enable/disable cosmetics fetch error messages
   * When false, suppresses ECONNREFUSED errors from cosmetics service (common in dev)
   */
  showCosmeticsFetchErrors: false,
};

// Make config available globally (for use in non-module contexts)
if (typeof window !== "undefined") {
  (window as any).customConfig = customConfig;
}

// Helper function to check if logging is enabled
export const shouldLog = () => customConfig.enableInfoLogging;

// Helper function for conditional console.log
export const log = (...args: any[]) => {
  if (shouldLog()) {
    console.log(...args);
  }
};

// Helper function for conditional console.info
export const info = (...args: any[]) => {
  if (shouldLog()) {
    console.info(...args);
  }
};
