import { get } from "svelte/store";
import { pixels } from "$lib/stores/pixels";
import { upgrades } from "$lib/stores/upgrades";
import { lumen } from "$lib/stores/lumen";

export interface RecipeComponents {
	red: number;
	green: number;
	blue: number;
}

// Generic color interface that works for both mixed and pure colors
export interface ColorWithRecipe {
	name: string;
	recipe: RecipeComponents;
}

/**
 * Format recipe components into a readable string
 * @param components The RGB components of the recipe
 * @param separator The separator between components (default: " + ")
 * @returns Formatted recipe string like "2R + 1G" or "1R, 1G, 1B"
 */
export function formatRecipeComponents(
	components: RecipeComponents,
	separator: string = " + "
): string {
	const parts: string[] = [];
	if (components.red > 0) parts.push(`${components.red}R`);
	if (components.green > 0) parts.push(`${components.green}G`);
	if (components.blue > 0) parts.push(`${components.blue}B`);
	return parts.join(separator);
}

/**
 * Get the current white conversion recipe based on game state
 * @param includeOutput Whether to include the output (→ 1W)
 * @returns Recipe string like "3R + 3G + 3B → 1W"
 */
export function getWhiteConversionRecipe(includeOutput: boolean = true): string {
	const currentUpgrades = get(upgrades);
	const lumenCostReduction = lumen.getConversionCostReduction();
	const cost = pixels.getConversionCost(
		currentUpgrades.breakthroughs,
		lumenCostReduction
	);
	
	const recipe = formatRecipeComponents(cost);
	return includeOutput ? `${recipe} → 1W` : recipe;
}

/**
 * Get recipe text for a color (works with both mixed and pure colors)
 * @param color The color configuration
 * @param includeOutput Whether to include the output arrow and name
 * @returns Recipe string like "2R + 1G → Orange"
 */
export function getColorRecipe(
	color: ColorWithRecipe,
	includeOutput: boolean = true
): string {
	const recipe = formatRecipeComponents(color.recipe);
	return includeOutput ? `${recipe} → 1 ${color.name}` : recipe;
}

/**
 * @deprecated Use getColorRecipe instead - keeping for backward compatibility
 */
export function getCompositeColorRecipe(
	color: ColorWithRecipe,
	includeOutput: boolean = true
): string {
	return getColorRecipe(color, includeOutput);
}

/**
 * Get recipe text for auto-converters
 * Handles white, pure, and mixed converter types
 */
export function getAutoConverterRecipe(
	converterType: "white" | "pure" | "mixed",
	targetColor?: string
): string {
	if (converterType === "white") {
		return getWhiteConversionRecipe();
	}
	
	if (converterType === "pure") {
		switch (targetColor) {
			case "crimson": return "3R → 1 Crimson";
			case "emerald": return "3G → 1 Emerald";
			case "sapphire": return "3B → 1 Sapphire";
			default: return "";
		}
	}
	
	if (converterType === "mixed") {
		switch (targetColor) {
			case "orange": return "2R + 1G → 1 Orange";
			case "purple": return "2R + 1B → 1 Purple";
			case "yellow": return "1R + 2G → 1 Yellow";
			case "cyan": return "1G + 2B → 1 Cyan";
			case "magenta": return "1R + 2B → 1 Magenta";
			case "lime": return "2G + 1B → 1 Lime";
			default: return "";
		}
	}
	
	return "";
}