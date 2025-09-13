/**
 * Currency System Entry Point
 *
 * Unified currency system for the Bits Collector game.
 * This module provides a clean, consistent interface for all currency operations.
 */

// ============================================================================
// Core System Exports
// ============================================================================

export * from "./core/interfaces";
export * from "./core/CurrencyBase";
export * from "./core/utils";

// ============================================================================
// Quick Access Re-exports
// ============================================================================

export {
	// Base classes
	CurrencyBase,
	StoragePersistence,
	HasAmountMixin,
	HasLifetimeTrackingMixin,
	createCurrencyStore,
} from "./core/CurrencyBase";

export {
	// All utility functions
	calculateExponentialCost,
	calculateLinearCost,
	calculatePowerCost,
	calculateCost,
	calculatePureColorMultiplier,
	calculateRandomGeneratorMultiplier,
	calculateConversionCost,
	calculateConversionEfficiency,
	calculateLumenPerSecond,
	calculateLumenEfficiency,
	formatCurrencyAmount,
	formatRate,
	canAffordCosts,
	spendCosts,
	hasAmountInterface,
	hasLifetimeInterface,
} from "./core/utils";

// ============================================================================
// Type Exports
// ============================================================================

export type {
	// Core interfaces
	ICurrency,
	CurrencyConfig,
	CurrencyStore,
	CurrencyStoreFactory,
	CurrencyType,

	// Capability mixins
	HasAmount,
	HasLifetimeTracking,
	HasGeneration,
	HasUpgrades,
	HasConversion,
	HasUnlocks,
	HasMultipliers,

	// Supporting types
	CurrencyAmount,
	ConversionRecipe,
	ColorConfig,
	CostConfig,

	// State types
	PixelCurrencyState,
	ColorCurrencyState,
	PremiumCurrencyState,
	StatisticCurrencyState,
} from "./core/interfaces";

// ============================================================================
// Constants and Configurations
// ============================================================================

/**
 * Standard cost configurations for common upgrade patterns
 */
export const STANDARD_COST_CONFIGS = {
	// Exponential growth for most upgrades
	GENERATOR_UPGRADE: {
		formula: "exponential" as const,
		baseCost: 10,
		costMultiplier: 1.5,
	},

	// More expensive exponential for powerups
	POWERUP_UPGRADE: {
		formula: "exponential" as const,
		baseCost: 100,
		costMultiplier: 2.0,
	},

	// Very expensive for breakthroughs
	BREAKTHROUGH_UPGRADE: {
		formula: "exponential" as const,
		baseCost: 1000,
		costMultiplier: 5.0,
	},

	// Linear growth for simple unlocks
	COLOR_UNLOCK: {
		formula: "linear" as const,
		baseCost: 50,
		costMultiplier: 100,
	},
} as const;

/**
 * Default currency type configurations
 */
export const DEFAULT_CURRENCY_CONFIGS = {
	PIXEL: {
		persistence: true,
		resetOnGameReset: true,
	},
	PREMIUM: {
		persistence: true,
		resetOnGameReset: true,
	},
	STATISTIC: {
		persistence: true,
		resetOnGameReset: false, // Statistics survive resets
	},
	COLOR: {
		persistence: true,
		resetOnGameReset: true,
	},
} as const;