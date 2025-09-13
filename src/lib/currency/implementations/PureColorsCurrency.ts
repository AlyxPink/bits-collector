/**
 * Pure Colors Currency Implementation
 *
 * Migrated from src/lib/stores/pureColors.ts to use the unified currency system.
 * Pure colors are special RGB combinations that heavily favor their primary color.
 */

import { createColorCurrency, createUnlockedDerived, type PureColor, type ColorState, type ColorCurrencyConfig } from "./ColorCurrency";
import {
	DEFAULT_PURE_COLOR_UNLOCKS,
	PURE_COLOR_UNLOCK_ORDER,
	calculatePureColorUnlockCost
} from "$lib/config/gameConfig";

// ============================================================================
// Pure Colors Configuration
// ============================================================================

// Define the pure colors with their recipes and styling
const DEFAULT_PURE_COLORS: ColorState<PureColor> = {
	crimson: {
		id: "crimson",
		name: "Crimson",
		type: "pure",
		recipe: { red: 3, green: 0, blue: 0 },
		count: 0,
		unlocked: DEFAULT_PURE_COLOR_UNLOCKS.crimson,
		borderColor: "border-red-700",
		textColor: "text-red-600",
		bgColor: "bg-red-700/10",
		hoverBgColor: "hover:bg-red-700/20",
		shadowColor: "shadow-red-700/50",
		circleColor: "bg-red-700",
	},
	emerald: {
		id: "emerald",
		name: "Emerald",
		type: "pure",
		recipe: { red: 0, green: 3, blue: 0 },
		count: 0,
		unlocked: DEFAULT_PURE_COLOR_UNLOCKS.emerald,
		borderColor: "border-emerald-600",
		textColor: "text-emerald-500",
		bgColor: "bg-emerald-600/10",
		hoverBgColor: "hover:bg-emerald-600/20",
		shadowColor: "shadow-emerald-600/50",
		circleColor: "bg-emerald-600",
	},
	sapphire: {
		id: "sapphire",
		name: "Sapphire",
		type: "pure",
		recipe: { red: 0, green: 0, blue: 3 },
		count: 0,
		unlocked: DEFAULT_PURE_COLOR_UNLOCKS.sapphire,
		borderColor: "border-blue-700",
		textColor: "text-blue-600",
		bgColor: "bg-blue-700/10",
		hoverBgColor: "hover:bg-blue-700/20",
		shadowColor: "shadow-blue-700/50",
		circleColor: "bg-blue-700",
	},
};

// ============================================================================
// Pure Colors Currency Factory
// ============================================================================

/**
 * Create pure colors currency store
 */
