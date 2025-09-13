/**
 * Mixed Colors Currency Implementation
 *
 * Migrated from src/lib/stores/mixedColors.ts to use the unified currency system.
 * Mixed colors blend multiple RGB components with even distribution.
 */

import { createColorCurrency, createUnlockedDerived, type MixedColor, type ColorState, type ColorCurrencyConfig } from "./ColorCurrency";
import {
	DEFAULT_MIXED_COLOR_UNLOCKS,
	MIXED_COLOR_UNLOCK_ORDER,
	calculateMixedColorUnlockCost
} from "$lib/config/gameConfig";

// ============================================================================
// Mixed Colors Configuration
// ============================================================================

// Define the mixed colors with their recipes and styling
const DEFAULT_MIXED_COLORS: ColorState<MixedColor> = {
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
};

// ============================================================================
// Mixed Colors Currency Factory
// ============================================================================

/**
 * Create mixed colors currency store
 */
function createMixedColorsCurrency() {
	const config: ColorCurrencyConfig<MixedColor> = {
		id: "mixedColors",
		type: "mixed-color",
		displayName: "Mixed Colors",
		storageKey: "mixedColors",
		defaultState: DEFAULT_MIXED_COLORS,
		persistence: true,
		resetOnGameReset: true,

		// Color-specific configuration
		unlockOrder: [...MIXED_COLOR_UNLOCK_ORDER],
		calculateUnlockCost: calculateMixedColorUnlockCost,
		defaultUnlocks: DEFAULT_MIXED_COLOR_UNLOCKS,
	};

	return createColorCurrency<MixedColor>(config);
}

// ============================================================================
// Export - Compatibility Layer
// ============================================================================

/**
 * Mixed colors store - maintains exact same API as original
 */
export const mixedColors = createMixedColorsCurrency();

/**
 * Derived store for unlocked status
 */
export const mixedColorsUnlocked = createUnlockedDerived(mixedColors);

// Export types for compatibility
export type { MixedColor };
export type MixedColorState = ColorState<MixedColor>;

// For debugging and testing
export { createMixedColorsCurrency, DEFAULT_MIXED_COLORS };