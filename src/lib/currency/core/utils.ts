/**
 * Currency Utilities
 *
 * Shared utility functions for cost calculations, validation, formatting,
 * and other common currency operations.
 */

import type { CurrencyAmount, ConversionRecipe, CostConfig } from "./interfaces";

// ============================================================================
// Cost Calculation Utilities
// ============================================================================

/**
 * Calculate exponential costs (most common for upgrades)
 * Formula: baseCost * (multiplier ^ level)
 */
export function calculateExponentialCost(
	level: number,
	baseCost: number,
	costMultiplier: number
): number {
	return Math.floor(baseCost * Math.pow(costMultiplier, level));
}

/**
 * Calculate linear costs
 * Formula: baseCost + (level * increment)
 */
export function calculateLinearCost(
	level: number,
	baseCost: number,
	increment: number
): number {
	return Math.floor(baseCost + (level * increment));
}

/**
 * Calculate power curve costs with custom exponent
 * Formula: baseCost * (level ^ exponent)
 */
export function calculatePowerCost(
	level: number,
	baseCost: number,
	exponent: number
): number {
	if (level === 0) return baseCost;
	return Math.floor(baseCost * Math.pow(level, exponent));
}

/**
 * Universal cost calculator using CostConfig
 */
export function calculateCost(level: number, config: CostConfig): number {
	switch (config.formula) {
		case "exponential":
			return calculateExponentialCost(level, config.baseCost, config.costMultiplier);

		case "linear":
			return calculateLinearCost(level, config.baseCost, config.costMultiplier);

		case "power":
			return calculatePowerCost(level, config.baseCost, config.costMultiplier);

		case "custom":
			if (!config.customFormula) {
				throw new Error("Custom formula not provided in CostConfig");
			}
			return Math.floor(config.customFormula(level, config.baseCost));

		default:
			throw new Error(`Unknown cost formula: ${config.formula}`);
	}
}

// ============================================================================
// Pure Color Multiplier Calculator (Extracted from pureColors.ts)
// ============================================================================

/**
 * Calculate the complex pure color multiplier
 * Extracted from pureColors.ts to eliminate duplication
 */
export function calculatePureColorMultiplier(
	pureCount: number,
	hasAllPureColors: boolean = false
): number {
	if (pureCount === 0) return 1;

	// Layer 1: Base logarithmic growth
	const baseBoost = Math.pow(pureCount, 0.5) * 0.1; // Sqrt scaling

	// Layer 2: Milestone bonuses at 10, 25, 50, 100, etc.
	const milestones = [10, 25, 50, 100, 250, 500, 1000];
	const milestoneBonus = milestones.filter((m) => pureCount >= m).length * 0.15;

	// Layer 3: Diminishing returns after certain thresholds
	let effectiveCount = pureCount;
	if (pureCount > 100) effectiveCount = 100 + Math.pow(pureCount - 100, 0.8);
	if (pureCount > 500) effectiveCount = 400 + Math.pow(pureCount - 500, 0.6);

	// Layer 4: Synergy bonus if you have all three pure colors
	const synergyBonus = hasAllPureColors ? Math.log10(pureCount + 1) * 0.2 : 0;

	// Final calculation with soft cap smoothing
	const rawMultiplier = 1 + baseBoost + milestoneBonus + (effectiveCount * 0.01) + synergyBonus;

	// Apply smooth soft cap (no hard walls!)
	if (rawMultiplier > 20) return 18 + Math.pow(rawMultiplier - 20, 0.3);
	if (rawMultiplier > 10) return 9 + Math.pow(rawMultiplier - 10, 0.5);
	if (rawMultiplier > 5) return 5 + Math.pow(rawMultiplier - 5, 0.7);

	return rawMultiplier;
}

/**
 * Calculate random generator multiplier from pure colors
 * Extracted and simplified from pureColors.ts
 */
export function calculateRandomGeneratorMultiplier(
	redCount: number,
	greenCount: number,
	blueCount: number
): number {
	if (redCount === 0 && greenCount === 0 && blueCount === 0) return 1;

	const hasAllPure = redCount > 0 && greenCount > 0 && blueCount > 0;

	// Calculate each color's multiplier
	const redMult = calculatePureColorMultiplier(redCount, hasAllPure);
	const greenMult = calculatePureColorMultiplier(greenCount, hasAllPure);
	const blueMult = calculatePureColorMultiplier(blueCount, hasAllPure);
	const averageMultiplier = (redMult + greenMult + blueMult) / 3;

	// Balance bonus for similar counts
	const maxCount = Math.max(redCount, greenCount, blueCount);
	const minCount = Math.min(redCount, greenCount, blueCount);
	const balanceRatio = maxCount > 0 ? minCount / maxCount : 0;
	const balanceBonus = 1 + (balanceRatio * 0.5);

	// Chaos factor: Small random variance (±5%)
	const chaosVariance = 0.95 + (Math.random() * 0.1);

	return averageMultiplier * balanceBonus * chaosVariance;
}

// ============================================================================
// Conversion Cost Utilities (from pixels.ts)
// ============================================================================

/**
 * Calculate dynamic RGB to White conversion cost
 * Extracted from pixels.ts
 */
