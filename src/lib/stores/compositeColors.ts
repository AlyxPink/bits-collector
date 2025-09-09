import { writable, derived, get } from "svelte/store";
import { pixels } from "./pixels";

// Recipe types for different color combinations
export interface ColorRecipe {
	red: number;
	green: number;
	blue: number;
}

export interface CompositeColor {
	id: string;
	name: string;
	type: "mixed" | "pure";
	recipe: ColorRecipe;
	count: number;
	// CSS styling properties for retro button style
	borderColor: string; // Border color class
	textColor: string; // Text color class  
	bgColor: string; // Semi-transparent background class
	hoverBgColor: string; // Hover background class
	shadowColor: string; // Shadow glow effect class
	circleColor: string; // Solid color for circles in navbar
}

export interface CompositeColorState {
	// Mixed colors (6)
	orange: CompositeColor;
	purple: CompositeColor;
	yellow: CompositeColor;
	cyan: CompositeColor;
	magenta: CompositeColor;
	lime: CompositeColor;
	// Pure colors (3)
	crimson: CompositeColor;
	emerald: CompositeColor;
	sapphire: CompositeColor;
}

// Default composite colors configuration
const DEFAULT_COMPOSITE_COLORS: CompositeColorState = {
	// Mixed colors (requiring 2 of one primary + 1 of another)
	orange: {
		id: "orange",
		name: "Orange",
		type: "mixed",
		recipe: { red: 2, green: 1, blue: 0 },
		count: 0,
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
		recipe: { red: 0, green: 2, blue: 1 },
		count: 0,
		borderColor: "border-lime-500",
		textColor: "text-lime-400",
		bgColor: "bg-lime-500/10",
		hoverBgColor: "hover:bg-lime-500/20", 
		shadowColor: "shadow-lime-500/50",
		circleColor: "bg-lime-500",
	},
	// Pure colors (requiring 3 of the same primary)
	crimson: {
		id: "crimson",
		name: "Crimson",
		type: "pure",
		recipe: { red: 3, green: 0, blue: 0 },
		count: 0,
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
		borderColor: "border-blue-700",
		textColor: "text-blue-600",
		bgColor: "bg-blue-700/10",
		hoverBgColor: "hover:bg-blue-700/20",
		shadowColor: "shadow-blue-700/50",
		circleColor: "bg-blue-700",
	},
};

// Load saved composite colors from localStorage
function loadCompositeColors(): CompositeColorState {
	if (typeof window === "undefined") {
		return { ...DEFAULT_COMPOSITE_COLORS };
	}

	const saved = localStorage.getItem("compositeColors");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			return parsed;
		} catch {
			return { ...DEFAULT_COMPOSITE_COLORS };
		}
	}
	return { ...DEFAULT_COMPOSITE_COLORS };
}

function createCompositeColorsStore() {
	const { subscribe, update, set } = writable<CompositeColorState>(loadCompositeColors());

	// Auto-save to localStorage
	subscribe((value) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("compositeColors", JSON.stringify(value));
		}
	});

	return {
		subscribe,

		// Check if player can afford a specific color recipe
		canAfford: (colorId: keyof CompositeColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const color = currentColors[colorId];
			
			if (!color) return false;

			return (
				currentPixels.red >= color.recipe.red &&
				currentPixels.green >= color.recipe.green &&
				currentPixels.blue >= color.recipe.blue
			);
		},

		// Mix a composite color by consuming RGB pixels
		mixColor: (colorId: keyof CompositeColorState): boolean => {
			const currentPixels = get(pixels);
			const currentColors = get({ subscribe });
			const color = currentColors[colorId];
			
			if (!color) return false;

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

				// Add composite color
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

		// Get all mixed colors (for UI grouping)
		getMixedColors: (): CompositeColor[] => {
			const colors = get({ subscribe });
			return Object.values(colors).filter((color) => color.type === "mixed");
		},

		// Get all pure colors (for UI grouping)
		getPureColors: (): CompositeColor[] => {
			const colors = get({ subscribe });
			return Object.values(colors).filter((color) => color.type === "pure");
		},

		// Get total count of all composite colors
		getTotalCount: (): number => {
			const colors = get({ subscribe });
			return Object.values(colors).reduce((total, color) => total + color.count, 0);
		},

		// Reset all composite colors
		reset: () => {
			set({ ...DEFAULT_COMPOSITE_COLORS });
		},
	};
}

export const compositeColors = createCompositeColorsStore();

// Derived stores for convenience
export const mixedColors = derived(compositeColors, ($colors) =>
	Object.values($colors).filter((color) => color.type === "mixed")
);

export const pureColors = derived(compositeColors, ($colors) =>
	Object.values($colors).filter((color) => color.type === "pure")
);

export const totalCompositeCount = derived(compositeColors, ($colors) =>
	Object.values($colors).reduce((total, color) => total + color.count, 0)
);

// Helper to check if mixed colors tab should be unlocked
export const mixedColorsUnlocked = derived(pixels, ($pixels) =>
	$pixels.lifetimeWhite >= 25
);

// Helper to check if pure colors tab should be unlocked  
export const pureColorsUnlocked = derived(pixels, ($pixels) =>
	$pixels.lifetimeWhite >= 50
);