/**
 * Composite Colors Currency Implementation
 *
 * Migrated from src/lib/stores/compositeColors.ts to use the unified currency system.
 * Composite colors combine both mixed and pure colors into a single unified system.
 */

import { get } from "svelte/store";
import { createColorCurrency, createUnlockedDerived, type CompositeColor, type ColorState, type ColorCurrencyConfig } from "./ColorCurrency";
import { pixels } from "./PixelsCurrency";
import {
	DEFAULT_MIXED_COLOR_UNLOCKS,
	DEFAULT_PURE_COLOR_UNLOCKS,
	MIXED_COLOR_UNLOCK_ORDER,
	PURE_COLOR_UNLOCK_ORDER,
	calculateMixedColorUnlockCost,
	calculatePureColorUnlockCost,
	PURE_COLOR_BOOST,
	PURE_COLOR_MILESTONES
} from "$lib/config/gameConfig";

// ============================================================================
// Composite Colors Configuration
// ============================================================================

// Define all composite colors (mixed + pure) with their recipes and styling
const DEFAULT_COMPOSITE_COLORS: ColorState<CompositeColor> = {
	// Mixed colors (6)
	orange: {
		id: "orange",
		name: "Orange",
		type: "mixed",
		recipe: { red: 2, green: 1, blue: 0 },
		count: 0,
		unlocked: DEFAULT_MIXED_COLOR_UNLOCKS.orange,
		borderColor: "border-orange-500",
		textColor: "text-orange-400",
		bgColor: "bg-orange-500/10",
		hoverBgColor: "hover:bg-orange-500/20",
		shadowColor: "shadow-orange-500/50",
		circleColor: "bg-orange-500",
	},
	purple: {
		id: "purple",
		name: "Purple",
		type: "mixed",
		recipe: { red: 2, green: 0, blue: 1 },
		count: 0,
		unlocked: DEFAULT_MIXED_COLOR_UNLOCKS.purple,
		borderColor: "border-purple-500",
		textColor: "text-purple-400",
		bgColor: "bg-purple-500/10",
		hoverBgColor: "hover:bg-purple-500/20",
		shadowColor: "shadow-purple-500/50",
		circleColor: "bg-purple-500",
	},
	yellow: {
		id: "yellow",
		name: "Yellow",
		type: "mixed",
		recipe: { red: 1, green: 2, blue: 0 },
		count: 0,
		unlocked: DEFAULT_MIXED_COLOR_UNLOCKS.yellow,
		borderColor: "border-yellow-500",
		textColor: "text-yellow-400",
		bgColor: "bg-yellow-500/10",
		hoverBgColor: "hover:bg-yellow-500/20",
		shadowColor: "shadow-yellow-500/50",
		circleColor: "bg-yellow-500",
	},
	cyan: {
		id: "cyan",
		name: "Cyan",
		type: "mixed",
		recipe: { red: 0, green: 1, blue: 2 },
		count: 0,
		unlocked: DEFAULT_MIXED_COLOR_UNLOCKS.cyan,
		borderColor: "border-cyan-500",
		textColor: "text-cyan-400",
		bgColor: "bg-cyan-500/10",
		hoverBgColor: "hover:bg-cyan-500/20",
		shadowColor: "shadow-cyan-500/50",
		circleColor: "bg-cyan-500",
	},
	magenta: {
		id: "magenta",
		name: "Magenta",
		type: "mixed",
		recipe: { red: 1, green: 0, blue: 2 },
		count: 0,
		unlocked: DEFAULT_MIXED_COLOR_UNLOCKS.magenta,
		borderColor: "border-pink-500",
		textColor: "text-pink-400",
		bgColor: "bg-pink-500/10",
		hoverBgColor: "hover:bg-pink-500/20",
		shadowColor: "shadow-pink-500/50",
		circleColor: "bg-pink-500",
	},
	lime: {
		id: "lime",
		name: "Lime",
		type: "mixed",
		recipe: { red: 1, green: 2, blue: 1 },
		count: 0,
		unlocked: DEFAULT_MIXED_COLOR_UNLOCKS.lime,
		borderColor: "border-lime-500",
		textColor: "text-lime-400",
		bgColor: "bg-lime-500/10",
		hoverBgColor: "hover:bg-lime-500/20",
		shadowColor: "shadow-lime-500/50",
		circleColor: "bg-lime-500",
	},

	// Pure colors (3)
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

// Combined unlock order (mixed first, then pure)
const COMPOSITE_UNLOCK_ORDER = [...MIXED_COLOR_UNLOCK_ORDER, ...PURE_COLOR_UNLOCK_ORDER];

// Combined default unlocks
const DEFAULT_COMPOSITE_UNLOCKS = {
	...DEFAULT_MIXED_COLOR_UNLOCKS,
	...DEFAULT_PURE_COLOR_UNLOCKS,
};

// ============================================================================
// Composite-specific unlock cost calculation
// ============================================================================

/**
 * Calculate unlock cost for composite colors based on their type
 */
function calculateCompositeColorUnlockCost(unlockedCount: number, colorId: string): { red: number; green: number; blue: number; total: number } {
	const color = DEFAULT_COMPOSITE_COLORS[colorId];

	if (!color) {
		// Fallback to mixed color calculation
		return calculateMixedColorUnlockCost(unlockedCount);
	}

	if (color.type === "pure") {
		// Use pure color calculation with specific color ID
		return calculatePureColorUnlockCost(unlockedCount, colorId as 'crimson' | 'emerald' | 'sapphire');
	} else {
		// Use mixed color calculation
		return calculateMixedColorUnlockCost(unlockedCount);
	}
}

// ============================================================================
// Composite Colors Currency Factory
// ============================================================================

/**
 * Create composite colors currency store
 */
function createCompositeColorsCurrency() {
	const config: ColorCurrencyConfig<CompositeColor> = {
		id: "compositeColors",
		type: "composite-color",
		displayName: "Composite Colors",
		storageKey: "compositeColors",
		defaultState: DEFAULT_COMPOSITE_COLORS,
		persistence: true,
		resetOnGameReset: true,

		// Color-specific configuration
		unlockOrder: COMPOSITE_UNLOCK_ORDER,
		calculateUnlockCost: calculateCompositeColorUnlockCost,
		defaultUnlocks: DEFAULT_COMPOSITE_UNLOCKS,
	};

	const store = createColorCurrency<CompositeColor>(config);

	// Add composite-specific methods
	return {
		...store,

		// Override getUnlockCost to count only colors of the same type
		getUnlockCost: (colorId: string) => {
			const currentColors = store.getColors();
			const color = currentColors.find(c => c.id === colorId);
			if (!color) {
				return { red: 0, green: 0, blue: 0, total: 0 };
			}

			// Count only unlocked colors of the SAME TYPE
			const unlockedCount = currentColors.filter(c => c.unlocked && c.type === color.type).length;
			const cost = calculateCompositeColorUnlockCost(unlockedCount, colorId);

			return cost;
		},

		// Override canAffordUnlock to count only colors of the same type
		canAffordUnlock: (colorId: string) => {
			const currentPixels = get(pixels);
			const currentColors = store.getColors();
			const color = currentColors.find(c => c.id === colorId);
			if (!color) {
				return false;
			}

			// Count only unlocked colors of the SAME TYPE
			const unlockedCount = currentColors.filter(c => c.unlocked && c.type === color.type).length;
			const cost = calculateCompositeColorUnlockCost(unlockedCount, colorId);

			const canAfford = (
				currentPixels.red >= cost.red &&
				currentPixels.green >= cost.green &&
				currentPixels.blue >= cost.blue
			);

			return canAfford;
		},

		// Override unlockColor to count only colors of the same type
		unlockColor: (colorId: string) => {
			const currentPixels = get(pixels);
			const currentColors = store.getColors();
			const color = currentColors.find(c => c.id === colorId);

			if (!color) {
				return false;
			}

			if (color.unlocked) {
				return false;
			}

			// Count only unlocked colors of the SAME TYPE
			const unlockedCount = currentColors.filter(c => c.unlocked && c.type === color.type).length;
			const cost = calculateCompositeColorUnlockCost(unlockedCount, colorId);

			// Check if we can afford the unlock
			if (
				currentPixels.red >= cost.red &&
				currentPixels.green >= cost.green &&
				currentPixels.blue >= cost.blue
			) {
				// Deduct RGB pixels
				pixels.update((p) => ({
					...p,
					red: p.red - cost.red,
					green: p.green - cost.green,
					blue: p.blue - cost.blue,
				}));

				// Unlock the color
				store.update((colors: CompositeColorState) => ({
					...colors,
					[colorId]: {
						...colors[colorId],
						unlocked: true,
					},
				}));

				return true;
			}

			return false;
		},

		// Get mixed colors only
		getMixedColors: () => {
			return store.getColors().filter(color => color.type === "mixed");
		},

		// Get pure colors only
		getPureColors: () => {
			return store.getColors().filter(color => color.type === "pure");
		},

		// Get colors by type with counts > 0
		getMixedColorsWithCounts: () => {
			return store.getColorsWithCounts().filter(color => color.type === "mixed");
		},

		getPureColorsWithCounts: () => {
			return store.getColorsWithCounts().filter(color => color.type === "pure");
		},

		// Bulk add color count (for fast catchup mode in autoConverters)
		addColorBulk: (colorId: string, amount: number): void => {
			store.update((state: CompositeColorState) => {
				const color = state[colorId as keyof CompositeColorState];
				if (color && color.unlocked) {
					return {
						...state,
						[colorId]: {
							...color,
							count: color.count + amount
						}
					};
				}
				return state;
			});
		},

		// Pure color methods (needed by UpgradesCurrency)
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

		hasAllPureColors: (): boolean => {
			const colors = store.getColors();
			const crimson = colors.find(c => c.id === "crimson");
			const emerald = colors.find(c => c.id === "emerald");
			const sapphire = colors.find(c => c.id === "sapphire");
			return !!(crimson?.unlocked && crimson.count > 0 &&
					 emerald?.unlocked && emerald.count > 0 &&
					 sapphire?.unlocked && sapphire.count > 0);
		},

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
			const baseBoost = Math.pow(pureCount, PURE_COLOR_BOOST.baseBoostPower) * PURE_COLOR_BOOST.baseBoostMultiplier;

			// Layer 2: Milestone bonuses
			const milestones = PURE_COLOR_MILESTONES.thresholds;
			const milestoneBonus = milestones.filter((m: number) => pureCount >= m).length * PURE_COLOR_MILESTONES.bonusPerMilestone;

			// Layer 3: Diminishing returns after certain thresholds
			let effectiveCount = pureCount;
			if (pureCount > 100) effectiveCount = 100 + Math.pow(pureCount - 100, PURE_COLOR_BOOST.effectiveCountPowers.above100);
			if (pureCount > 500) effectiveCount = 400 + Math.pow(pureCount - 500, PURE_COLOR_BOOST.effectiveCountPowers.above500);

			// Layer 4: Synergy bonus
			const hasAllPure = compositeColors.hasAllPureColors();
			const synergyBonus = hasAllPure ? Math.log10(pureCount + 1) * PURE_COLOR_BOOST.synergyMultiplier : 0;

			const rawMultiplier = 1 + baseBoost + milestoneBonus + (effectiveCount * 0.005) + synergyBonus;

			// Apply smooth soft cap
			if (rawMultiplier > PURE_COLOR_BOOST.capThresholds.hard) return 18 + Math.pow(rawMultiplier - PURE_COLOR_BOOST.capThresholds.hard, PURE_COLOR_BOOST.capPowers.hard);
			if (rawMultiplier > PURE_COLOR_BOOST.capThresholds.medium) return 9 + Math.pow(rawMultiplier - PURE_COLOR_BOOST.capThresholds.medium, PURE_COLOR_BOOST.capPowers.medium);
			if (rawMultiplier > PURE_COLOR_BOOST.capThresholds.soft) return 5 + Math.pow(rawMultiplier - PURE_COLOR_BOOST.capThresholds.soft, PURE_COLOR_BOOST.capPowers.soft);

			return rawMultiplier;
		},

		getRandomGeneratorMultiplier: (): number => {
			const colors = store.getColors();

			const crimson = colors.find(c => c.id === "crimson");
			const emerald = colors.find(c => c.id === "emerald");
			const sapphire = colors.find(c => c.id === "sapphire");

			const redCount = crimson?.unlocked ? crimson.count : 0;
			const greenCount = emerald?.unlocked ? emerald.count : 0;
			const blueCount = sapphire?.unlocked ? sapphire.count : 0;

			const totalCount = redCount + greenCount + blueCount;
			const avgCount = totalCount / 3;

			if (totalCount === 0) return 1;

			// Balanced bonus
			const balance = Math.min(redCount, greenCount, blueCount) / Math.max(redCount, greenCount, blueCount, 1);
			const balanceBonus = balance * PURE_COLOR_BOOST.randomGenerator.balanceBonus;

			// Base multiplier from average count
			const baseMultiplier = 1 + (avgCount * PURE_COLOR_BOOST.randomGenerator.baseMultiplierPerCount);

			// Spectrum synergy bonus
			const hasAllPure = redCount > 0 && greenCount > 0 && blueCount > 0;
			const synergyBonus = hasAllPure ? Math.log10(totalCount + 1) * PURE_COLOR_BOOST.randomGenerator.synergyMultiplier : 0;

			return baseMultiplier + balanceBonus + synergyBonus;
		},
	};
}

// ============================================================================
// Export - Compatibility Layer
// ============================================================================

/**
 * Composite colors store - maintains exact same API as original
 */
export const compositeColors = createCompositeColorsCurrency();

/**
 * Derived store for unlocked status
 */
export const compositeColorsUnlocked = createUnlockedDerived(compositeColors);

// Export types for compatibility
export type { CompositeColor };
export type CompositeColorState = ColorState<CompositeColor>;

// For debugging and testing
export { createCompositeColorsCurrency, DEFAULT_COMPOSITE_COLORS };