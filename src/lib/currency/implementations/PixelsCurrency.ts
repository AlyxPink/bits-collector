/**
 * Pixels Currency Implementation
 *
 * Migrated from src/lib/stores/pixels.ts to use the unified currency system.
 * Handles RGB pixels and their conversion to white pixels with complex efficiency mechanics.
 */

import { MultiCurrencyBase, createMultiCurrencyDerived, type MultiCurrencyConfig } from "../core/MultiCurrency";

// ============================================================================
// Pixels Interfaces
// ============================================================================

export interface PixelCounts {
	red: number;
	green: number;
	blue: number;
	white: number;
	lifetimeWhite: number;
}

export interface ConversionCost {
	red: number;
	green: number;
	blue: number;
}

// ============================================================================
// Conversion Mechanics
// ============================================================================

// Calculate dynamic conversion cost based on lifetime white pixels
function calculateConversionCost(lifetimeWhite: number, breakthroughs?: any, lumenCostReduction = 1): ConversionCost {
	// Smooth exponential scaling starting from base cost of 1
	let costMultiplier = Math.pow(1 + lifetimeWhite / 10, 0.4);

	// Progressive soft caps to slow growth at different scales
	if (lifetimeWhite > 25) {
		costMultiplier *= Math.pow(lifetimeWhite / 25, 0.15);
	}
	if (lifetimeWhite > 100) {
		costMultiplier *= Math.pow(lifetimeWhite / 100, 0.25);
	}
	if (lifetimeWhite > 500) {
		costMultiplier *= Math.pow(lifetimeWhite / 500, 0.35);
	}

	// Apply Conversion Catalyst breakthrough (reduces cost multiplier by 25%)
	if (breakthroughs?.conversionCatalyst?.purchased) {
		costMultiplier *= (1 - breakthroughs.conversionCatalyst.effect);
	}

	// Apply lumen-based cost reduction synergy (passed as parameter)
	costMultiplier *= lumenCostReduction;

	const cost = Math.ceil(costMultiplier);
	return { red: cost, green: cost, blue: cost };
}

// Calculate conversion efficiency (affects white pixels gained)
function calculateConversionEfficiency(totalConversions: number, breakthroughs?: any): number {
	let efficiency = 1.0;

	// Efficiency decay with usage - more conversions = lower efficiency
	let decayRate = 0.2;

	// Apply Efficiency Stabilizer breakthrough (reduces decay by 50%)
	if (breakthroughs?.efficiencyStabilizer?.purchased) {
		decayRate *= (1 - breakthroughs.efficiencyStabilizer.effect);
	}

	efficiency /= Math.pow(1 + totalConversions / 50, decayRate);

	// Apply White Pixel Amplifier (chance for bonus white pixels)
	if (breakthroughs?.whiteAmplifier?.purchased) {
		// Add the bonus chance to the base efficiency
		efficiency *= (1 + breakthroughs.whiteAmplifier.effect);
	}

	// Minimum 10% efficiency to prevent complete stalling
	return Math.max(efficiency, 0.1);
}

// ============================================================================
// Pixels Currency Implementation
// ============================================================================

class PixelsCurrencyImpl extends MultiCurrencyBase<PixelCounts> {
	// ICurrency implementation
	getAmount(currency: "red" | "green" | "blue" | "white" | "lifetimeWhite" = "white"): number {
		const state = this.getState();
		return state[currency];
	}

	addAmount(amount: number, currency: "red" | "green" | "blue" | "white" | "lifetimeWhite" = "white"): void {
		this.updateState(state => ({
			...state,
			[currency]: state[currency] + amount
		}));
	}

	spendAmount(amount: number, currency: "red" | "green" | "blue" | "white" = "white"): boolean {
		const state = this.getState();
		if (state[currency] >= amount) {
			this.updateState(current => ({
				...current,
				[currency]: current[currency] - amount
			}));
			return true;
		}
		return false;
	}

	canAfford(amount: number, currency: "red" | "green" | "blue" | "white" = "white"): boolean {
		const state = this.getState();
		return state[currency] >= amount;
	}

	// Pixel-specific methods
	addPixel(color: "red" | "green" | "blue"): void {
		this.updateState(counts => ({
			...counts,
			[color]: counts[color] + 1,
		}));
	}

