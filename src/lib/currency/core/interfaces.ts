/**
 * Currency System Interfaces
 *
 * Unified interfaces for all currency types in the Bits Collector game.
 * These interfaces define the common patterns extracted from existing stores.
 */

import type { Writable } from "svelte/store";

// ============================================================================
// Core Currency Interfaces
// ============================================================================

/**
 * Base currency interface - all currencies must implement this
 */
export interface ICurrency {
	readonly id: string;
	readonly type: CurrencyType;
	readonly displayName: string;
}

/**
 * Currency types in the game
 */
export type CurrencyType =
	| "pixel"           // RGB pixels (red, green, blue, white)
	| "pure-color"      // Pure colors (crimson, emerald, sapphire)
	| "mixed-color"     // Mixed colors (orange, yellow, etc.)
	| "composite-color" // Composite colors (complex mixtures)
	| "premium"         // Premium currencies (lumen, lux)
	| "statistic"       // Game statistics
	| "multi-currency"; // Multiple related currencies (pixels: RGB → White)

/**
 * Configuration for creating a currency store
 */
export interface CurrencyConfig<T> {
	id: string;
	type: CurrencyType;
	displayName: string;
	storageKey: string;
	defaultState: T;
	persistence?: boolean;
	resetOnGameReset?: boolean;
}

// ============================================================================
// Capability Mixins (Interface Segregation)
// ============================================================================

/**
 * Currency that has a simple amount/count
 */
export interface HasAmount {
	readonly amount: number;
	add(amount: number): void;
	canAfford(cost: number): boolean;
	spend(amount: number): boolean;
}

/**
 * Currency that tracks lifetime totals and records
 */
export interface HasLifetimeTracking {
	readonly lifetimeTotal: number;
	readonly bestAmount: number;
	addToLifetime(amount: number): void;
}

/**
 * Currency that can be automatically generated
 */
export interface HasGeneration {
	readonly generationRate: number;
	processGenerationTick(deltaTimeSeconds: number): void;
	getGenerationRate(): number;
}

/**
 * Currency that can be upgraded/leveled
 */
export interface HasUpgrades<T = any> {
	readonly upgrades: Record<string, T>;
	canAffordUpgrade(upgradeId: string): boolean;
	purchaseUpgrade(upgradeId: string): boolean;
	getUpgradeCost(upgradeId: string): number;
}

/**
 * Currency that can be converted to/from other currencies
 */
export interface HasConversion {
	canConvert(recipe: ConversionRecipe): boolean;
	convert(recipe: ConversionRecipe): boolean;
	getConversionCost(recipe: ConversionRecipe): CurrencyAmount[];
}

/**
 * Currency that can unlock new features
 */
export interface HasUnlocks {
	readonly unlocked: boolean;
	canUnlock(): boolean;
	unlock(): boolean;
	getUnlockCost(): CurrencyAmount[];
}

/**
 * Currency that provides multipliers to other systems
 */
export interface HasMultipliers {
	getMultiplierFor(target: string): number;
	getSynergyBonus(): number;
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Represents a cost or reward in specific currency amounts
 */
export interface CurrencyAmount {
	currencyId: string;
	amount: number;
}

/**
 * Recipe for converting between currencies
 */
export interface ConversionRecipe {
	id: string;
	name: string;
	inputs: CurrencyAmount[];
	outputs: CurrencyAmount[];
	efficiency?: number;
}

/**
 * Configuration for color-based currencies
 */
export interface ColorConfig {
	id: string;
	name: string;
	recipe: { red: number; green: number; blue: number };
	styling: {
		borderColor: string;
		textColor: string;
		bgColor: string;
		hoverBgColor: string;
		shadowColor: string;
		circleColor: string;
	};
}

/**
 * Configuration for generation/upgrade costs
 */
export interface CostConfig {
	baseCost: number;
	costMultiplier: number;
	formula: "exponential" | "linear" | "power" | "custom";
	customFormula?: (level: number, baseCost: number) => number;
}

// ============================================================================
// Store Factory Types
// ============================================================================

/**
 * Enhanced Svelte store interface with currency-specific methods
 */
export interface CurrencyStore<T> extends Writable<T> {
	// Standard Svelte store methods
	subscribe: Writable<T>["subscribe"];
	set: Writable<T>["set"];
	update: Writable<T>["update"];

	// Currency-specific methods
	reset(): void;
	save(): void;
	load(): T;

	// Configuration access
	getConfig(): CurrencyConfig<T>;
}

/**
 * Factory function signature for creating currency stores
 */
export type CurrencyStoreFactory<T> = (config: CurrencyConfig<T>) => CurrencyStore<T>;

// ============================================================================
// Specific Currency State Types
// ============================================================================

/**
 * RGB Pixel currency state
 */
export interface PixelCurrencyState {
	red: number;
	green: number;
	blue: number;
	white: number;
	lifetimeWhite: number;
}

/**
 * Color currency state (pure/mixed/composite)
 */
export interface ColorCurrencyState {
	[colorId: string]: {
		id: string;
		name: string;
		count: number;
		unlocked: boolean;
		recipe: { red: number; green: number; blue: number };
		styling: ColorConfig["styling"];
	};
}

/**
 * Premium currency state (lumen/lux)
 */
export interface PremiumCurrencyState {
	total: number;
	lifetimeTotal: number;
	bestAmount: number;
	lastTick: number;
	generators: Record<string, any>;
	upgrades: Record<string, any>;
}

/**
 * Game statistics state
 */
export interface StatisticCurrencyState {
	totalClicks: number;
	totalConversions: number;
	playtimeSeconds: number;
	startTime: number;
}