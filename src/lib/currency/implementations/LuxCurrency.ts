/**
 * Lux Premium Currency Implementation
 *
 * Migrated from src/lib/stores/lux.ts to use the unified currency system.
 * Lux is a premium currency with prestige mechanics and smooth display interpolation.
 */

import { HasLifetimeTrackingMixin } from "../core/CurrencyBase";
import { formatCurrencyAmount } from "../core/utils";
import type { CurrencyConfig, HasAmount, HasLifetimeTracking } from "../core/interfaces";
import { LUX_DISPLAY_INTERVAL } from "$lib/config/gameConfig";

// ============================================================================
// State Definition
// ============================================================================

interface LuxCurrencyState {
	amount: number;          // total lux (same as old 'total')
	displayTotal: number;    // For smooth visual updates
	lifetimeTotal: number;   // lifetimeLux
	bestAmount: number;      // bestLux - highest ever reached
	lastUpdate: number;
	lastDisplayTick: number;
	prestigeLevel: number;   // Number of resets performed
	totalLumenEarned: number; // Total Lumen earned from prestiges
}

// ============================================================================
// Lux Currency Implementation
// ============================================================================

class LuxCurrencyImpl
	extends HasLifetimeTrackingMixin<LuxCurrencyState>
	implements HasAmount, HasLifetimeTracking
{
	private displayUpdateInterval: ReturnType<typeof setInterval> | null = null;

	constructor(config: CurrencyConfig<LuxCurrencyState>) {
		super(config);
		this.setupDisplayUpdates();
	}

	/**
	 * Setup display update ticker for smooth visual feedback
	 */
	private setupDisplayUpdates(): void {
		if (typeof window !== "undefined") {
			this.displayUpdateInterval = setInterval(() => {
				this.updateDisplayValue();
			}, LUX_DISPLAY_INTERVAL);
		}
	}

	/**
	 * Update display value by interpolating towards actual value
	 */
	private updateDisplayValue(): void {
		this.update((state) => {
			const now = Date.now();
			const displayDelta = (now - state.lastDisplayTick) / 1000;

			// Interpolate display value towards actual value
			const targetDisplayTotal = state.amount;

			// If display is significantly different from actual, catch up gradually
			let newDisplayTotal = state.displayTotal;
			if (Math.abs(targetDisplayTotal - state.displayTotal) > 0.01) {
				// Lerp towards target with smooth animation
				const lerpSpeed = 3.0; // Adjust to control catch-up speed
				newDisplayTotal = state.displayTotal + (targetDisplayTotal - state.displayTotal) * displayDelta * lerpSpeed;
			} else {
				// Very close to target, just set it directly
				newDisplayTotal = targetDisplayTotal;
			}

			return {
				...state,
				displayTotal: Math.max(0, newDisplayTotal),
				lastDisplayTick: now,
			};
		});
	}

	/**
	 * Get display total for smooth animations
	 */
	get displayTotal(): number {
		return this.getCurrentState().displayTotal;
	}

	/**
	 * Get prestige level
	 */
	get prestigeLevel(): number {
		return this.getCurrentState().prestigeLevel;
	}

	/**
	 * Get total lumen earned from prestiges
	 */
	get totalLumenEarned(): number {
		return this.getCurrentState().totalLumenEarned;
	}

	/**
	 * Add lux to the total (overwrites base add to update lastUpdate)
	 */
	add(amount: number): void {
		if (amount <= 0) return;
		this.update((state) => {
			const newAmount = state.amount + amount;
			return {
				...state,
				amount: newAmount,
				lifetimeTotal: state.lifetimeTotal + amount,
				lastUpdate: Date.now(),
				bestAmount: Math.max(state.bestAmount, newAmount),
			};
		});
	}

	/**
	 * Spend lux (returns false if insufficient funds)
	 */
	spend(amount: number): boolean {
		const state = this.getCurrentState();
		if (state.amount < amount) return false;

		this.update((state) => ({
			...state,
			amount: state.amount - amount,
			lastUpdate: Date.now(),
		}));
		return true;
	}

	/**
	 * Check if player can afford something
	 */
	canAfford(amount: number): boolean {
		return this.getCurrentState().amount >= amount;
	}

	/**
	 * Get display intensity for styling (0-1 based on lux amount)
	 */
	getDisplayIntensity(): number {
		const state = this.getCurrentState();
		// Logarithmic scaling for smooth visual progression
		return Math.min(1, Math.log10(state.amount + 1) / 8);
	}

	/**
	 * Get prestige level based on lifetime lux
	 */
	getPrestigeLevel(): number {
		const state = this.getCurrentState();
		if (state.lifetimeTotal < 1000) return 0;
		return Math.floor(Math.log10(state.lifetimeTotal / 1000)) + 1;
	}

	/**
	 * Get current prestige level based on current lux
	 */
	getCurrentPrestigeLevel(): number {
		const state = this.getCurrentState();
		// Find which threshold we've reached based on current Lux
		// Thresholds: 10, 40, 90, 160, 250... (formula: 10 * n²)
		// Solving for n: n = sqrt(luxAmount / 10)
		if (state.amount < 10) return 0;
		return Math.floor(Math.sqrt(state.amount / 10));
	}

	/**
	 * Calculate lumen reward for prestige
	 */
	getLumenReward(): number {
		const state = this.getCurrentState();
		// Calculate prestige level directly: n = sqrt(luxAmount / 10)
		if (state.amount < 10) return 0;
		const prestigeLevel = Math.floor(Math.sqrt(state.amount / 10));
		return Math.max(0, prestigeLevel);
	}

	/**
	 * Get next prestige threshold
	 */
	getNextThreshold(): { lux: number; reward: number } {
		const state = this.getCurrentState();
		// Calculate current prestige level directly: n = sqrt(luxAmount / 10)
		let currentLevel = 0;
		if (state.amount >= 10) {
			currentLevel = Math.floor(Math.sqrt(state.amount / 10));
		}
		const nextLevel = currentLevel + 1;
		const nextThreshold = 10 * Math.pow(nextLevel, 2);
		return { lux: nextThreshold, reward: nextLevel };
	}

	/**
	 * Check if prestige is available
	 */
	canPrestige(): boolean {
		const state = this.getCurrentState();
		return state.amount >= 10; // Can always reset at 10+ Lux
	}

	/**
	 * Perform prestige operation
	 */
	performPrestige(): boolean {
		const state = this.getCurrentState();
		if (state.amount < 10) return false; // Check prestige requirement directly

		// Calculate lumen reward directly
		const prestigeLevel = Math.floor(Math.sqrt(state.amount / 10));
		const lumenGained = Math.max(0, prestigeLevel);
		if (lumenGained <= 0) return false; // Should not happen, but safety check

		this.update((current) => ({
			...current,
			amount: 0, // Reset Lux to 0
			displayTotal: 0, // Reset display to match
			prestigeLevel: current.prestigeLevel + 1, // Track total resets for statistics
			totalLumenEarned: current.totalLumenEarned + lumenGained,
			lastUpdate: Date.now(),
			// Keep lifetime stats
			lifetimeTotal: current.lifetimeTotal,
			bestAmount: current.bestAmount,
		}));

		// Add Lumen to the lumen store
		import("$lib/currency/implementations/LumenCurrency").then(({ lumen }) => {
			lumen.addLumen(lumenGained);
		});

		return true;
	}

	/**
	 * Reset the store (for game reset, not prestige)
	 */
	reset(): void {
		const now = Date.now();
		this.set({
			amount: 10,
			displayTotal: 10,
			lifetimeTotal: 10,
			lastUpdate: now,
			lastDisplayTick: now,
			prestigeLevel: 0,
			bestAmount: 10,
			totalLumenEarned: 0,
		});
	}

	/**
	 * Cleanup display interval on destroy
	 */
	destroy(): void {
		if (this.displayUpdateInterval) {
			clearInterval(this.displayUpdateInterval);
			this.displayUpdateInterval = null;
		}
	}
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format lux numbers for display (extracted from original)
 */
export function formatLux(num: number): string {
	return formatCurrencyAmount(num, 2);
}

/**
 * The absurd winning goal - like Prestige Tree's endgame
 */
export const WINNING_GOAL = 1.79e308; // Near JavaScript's max number

// ============================================================================
// Factory and Store Creation
// ============================================================================

/**
 * Create lux currency store
 */
function createLuxCurrency() {
	const now = Date.now();
	const config: CurrencyConfig<LuxCurrencyState> = {
		id: "lux",
		type: "premium",
		displayName: "Lux",
		storageKey: "luxState",
		defaultState: {
			amount: 10,
			displayTotal: 10,
			lifetimeTotal: 10,
			lastUpdate: now,
			lastDisplayTick: now,
			prestigeLevel: 0,
			bestAmount: 10,
			totalLumenEarned: 0,
		},
		persistence: true,
		resetOnGameReset: true,
	};

	const currency = new LuxCurrencyImpl(config);

	return {
		// Standard Svelte store interface with compatibility layer
		subscribe: (callback: (value: any) => void) => {
			return currency.subscribe((state) => {
				// Add compatibility properties to the state for $lux usage
				const enrichedState = {
					...state,
					total: state.amount,
					bestLux: state.bestAmount,
					lifetimeLux: state.lifetimeTotal,
				};
				callback(enrichedState);
			});
		},

		// Currency methods
		reset: () => currency.reset(),
		save: () => currency.save(),
		load: () => currency.load(),

		// HasAmount interface (compatibility with old API)
		get amount() { return currency.amount; },
		get total() { return currency.amount; }, // Alias for compatibility
		add: (amount: number) => currency.add(amount),
		addLux: (amount: number) => currency.add(amount), // Original method name
		canAfford: (cost: number) => currency.canAfford(cost),
		spend: (amount: number) => currency.spend(amount),
		spendLux: (amount: number) => currency.spend(amount), // Original method name

		// HasLifetimeTracking interface
		get lifetimeTotal() { return currency.lifetimeTotal; },
		get lifetimeLux() { return currency.lifetimeTotal; }, // Alias for compatibility
		get bestAmount() { return currency.bestAmount; },
		get bestLux() { return currency.bestAmount; }, // Alias for compatibility
		addToLifetime: (amount: number) => currency.addToLifetime(amount),

		// Lux-specific methods
		get displayTotal() { return currency.displayTotal; },
		get prestigeLevel() { return currency.prestigeLevel; },
		get totalLumenEarned() { return currency.totalLumenEarned; },
		getDisplayIntensity: () => currency.getDisplayIntensity(),
		getPrestigeLevel: () => currency.getPrestigeLevel(),
		getCurrentPrestigeLevel: () => currency.getCurrentPrestigeLevel(),
		getLumenReward: () => currency.getLumenReward(),
		getNextThreshold: () => currency.getNextThreshold(),
		canPrestige: () => currency.canPrestige(),
		performPrestige: () => currency.performPrestige(),

		// For cleanup (internal use)
		destroy: () => currency.destroy(),
	};
}

// ============================================================================
// Export - Compatibility Layer
// ============================================================================

/**
 * Lux store - maintains exact same API as original
 */
export const lux = createLuxCurrency();

// For debugging and testing
export { LuxCurrencyImpl, createLuxCurrency };