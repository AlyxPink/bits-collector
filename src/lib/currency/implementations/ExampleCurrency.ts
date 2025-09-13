/**
 * Example Currency Implementation
 *
 * Demonstrates how to use the unified currency system.
 * This serves as a validation of our architecture and a template for migrations.
 */

import { derived } from "svelte/store";
import { HasLifetimeTrackingMixin } from "../core/CurrencyBase";
import { calculateExponentialCost } from "../core/utils";
import type {
	CurrencyConfig,
	HasAmount,
	HasLifetimeTracking
} from "../core/interfaces";

// ============================================================================
// State Definition
// ============================================================================

interface ExampleCurrencyState {
	amount: number;
	lifetimeTotal: number;
	bestAmount: number;
	level: number;
	multiplier: number;
}

// ============================================================================
// Currency Implementation
// ============================================================================

class ExampleCurrencyImpl
	extends HasLifetimeTrackingMixin<ExampleCurrencyState>
	implements HasAmount, HasLifetimeTracking
{
	constructor(config: CurrencyConfig<ExampleCurrencyState>) {
		super(config);
	}

	// ============================================================================
	// Custom Methods
	// ============================================================================

	/**
	 * Get current level
	 */
	get level(): number {
		return this.getCurrentState().level;
	}

	/**
	 * Get current multiplier
	 */
	get multiplier(): number {
		return this.getCurrentState().multiplier;
	}

	/**
	 * Calculate upgrade cost for current level
	 */
	getUpgradeCost(): number {
		return calculateExponentialCost(this.level, 100, 1.5);
	}

	/**
	 * Purchase upgrade if affordable
	 */
	purchaseUpgrade(): boolean {
		const cost = this.getUpgradeCost();
		if (this.canAfford(cost)) {
			this.update((state) => ({
				...state,
				amount: state.amount - cost,
				level: state.level + 1,
				multiplier: state.multiplier * 1.2,
			}));
			return true;
		}
		return false;
	}

	/**
	 * Generate currency based on multiplier
	 */
	processGeneration(deltaTimeSeconds: number): void {
		const generationRate = this.level * this.multiplier;
		const generated = generationRate * deltaTimeSeconds;

		if (generated > 0) {
			this.add(generated);
		}
	}
}

// ============================================================================
// Factory and Export
// ============================================================================

/**
 * Create example currency store
 */
export function createExampleCurrency() {
	const config: CurrencyConfig<ExampleCurrencyState> = {
		id: "example",
		type: "statistic",
		displayName: "Example Currency",
		storageKey: "exampleCurrency",
		defaultState: {
			amount: 0,
			lifetimeTotal: 0,
			bestAmount: 0,
			level: 1,
			multiplier: 1.0,
		},
		persistence: true,
		resetOnGameReset: true,
	};

	const currency = new ExampleCurrencyImpl(config);

	return {
		// Standard Svelte store interface
		subscribe: currency.subscribe,

		// Currency methods
		reset: () => currency.reset(),
		save: () => currency.save(),
		load: () => currency.load(),

		// HasAmount interface
		get amount() { return currency.amount; },
		add: (amount: number) => currency.add(amount),
		canAfford: (cost: number) => currency.canAfford(cost),
		spend: (amount: number) => currency.spend(amount),

		// HasLifetimeTracking interface
		get lifetimeTotal() { return currency.lifetimeTotal; },
		get bestAmount() { return currency.bestAmount; },
		addToLifetime: (amount: number) => currency.addToLifetime(amount),

		// Custom methods
		get level() { return currency.level; },
		get multiplier() { return currency.multiplier; },
		getUpgradeCost: () => currency.getUpgradeCost(),
		purchaseUpgrade: () => currency.purchaseUpgrade(),
		processGeneration: (deltaTime: number) => currency.processGeneration(deltaTime),
	};
}

// Create and export the store instance
export const exampleCurrency = createExampleCurrency();

// ============================================================================
// Derived Stores for UI Reactivity
// ============================================================================

/**
 * Derived store for upgrade affordability
 */
export const canAffordUpgrade = derived(
	exampleCurrency,
	($currency) => {
		const cost = exampleCurrency.getUpgradeCost();
		return $currency.amount >= cost;
	}
);

/**
 * Derived store for generation rate
 */
export const generationRate = derived(
	exampleCurrency,
	($currency) => $currency.level * $currency.multiplier
);

/**
 * Derived store for formatted amounts
 */
export const formattedAmount = derived(
	exampleCurrency,
	($currency) => {
		if ($currency.amount < 1000) {
			return $currency.amount.toFixed(2);
		}
		if ($currency.amount < 1000000) {
			return ($currency.amount / 1000).toFixed(2) + "K";
		}
		return ($currency.amount / 1000000).toFixed(2) + "M";
	}
);