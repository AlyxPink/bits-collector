/**
 * Throttled Store Utility
 *
 * Creates a derived store that throttles updates based on performance mode.
 * Used to reduce UI re-renders when production rates are extremely high.
 */

import { derived, type Readable } from "svelte/store";
import { PERFORMANCE_MODE } from "$lib/config/gameConfig";

export interface ThrottleOptions {
	/**
	 * Force immediate update even if throttled
	 */
	immediate?: boolean;

	/**
	 * Use requestAnimationFrame for visual updates
	 */
	useRaf?: boolean;
}

/**
 * Creates a throttled version of a store that updates less frequently
 * based on the current performance mode.
 *
 * @param source Source store to throttle
 * @param options Throttling options
 * @returns Throttled readable store
 */
export function createThrottledStore<T>(
	source: Readable<T>,
	options: ThrottleOptions = {}
): Readable<T> {
	let lastValue: T;
	let lastUpdateTime = 0;
	let pendingUpdate: T | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let rafId: number | null = null;

	const getThrottleInterval = (): number => {
		// Get current performance mode from window
		const performanceMode = (window as any).__gameLoopState?.performanceMode || "normal";

		switch (performanceMode) {
			case "emergency":
			case "extreme":
				return PERFORMANCE_MODE.uiUpdateThrottle.extremeInterval;
			case "high":
				return PERFORMANCE_MODE.uiUpdateThrottle.highInterval;
			case "medium":
				return PERFORMANCE_MODE.uiUpdateThrottle.mediumInterval;
			default:
				return PERFORMANCE_MODE.uiUpdateThrottle.normalInterval;
		}
	};

	return derived(source, (value, set) => {
		const now = Date.now();
		const throttleInterval = getThrottleInterval();

		// Initialize on first call
		if (lastValue === undefined) {
			lastValue = value;
			lastUpdateTime = now;
			set(value);
			return;
		}

		// If immediate mode or enough time has passed, update immediately
		if (options.immediate || (now - lastUpdateTime) >= throttleInterval) {
			lastValue = value;
			lastUpdateTime = now;
			set(value);
			return;
		}

		// Otherwise, schedule a throttled update
		pendingUpdate = value;

		// Clear existing scheduled updates
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		const executeUpdate = () => {
			if (pendingUpdate !== null) {
				lastValue = pendingUpdate;
				lastUpdateTime = Date.now();
				set(pendingUpdate);
				pendingUpdate = null;
			}
		};

		// Use requestAnimationFrame for visual updates, or setTimeout for logic updates
		if (options.useRaf && typeof requestAnimationFrame !== "undefined") {
			rafId = requestAnimationFrame(executeUpdate);
		} else {
			const delay = throttleInterval - (now - lastUpdateTime);
			timeoutId = setTimeout(executeUpdate, Math.max(0, delay));
		}
	});
}

/**
 * Format large numbers with abbreviations for display
 * Reduces string operations for performance
 */
export function formatLargeNumber(value: number): string {
	if (value < 1000) return value.toFixed(0);
	if (value < 1000000) return `${(value / 1000).toFixed(1)}K`;
	if (value < 1000000000) return `${(value / 1000000).toFixed(1)}M`;
	if (value < 1000000000000) return `${(value / 1000000000).toFixed(1)}B`;
	return `${(value / 1000000000000).toFixed(1)}T`;
}

/**
 * Batch multiple store subscriptions into a single RAF update
 * Useful for components that depend on multiple stores
 */
export function batchUpdates<T>(callback: () => T): T {
	// In production, batch updates using RAF
	if (typeof requestAnimationFrame !== "undefined") {
		let result: T;
		const update = () => {
			result = callback();
		};
		requestAnimationFrame(update);
		return result!;
	}

	// In SSR or tests, execute immediately
	return callback();
}
