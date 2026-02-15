import { logger } from "./Logger";

const log = logger.child({ comp: "polling" });

/**
 * Starts a polling loop that executes the given async task effectively recursively using setTimeout.
 * This guarantees that the next execution only starts after the previous one has completed (or failed),
 * preventing request pile-ups.
 *
 * @param task The async function to execute.
 * @param intervalMs The delay in milliseconds before the next execution.
 */
export function startPolling(task: () => Promise<void>, intervalMs: number) {
  const runLoop = () => {
    task()
      .catch((error) => {
        // CUSTOM: Suppress ECONNREFUSED and network errors (expected in dev when services aren't running)
        const hasECONNREFUSED =
          error &&
          typeof error === "object" &&
          "cause" in error &&
          error.cause &&
          typeof error.cause === "object" &&
          "code" in error.cause &&
          error.cause.code === "ECONNREFUSED";
        const hasNetworkError =
          error instanceof Error && error.message.includes("network error");

        if (!hasECONNREFUSED && !hasNetworkError) {
          log.error("Error in polling loop:", error);
        }
      })
      .finally(() => {
        setTimeout(runLoop, intervalMs);
      });
  };
  runLoop();
}
