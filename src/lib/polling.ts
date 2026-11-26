/**
 * Pure decision logic for background polling. Kept free of React/DOM imports so
 * it can be unit-tested with the Node test runner.
 *
 * A poll tick is skipped when the tab is hidden (nobody is looking at the
 * result) or when the previous request is still running (prevents requests
 * stacking up on a slow server, which multiplies CPU use).
 */
export function shouldPoll(state: { hidden: boolean; inFlight: boolean }): boolean {
  return !state.hidden && !state.inFlight;
}

/**
 * When a tab becomes visible again, refresh immediately only if the data is
 * at least one interval old; otherwise wait for the regular tick.
 */
export function shouldRefreshOnVisible(now: number, lastRunAt: number, intervalMs: number): boolean {
  return now - lastRunAt >= intervalMs;
}
