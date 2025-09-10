import { writable, derived, get } from "svelte/store";
import { pixels } from "./pixels";
import {
	DEFAULT_PURE_COLOR_UNLOCKS,
	PURE_COLOR_UNLOCK_ORDER,
	calculatePureColorUnlockCost
} from "$lib/config/gameConfig";

// Recipe types for color combinations
export interface ColorRecipe {
	red: number;
	green: number;
	blue: number;
}

export interface PureColor {
	id: string;
	name: string;
	recipe: ColorRecipe;
	count: number;
	unlocked: boolean;
	// CSS styling properties for retro button style
	borderColor: string; // Border color class
	textColor: string; // Text color class
	bgColor: string; // Semi-transparent background class
	hoverBgColor: string; // Hover background class
	shadowColor: string; // Shadow glow effect class
	circleColor: string; // Solid color for circles in navbar
}

export interface PureColorState {
	crimson: PureColor;
	emerald: PureColor;
	sapphire: PureColor;
}

// Default pure colors configuration
const DEFAULT_PURE_COLORS: PureColorState = {
	crimson: {
		id: "crimson",
		name: "Crimson",
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

// Load saved pure colors from localStorage
function loadPureColors(): PureColorState {
	if (typeof window === "undefined") {
		return { ...DEFAULT_PURE_COLORS };
	}

	const saved = localStorage.getItem("pureColors");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			return parsed;
		} catch {
			return { ...DEFAULT_PURE_COLORS };
		}
	}
	return { ...DEFAULT_PURE_COLORS };
}