	addPixelsBulk(amounts: { red?: number; green?: number; blue?: number }): void {
		this.updateState(counts => ({
			...counts,
			red: counts.red + (amounts.red || 0),
			green: counts.green + (amounts.green || 0),
			blue: counts.blue + (amounts.blue || 0),
		}));
	}

	convertToWhite(totalConversions: number = 0, breakthroughs?: any, lumenCostReduction = 1): boolean {
		const counts = this.getState();
		const cost = calculateConversionCost(counts.lifetimeWhite, breakthroughs, lumenCostReduction);

		// Check if we have enough RGB pixels for the conversion
		if (counts.red >= cost.red && counts.green >= cost.green && counts.blue >= cost.blue) {
			const efficiency = calculateConversionEfficiency(totalConversions, breakthroughs);
			let whiteGained = Math.floor(1 * efficiency);

			// Handle bulk converter breakthrough
			if (breakthroughs?.bulkConverter?.purchased) {
				// Try to convert up to 5 sets at once
				const maxSets = Math.min(
					breakthroughs.bulkConverter.effect,
					Math.floor(counts.red / cost.red),
					Math.floor(counts.green / cost.green),
					Math.floor(counts.blue / cost.blue)
				);
				whiteGained *= maxSets;

				this.updateState(() => ({
					red: counts.red - (cost.red * maxSets),
					green: counts.green - (cost.green * maxSets),
					blue: counts.blue - (cost.blue * maxSets),
					white: counts.white + whiteGained,
					lifetimeWhite: counts.lifetimeWhite + whiteGained,
				}));
			} else {
				// Standard single conversion
				// Sometimes efficiency might result in 0 white pixels
				const actualWhiteGained = Math.max(whiteGained, efficiency > 0 ? 1 : 0);

				this.updateState(() => ({
					red: counts.red - cost.red,
					green: counts.green - cost.green,
					blue: counts.blue - cost.blue,
					white: counts.white + actualWhiteGained,
					lifetimeWhite: counts.lifetimeWhite + actualWhiteGained,
				}));
			}
			return true;
		}
		return false;
	}

	getConversionCost(breakthroughs?: any, lumenCostReduction = 1): ConversionCost {
		const counts = this.getState();
		return calculateConversionCost(counts.lifetimeWhite, breakthroughs, lumenCostReduction);
	}

	getConversionEfficiency(totalConversions: number = 0, breakthroughs?: any): number {
		return calculateConversionEfficiency(totalConversions, breakthroughs);
	}

	canConvertAtCost(totalConversions: number = 0, breakthroughs?: any, lumenCostReduction = 1): boolean {
		const counts = this.getState();
		const cost = calculateConversionCost(counts.lifetimeWhite, breakthroughs, lumenCostReduction);
		const efficiency = calculateConversionEfficiency(totalConversions, breakthroughs);

		return counts.red >= cost.red &&
			   counts.green >= cost.green &&
			   counts.blue >= cost.blue &&
			   efficiency > 0;
	}
}

// ============================================================================
// Factory Function
// ============================================================================

function createPixelsCurrency() {
	const config: MultiCurrencyConfig<PixelCounts> = {
		id: "pixels",
		type: "multi-currency",
		displayName: "Pixels",
		storageKey: "pixelCounts",
		defaultState: { red: 0, green: 0, blue: 0, white: 0, lifetimeWhite: 0 },
		persistence: true,
		resetOnGameReset: true,
	};

	return new PixelsCurrencyImpl(config);
}

// ============================================================================
// Export - Create Instance
// ============================================================================

export const pixels = createPixelsCurrency();

// Derived store for current conversion cost (default parameters)
export const conversionCost = createMultiCurrencyDerived(
	pixels,
	(state) => calculateConversionCost(state.lifetimeWhite)
);

// Derived store to check if conversion is available at current cost
export const canConvert = createMultiCurrencyDerived(
	pixels,
	(state) => {
		const cost = calculateConversionCost(state.lifetimeWhite);
		return state.red >= cost.red &&
			   state.green >= cost.green &&
			   state.blue >= cost.blue;
	}
);

// Function to create a derived store for efficiency that takes gameStats as input
export function createConversionEfficiencyStore(gameStatsStore: any) {
	// This will need to be implemented once gameStats is migrated
	// For now, return a placeholder derived store
	return createMultiCurrencyDerived(
		pixels,
		() => 1.0 // Default efficiency
	);
}

// Export factory for compatibility
export { createPixelsCurrency };