function createPureColorsCurrency() {
	const config: ColorCurrencyConfig<PureColor> = {
		id: "pureColors",
		type: "pure-color",
		displayName: "Pure Colors",
		storageKey: "pureColors",
		defaultState: DEFAULT_PURE_COLORS,
		persistence: true,
		resetOnGameReset: true,

		// Color-specific configuration
		unlockOrder: [...PURE_COLOR_UNLOCK_ORDER],
		calculateUnlockCost: (unlockedCount: number, colorId: string) => calculatePureColorUnlockCost(unlockedCount, colorId as 'crimson' | 'emerald' | 'sapphire'),
		defaultUnlocks: DEFAULT_PURE_COLOR_UNLOCKS,
	};

	const store = createColorCurrency<PureColor>(config);

	// Add pure-color specific methods that weren't in the base implementation
	return {
		...store,

		// Get only unlocked pure colors for calculations
		getUnlockedColors: () => {
			const colors = store.getColors();
			return colors.filter((color) => color.unlocked);
		},

		// Get total count of all pure colors
		getTotalCount: () => {
			const colors = store.getColors();
			return colors
				.filter(color => color.unlocked)
				.reduce((total, color) => total + color.count, 0);
		},

		// Get pure color count for a specific primary color (only if unlocked)
		getPureColorCount: (color: "red" | "green" | "blue"): number => {
			const colors = store.getColors();
			switch (color) {
				case "red":
					const crimson = colors.find(c => c.id === "crimson");
					return crimson?.unlocked ? crimson.count : 0;
				case "green":
					const emerald = colors.find(c => c.id === "emerald");
					return emerald?.unlocked ? emerald.count : 0;
				case "blue":
					const sapphire = colors.find(c => c.id === "sapphire");
					return sapphire?.unlocked ? sapphire.count : 0;
				default:
					return 0;
			}
		},

		// Check if player has all three pure colors (unlocked and owned)
		hasAllPureColors: (): boolean => {
			const colors = store.getColors();
			const crimson = colors.find(c => c.id === "crimson");
			const emerald = colors.find(c => c.id === "emerald");
			const sapphire = colors.find(c => c.id === "sapphire");
			return !!(crimson?.unlocked && crimson.count > 0 &&
					 emerald?.unlocked && emerald.count > 0 &&
					 sapphire?.unlocked && sapphire.count > 0);
		},

		// Complex scaling function for pure color RGB generator multipliers
		getPureColorMultiplier: (color: "red" | "green" | "blue"): number => {
			const colors = store.getColors();
			let pureCount = 0;
			switch (color) {
				case "red":
					const crimson = colors.find(c => c.id === "crimson");
					pureCount = crimson?.unlocked ? crimson.count : 0;
					break;
				case "green":
					const emerald = colors.find(c => c.id === "emerald");
					pureCount = emerald?.unlocked ? emerald.count : 0;
					break;
				case "blue":
					const sapphire = colors.find(c => c.id === "sapphire");
					pureCount = sapphire?.unlocked ? sapphire.count : 0;
					break;
			}

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

			// Layer 4: Synergy bonus if you have all three pure colors (unlocked and owned)
			const allColors = store.getColors();
			const crimsonAll = allColors.find(c => c.id === "crimson");
			const emeraldAll = allColors.find(c => c.id === "emerald");
			const sapphireAll = allColors.find(c => c.id === "sapphire");
			const hasAllPure = !!(crimsonAll?.unlocked && crimsonAll.count > 0 &&
								 emeraldAll?.unlocked && emeraldAll.count > 0 &&
								 sapphireAll?.unlocked && sapphireAll.count > 0);
			const synergyBonus = hasAllPure ? Math.log10(pureCount + 1) * 0.2 : 0;

			// Final calculation with soft cap smoothing
			const rawMultiplier = 1 + baseBoost + milestoneBonus + (effectiveCount * 0.01) + synergyBonus;

			// Apply smooth soft cap (no hard walls!)
			if (rawMultiplier > 20) return 18 + Math.pow(rawMultiplier - 20, 0.3);
			if (rawMultiplier > 10) return 9 + Math.pow(rawMultiplier - 10, 0.5);
			if (rawMultiplier > 5) return 5 + Math.pow(rawMultiplier - 5, 0.7);

			return rawMultiplier;
		},

		// Special multiplier for random generator based on total pure colors
		getRandomGeneratorMultiplier: (): number => {
			const colors = store.getColors();

			// Get pure color counts directly (only if unlocked)
			const crimson = colors.find(c => c.id === "crimson");
			const emerald = colors.find(c => c.id === "emerald");
			const sapphire = colors.find(c => c.id === "sapphire");

			const redCount = crimson?.unlocked ? crimson.count : 0;
			const greenCount = emerald?.unlocked ? emerald.count : 0;
			const blueCount = sapphire?.unlocked ? sapphire.count : 0;

			// Average count for balanced growth
			const totalCount = redCount + greenCount + blueCount;
			const avgCount = totalCount / 3;

			if (totalCount === 0) return 1;

			// Random generator gets boosted by having balanced pure colors
			const balance = Math.min(redCount, greenCount, blueCount) / Math.max(redCount, greenCount, blueCount, 1);
			const balanceBonus = balance * 0.5; // Up to 50% bonus for perfect balance

			// Base multiplier from average count
			const baseMultiplier = 1 + (avgCount * 0.05); // 5% per average count

			// Spectrum synergy bonus
			const hasAllPure = redCount > 0 && greenCount > 0 && blueCount > 0;
			const synergyBonus = hasAllPure ? Math.log10(totalCount + 1) * 0.3 : 0;

			return baseMultiplier + balanceBonus + synergyBonus;
		},
	};
}

// ============================================================================
// Export - Compatibility Layer
// ============================================================================

/**
 * Pure colors store - maintains exact same API as original
 */
export const pureColors = createPureColorsCurrency();

/**
 * Derived store for unlocked status
 */
export const pureColorsUnlocked = createUnlockedDerived(pureColors);

// Export types for compatibility
export type { PureColor };
export type PureColorState = ColorState<PureColor>;

// For debugging and testing
export { createPureColorsCurrency, DEFAULT_PURE_COLORS };