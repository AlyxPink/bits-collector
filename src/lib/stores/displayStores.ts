/**
 * Display Stores
 *
 * Throttled versions of frequently updated stores for UI display.
 * These stores update less frequently based on performance mode to prevent
 * excessive re-renders when production rates are extremely high.
 */

import { derived } from "svelte/store";
import { pixels } from "$lib/currency/implementations/PixelsCurrency";
import { upgrades } from "$lib/currency/implementations/UpgradesCurrency";
import { lumen } from "$lib/currency/implementations/LumenCurrency";
import { createThrottledStore } from "$lib/utils/throttledStore";
import { gameLoop } from "./gameLoop";

/**
 * Throttled pixel counts for display
 * Updates based on performance mode to reduce re-renders
 */
export const displayPixels = createThrottledStore(pixels, { useRaf: true });

/**
 * Throttled upgrades state for display
 * Important: Use this for display only, not for calculations
 */
export const displayUpgrades = createThrottledStore(upgrades, { useRaf: true });

/**
 * Throttled lumen state for display
 */
export const displayLumen = createThrottledStore(lumen, { useRaf: true });

/**
 * Throttled game loop state for display
 */
export const displayGameLoop = createThrottledStore(gameLoop, { useRaf: true });

/**
 * Performance mode indicator for UI
 * Shows current performance status
 */
export const performanceStatus = derived(gameLoop, ($gameLoop) => {
	return {
		mode: $gameLoop.performanceMode,
		tickInterval: $gameLoop.currentTickInterval,
		productionRate: $gameLoop.productionRate,
		effectiveTPS: 1000 / $gameLoop.currentTickInterval,
	};
});