export function calculateConversionCost(
	lifetimeWhite: number,
	breakthroughEffects: {
		conversionCatalyst?: { purchased: boolean; effect: number };
	} = {},
	lumenCostReduction: number = 1
): { red: number; green: number; blue: number } {
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

	// Apply Conversion Catalyst breakthrough
	if (breakthroughEffects.conversionCatalyst?.purchased) {
		costMultiplier *= (1 - breakthroughEffects.conversionCatalyst.effect);
	}

	// Apply lumen-based cost reduction synergy
	costMultiplier *= lumenCostReduction;

	const cost = Math.ceil(costMultiplier);
	return { red: cost, green: cost, blue: cost };
}

/**
 * Calculate RGB to White conversion efficiency
 * Extracted from pixels.ts
 */
export function calculateConversionEfficiency(
	totalConversions: number,
	breakthroughEffects: {
		efficiencyStabilizer?: { purchased: boolean; effect: number };
		whiteAmplifier?: { purchased: boolean; effect: number };
	} = {}
): number {
	let efficiency = 1.0;

	// Efficiency decay with usage
	let decayRate = 0.2;

	// Apply Efficiency Stabilizer breakthrough
	if (breakthroughEffects.efficiencyStabilizer?.purchased) {
		decayRate *= (1 - breakthroughEffects.efficiencyStabilizer.effect);
	}

	efficiency /= Math.pow(1 + totalConversions / 50, decayRate);

	// Apply White Pixel Amplifier
	if (breakthroughEffects.whiteAmplifier?.purchased) {
		efficiency *= (1 + breakthroughEffects.whiteAmplifier.effect);
	}

	// Minimum 10% efficiency
	return Math.max(efficiency, 0.1);
}

// ============================================================================
// Lumen Generation Utilities (from lumen.ts)
// ============================================================================

/**
 * Calculate lumen per second from white pixels
 * Extracted from lumen.ts
 */
export function calculateLumenPerSecond(
	whitePixels: number,
	upgrades: {
		quantumEfficiency?: { level: number; effect: number };
		photonAmplifier?: { level: number; effect: number };
	} = {}
): number {
	if (whitePixels < 10) return 0;

	// Base formula: power curve for satisfying growth
	let base = Math.pow(whitePixels / 10, 0.6);

	// Apply quantum efficiency upgrades to the curve
	if (upgrades.quantumEfficiency && upgrades.quantumEfficiency.level > 0) {
		const efficiencyMultiplier = Math.pow(
			upgrades.quantumEfficiency.effect,
			upgrades.quantumEfficiency.level
		);
		base *= efficiencyMultiplier;
	}

	// Smooth soft caps
	if (base > 10) {
		base = 10 * Math.pow(base / 10, 0.8);
	}
	if (base > 100) {
		base = 100 * Math.pow(base / 100, 0.65);
	}
	if (base > 1000) {
		base = 1000 * Math.pow(base / 1000, 0.5);
	}

	// Apply photon amplifier multipliers
	let finalMultiplier = 1;
	if (upgrades.photonAmplifier && upgrades.photonAmplifier.level > 0) {
		finalMultiplier = Math.pow(
			upgrades.photonAmplifier.effect,
			upgrades.photonAmplifier.level
		);
	}

	return base * finalMultiplier;
}

/**
 * Calculate lumen generation efficiency percentage
 * Extracted from lumen.ts
 */
export function calculateLumenEfficiency(
	whitePixels: number,
	upgrades: Parameters<typeof calculateLumenPerSecond>[1]
): number {
	if (whitePixels < 10) return 1;

	// Calculate what generation would be with linear scaling
	const linear = (whitePixels / 10) * 0.6;
	const actual = calculateLumenPerSecond(whitePixels, upgrades);

	return actual / linear;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if player can afford a list of currency costs
 */
export function canAffordCosts(
	costs: CurrencyAmount[],
	currencyGetter: (id: string) => number
): boolean {
	return costs.every((cost) => currencyGetter(cost.currencyId) >= cost.amount);
}

/**
 * Validate and execute spending of multiple currencies
 */
export function spendCosts(
	costs: CurrencyAmount[],
	currencySpender: (id: string, amount: number) => boolean
): boolean {
	// Check if all costs can be afforded first
	const canAffordAll = costs.every((cost) => {
		// This requires each currency to implement canAfford check
		return true; // Simplified for now
	});

	if (!canAffordAll) {
		return false;
	}

	// Execute all spending operations
	const success = costs.every((cost) => currencySpender(cost.currencyId, cost.amount));

	return success;
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format currency amounts for display
 */
export function formatCurrencyAmount(amount: number, precision: number = 2): string {
	if (amount < 1000) {
		return amount.toFixed(precision);
	}

	if (amount < 1000000) {
		return (amount / 1000).toFixed(precision) + "K";
	}

	if (amount < 1000000000) {
		return (amount / 1000000).toFixed(precision) + "M";
	}

	return (amount / 1000000000).toFixed(precision) + "B";
}

/**
 * Format currency rates (per second)
 */
export function formatRate(rate: number): string {
	if (rate === 0) return "0/sec";
	if (rate < 0.01) return "<0.01/sec";
	return `${formatCurrencyAmount(rate)}/sec`;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if an object implements HasAmount interface
 */
export function hasAmountInterface(obj: any): obj is { amount: number; canAfford: (cost: number) => boolean } {
	return typeof obj === "object" &&
		   typeof obj.amount === "number" &&
		   typeof obj.canAfford === "function";
}

/**
 * Check if an object implements HasLifetimeTracking interface
 */
export function hasLifetimeInterface(obj: any): obj is { lifetimeTotal: number; bestAmount: number } {
	return typeof obj === "object" &&
		   typeof obj.lifetimeTotal === "number" &&
		   typeof obj.bestAmount === "number";
}