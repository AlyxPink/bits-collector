import type { GeneratorConfig, PowerupConfig, BreakthroughConfig, TabUnlockConfig } from "./types";

// Generator configurations
export const GENERATOR_CONFIG: Record<string, GeneratorConfig> = {
	red: {
		baseRate: 0.3, // Reduced from 0.5 for balance
		baseCost: 3,
		costMultiplier: 1.25,
		maxLevel: 10, // Cap to prevent exponential growth
	},
	green: {
		baseRate: 0.3, // Reduced from 0.5 for balance
		baseCost: 3,
		costMultiplier: 1.25,
		maxLevel: 10, // Cap to prevent exponential growth
	},
	blue: {
		baseRate: 0.3, // Reduced from 0.5 for balance
		baseCost: 3,
		costMultiplier: 1.25,
		maxLevel: 10, // Cap to prevent exponential growth
	},
	random: {
		baseRate: 0.9,
		baseCost: 5,
		costMultiplier: 1.6,
		maxLevel: 15, // Keep random generator slightly higher
	},
};

// Powerup configurations
// NEW ADDITIVE SYSTEM: Each powerup adds to total multiplier instead of multiplying
// Formula: totalMultiplier = (1 + speedBoostBonus) × (1 + megaSpeedBonus) × (1 + ultraSpeedBonus)
// This prevents exponential growth while keeping progression satisfying
export const POWERUP_CONFIG: Record<string, PowerupConfig> = {
	speedBoost: {
		multiplier: 1.5, // Adds +50% per level (+0.5x in additive formula) - Reduced from 2
		baseCost: 50,
		costMultiplier: 4, // Increased from 3 to slow progression
		maxLevel: 5, // 5 levels = +250% = 3.5x total (down from 6x)
	},
	megaSpeed: {
		multiplier: 2, // Adds +100% per level (+1.0x in additive formula) - Reduced from 3
		baseCost: 500, // Increased from 200
		costMultiplier: 5, // Increased from 4
		maxLevel: 3, // 3 levels = +300% = 4x total (down from 7x)
	},
	ultraSpeed: {
		multiplier: 2.5, // Adds +150% per level (+1.5x in additive formula) - Reduced from 4
		baseCost: 5000, // Increased from 1000
		costMultiplier: 6, // Increased from 5
		maxLevel: 2, // 2 levels = +300% = 4x total (down from 7x)
	},
};

// Breakthrough configurations
export const BREAKTHROUGH_CONFIG: Record<string, BreakthroughConfig> = {
	// Production efficiency breakthroughs
	efficiency1: {
		type: "efficiency",
		effect: 1.15,
		baseCost: 100,
	},
	efficiency2: {
		type: "efficiency",
		effect: 1.25,
		baseCost: 2500,
	},
	efficiency3: {
		type: "efficiency",
		effect: 1.4,
		baseCost: 50000,
	},

	// Conversion-focused breakthroughs
	conversionCatalyst: {
		type: "efficiency",
		effect: 0.25, // Reduces cost multiplier by 25%
		baseCost: 150,
	},
	efficiencyStabilizer: {
		type: "efficiency",
		effect: 0.5, // Reduces decay by 50%
		baseCost: 300,
	},
	bulkConverter: {
		type: "multiplier",
		effect: 10, // Convert up to 10 sets at once (increased from 5)
		baseCost: 500,
	},
	whiteAmplifier: {
		type: "multiplier",
		effect: 0.25, // 25% chance for bonus white pixel
		baseCost: 750,
	},
};

// Tab unlock requirements
export const TAB_UNLOCK_CONFIG: Record<string, TabUnlockConfig> = {
	luminance: {
		white: 0,
		red: 0,
		green: 0,
		blue: 0, // Always unlocked - first tab
	},
	generators: {
		white: 0,
		red: 0,
		green: 0,
		blue: 0,
		lumen: 100, // Requires 100 lumen to unlock
	},
	autoConverters: {
		white: 10,
		red: 25,
		green: 25,
		blue: 25,
	},
	powerups: {
		white: 30,
		red: 100,
		green: 100,
		blue: 100,
		lumen: 100, // Initially 100, increases to 5,000 if generators purchased
	},
	breakthroughs: {
		white: 150,
		red: 500,
		green: 500,
		blue: 500,
	},
};
