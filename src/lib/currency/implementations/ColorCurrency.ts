/**
 * Unified Color Currency System
 *
 * Consolidates pureColors.ts, mixedColors.ts, and compositeColors.ts into a single
 * unified system, eliminating ~400+ lines of duplicate code.
 */

import { writable, derived, get } from "svelte/store";
import { CurrencyBase } from "../core/CurrencyBase";
import type { ICurrency, CurrencyConfig } from "../core/interfaces";
import { pixels } from "$lib/stores/pixels";

// ============================================================================
// Core Types
// ============================================================================

export interface ColorRecipe {
	red: number;
	green: number;
	blue: number;
}

export interface BaseColor {
	id: string;
	name: string;
	recipe: ColorRecipe;
	count: number;
	unlocked: boolean;
	// CSS styling properties for retro button style
	borderColor: string;
	textColor: string;
	bgColor: string;
	hoverBgColor: string;
	shadowColor: string;
	circleColor: string;
}

export interface MixedColor extends BaseColor {
	type: "mixed";
}

export interface PureColor extends BaseColor {
	type: "pure";
}

export interface CompositeColor extends BaseColor {
	type: "mixed" | "pure";
}

// Generic color state that can hold any color type
export type ColorState<T extends BaseColor> = Record<string, T>;

// ============================================================================
// Color Currency Configuration
// ============================================================================

export interface ColorCurrencyConfig<T extends BaseColor> extends CurrencyConfig<ColorState<T>> {
	unlockOrder: string[];
	calculateUnlockCost: (unlockedCount: number, colorId: string) => { red: number; green: number; blue: number; total: number };
	defaultUnlocks: Record<string, boolean>;
}

// ============================================================================
// Color Currency Implementation
// ============================================================================

class ColorCurrencyImpl<T extends BaseColor>
	extends CurrencyBase<ColorState<T>>
	implements ICurrency
{
	private colorConfig: ColorCurrencyConfig<T>;

	constructor(config: ColorCurrencyConfig<T>) {
		super(config);
		this.colorConfig = config;
	}

	/**
	 * Expose update method for external modifications
	 */
	update = this.store.update;

	/**
	 * Get unlock cost for a specific color
	 */
	getUnlockCost(colorId: string): { red: number; green: number; blue: number; total: number } {
		const currentColors = this.getCurrentState();
		const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
		return this.colorConfig.calculateUnlockCost(unlockedCount, colorId);
	}

	/**
	 * Check if player can afford to unlock a specific color
	 */
	canAffordUnlock(colorId: string): boolean {
		const currentPixels = get(pixels);
		const currentColors = this.getCurrentState();
		const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
		const cost = this.colorConfig.calculateUnlockCost(unlockedCount, colorId);

		return (
			currentPixels.red >= cost.red &&
			currentPixels.green >= cost.green &&
			currentPixels.blue >= cost.blue
		);
	}

	/**
	 * Unlock a color by spending RGB pixels
	 */
	unlockColor(colorId: string): boolean {
		const currentPixels = get(pixels);
		const currentColors = this.getCurrentState();
		const color = currentColors[colorId];

		if (!color || color.unlocked) return false;

		const unlockedCount = Object.values(currentColors).filter(c => c.unlocked).length;
		const cost = this.colorConfig.calculateUnlockCost(unlockedCount, colorId);

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
			this.update((colors) => ({
				...colors,
				[colorId]: {
					...colors[colorId],
					unlocked: true,
				},
			}));

			return true;
		}
		return false;
	}

	/**
	 * Get count of unlocked colors
	 */
	getUnlockedCount(): number {
		const colors = this.getCurrentState();
		return Object.values(colors).filter((color) => color.unlocked).length;
	}

	/**
	 * Get next color to unlock by order
	 */
	getNextToUnlock(): T | null {
		const colors = this.getCurrentState();

		for (const colorId of this.colorConfig.unlockOrder) {
			const color = colors[colorId];
			if (color && !color.unlocked) {
				return color;
			}
		}
		return null;
	}

	/**
	 * Check if player can afford a specific color recipe
	 */
	canAfford(colorId: string): boolean {
		const currentPixels = get(pixels);
		const currentColors = this.getCurrentState();
		const color = currentColors[colorId];

		if (!color || !color.unlocked) return false;

		return (
			currentPixels.red >= color.recipe.red &&
			currentPixels.green >= color.recipe.green &&
			currentPixels.blue >= color.recipe.blue
		);
	}

	/**
	 * Mix a color by consuming RGB pixels
	 */
	mixColor(colorId: string): boolean {
		const currentPixels = get(pixels);
		const currentColors = this.getCurrentState();
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

			// Add color
			this.update((colors) => ({
				...colors,
				[colorId]: {
					...colors[colorId],
					count: colors[colorId].count + 1,
				},
			}));

			return true;
		}
		return false;
	}

	/**
	 * Get all colors (for UI) - includes locked colors for unlock UI
	 */
	getColors(): T[] {
		const colors = this.getCurrentState();
		return Object.values(colors);
	}

	/**
	 * Get colors with counts > 0 (for navigation display)
	 */
	getColorsWithCounts(): T[] {
		const colors = this.getCurrentState();
		return Object.values(colors).filter(color => color.count > 0);
	}

	/**
	 * Reset to default state
	 */
	reset(): void {
		this.set({ ...this.config.defaultState });
	}
}

// ============================================================================
// Color Currency Factory
// ============================================================================

/**
 * Create a color currency store with the unified system
 */
export function createColorCurrency<T extends BaseColor>(config: ColorCurrencyConfig<T>) {
	const currency = new ColorCurrencyImpl<T>(config);

	return {
		// Standard Svelte store interface
		subscribe: currency.subscribe,
		update: currency.update,

		// Currency methods
		reset: () => currency.reset(),
		save: () => currency.save(),
		load: () => currency.load(),

		// Color-specific methods
		getUnlockCost: (colorId: string) => currency.getUnlockCost(colorId),
		canAffordUnlock: (colorId: string) => currency.canAffordUnlock(colorId),
		unlockColor: (colorId: string) => currency.unlockColor(colorId),
		getUnlockedCount: () => currency.getUnlockedCount(),
		getNextToUnlock: () => currency.getNextToUnlock(),
		canAfford: (colorId: string) => currency.canAfford(colorId),
		mixColor: (colorId: string) => currency.mixColor(colorId),
		getColors: () => currency.getColors(),
		getColorsWithCounts: () => currency.getColorsWithCounts(),

		// Compatibility methods for existing components
		getPureColors: () => currency.getColors(), // For pureColors compatibility
		getMixedColors: () => currency.getColors(), // For mixedColors compatibility
		getCompositeColors: () => currency.getColors(), // For compositeColors compatibility
	};
}

// ============================================================================
// Derived Store Helpers
// ============================================================================

/**
 * Create derived store for unlocked status
 */
export function createUnlockedDerived<T extends BaseColor>(colorStore: ReturnType<typeof createColorCurrency<T>>) {
	return derived(colorStore, ($colors) =>
		Object.values($colors).some(color => color.unlocked)
	);
}

// Types are already exported via the interface and type declarations above