import { writable, derived, get } from "svelte/store";
import { pixels } from "./pixels";
import {
	DEFAULT_MIXED_COLOR_UNLOCKS,
	MIXED_COLOR_UNLOCK_ORDER,
	calculateMixedColorUnlockCost
} from "$lib/config/gameConfig";

// Recipe types for color combinations
export interface ColorRecipe {
	red: number;
	green: number;
	blue: number;
}

export interface MixedColor {
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

export interface MixedColorState {
	orange: MixedColor;
	purple: MixedColor;
	yellow: MixedColor;
	cyan: MixedColor;
	magenta: MixedColor;
	lime: MixedColor;
}

// Default mixed colors configuration
const DEFAULT_MIXED_COLORS: MixedColorState = {
	orange: {
		id: "orange",
		name: "Orange",
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
		recipe: { red: 0, green: 2, blue: 1 },
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

// Load saved mixed colors from localStorage
function loadMixedColors(): MixedColorState {
	if (typeof window === "undefined") {
		return { ...DEFAULT_MIXED_COLORS };
	}

	const saved = localStorage.getItem("mixedColors");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			return parsed;
		} catch {
			return { ...DEFAULT_MIXED_COLORS };
		}
	}
	return { ...DEFAULT_MIXED_COLORS };
}

function createMixedColorsStore() {
	const { subscribe, update, set } = writable<MixedColorState>(loadMixedColors());

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("mixedColors", JSON.stringify(value));
		}
	});

	return {
		subscribe,

		// Get unlock cost for a specific mixed color
		getUnlockCost: (colorId: keyof MixedColorState): { red: number; green: number; blue: number; total: number } => {
			const currentColors = get({ subscribe });
			const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
			return calculateMixedColorUnlockCost(unlockedCount);
		},

		// Check if player can afford to unlock a specific mixed color
		canAffordUnlock: (colorId: keyof MixedColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
			const cost = calculateMixedColorUnlockCost(unlockedCount);

			return (
				currentPixels.red >= cost.red &&
				currentPixels.green >= cost.green &&
				currentPixels.blue >= cost.blue
			);
		},

		// Unlock a mixed color by spending RGB pixels
		unlockColor: (colorId: keyof MixedColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const color = currentColors[colorId];

			if (!color || color.unlocked) return false;

			const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
			const cost = calculateMixedColorUnlockCost(unlockedCount);

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

		// Get count of unlocked mixed colors
		getUnlockedCount: (): number => {
			const colors = get({ subscribe });
			return Object.values(colors).filter((color) => color.unlocked).length;
		},

		// Get next mixed color to unlock by order
		getNextToUnlock: (): MixedColor | null => {
			const colors = get({ subscribe });

			for (const colorId of MIXED_COLOR_UNLOCK_ORDER) {
				const color = colors[colorId as keyof MixedColorState];
				if (color && !color.unlocked) {
					return color;
				}
			}
			return null;
		},

		// Check if player can afford a specific mixed color recipe
		canAfford: (colorId: keyof MixedColorState): boolean => {
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

		// Mix a color by consuming RGB pixels
		mixColor: (colorId: keyof MixedColorState): boolean => {
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

				// Add mixed color
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

		// Get all mixed colors (for UI grouping) - includes locked colors for unlock UI
		getMixedColors: (): MixedColor[] => {
			const colors = get({ subscribe });
			return Object.values(colors);
		},

		// Get only unlocked mixed colors for calculations
		getUnlockedColors: (): MixedColor[] => {
			const colors = get({ subscribe });
			return Object.values(colors).filter((color) => color.unlocked);
		},

		// Get total count of all mixed colors
		getTotalCount: (): number => {
			const colors = get({ subscribe });
			return Object.values(colors)
				.filter(color => color.unlocked)
				.reduce((total, color) => total + color.count, 0);
		},

		// Reset all mixed colors
		reset: () => {
			set({ ...DEFAULT_MIXED_COLORS });
		},
	};
}

export const mixedColors = createMixedColorsStore();

// Derived stores for convenience
export const totalMixedCount = derived(mixedColors, ($colors) =>
	Object.values($colors).reduce((total, color) => total + color.count, 0)
);

// Helper to check if mixed colors tab should be unlocked
export const mixedColorsUnlocked = derived(pixels, ($pixels) =>
	$pixels.lifetimeWhite >= 25
);