function createPureColorsStore() {
	const { subscribe, update, set } = writable<PureColorState>(loadPureColors());

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("pureColors", JSON.stringify(value));
		}
	});

	return {
		subscribe,

		// Get unlock cost for a specific pure color
		getUnlockCost: (colorId: keyof PureColorState): { red: number; green: number; blue: number; total: number } => {
			const currentColors = get({ subscribe });
			const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
			return calculatePureColorUnlockCost(unlockedCount, colorId);
		},

		// Check if player can afford to unlock a specific pure color
		canAffordUnlock: (colorId: keyof PureColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
			const cost = calculatePureColorUnlockCost(unlockedCount, colorId);

			return (
				currentPixels.red >= cost.red &&
				currentPixels.green >= cost.green &&
				currentPixels.blue >= cost.blue
			);
		},

		// Unlock a pure color by spending RGB pixels
		unlockColor: (colorId: keyof PureColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const color = currentColors[colorId];

			if (!color || color.unlocked) return false;

			const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
			const cost = calculatePureColorUnlockCost(unlockedCount, colorId);

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
				update((colors) => ({
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

		// Get count of unlocked pure colors
		getUnlockedCount: (): number => {
			const colors = get({ subscribe });
			return Object.values(colors).filter((color) => color.unlocked).length;
		},

		// Get next pure color to unlock by order
		getNextToUnlock: (): PureColor | null => {
			const colors = get({ subscribe });

			for (const colorId of PURE_COLOR_UNLOCK_ORDER) {
				const color = colors[colorId as keyof PureColorState];
				if (color && !color.unlocked) {
					return color;
				}
			}
			return null;
		},

		// Check if player can afford a specific pure color recipe
		canAfford: (colorId: keyof PureColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const color = currentColors[colorId];

			if (!color || !color.unlocked) return false;

			return (
				currentPixels.red >= color.recipe.red &&
				currentPixels.green >= color.recipe.green &&
				currentPixels.blue >= color.recipe.blue
			);
		},

		// Mix a pure color by consuming RGB pixels
		mixColor: (colorId: keyof PureColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const color = currentColors[colorId];

			if (!color || !color.unlocked) return false;

			// Check if we can afford the recipe
			if (
				currentPixels.red >= color.recipe.red &&
				currentPixels.green >= color.recipe.green &&
				currentPixels.blue >= color.recipe.blue
			) {
				// Deduct RGB pixels
				pixels.update((p) => ({
					...p,
					red: p.red - color.recipe.red,
					green: p.green - color.recipe.green,
					blue: p.blue - color.recipe.blue,
				}));

				// Add pure color
				update((colors) => ({
					...colors,
					[colorId]: {
						...colors[colorId],
						count: colors[colorId].count + 1,
					},
				}));

				return true;
			}
			return false;
		},

		// Get all pure colors (for UI grouping) - includes locked colors for unlock UI
		getPureColors: (): PureColor[] => {
			const colors = get({ subscribe });
			return Object.values(colors);
		},

		// Get only unlocked pure colors for calculations
		getUnlockedColors: (): PureColor[] => {
			const colors = get({ subscribe });
			return Object.values(colors).filter((color) => color.unlocked);
		},

		// Get total count of all pure colors
		getTotalCount: (): number => {
			const colors = get({ subscribe });
			return Object.values(colors)
				.filter(color => color.unlocked)
				.reduce((total, color) => total + color.count, 0);
		},

		// Get pure color count for a specific primary color (only if unlocked)
		getPureColorCount: (color: "red" | "green" | "blue"): number => {
			const colors = get({ subscribe });
			switch (color) {
				case "red":
					return colors.crimson.unlocked ? colors.crimson.count : 0;
				case "green":
					return colors.emerald.unlocked ? colors.emerald.count : 0;
				case "blue":
					return colors.sapphire.unlocked ? colors.sapphire.count : 0;
				default:
					return 0;
			}
		},

		// Check if player has all three pure colors (unlocked and owned)
		hasAllPureColors: (): boolean => {
			const colors = get({ subscribe });
			return colors.crimson.unlocked && colors.crimson.count > 0 &&
				   colors.emerald.unlocked && colors.emerald.count > 0 &&
				   colors.sapphire.unlocked && colors.sapphire.count > 0;
		},

		// Complex scaling function for pure color RGB generator multipliers
		getPureColorMultiplier: (color: "red" | "green" | "blue"): number => {
			const colors = get({ subscribe });
			let pureCount = 0;
			switch (color) {
				case "red":
					pureCount = colors.crimson.unlocked ? colors.crimson.count : 0;
					break;
				case "green":
					pureCount = colors.emerald.unlocked ? colors.emerald.count : 0;
					break;
				case "blue":
					pureCount = colors.sapphire.unlocked ? colors.sapphire.count : 0;
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
			const hasAllPure = colors.crimson.unlocked && colors.crimson.count > 0 &&
							   colors.emerald.unlocked && colors.emerald.count > 0 &&
							   colors.sapphire.unlocked && colors.sapphire.count > 0;
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
			const colors = get({ subscribe });

			// Get pure color counts directly (only if unlocked)
			const redCount = colors.crimson.unlocked ? colors.crimson.count : 0;
			const greenCount = colors.emerald.unlocked ? colors.emerald.count : 0;
			const blueCount = colors.sapphire.unlocked ? colors.sapphire.count : 0;

			if (redCount === 0 && greenCount === 0 && blueCount === 0) return 1;

			// Calculate each color's multiplier manually (to avoid recursion)
			const calculatePureMultiplier = (count: number): number => {
				if (count === 0) return 1;

				const baseBoost = Math.pow(count, 0.5) * 0.1;
				const milestones = [10, 25, 50, 100, 250, 500, 1000];
				const milestoneBonus = milestones.filter((m) => count >= m).length * 0.15;

				let effectiveCount = count;
				if (count > 100) effectiveCount = 100 + Math.pow(count - 100, 0.8);
				if (count > 500) effectiveCount = 400 + Math.pow(count - 500, 0.6);

				const hasAllPure = redCount > 0 && greenCount > 0 && blueCount > 0;
				const synergyBonus = hasAllPure ? Math.log10(count + 1) * 0.2 : 0;

				const rawMultiplier = 1 + baseBoost + milestoneBonus + (effectiveCount * 0.01) + synergyBonus;

				if (rawMultiplier > 20) return 18 + Math.pow(rawMultiplier - 20, 0.3);
				if (rawMultiplier > 10) return 9 + Math.pow(rawMultiplier - 10, 0.5);
				if (rawMultiplier > 5) return 5 + Math.pow(rawMultiplier - 5, 0.7);

				return rawMultiplier;
			};

			// Base: Average of all three pure color multipliers
			const redMult = calculatePureMultiplier(redCount);
			const greenMult = calculatePureMultiplier(greenCount);
			const blueMult = calculatePureMultiplier(blueCount);
			const averageMultiplier = (redMult + greenMult + blueMult) / 3;

			// Bonus: Extra multiplier if pure colors are balanced (similar counts)
			const maxCount = Math.max(redCount, greenCount, blueCount);
			const minCount = Math.min(redCount, greenCount, blueCount);
			const balanceRatio = maxCount > 0 ? minCount / maxCount : 0;
			const balanceBonus = 1 + (balanceRatio * 0.5); // Up to 50% bonus for perfect balance

			// Chaos factor: Small random variance that changes each tick (±5%)
			const chaosVariance = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05

			return averageMultiplier * balanceBonus * chaosVariance;
		},

		// Reset all pure colors
		reset: () => {
			set({ ...DEFAULT_PURE_COLORS });
		},
	};
}

export const pureColors = createPureColorsStore();

// Derived stores for convenience
export const totalPureCount = derived(pureColors, ($colors) =>
	Object.values($colors).reduce((total, color) => total + color.count, 0)
);

// Helper to check if pure colors tab should be unlocked
export const pureColorsUnlocked = derived(pixels, ($pixels) =>
	$pixels.lifetimeWhite >= 50
);
