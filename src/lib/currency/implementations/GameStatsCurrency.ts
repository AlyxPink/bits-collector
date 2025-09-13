/**
 * Game Statistics Currency Implementation
 *
 * Migrated from src/lib/stores/game.ts to demonstrate the unified currency system.
 * This stores tracks gameplay statistics like clicks and conversions.
 */

import { CurrencyBase } from "../core/CurrencyBase";
import type { CurrencyConfig, StatisticCurrencyState } from "../core/interfaces";

// ============================================================================
// Game Statistics Implementation
// ============================================================================

class GameStatsCurrencyImpl extends CurrencyBase<StatisticCurrencyState> {
	constructor(config: CurrencyConfig<StatisticCurrencyState>) {
		super(config);
	}

	/**
	 * Get current playtime in seconds
	 */
	get playtimeSeconds(): number {
		const state = this.getCurrentState();
		return state.playtimeSeconds + (Date.now() - state.startTime) / 1000;
	}

	/**
	 * Increment total clicks counter
	 */
	incrementClicks(): void {
		this.update((state) => ({
			...state,
			totalClicks: state.totalClicks + 1,
		}));
	}

	/**
	 * Increment total conversions counter
	 */
	incrementConversions(): void {
		this.update((state) => ({
			...state,
			totalConversions: state.totalConversions + 1,
		}));
	}

	/**
	 * Update playtime (called periodically by game loop)
	 */
	updatePlaytime(): void {
		this.update((state) => {
			const now = Date.now();
			const sessionTime = (now - state.startTime) / 1000;
			return {
				...state,
				playtimeSeconds: state.playtimeSeconds + sessionTime,
				startTime: now, // Reset session timer
			};
		});
	}

	/**
	 * Reset statistics (preserve across game resets by configuration)
	 */
	reset(): void {
		// Statistics are preserved across resets (resetOnGameReset: false)
		// Only reset if explicitly called
		const now = Date.now();
		this.set({
			totalClicks: 0,
			totalConversions: 0,
			playtimeSeconds: 0,
			startTime: now,
		});
	}
}

// ============================================================================
// Factory and Store Creation
// ============================================================================

/**
 * Create game statistics currency store
 */
function createGameStatsCurrency() {
	const config: CurrencyConfig<StatisticCurrencyState> = {
		id: "gameStats",
		type: "statistic",
		displayName: "Game Statistics",
		storageKey: "gameStats",
		defaultState: {
			totalClicks: 0,
			totalConversions: 0,
			playtimeSeconds: 0,
			startTime: Date.now(),
		},
		persistence: true,
		resetOnGameReset: false, // Statistics survive game resets
	};

	const currency = new GameStatsCurrencyImpl(config);

	return {
		// Standard Svelte store interface
		subscribe: currency.subscribe,

		// Currency methods
		reset: () => currency.reset(),
		save: () => currency.save(),
		load: () => currency.load(),

		// Game statistics specific methods
		incrementClicks: () => currency.incrementClicks(),
		incrementConversions: () => currency.incrementConversions(),
		updatePlaytime: () => currency.updatePlaytime(),

		// Computed properties
		get playtimeSeconds() { return currency.playtimeSeconds; },
	};
}

// ============================================================================
// Export - Compatibility Layer
// ============================================================================

/**
 * Game statistics store - maintains exact same API as original
 */
export const gameStats = createGameStatsCurrency();

// For debugging and testing
export { GameStatsCurrencyImpl, createGameStatsCurrency };