/**
 * Composite Colors Currency Implementation
 *
 * Migrated from src/lib/stores/compositeColors.ts to use the unified currency system.
 * Composite colors combine both mixed and pure colors into a single unified system.
 */

import { createColorCurrency, createUnlockedDerived, type CompositeColor, type ColorState, type ColorCurrencyConfig } from "./ColorCurrency";
import {
	DEFAULT_MIXED_COLOR_UNLOCKS,
	DEFAULT_PURE_COLOR_UNLOCKS,
	MIXED_COLOR_UNLOCK_ORDER,
	PURE_COLOR_UNLOCK_ORDER,
	calculateMixedColorUnlockCost,
	calculatePureColorUnlockCost
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